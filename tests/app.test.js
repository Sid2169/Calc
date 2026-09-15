import { describe, it, expect, beforeEach } from 'vitest';
import { openApp } from './bootstrap.js';

let app;

function setMode(mode) {
  const sel = app.document.getElementById('modeSelector');
  sel.value = mode;
  sel.dispatchEvent(new app.window.Event('change', { bubbles: true }));
}

function basicHidden() {
  return app.document.querySelector('.basic-buttons').classList.contains('panel-hidden');
}

function advancedHidden() {
  return app.document.querySelector('.advanced-buttons').classList.contains('panel-hidden');
}

function swipeKeypad(fromX, fromY, toX, toY) {
  const keypad = app.document.getElementById('advancedKeypad');
  const start = new app.window.Event('touchstart', { bubbles: true });
  const end = new app.window.Event('touchend', { bubbles: true });

  Object.defineProperty(start, 'touches', {
    value: [{ clientX: fromX, clientY: fromY }],
  });
  Object.defineProperty(end, 'changedTouches', {
    value: [{ clientX: toX, clientY: toY }],
  });

  keypad.dispatchEvent(start);
  keypad.dispatchEvent(end);
}

describe('Mode switching', () => {
  beforeEach(() => {
    app = openApp();
  });

  it('boots in advanced mode with the calculator panel active', () => {
    const panel = app.document.getElementById('advancedPanel');
    expect(panel.classList.contains('panel-active')).toBe(true);
    expect(panel.classList.contains('panel-hidden')).toBe(false);
    expect(app.document.getElementById('modeSelector').value).toBe('advanced');
  });

  it('basic mode hides the advanced keypad and keeps the basic keypad', () => {
    setMode('basic');
    expect(advancedHidden()).toBe(true);
    expect(basicHidden()).toBe(false);
  });

  it('keyboard mode hides both keypads and shows the display', () => {
    setMode('keyboard');
    expect(basicHidden()).toBe(true);
    expect(advancedHidden()).toBe(true);
    expect(app.document.getElementById('displayText')).toBeTruthy();
  });

  it('advanced mode shows both keypads again', () => {
    setMode('keyboard');
    setMode('advanced');
    expect(basicHidden()).toBe(false);
    expect(advancedHidden()).toBe(false);
  });

  it('the mobile keypad button switches and labels both keypad views', () => {
    const activeToggle = app.document.querySelector('.converter-active .keypad-view-toggle');
    const keypad = app.document.getElementById('advancedKeypad');

    expect(keypad.dataset.keypadView).toBe('basic');
    activeToggle.click();
    expect(keypad.dataset.keypadView).toBe('advanced');
    expect(app.display()).toBe('0');
    expect(activeToggle.getAttribute('aria-label')).toBe('Show number keys');
    expect(activeToggle.getAttribute('aria-pressed')).toBe('true');

    activeToggle.click();
    expect(keypad.dataset.keypadView).toBe('basic');
    expect(app.display()).toBe('0');
    expect(activeToggle.getAttribute('aria-label')).toBe('Show advanced keys');
  });

  it('switches keypad views with horizontal swipes in advanced mode', () => {
    const keypad = app.document.getElementById('advancedKeypad');

    swipeKeypad(160, 40, 80, 45);
    expect(keypad.dataset.keypadView).toBe('advanced');

    swipeKeypad(80, 40, 160, 45);
    expect(keypad.dataset.keypadView).toBe('basic');
  });

  it('ignores vertical gestures and keypad swipes outside advanced mode', () => {
    const keypad = app.document.getElementById('advancedKeypad');

    swipeKeypad(160, 40, 120, 130);
    expect(keypad.dataset.keypadView).toBe('basic');

    setMode('basic');
    swipeKeypad(160, 40, 80, 45);
    expect(keypad.dataset.keypadView).toBe('basic');
  });

  it('keeps an active converter container visible in every mode', () => {
    for (const mode of ['advanced', 'basic', 'keyboard']) {
      setMode(mode);
      const active = app.document.querySelector('.converter-container.converter-active');
      expect(active, `converter active in ${mode} mode`).not.toBeNull();
      expect(active.classList.contains('converter-hidden')).toBe(false);
      expect(app.document.querySelectorAll('.converter-container.converter-active').length).toBe(1);
    }
  });

  it('the quantity selector drives which converter container is active', () => {
    const sel = app.document.getElementById('quantitySelector');
    const angle = app.document.querySelector('.converter-container.angle');
    const length = app.document.querySelector('.converter-container.length');

    expect(angle.classList.contains('converter-active')).toBe(true);

    sel.value = 'length';
    sel.dispatchEvent(new app.window.Event('change', { bubbles: true }));

    expect(length.classList.contains('converter-active')).toBe(true);
    expect(length.classList.contains('converter-hidden')).toBe(false);
    expect(angle.classList.contains('converter-active')).toBe(false);
    expect(angle.classList.contains('converter-hidden')).toBe(true);
  });

  it('switches between modes repeatedly without erroring', () => {
    const cycle = ['advanced', 'basic', 'keyboard', 'basic', 'advanced', 'keyboard', 'advanced'];
    for (const mode of cycle) {
      expect(() => setMode(mode)).not.toThrow();
    }
  });

  it.each(['advanced', 'basic', 'keyboard'])(
    'has exactly one .panel-active panel in %s mode',
    (mode) => {
      setMode(mode);
      expect(app.document.querySelectorAll('.panel-active').length).toBe(1);
      expect(app.document.querySelectorAll('.panel-active.panel-hidden').length).toBe(0);
    }
  );
});
