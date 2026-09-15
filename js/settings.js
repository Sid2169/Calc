/**
 * settings.js
 * Persistent user preferences shared by the calculator and converter UI.
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'gnome-calculator.settings.v1';
  const DEFAULTS = {
    mode: 'advanced',
    quantity: 'angle',
    units: {},
  };

  function validUnitPair(pair) {
    return pair && typeof pair === 'object' &&
      typeof pair.from === 'string' && typeof pair.to === 'string';
  }

  function normalize(value) {
    const settings = {
      mode: DEFAULTS.mode,
      quantity: DEFAULTS.quantity,
      units: {},
    };

    if (!value || typeof value !== 'object' || Array.isArray(value)) return settings;
    if (typeof value.mode === 'string') settings.mode = value.mode;
    if (typeof value.quantity === 'string') settings.quantity = value.quantity;

    if (value.units && typeof value.units === 'object' && !Array.isArray(value.units)) {
      Object.entries(value.units).forEach(([quantity, pair]) => {
        if (validUnitPair(pair)) {
          settings.units[quantity] = { from: pair.from, to: pair.to };
        }
      });
    }

    return settings;
  }

  function load() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : normalize(DEFAULTS);
    } catch (error) {
      return normalize(DEFAULTS);
    }
  }

  let state = load();

  function save() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (error) {
      // Preferences remain usable for this session when storage is unavailable.
    }
  }

  function get() {
    return normalize(state);
  }

  function setMode(mode) {
    if (typeof mode !== 'string') return;
    state.mode = mode;
    save();
  }

  function setQuantity(quantity) {
    if (typeof quantity !== 'string') return;
    state.quantity = quantity;
    save();
  }

  function setUnits(quantity, from, to) {
    if (![quantity, from, to].every((value) => typeof value === 'string')) return;
    state.units[quantity] = { from, to };
    save();
  }

  global.Settings = {
    get,
    setMode,
    setQuantity,
    setUnits,
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ----- test harness (node) ----- */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = global.Settings;
}
