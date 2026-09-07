import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openApp } from './bootstrap.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_HTML = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');

let app;

describe('DOM/UI integrity', () => {
  beforeEach(() => {
    app = openApp();
  });

  it('exposes all app globals on window', () => {
    expect(app.window.Evaluator).toBeDefined();
    expect(app.window.Converter).toBeDefined();
    expect(app.window.Calculator).toBeDefined();

    expect(typeof app.window.Evaluator).toBe('object');
    expect(typeof app.window.Converter).toBe('object');
    expect(typeof app.window.Calculator).toBe('object');
  });

  it('loads the four scripts in order: evaluator, converter, calculator, app', () => {
    const srcs = [...INDEX_HTML.matchAll(/ src="(js\/[^"]+)"/g)].map((m) => m[1]);
    expect(srcs).toEqual([
      'js/evaluator.js',
      'js/converter.js',
      'js/calculator.js',
      'js/app.js',
    ]);
  });

  it('every calculator keypad button is clickable without throwing', () => {
    const buttons = [
      ...app.document.querySelectorAll('.basic-buttons button, .advanced-buttons button'),
    ];
    expect(buttons.length).toBeGreaterThan(0);

    for (const btn of buttons) {
      const label = btn.textContent.trim();
      if (!label) continue;
      expect(
        () => btn.dispatchEvent(new app.window.MouseEvent('click', { bubbles: true })),
        `clicking "${label}"`
      ).not.toThrow();
    }
  });

  it('has the displayText input used for typing', () => {
    const input = app.document.getElementById('displayText');
    expect(input).not.toBeNull();
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('text');
    expect(input.value).toBe('0');
  });

  it('the active converter container exposes a result element when shown', () => {
    const active = app.document.querySelector('.converter-container.converter-active');
    expect(active).not.toBeNull();

    const result = active.querySelector('.result');
    expect(result).not.toBeNull();
    expect(result.textContent.trim().length).toBeGreaterThan(0);
    expect(result.textContent).toContain('=');
  });
});