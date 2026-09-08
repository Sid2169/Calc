import { describe, it, expect, beforeEach } from 'vitest';
import { openApp } from './bootstrap.js';

let app;

function setInnerWidth(width) {
  Object.defineProperty(app.window, 'innerWidth', { value: width, configurable: true });
  app.window.dispatchEvent(new app.window.Event('resize'));
}

function setMode(mode) {
  const sel = app.document.getElementById('modeSelector');
  sel.value = mode;
  sel.dispatchEvent(new app.window.Event('change', { bubbles: true }));
}

function keypad() {
  return app.document.querySelector('.advanced-keypad');
}

function toggleBtn() {
  return app.document.getElementById('keypadToggle');
}

function touch(startX, endX, startY = 0, endY = 0) {
  const el = keypad();
  const startEvent = new app.window.Event('touchstart', { bubbles: true });
  Object.defineProperty(startEvent, 'changedTouches', {
    value: [{ clientX: startX, clientY: startY }],
  });
  el.dispatchEvent(startEvent);

  const moveEvent = new app.window.Event('touchmove', { bubbles: true });
  Object.defineProperty(moveEvent, 'changedTouches', {
    value: [{ clientX: endX, clientY: endY }],
  });
  el.dispatchEvent(moveEvent);

  const endEvent = new app.window.Event('touchend', { bubbles: true });
  Object.defineProperty(endEvent, 'changedTouches', {
    value: [{ clientX: endX, clientY: endY }],
  });
  el.dispatchEvent(endEvent);
}

describe('Two-part keypad collapse (GNOME narrow-window behavior)', () => {
  beforeEach(() => {
    app = openApp();
  });

  it('starts wide (window >= 640px): both parts shown, toggle hidden', () => {
    expect(app.window.innerWidth).toBe(1024);
    expect(keypad().classList.contains('keypad-collapsed')).toBe(false);
    expect(toggleBtn().classList.contains('keypad-collapsed')).toBe(false);
  });

  it('narrow window in advanced mode collapses the keypad to one part, basic first', () => {
    setInnerWidth(400);
    expect(keypad().classList.contains('keypad-collapsed')).toBe(true);
    expect(toggleBtn().classList.contains('keypad-collapsed')).toBe(true);
    expect(keypad().classList.contains('show-advanced')).toBe(false);
    expect(toggleBtn().textContent).toBe('›');
  });

  it('widening the window restores the side-by-side layout', () => {
    setInnerWidth(400);
    setInnerWidth(1024);
    expect(keypad().classList.contains('keypad-collapsed')).toBe(false);
    expect(toggleBtn().classList.contains('keypad-collapsed')).toBe(false);
  });

  it('toggle button switches between the basic and advanced parts', () => {
    setInnerWidth(400);
    toggleBtn().dispatchEvent(new app.window.Event('click', { bubbles: true }));
    expect(keypad().classList.contains('show-advanced')).toBe(true);
    expect(toggleBtn().textContent).toBe('‹');

    toggleBtn().dispatchEvent(new app.window.Event('click', { bubbles: true }));
    expect(keypad().classList.contains('show-advanced')).toBe(false);
    expect(toggleBtn().textContent).toBe('›');
  });

  it('remembers the selected part across collapse/expand cycles', () => {
    setInnerWidth(400);
    toggleBtn().dispatchEvent(new app.window.Event('click', { bubbles: true })); // advanced
    expect(keypad().classList.contains('show-advanced')).toBe(true);

    setInnerWidth(1024); // expand
    expect(keypad().classList.contains('show-advanced')).toBe(true);

    setInnerWidth(400); // collapse again
    expect(keypad().classList.contains('keypad-collapsed')).toBe(true);
    expect(keypad().classList.contains('show-advanced')).toBe(true);
  });

  it('does not collapse outside advanced mode', () => {
    setMode('basic');
    setInnerWidth(400);
    expect(keypad().classList.contains('keypad-collapsed')).toBe(false);
    expect(toggleBtn().classList.contains('keypad-collapsed')).toBe(false);

    setMode('keyboard');
    expect(keypad().classList.contains('keypad-collapsed')).toBe(false);
  });

  it('collapses again when switching back to advanced mode while narrow', () => {
    setMode('basic');
    setInnerWidth(400);
    expect(keypad().classList.contains('keypad-collapsed')).toBe(false);
    setMode('advanced');
    expect(keypad().classList.contains('keypad-collapsed')).toBe(true);
  });

  it('setPart switches to the requested part and ignores invalid parts', () => {
    setInnerWidth(400);
    app.window.KeypadState.setPart('advanced');
    expect(keypad().classList.contains('show-advanced')).toBe(true);
    app.window.KeypadState.setPart('nope');
    expect(keypad().classList.contains('show-advanced')).toBe(true);
    app.window.KeypadState.setPart('basic');
    expect(keypad().classList.contains('show-advanced')).toBe(false);
  });

  it('swipe left on the keypad switches to the advanced part', () => {
    setInnerWidth(400);
    expect(keypad().classList.contains('show-advanced')).toBe(false);
    touch(300, 100);
    expect(keypad().classList.contains('show-advanced')).toBe(true);
    expect(toggleBtn().textContent).toBe('‹');
  });

  it('swipe right on the keypad switches back to the basic part', () => {
    setInnerWidth(400);
    app.window.KeypadState.setPart('advanced');
    touch(100, 300);
    expect(keypad().classList.contains('show-advanced')).toBe(false);
    expect(toggleBtn().textContent).toBe('›');
  });

  it('a short horizontal swipe (below threshold) does not switch parts', () => {
    setInnerWidth(400);
    touch(300, 270);
    expect(keypad().classList.contains('show-advanced')).toBe(false);
  });

  it('a predominantly vertical swipe does not switch parts', () => {
    setInnerWidth(400);
    touch(300, 200, 0, 200);
    expect(keypad().classList.contains('show-advanced')).toBe(false);
  });

  it('swiping does nothing while the keypad is not collapsed', () => {
    touch(300, 100);
    expect(keypad().classList.contains('show-advanced')).toBe(false);
  });
});