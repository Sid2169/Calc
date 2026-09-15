/**
 * pwa.js
 * Registers the offline application shell on supported secure origins.
 */

(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // Installation support is optional; calculator operation remains available.
    });
  });
})();
