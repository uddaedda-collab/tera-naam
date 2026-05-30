/* ============================================================
   CineSync · Chat + Animated Emoji Reactions
   ------------------------------------------------------------
   Pure UI module. The sync engine (app.js) calls these methods
   and wires the socket send callbacks.
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // A friendly emoji set for the picker.
  const EMOJIS = [
    '❤️','😍','😘','🥰','😂','🤣','😊','😎','🥺','😭','😡','😱',
    '👏','🙌','🔥','✨','🌟','💯','🎉','🍿','🎬','🎵','💔','💕',
    '💖','💘','😴','🤤','🤗','🤩','😏','😜','🙈','🙉','🤫','👀',
    '👍','👎','🤝','💪','🌹','🌈','☀️','🌙','⭐','⚡','💧','🍻',
  ];

  // Deterministic vivid color per name (for avatars + message accents).
  function colorFor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return `hsl(${h}, 70%, 60%)`;
  }
  function initialOf(name) {
    return (name || '?').trim().charAt(0).toUpperCase() || '?';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  // Detect "emoji-only" short messages to render them large.
  function isEmojiOnly(text) {
    const t = text.trim();
    if (!t || t.length > 8) return false;
    return /^(\p{Extended_Pictographic}|\uFE0F|\u200D|\s)+$/u.test(t);
  }

  class Chat {
    constructor() {
      this.log = $('chatLog');
      this.input = $('chatInput');
      this.form = $('chatForm');
      this.typingHint = $('typingHint');
      this.picker = $('emojiPicker');
      this.reactionLayer = $('reactionLayer');
      this.btnEmoji = $('btnEmoji');
      this.reactionBar = $('reactionBar');

      this.myId = null;
      this.onSend = () => {};
      this.onReaction = () => {};
      this.onTyping = () => {};

      this._typingUsers = new Map();
      this._typingTimers = new Map();
      this._buildPicker();
      this._wire();
    }

    setMyId(id) { this.myId = id; }

    _wire() {
      // Submit message.
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.input.value.trim();
        if (!text) return;
        this.onSend(text);
        this.input.value = '';
        this._emitTyping(false);
        this.picker.hidden = true;
      });

      // Typing indicator (debounced stop).
      let typingTO;
      this.input.addEventListener('input', () => {
        this._emitTyping(true);
        clearTimeout(typingTO);
        typingTO = setTimeout(() => this._emitTyping(false), 1500);
      });

      // Quick reaction bar.
      this.reactionBar.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-emoji]');
        if (!btn) return;
        this.onReaction(btn.dataset.emoji);
      });

      // Emoji picker toggle.
      this.btnEmoji.addEventListener('click', () => {
        this.picker.hidden = !this.picker.hidden;
      });
      document.addEventListener('click', (e) => {
        if (!this.picker.hidden && !this.picker.contains(e.target) && e.target !== this.btnEmoji) {
          this.picker.hidden = true;
        }
      });
    }

    _buildPicker() {
      const frag = document.createDocumentFragment();
      EMOJIS.forEach((em) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = em;
        b.addEventListener('click', () => {
          this.input.value += em;
          this.input.focus();
        });
        frag.appendChild(b);
      });
      this.picker.appendChild(frag);
    }

    _emitTyping(state) {
      if (this._lastTyping === state) return;
      this._lastTyping = state;
      this.onTyping(state);
    }

    /* ---------- Rendering messages ---------- */
    addMessage(msg) {
      const el = document.createElement('div');
      if (msg.kind === 'system') {
        el.className = 'msg msg--system';
        el.innerHTML = `<div class="msg__bubble">✦ ${escapeHtml(msg.text)}</div>`;
      } else {
        const mine = msg.userId && msg.userId === this.myId;
        const emojiOnly = isEmojiOnly(msg.text);
        el.className = `msg ${mine ? 'msg--me' : 'msg--them'}${emojiOnly ? ' msg--emoji-only' : ''}`;
        const nameHtml = mine ? '' : `<div class="msg__name">${escapeHtml(msg.name)}</div>`;
        el.innerHTML = `${nameHtml}<div class="msg__bubble">${escapeHtml(msg.text)}</div>`;
      }
      this.log.appendChild(el);
      this._scroll();
    }

    addManyMessages(list) {
      (list || []).forEach((m) => this.addMessage(m));
    }

    _scroll() {
      // Only autoscroll if user is near the bottom.
      const nearBottom = this.log.scrollHeight - this.log.scrollTop - this.log.clientHeight < 140;
      if (nearBottom) this.log.scrollTop = this.log.scrollHeight;
    }

    /* ---------- Typing hint ---------- */
    showTyping(userId, name, typing) {
      if (userId === this.myId) return;
      if (typing) {
        this._typingUsers.set(userId, name);
        clearTimeout(this._typingTimers.get(userId));
        this._typingTimers.set(userId, setTimeout(() => {
          this._typingUsers.delete(userId);
          this._renderTyping();
        }, 4000));
      } else {
        this._typingUsers.delete(userId);
      }
      this._renderTyping();
    }

    _renderTyping() {
      const names = Array.from(this._typingUsers.values());
      if (!names.length) { this.typingHint.hidden = true; return; }
      const who = names.length === 1 ? `${names[0]} is typing` : `${names.length} people are typing`;
      this.typingHint.hidden = false;
      this.typingHint.innerHTML = `${escapeHtml(who)}<span class="dots"><span>.</span><span>.</span><span>.</span></span>`;
    }

    /* ---------- Floating emoji reaction ---------- */
    flyReaction(emoji, name) {
      const el = document.createElement('div');
      el.className = 'float-emoji';
      // Random horizontal start, slight rotation for life.
      const left = 8 + Math.random() * 78;
      el.style.left = left + '%';
      el.style.fontSize = (1.6 + Math.random() * 1.4) + 'rem';
      el.innerHTML = `${emoji}${name ? `<small>${escapeHtml(name)}</small>` : ''}`;
      this.reactionLayer.appendChild(el);
      setTimeout(() => el.remove(), 2700);

      // Light haptic on supported devices.
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
    }
  }

  window.CineSyncChat = Chat;
  window.CineSyncColorFor = colorFor;
  window.CineSyncInitialOf = initialOf;
})();
