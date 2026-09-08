/**
 * keypad.js
 * Responsive two-part keypad for narrow windows (GNOME-Calculator style).
 *
 * In Advanced mode the keypad has two parts (basic + advanced). When the
 * window is too narrow for both to sit side by side, only the selected part
 * takes the whole width and a toggle button switches between the parts.
 * On touch devices the parts can also be switched by swiping sideways.
 *
 * Exposes window.KeypadState with:
 *   - init():        wire breakpoint detection, toggle button and swipe
 *   - applyMode():   called by app.js when the mode changes
 *   - setPart(p):    switch to the 'basic' or 'advanced' part
 *   - togglePart():  switch to the other part
 *   - getPart():     currently selected part ('basic' | 'advanced')
 *   - isCollapsed(): whether the two parts are currently collapsed
 */

(function (global) {
  'use strict';

  const keypadEl = document.querySelector('.advanced-keypad');
  const toggleEl = document.getElementById('keypadToggle');
  if (!keypadEl || !toggleEl) {
    throw new Error('keypad.js requires .advanced-keypad and #keypadToggle in the DOM');
  }

  const BREAKPOINT = 640; // px; below this the two parts no longer fit side by side

  let currentMode = 'advanced';
  let currentPart = 'basic'; // remember the last-selected part across toggles
  let collapsed = false;     // collapsed layout active (advanced mode + narrow)

  function isNarrow() {
    if (global.matchMedia) {
      return global.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`).matches;
    }
    // jsdom fallback: no matchMedia, rely on the window width.
    return global.innerWidth < BREAKPOINT;
  }

  function setCollapsed(next) {
    if (collapsed === next) return;
    collapsed = next;
    keypadEl.classList.toggle('keypad-collapsed', collapsed);
    toggleEl.classList.toggle('keypad-collapsed', collapsed);
  }

  function syncActiveClasses() {
    keypadEl.classList.toggle('show-advanced', currentPart === 'advanced');
    // The arrow points at the part that will be revealed next.
    toggleEl.textContent = currentPart === 'basic' ? '›' : '‹';
  }

  function setPart(part) {
    if (part !== 'basic' && part !== 'advanced') return;
    currentPart = part;
    syncActiveClasses();
  }

  function togglePart() {
    setPart(currentPart === 'basic' ? 'advanced' : 'basic');
  }

  function refresh() {
    const narrow = isNarrow();
    // The collapsed single-part layout only applies in advanced mode; in
    // basic/keyboard modes the panel-hidden logic controls what is shown.
    setCollapsed(currentMode === 'advanced' && narrow);
  }

  function applyMode(mode) {
    currentMode = mode;
    refresh();
  }

  function init() {
    // Re-evaluate the breakpoint when the window is resized.
    global.addEventListener('resize', refresh);
    if (global.matchMedia) {
      global.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`).addEventListener('change', refresh);
    }

    // Toggle button.
    toggleEl.addEventListener('click', togglePart);

    // Swipe anywhere on the keypad to slide between the parts (touch devices).
    let touchStartX = null;
    let touchStartY = null;

    keypadEl.addEventListener('touchstart', (e) => {
      if (!collapsed) return;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }, { passive: true });

    keypadEl.addEventListener('touchmove', (e) => {
      // Let vertical scrolling continue; only horizontal swipes switch parts.
      if (!collapsed || touchStartX === null) return;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = Math.abs(t.clientX - touchStartX);
      const dy = Math.abs(t.clientY - touchStartY);
      if (dy > dx && dy > 24) {
        touchStartX = null; // vertical scroll intent; abandon the gesture
      }
    }, { passive: true });

    keypadEl.addEventListener('touchend', (e) => {
      if (!collapsed || touchStartX === null) return;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - touchStartX;
      const THRESHOLD = 40; // px of horizontal travel required to switch
      if (dx <= -THRESHOLD && currentPart === 'basic') {
        setPart('advanced'); // swipe left -> advanced
      } else if (dx >= THRESHOLD && currentPart === 'advanced') {
        setPart('basic'); // swipe right -> basic
      }
      touchStartX = null;
    }, { passive: true });

    refresh();
  }

  global.KeypadState = {
    init,
    applyMode,
    setPart,
    togglePart,
    getPart: function () {
      return currentPart;
    },
    isCollapsed: function () {
      return collapsed && currentMode === 'advanced';
    },
    // testing hook
    _refresh: refresh
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ----- node test harness ----- */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = global.KeypadState;
}