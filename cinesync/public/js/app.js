/* ============================================================
   CineSync · App Orchestrator + Sync Engine
   ------------------------------------------------------------
   - View routing (landing <-> room, deep-link /room/:id)
   - Socket.IO connection + event wiring
   - Authoritative sync with drift correction
   - Modals (add media, invite, name), uploads, controls UI
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const DRIFT_THRESHOLD = 1.5;   // seconds before we hard-correct
  const SOFT_DRIFT = 0.4;        // seconds we tolerate silently

  const state = {
    socket: null,
    roomId: null,
    name: localStorage.getItem('cinesync_name') || '',
    myId: null,
    hostId: null,
    applyingRemote: false,       // guard while we apply server state locally
    lastSourceRaw: null,
  };

  let player, chat;

  /* ---------- Toast ---------- */
  let toastTO;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add('toast--show'));
    clearTimeout(toastTO);
    toastTO = setTimeout(() => {
      t.classList.remove('toast--show');
      setTimeout(() => { t.hidden = true; }, 250);
    }, 2600);
  }
  // Expose toast so the PWA install module can use it.
  window.CineSyncToast = toast;

  /* ---------- View routing ---------- */
  function showView(name) {
    $('landing').classList.toggle('view--active', name === 'landing');
    $('room').classList.toggle('view--active', name === 'room');
  }

  function getRoomFromPath() {
    const m = location.pathname.match(/^\/room\/([A-Za-z0-9]+)/);
    return m ? m[1].toUpperCase() : null;
  }

  /* ---------- Time formatting ---------- */
  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const mm = h ? String(m).padStart(2, '0') : m;
    return (h ? h + ':' : '') + mm + ':' + String(s).padStart(2, '0');
  }

  /* ============================================================
     SOCKET + SYNC
     ============================================================ */
  function connectSocket() {
    state.socket = io({ transports: ['websocket', 'polling'] });
    const s = state.socket;

    s.on('connect', () => {
      state.myId = s.id;
      chat.setMyId(s.id);
      setSyncStatus('ok', 'Connected');
      // (Re)join room.
      s.emit('room:join', { roomId: state.roomId, name: state.name }, (res) => {
        if (res && res.ok === false) {
          toast(res.error || 'Could not join room');
          setTimeout(() => navigateHome(), 1200);
        }
      });
    });

    s.on('disconnect', () => setSyncStatus('bad', 'Reconnecting…'));
    s.on('connect_error', () => setSyncStatus('bad', 'Connection issue'));

    s.on('room:joined', (data) => {
      state.roomId = data.roomId;
      $('roomCodeLabel').textContent = data.roomId;
      chat.addManyMessages(data.messages);
      if (data.playback && data.playback.source) {
        applySource(data.playback.source, data.playback);
      }
      setSyncStatus('ok', 'In sync');
    });

    s.on('room:members', ({ members, hostId }) => {
      state.hostId = hostId;
      renderMembers(members, hostId);
    });

    s.on('room:error', (e) => toast(e.error || 'Something went wrong'));
    s.on('system:notice', (m) => chat.addMessage({ ...m, kind: 'system' }));

    // A new source was set by someone.
    s.on('source:changed', ({ source, playback }) => {
      applySource(source, playback);
      toast(`Now playing: ${source.title || source.type}`);
    });

    // Authoritative playback state broadcast.
    s.on('playback:state', (snap) => applyPlayback(snap));

    // Late-joiner resync response.
    s.on('sync:state', (snap) => applyPlayback(snap, true));

    // Chat.
    s.on('chat:message', (m) => chat.addMessage(m));
    s.on('chat:reaction', (r) => chat.flyReaction(r.emoji, r.name));
    s.on('chat:typing', (t) => chat.showTyping(t.userId, t.name, t.typing));
  }

  /* ---------- Apply remote source ---------- */
  function applySource(source, playback) {
    if (state.lastSourceRaw === source.raw && player.source) {
      // Same source already loaded; just sync time.
      if (playback) applyPlayback(playback, true);
      return;
    }
    state.lastSourceRaw = source.raw;
    $('playerEmpty').style.display = 'none';
    player.load(source);
    // Once ready, jump to the projected time.
    const onReady = () => {
      if (playback) applyPlayback(playback, true);
      player.listeners.ready = (player.listeners.ready || []).filter((f) => f !== onReady);
    };
    player.on('ready', onReady);
  }

  /* ---------- Apply remote playback (with drift correction) ---------- */
  function applyPlayback(snap, force) {
    if (!snap || !player.source) return;
    if (!player.isControllable()) return; // drive iframe: can't control

    // Account for network latency since server stamped the snapshot.
    const latency = snap.serverTime ? Math.max(0, (Date.now() - snap.serverTime) / 1000) : 0;
    let target = snap.currentTime + (snap.isPlaying ? latency : 0);

    state.applyingRemote = true;

    const localTime = player.getTime();
    const drift = Math.abs(localTime - target);

    if (force || drift > DRIFT_THRESHOLD) {
      player.seek(target);
    } else if (drift > SOFT_DRIFT && player.backend === 'html5') {
      // Gentle nudge: briefly adjust rate to glide back into sync.
      nudgeRate(localTime < target);
    }

    if (typeof snap.rate === 'number') player.setRate(snap.rate);

    if (snap.isPlaying && !player.isPlaying()) player.play();
    else if (!snap.isPlaying && player.isPlaying()) player.pause();

    updatePlayButton(snap.isPlaying);
    setSyncStatus(drift > DRIFT_THRESHOLD ? 'warn' : 'ok', drift > DRIFT_THRESHOLD ? 'Re-syncing…' : 'In sync');

    setTimeout(() => { state.applyingRemote = false; }, 400);
  }

  let nudgeTO;
  function nudgeRate(speedUp) {
    if (player.backend !== 'html5') return;
    const base = player.video.playbackRate || 1;
    player.video.playbackRate = speedUp ? base * 1.05 : base * 0.95;
    clearTimeout(nudgeTO);
    nudgeTO = setTimeout(() => { player.video.playbackRate = base; }, 1200);
  }

  /* ---------- Send local control to server ---------- */
  function sendControl(type, extra = {}) {
    if (state.applyingRemote) return; // don't echo remote-applied changes
    state.socket.emit('playback:control', {
      type,
      currentTime: player.getTime(),
      rate: player.video ? player.video.playbackRate : 1,
      ...extra,
    });
  }

  /* ============================================================
     PLAYER WIRING
     ============================================================ */
  function wirePlayer() {
    player = new window.CineSyncPlayer();

    // Player -> server (user actions).
    player.on('play', () => { updatePlayButton(true); sendControl('play', { isPlaying: true }); });
    player.on('pause', () => { updatePlayButton(false); sendControl('pause', { isPlaying: false }); });
    player.on('seek', ({ time }) => sendControl('seek', { currentTime: time }));

    // Player -> UI.
    player.on('timeupdate', ({ time, duration }) => {
      const seek = $('seekBar');
      if (duration > 0 && !seek.dragging) seek.value = Math.round((time / duration) * 1000);
      $('curTime').textContent = fmt(time);
      $('durTime').textContent = fmt(duration);
    });
    player.on('durationchange', (d) => { $('durTime').textContent = fmt(d); });
    player.on('buffered', ({ end, duration }) => {
      if (duration > 0) $('seekBuffered').style.width = (end / duration * 100) + '%';
    });
    player.on('zoom', ({ zoom }) => { $('zoomLabel').textContent = Math.round(zoom * 100) + '%'; });
    player.on('notice', (msg) => toast(msg));
    player.on('ended', () => updatePlayButton(false));

    wireControls();
  }

  function updatePlayButton(playing) {
    $('btnPlay').textContent = playing ? '⏸' : '▶';
  }

  function wireControls() {
    $('btnPlay').addEventListener('click', () => {
      player.isPlaying() ? player.pause() : player.play();
    });
    $('btnBack').addEventListener('click', () => player.seek(Math.max(0, player.getTime() - 10)));
    $('btnFwd').addEventListener('click', () => player.seek(player.getTime() + 10));

    const seek = $('seekBar');
    seek.addEventListener('mousedown', () => { seek.dragging = true; });
    seek.addEventListener('touchstart', () => { seek.dragging = true; }, { passive: true });
    const commitSeek = () => {
      const dur = player.getDuration();
      if (dur > 0) player.seek((seek.value / 1000) * dur);
      seek.dragging = false;
    };
    seek.addEventListener('change', commitSeek);
    seek.addEventListener('mouseup', commitSeek);
    seek.addEventListener('touchend', commitSeek);

    // Volume.
    $('volBar').addEventListener('input', (e) => {
      const v = e.target.value / 100;
      player.setVolume(v);
      player.setMuted(v === 0);
      $('btnMute').textContent = v === 0 ? '🔇' : (v < 0.5 ? '🔉' : '🔊');
    });
    $('btnMute').addEventListener('click', () => {
      const muted = $('btnMute').textContent !== '🔇';
      player.setMuted(muted);
      $('btnMute').textContent = muted ? '🔇' : '🔊';
    });

    // Zoom.
    $('btnZoomIn').addEventListener('click', () => player.zoomIn());
    $('btnZoomOut').addEventListener('click', () => player.zoomOut());
    $('btnZoomReset').addEventListener('click', () => player.resetZoom());

    // Speed.
    $('rateSelect').addEventListener('change', (e) => {
      const r = parseFloat(e.target.value);
      player.setRate(r);
      sendControl('rate', { rate: r });
    });

    // Fullscreen.
    $('btnFullscreen').addEventListener('click', () => player.toggleFullscreen());

    // Change media.
    $('btnChangeMedia').addEventListener('click', openMediaModal);
    $('btnAddMediaEmpty').addEventListener('click', openMediaModal);

    // Resync.
    $('btnResync').addEventListener('click', () => {
      state.socket.emit('sync:request', {}, (snap) => applyPlayback(snap, true));
      toast('Re-syncing…');
    });

    // Keyboard shortcuts.
    document.addEventListener('keydown', (e) => {
      if (!$('room').classList.contains('view--active')) return;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
      if (typing) return;
      if (e.code === 'Space') { e.preventDefault(); player.isPlaying() ? player.pause() : player.play(); }
      else if (e.code === 'ArrowLeft') player.seek(Math.max(0, player.getTime() - 5));
      else if (e.code === 'ArrowRight') player.seek(player.getTime() + 5);
      else if (e.key === '+' || e.key === '=') player.zoomIn();
      else if (e.key === '-') player.zoomOut();
      else if (e.key === '0') player.resetZoom();
      else if (e.key === 'f') player.toggleFullscreen();
    });
  }

  /* ============================================================
     CHAT WIRING
     ============================================================ */
  function wireChat() {
    chat = new window.CineSyncChat();
    chat.onSend = (text) => state.socket.emit('chat:message', { text });
    chat.onReaction = (emoji) => {
      state.socket.emit('chat:reaction', { emoji });
      chat.flyReaction(emoji, 'You'); // optimistic local fly
    };
    chat.onTyping = (typing) => state.socket.emit('chat:typing', { typing });
  }

  /* ============================================================
     MEMBERS STRIP
     ============================================================ */
  function renderMembers(members, hostId) {
    const strip = $('membersStrip');
    strip.innerHTML = '';
    members.forEach((m) => {
      const a = document.createElement('div');
      a.className = 'avatar' + (m.id === hostId ? ' avatar--host' : '');
      a.style.background = window.CineSyncColorFor(m.name);
      a.style.position = 'relative';
      a.textContent = window.CineSyncInitialOf(m.name);
      a.title = m.name + (m.id === hostId ? ' (host)' : '');
      strip.appendChild(a);
    });
    $('onlineCount').textContent = `${members.length} online`;
  }

  /* ============================================================
     MODALS
     ============================================================ */
  function openMediaModal() { $('mediaModal').hidden = false; }
  function closeMediaModal() { $('mediaModal').hidden = true; }

  function wireModals() {
    // Generic close.
    document.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', () => {
        const modal = el.closest('.modal');
        if (modal) modal.hidden = true;
      });
    });

    // Media tabs.
    const tabs = $('mediaTabs');
    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const which = tab.dataset.tab;
      tabs.querySelectorAll('.tab').forEach((t) => t.classList.toggle('tab--active', t === tab));
      document.querySelectorAll('.tab-pane').forEach((p) => {
        p.classList.toggle('tab-pane--active', p.dataset.pane === which);
      });
    });

    // Load by link.
    $('btnLoadLink').addEventListener('click', loadByLink);
    $('mediaUrl').addEventListener('keydown', (e) => { if (e.key === 'Enter') loadByLink(); });

    // Upload.
    wireUpload();

    // Invite.
    $('btnInvite').addEventListener('click', openInvite);
    $('btnCopyLink').addEventListener('click', copyInvite);

    // Home / leave.
    $('btnHome').addEventListener('click', () => {
      if (confirm('Leave the cinema?')) navigateHome();
    });
  }

  async function loadByLink() {
    const url = $('mediaUrl').value.trim();
    const msg = $('resolveMsg');
    if (!url) return;
    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.ok) {
        msg.hidden = false; msg.className = 'resolve-msg resolve-msg--err';
        msg.textContent = '⚠️ ' + (data.error || 'Could not load this link');
        return;
      }
      msg.hidden = false; msg.className = 'resolve-msg resolve-msg--ok';
      msg.textContent = `✅ ${data.source.type.toUpperCase()} detected`;
      // Broadcast the source to the room.
      state.socket.emit('source:set', { source: data.source });
      setTimeout(() => { closeMediaModal(); msg.hidden = true; $('mediaUrl').value = ''; }, 600);
    } catch (err) {
      msg.hidden = false; msg.className = 'resolve-msg resolve-msg--err';
      msg.textContent = '⚠️ Network error';
    }
  }

  function wireUpload() {
    const dz = $('dropzone');
    const input = $('fileInput');

    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dropzone--over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dropzone--over'));
    dz.addEventListener('drop', (e) => {
      e.preventDefault(); dz.classList.remove('dropzone--over');
      if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', () => { if (input.files[0]) uploadFile(input.files[0]); });
  }

  function uploadFile(file) {
    const prog = $('uploadProgress');
    const bar = $('uploadBar');
    const pct = $('uploadPct');
    prog.hidden = false;

    const form = new FormData();
    form.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const p = Math.round((e.loaded / e.total) * 100);
        bar.style.width = p + '%';
        pct.textContent = p + '%';
      }
    };
    xhr.onload = () => {
      prog.hidden = true; bar.style.width = '0%'; pct.textContent = '0%';
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.ok) {
          state.socket.emit('source:set', { source: data.source });
          closeMediaModal();
          toast('Uploaded! Playing for both of you 🎬');
        } else {
          toast(data.error || 'Upload failed');
        }
      } catch (e) { toast('Upload failed'); }
    };
    xhr.onerror = () => { prog.hidden = true; toast('Upload failed'); };
    xhr.send(form);
  }

  /* ---------- Invite ---------- */
  function inviteUrl() {
    return `${location.origin}/room/${state.roomId}`;
  }
  function openInvite() {
    $('inviteLink').value = inviteUrl();
    $('inviteCode').textContent = state.roomId;
    $('inviteModal').hidden = false;
  }
  async function copyInvite() {
    const link = inviteUrl();
    try {
      await navigator.clipboard.writeText(link);
      toast('Link copied! Send it to your love 💌');
    } catch (e) {
      const inp = $('inviteLink'); inp.select(); document.execCommand('copy');
      toast('Link copied 💌');
    }
  }

  /* ============================================================
     NAME GATE + ROOM ENTRY
     ============================================================ */
  function ensureName() {
    return new Promise((resolve) => {
      if (state.name) return resolve(state.name);
      const modal = $('nameModal');
      modal.hidden = false;
      const input = $('nameInput');
      input.focus();
      const save = () => {
        const n = input.value.trim() || 'Someone';
        state.name = n;
        localStorage.setItem('cinesync_name', n);
        modal.hidden = true;
        resolve(n);
      };
      $('btnSaveName').addEventListener('click', save, { once: true });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
    });
  }

  async function enterRoom(roomId) {
    state.roomId = roomId;
    await ensureName();
    showView('room');
    history.pushState({}, '', `/room/${roomId}`);
    $('roomCodeLabel').textContent = roomId;
    if (!state.socket) connectSocket();
    else state.socket.emit('room:join', { roomId, name: state.name });
  }

  function navigateHome() {
    if (state.socket) { state.socket.emit('room:leave'); state.socket.disconnect(); state.socket = null; }
    state.roomId = null;
    state.lastSourceRaw = null;
    history.pushState({}, '', '/');
    showView('landing');
  }

  /* ---------- Create / Join ---------- */
  async function createRoom() {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Movie Night' }),
      });
      const data = await res.json();
      if (data.ok) {
        await enterRoom(data.roomId);
        setTimeout(openInvite, 500); // nudge to invite partner
      }
    } catch (e) { toast('Could not create room'); }
  }

  async function joinRoom(code) {
    code = (code || '').trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch('/api/rooms/' + encodeURIComponent(code));
      const data = await res.json();
      if (!data.ok) { toast('Room not found 😕'); return; }
      await enterRoom(code);
    } catch (e) { toast('Could not join'); }
  }

  /* ---------- Sync status indicator ---------- */
  function setSyncStatus(level, text) {
    const dot = $('syncDot');
    dot.className = 'sync-dot sync-dot--' + (level === 'ok' ? 'ok' : level === 'warn' ? 'warn' : 'bad');
    $('syncText').textContent = text;
  }

  /* ============================================================
     LANDING WIRING + BOOT
     ============================================================ */
  function wireLanding() {
    $('btnCreate').addEventListener('click', createRoom);
    $('btnShowJoin').addEventListener('click', () => {
      const f = $('joinForm');
      f.hidden = !f.hidden;
      if (!f.hidden) $('joinCode').focus();
    });
    $('joinForm').addEventListener('submit', (e) => {
      e.preventDefault();
      joinRoom($('joinCode').value);
    });
    // Auto-uppercase room code input.
    $('joinCode').addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
  }

  function boot() {
    wirePlayer();
    wireChat();
    wireModals();
    wireLanding();

    // Deep link?
    const deep = getRoomFromPath();
    if (deep) {
      enterRoom(deep);
    } else if (new URLSearchParams(location.search).get('action') === 'create') {
      // Launched from the installed-app shortcut ("Create a Cinema").
      showView('landing');
      createRoom();
    } else {
      showView('landing');
    }

    // Handle back button.
    window.addEventListener('popstate', () => {
      const r = getRoomFromPath();
      if (r) enterRoom(r);
      else navigateHome();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
