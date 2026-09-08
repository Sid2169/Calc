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
  const KeypadState = window.KeypadState;

  function applyMode(mode) {
    switch (mode) {
      case 'advanced':
        advancedButtons.classList.remove('panel-hidden');
        basicButtons.classList.remove('panel-hidden');
        break;
      case 'basic':
        advancedButtons.classList.add('panel-hidden');
        basicButtons.classList.remove('panel-hidden');
        break;
      case 'keyboard':
        basicButtons.classList.add('panel-hidden');
        advancedButtons.classList.add('panel-hidden');
        document.getElementById('displayText').focus();
        break;
      default:
        break;
    }
    if (KeypadState) {
      KeypadState.applyMode(mode);
    }
  }

  if (KeypadState) {
    KeypadState.init();
  }
  applyMode(modeSelector.value);
  modeSelector.addEventListener('change', () => {
    applyMode(modeSelector.value);
  });

  Calculator.init();
})();