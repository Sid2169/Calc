/**
 * app.js
 * Application bootstrap: wires the Calculator module and the mode selector.
 *
 * Modes (via #modeSelector):
 *   advanced -> show both basic and advanced keypads
 *   basic    -> show keypad but hide advanced buttons
 *   keyboard -> hide the keypad; type directly into the display
 *
 * The unit-converter section is intentionally kept visible in every mode.
 */

(function () {
  'use strict';

  const Calculator = window.Calculator;
  if (!Calculator) {
    throw new Error('app.js requires calculator.js to be loaded first');
  }

  const Converter = window.Converter;
  if (Converter) {
    Converter.init();
  }

  const modeSelector = document.getElementById('modeSelector');
  const advancedButtons = document.querySelector('.advanced-buttons');
  const basicButtons = document.querySelector('.basic-buttons');
  const advancedKeypad = document.getElementById('advancedKeypad');
  const keypadViewToggles = document.querySelectorAll('.keypad-view-toggle');
  let touchStart = null;

  function setKeypadView(view) {
    const nextView = view === 'advanced' ? 'advanced' : 'basic';
    advancedKeypad.dataset.keypadView = nextView;

    keypadViewToggles.forEach((button) => {
      const showingAdvanced = nextView === 'advanced';
      const actionLabel = showingAdvanced ? 'Show number keys' : 'Show advanced keys';
      button.setAttribute('aria-label', actionLabel);
      button.setAttribute('aria-pressed', String(showingAdvanced));
      button.title = actionLabel;
    });
  }

  function setToggleVisibility(visible) {
    keypadViewToggles.forEach((button) => {
      button.classList.toggle('panel-hidden', !visible);
    });
  }

  function applyMode(mode) {
    switch (mode) {
      case 'advanced':
        setKeypadView(advancedKeypad.dataset.keypadView);
        advancedButtons.classList.remove('panel-hidden');
        basicButtons.classList.remove('panel-hidden');
        setToggleVisibility(true);
        break;
      case 'basic':
        setKeypadView('basic');
        advancedButtons.classList.add('panel-hidden');
        basicButtons.classList.remove('panel-hidden');
        setToggleVisibility(false);
        break;
      case 'keyboard':
        basicButtons.classList.add('panel-hidden');
        advancedButtons.classList.add('panel-hidden');
        setToggleVisibility(false);
        document.getElementById('displayText').focus();
        break;
      default:
        break;
    }
  }

  applyMode(modeSelector.value);
  modeSelector.addEventListener('change', () => {
    applyMode(modeSelector.value);
  });

  keypadViewToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const nextView = advancedKeypad.dataset.keypadView === 'advanced' ? 'basic' : 'advanced';
      setKeypadView(nextView);
    });
  });

  advancedKeypad.addEventListener('touchstart', (event) => {
    if (modeSelector.value !== 'advanced' || event.touches.length !== 1) return;
    touchStart = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }, { passive: true });

  advancedKeypad.addEventListener('touchend', (event) => {
    if (!touchStart || event.changedTouches.length !== 1) return;

    const deltaX = event.changedTouches[0].clientX - touchStart.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    setKeypadView(deltaX < 0 ? 'advanced' : 'basic');
  }, { passive: true });

  advancedKeypad.addEventListener('touchcancel', () => {
    touchStart = null;
  }, { passive: true });

  Calculator.init();
})();
