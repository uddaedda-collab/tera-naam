/* ============================================================
   CineSync · PWA install + service worker registration
   ------------------------------------------------------------
   - Registers the service worker (makes the app installable & fast)
   - Captures the Android/Chrome install prompt and shows a pretty
     "Install app" button
   - Detects iOS (which has no prompt) and shows simple
     "Add to Home Screen" instructions instead
   ============================================================ */
(function () {
  'use strict';

  // --- Register the service worker ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as Mac; detect touch to disambiguate
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  let deferredPrompt = null;

  function el(id) { return document.getElementById(id); }

  function showInstallButton(show) {
    const btn = el('btnInstall');
    if (btn) btn.hidden = !show;
  }

  // Android / desktop Chrome: capture the prompt.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone()) showInstallButton(true);
  });

  // Already installed -> hide button, say thanks.
  window.addEventListener('appinstalled', () => {
    showInstallButton(false);
    deferredPrompt = null;
    if (window.CineSyncToast) window.CineSyncToast('Installed! Open CineSync from your home screen 🎬');
  });

  function openIosSheet() {
    const sheet = el('iosInstall');
    if (sheet) sheet.hidden = false;
  }

  function wire() {
    const btn = el('btnInstall');
    if (!btn) return;

    // If already installed as an app, never show the button.
    if (isStandalone()) { showInstallButton(false); return; }

    // On iOS there is no beforeinstallprompt; show the button so we can
    // give Add-to-Home-Screen instructions.
    if (isIOS()) showInstallButton(true);

    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch (e) {}
        deferredPrompt = null;
        showInstallButton(false);
      } else if (isIOS()) {
        openIosSheet();
      } else {
        if (window.CineSyncToast) {
          window.CineSyncToast('Open your browser menu → "Install app" / "Add to Home screen"');
        }
      }
    });

    // Close button for the iOS instructions sheet.
    const close = el('iosInstallClose');
    if (close) close.addEventListener('click', () => { el('iosInstall').hidden = true; });
    const backdrop = document.querySelector('#iosInstall .modal__backdrop');
    if (backdrop) backdrop.addEventListener('click', () => { el('iosInstall').hidden = true; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
