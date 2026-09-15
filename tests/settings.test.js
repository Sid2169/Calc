import { describe, it, expect, beforeEach } from 'vitest';
import { openApp } from './bootstrap.js';

const SETTINGS_STORAGE_KEY = 'gnome-calculator.settings.v1';
let app;

function changeSelect(select, value) {
  select.value = value;
  select.dispatchEvent(new app.window.Event('change', { bubbles: true }));
}

function savedSettings() {
  return JSON.parse(app.window.localStorage.getItem(SETTINGS_STORAGE_KEY));
}

describe('Persistent settings', () => {
  beforeEach(() => {
    app = openApp();
  });

  it('restores the mode, quantity, and saved units before the UI initializes', () => {
    app = openApp(undefined, {
      [SETTINGS_STORAGE_KEY]: JSON.stringify({
        mode: 'basic',
        quantity: 'length',
        units: {
          length: { from: 'kilometer', to: 'mile' },
          angle: { from: 'radian', to: 'gradian' },
        },
      }),
    });

    const length = app.document.querySelector('.converter-container.length');
    const angle = app.document.querySelector('.converter-container.angle');
    expect(app.document.getElementById('modeSelector').value).toBe('basic');
    expect(app.document.querySelector('.advanced-buttons').classList.contains('panel-hidden')).toBe(true);
    expect(app.document.getElementById('quantitySelector').value).toBe('length');
    expect(length.classList.contains('converter-active')).toBe(true);
    expect(length.querySelector('.from-unit').value).toBe('kilometer');
    expect(length.querySelector('.to-unit').value).toBe('mile');
    expect(angle.querySelector('.from-unit').value).toBe('radian');
    expect(angle.querySelector('.to-unit').value).toBe('gradian');
  });

  it('saves mode, quantity, and unit changes in one settings record', () => {
    changeSelect(app.document.getElementById('modeSelector'), 'keyboard');
    changeSelect(app.document.getElementById('quantitySelector'), 'length');

    const length = app.document.querySelector('.converter-container.length');
    changeSelect(length.querySelector('.from-unit'), 'kilometer');
    changeSelect(length.querySelector('.to-unit'), 'foot');

    expect(savedSettings()).toEqual({
      mode: 'keyboard',
      quantity: 'length',
      units: {
        length: { from: 'kilometer', to: 'foot' },
      },
    });
  });

  it('saves the new unit order when the conversion switch is used', () => {
    changeSelect(app.document.getElementById('quantitySelector'), 'angle');
    const angle = app.document.querySelector('.converter-container.angle');
    changeSelect(angle.querySelector('.from-unit'), 'degree');
    changeSelect(angle.querySelector('.to-unit'), 'radian');

    angle.querySelector('.switch-btn').click();

    expect(savedSettings().units.angle).toEqual({ from: 'radian', to: 'degree' });
    expect(app.display()).toBe('0');
  });

  it('falls back to markup defaults for malformed or unavailable options', () => {
    app = openApp(undefined, {
      [SETTINGS_STORAGE_KEY]: JSON.stringify({
        mode: 'unsupported-mode',
        quantity: 'unsupported-quantity',
        units: {
          angle: { from: 'unsupported-unit', to: 'also-unsupported' },
        },
      }),
    });

    const angle = app.document.querySelector('.converter-container.angle');
    expect(app.document.getElementById('modeSelector').value).toBe('advanced');
    expect(app.document.getElementById('quantitySelector').value).toBe('angle');
    expect(angle.querySelector('.from-unit').value).toBe('degree');
    expect(angle.querySelector('.to-unit').value).toBe('degree');

    expect(() => {
      app = openApp(undefined, { [SETTINGS_STORAGE_KEY]: '{invalid json' });
    }).not.toThrow();
    expect(app.document.getElementById('modeSelector').value).toBe('advanced');
  });
});
