/**
 * Shared test bootstrap.
 *
 * Loads the real index.html into jsdom and then executes the four app
 * scripts in the same order the browser does, reproducing the page's boot
 * sequence (app.js calls Calculator.init() and Converter.init() itself).
 *
 * The bootstrap returns a handle with helpers for driving the calculator
 * exactly like a user does (clicking on-screen buttons, pressing keys,
 * typing into the display), plus references to the exposed modules.
 *
 * Usage:
 *   import { openApp, clickButton, key } from './bootstrap.js';
 *   const app = openApp();
 *   app.click('<button-label>');      // e.g. '5', '+', '=', '×'
 *   app.key('Enter');
 */
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SCRIPT_ORDER = ['js/evaluator.js', 'js/converter.js', 'js/calculator.js', 'js/keypad.js', 'js/app.js'];

export function buildDom() {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  return new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
}

// Default fetch stub so the app can boot without a network. Converter.init()
// fires an immediate currency refresh; jsdom has no native fetch, so provide
// a stand-in. It rejects (like a network-unavailable page): the converter
// catches the failure and leaves currency as "not yet fetched", so tests that
// care about currency install their own stub and trigger the lazy refetch via
// Converter.setQuantity('currency'). Individual tests may inject their own
// fetch through openApp(fetchFn).
export function defaultFetch() {
  return () => Promise.reject(new Error('no network (test default)'));
}

export function loadScripts(window) {
  for (const rel of SCRIPT_ORDER) {
    const src = readFileSync(resolve(ROOT, rel), 'utf8');
    window.eval(src);
  }
}

export function openApp(fetchFn) {
  const dom = buildDom();
  const { window } = dom;
  const { document } = window;

  // Provide a fetch impl before the app scripts boot (app.js's
  // Converter.init() fires a currency refresh immediately). jsdom has no
  // native fetch, so default to a resolvable stub; tests may inject their own.
  window.fetch = fetchFn || defaultFetch();

  loadScripts(window);

  const Calculator = window.Calculator;
  const Converter = window.Converter;

  const clickButton = (label) => {
    const btn = [...document.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === String(label)
    );
    if (!btn) throw new Error(`clickButton: no button with label "${label}"`);
    btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  };

  const pressButton = (label) => clickButton(label);

  const key = (keyArg, extra = {}) => {
    document.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: keyArg, bubbles: true, cancelable: true, ...extra })
    );
  };

  const type = (value) => {
    const input = document.getElementById('displayText');
    input.value = value;
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  };

  const display = () => document.getElementById('displayText').value;
  const history = () => [...document.querySelectorAll('.history-entry')].map(
    (r) => ({
      expr: r.querySelector('.history-expr').textContent,
      value: r.querySelector('.history-value').textContent,
    })
  );

  return {
    dom, window, document,
    Calculator,
    Converter,
    clickButton,
    pressButton: clickButton,
    key,
    type,
    display,
    history,
    get displayValue() {
      return display();
    },
  };
}

/* Re-export module handles for direct unit access. */
export async function loadModule(relPath) {
  return import(resolve(ROOT, relPath));
}