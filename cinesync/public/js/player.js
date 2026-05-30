/* ============================================================
   CineSync · Unified Player Engine
   ------------------------------------------------------------
   Wraps three very different media backends behind one API:
     - HTML5 <video>  (direct URLs, Google Drive direct stream, uploads)
     - YouTube IFrame  (videoId)
     - Google Drive /preview iframe (fallback, no programmatic control)

   Exposes a uniform interface used by the sync engine (app.js):
     player.load(source)
     player.play() / pause() / seek(t) / setRate(r)
     player.getTime() / getDuration() / isPlaying()
     player.on(event, cb)   // 'play','pause','seek','timeupdate','ready','ended'

   Plus zoom/pan + fullscreen helpers (work for video + youtube).
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // YouTube IFrame API readiness gate.
  let ytApiReady = false;
  const ytReadyQueue = [];
  window.onYouTubeIframeAPIReady = function () {
    ytApiReady = true;
    ytReadyQueue.splice(0).forEach((fn) => fn());
  };
  function whenYtReady(fn) {
    if (ytApiReady && window.YT && window.YT.Player) fn();
    else ytReadyQueue.push(fn);
  }

  class Player {
    constructor() {
      this.shell = $('playerShell');
      this.mediaMount = $('mediaMount');
      this.video = $('htmlVideo');
      this.ytMount = $('ytMount');
      this.driveFrame = $('driveFrame');
      this.controls = $('controls');
      this.loader = $('playerLoader');

      this.backend = null; // 'html5' | 'youtube' | 'drive'
      this.source = null;
      this.yt = null;       // YT.Player instance
      this.ytState = -1;
      this.listeners = {};

      // Zoom / pan state.
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
      this.minZoom = 1;
      this.maxZoom = 4;

      // Guard so that programmatic seeks/plays don't echo back as user actions.
      this.suppress = false;

      this._wireVideoEvents();
      this._wireZoomPan();
    }

    /* ---------- Event emitter ---------- */
    on(evt, cb) {
      (this.listeners[evt] = this.listeners[evt] || []).push(cb);
      return this;
    }
    emit(evt, payload) {
      (this.listeners[evt] || []).forEach((cb) => {
        try { cb(payload); } catch (e) { console.error(e); }
      });
    }

    /* ---------- Loading sources ---------- */
    load(source) {
      this.source = source;
      this._resetZoom();
      this._hideAll();
      this.shell.dataset.empty = 'false';
      this.showLoader(true);

      if (source.type === 'youtube') {
        this._loadYouTube(source.id);
      } else if (source.type === 'gdrive') {
        // Try the direct stream in <video> first; if it errors we fall back to iframe.
        this._loadHtml5(source.directUrl || source.url, { driveFallback: source });
      } else {
        // direct + upload
        this._loadHtml5(source.url);
      }
      this.controls.hidden = false;
    }

    _hideAll() {
      this.video.hidden = true;
      this.ytMount.hidden = true;
      this.driveFrame.hidden = true;
      try { this.video.pause(); } catch (e) {}
      if (this.yt && this.yt.stopVideo) { try { this.yt.stopVideo(); } catch (e) {} }
    }

    _loadHtml5(url, opts = {}) {
      this.backend = 'html5';
      this.video.hidden = false;
      this.video.src = url;
      this.video.load();

      if (opts.driveFallback) {
        // If the direct stream fails (quota / large file), switch to Drive preview iframe.
        const onErr = () => {
          this.video.removeEventListener('error', onErr);
          this._loadDriveIframe(opts.driveFallback);
        };
        this.video.addEventListener('error', onErr, { once: true });
      }
    }

    _loadDriveIframe(source) {
      this.backend = 'drive';
      this._hideAll();
      this.driveFrame.hidden = false;
      this.driveFrame.src = source.url; // /preview
      this.showLoader(false);
      // Drive iframe can't be programmatically controlled; sync is best-effort
      // (source change is synced, fine playback control is manual).
      this.emit('ready', { backend: 'drive', controllable: false });
      this.emit('notice', 'Google Drive preview loaded. Playback controls are limited for Drive previews.');
    }

    _loadYouTube(videoId) {
      this.backend = 'youtube';
      this.ytMount.hidden = false;

      const build = () => {
        // Recreate the inner div each time (YT replaces it with an iframe).
        this.ytMount.innerHTML = '<div id="ytPlayerInner"></div>';
        this.yt = new YT.Player('ytPlayerInner', {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 0, controls: 0, rel: 0, modestbranding: 1,
            playsinline: 1, disablekb: 1, iv_load_policy: 3,
          },
          events: {
            onReady: () => {
              this.showLoader(false);
              this.emit('ready', { backend: 'youtube', controllable: true });
              this.emit('durationchange', this.getDuration());
            },
            onStateChange: (e) => this._onYtState(e),
          },
        });
      };
      whenYtReady(build);
    }

    _onYtState(e) {
      this.ytState = e.data;
      const YTS = window.YT.PlayerState;
      if (e.data === YTS.PLAYING) {
        if (!this.suppress) this.emit('play', { time: this.getTime() });
        this._startYtTicker();
      } else if (e.data === YTS.PAUSED) {
        if (!this.suppress) this.emit('pause', { time: this.getTime() });
      } else if (e.data === YTS.ENDED) {
        this.emit('ended');
      } else if (e.data === YTS.BUFFERING) {
        this.emit('durationchange', this.getDuration());
      }
    }

    _startYtTicker() {
      if (this._ytTick) return;
      this._ytTick = setInterval(() => {
        if (this.backend !== 'youtube' || !this.yt) return;
        this.emit('timeupdate', { time: this.getTime(), duration: this.getDuration() });
        if (this.ytState !== window.YT.PlayerState.PLAYING) {
          clearInterval(this._ytTick);
          this._ytTick = null;
        }
      }, 500);
    }

    /* ---------- HTML5 video events ---------- */
    _wireVideoEvents() {
      const v = this.video;
      v.addEventListener('loadedmetadata', () => {
        this.showLoader(false);
        this.emit('ready', { backend: 'html5', controllable: true });
        this.emit('durationchange', this.getDuration());
      });
      v.addEventListener('play', () => { if (!this.suppress) this.emit('play', { time: this.getTime() }); });
      v.addEventListener('pause', () => { if (!this.suppress) this.emit('pause', { time: this.getTime() }); });
      v.addEventListener('seeked', () => { if (!this.suppress) this.emit('seek', { time: this.getTime() }); });
      v.addEventListener('timeupdate', () => this.emit('timeupdate', { time: this.getTime(), duration: this.getDuration() }));
      v.addEventListener('waiting', () => this.showLoader(true));
      v.addEventListener('playing', () => this.showLoader(false));
      v.addEventListener('ended', () => this.emit('ended'));
      v.addEventListener('progress', () => {
        try {
          if (v.buffered.length) this.emit('buffered', { end: v.buffered.end(v.buffered.length - 1), duration: this.getDuration() });
        } catch (e) {}
      });
    }

    /* ---------- Uniform controls ---------- */
    play() {
      this.suppress = true;
      if (this.backend === 'html5') {
        const p = this.video.play();
        if (p && p.catch) p.catch(() => {});
      } else if (this.backend === 'youtube' && this.yt) {
        this.yt.playVideo();
      }
      setTimeout(() => { this.suppress = false; }, 250);
    }

    pause() {
      this.suppress = true;
      if (this.backend === 'html5') this.video.pause();
      else if (this.backend === 'youtube' && this.yt) this.yt.pauseVideo();
      setTimeout(() => { this.suppress = false; }, 250);
    }

    seek(time) {
      this.suppress = true;
      if (this.backend === 'html5') {
        try { this.video.currentTime = time; } catch (e) {}
      } else if (this.backend === 'youtube' && this.yt) {
        this.yt.seekTo(time, true);
      }
      setTimeout(() => { this.suppress = false; }, 350);
    }

    setRate(rate) {
      if (this.backend === 'html5') this.video.playbackRate = rate;
      else if (this.backend === 'youtube' && this.yt) this.yt.setPlaybackRate(rate);
    }

    setVolume(v01) {
      if (this.backend === 'html5') this.video.volume = v01;
      else if (this.backend === 'youtube' && this.yt) this.yt.setVolume(Math.round(v01 * 100));
    }
    setMuted(m) {
      if (this.backend === 'html5') this.video.muted = m;
      else if (this.backend === 'youtube' && this.yt) { m ? this.yt.mute() : this.yt.unMute(); }
    }

    getTime() {
      if (this.backend === 'html5') return this.video.currentTime || 0;
      if (this.backend === 'youtube' && this.yt && this.yt.getCurrentTime) return this.yt.getCurrentTime() || 0;
      return 0;
    }
    getDuration() {
      if (this.backend === 'html5') return this.video.duration || 0;
      if (this.backend === 'youtube' && this.yt && this.yt.getDuration) return this.yt.getDuration() || 0;
      return 0;
    }
    isPlaying() {
      if (this.backend === 'html5') return !this.video.paused && !this.video.ended;
      if (this.backend === 'youtube' && this.yt) return this.ytState === (window.YT && window.YT.PlayerState.PLAYING);
      return false;
    }
    isControllable() { return this.backend === 'html5' || this.backend === 'youtube'; }

    showLoader(on) { this.loader.hidden = !on; }

    /* ---------- Zoom & Pan ---------- */
    _zoomTarget() {
      // The element we visually transform.
      if (this.backend === 'youtube') return this.ytMount;
      if (this.backend === 'html5') return this.video;
      return null;
    }

    _applyTransform() {
      const el = this._zoomTarget();
      if (!el) return;
      // Clamp pan so the image can't be dragged completely off-screen.
      const maxPan = (this.zoom - 1) * el.clientWidth / 2;
      const maxPanY = (this.zoom - 1) * el.clientHeight / 2;
      this.panX = Math.max(-maxPan, Math.min(maxPan, this.panX));
      this.panY = Math.max(-maxPanY, Math.min(maxPanY, this.panY));
      el.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
      this.emit('zoom', { zoom: this.zoom });
    }

    setZoom(z) {
      this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, +z.toFixed(2)));
      if (this.zoom === 1) { this.panX = 0; this.panY = 0; }
      this._applyTransform();
    }
    zoomIn() { this.setZoom(this.zoom + 0.25); }
    zoomOut() { this.setZoom(this.zoom - 0.25); }
    _resetZoom() { this.zoom = 1; this.panX = 0; this.panY = 0; const el = this._zoomTarget(); if (el) el.style.transform = ''; }
    resetZoom() { this._resetZoom(); this.emit('zoom', { zoom: 1 }); }

    _wireZoomPan() {
      const shell = this.shell;

      // Wheel / ctrl-wheel zoom.
      shell.addEventListener('wheel', (e) => {
        if (this.shell.dataset.empty === 'true') return;
        if (!(e.ctrlKey || e.metaKey)) return; // require modifier so page scroll still works on mobile-less
        e.preventDefault();
        this.setZoom(this.zoom + (e.deltaY < 0 ? 0.2 : -0.2));
      }, { passive: false });

      // Drag to pan (video backend reliably; youtube iframe captures pointer so we
      // pan the container when zoomed).
      let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
      const start = (x, y) => {
        if (this.zoom <= 1) return;
        dragging = true; sx = x; sy = y; ox = this.panX; oy = this.panY;
        const el = this._zoomTarget(); if (el) el.classList.add('panning');
      };
      const move = (x, y) => {
        if (!dragging) return;
        this.panX = ox + (x - sx);
        this.panY = oy + (y - sy);
        this._applyTransform();
      };
      const end = () => {
        dragging = false;
        const el = this._zoomTarget(); if (el) el.classList.remove('panning');
      };

      shell.addEventListener('mousedown', (e) => start(e.clientX, e.clientY));
      window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
      window.addEventListener('mouseup', end);

      // Touch: pinch zoom + single-finger pan.
      let pinchStart = 0, pinchZoom = 1;
      shell.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          pinchStart = this._touchDist(e.touches);
          pinchZoom = this.zoom;
        } else if (e.touches.length === 1) {
          start(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
      shell.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && pinchStart) {
          const d = this._touchDist(e.touches);
          this.setZoom(pinchZoom * (d / pinchStart));
        } else if (e.touches.length === 1) {
          move(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
      shell.addEventListener('touchend', () => { pinchStart = 0; end(); });

      // Double-click toggles 2x zoom.
      shell.addEventListener('dblclick', (e) => {
        if (this.shell.dataset.empty === 'true') return;
        if (e.target.closest('.controls')) return;
        this.setZoom(this.zoom > 1 ? 1 : 2);
      });
    }

    _touchDist(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    /* ---------- Fullscreen ---------- */
    toggleFullscreen() {
      const el = this.shell;
      if (!document.fullscreenElement) {
        (el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen).call(el);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
      }
    }
  }

  // Expose globally for app.js
  window.CineSyncPlayer = Player;
})();
