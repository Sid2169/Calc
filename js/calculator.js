/**
 * calculator.js
 * Display management and on-screen button handling for the calculator.
 *
 * The display holds a single text expression. Button presses either append
 * tokens, tweak the tail (e.g. %, !, ^), or trigger evaluation through the
 * Evaluator module.
 *
 * Exposes window.Calculator with:
 *   - syncDisplay():     refresh input value from internal string
 *   - insertToken(tok):  append token text to the display
 *   - evaluate(exp):     translate display symbols and compute a result string
 *   - calculate():       evaluate current display and write back the result
 *   - clear():           reset the display
 *   - undo():            remove the last token/character
 *   - init():            bind all button + keyboard handlers
 */

(function (global) {
  'use strict';

  const evaluator = global.Evaluator;
  if (!evaluator) {
    throw new Error('calculator.js requires evaluator.js to be loaded first');
  }

  const displayEl = document.getElementById('displayText');
  if (!displayEl) {
    throw new Error('calculator.js: #displayText not found in the document');
  }

  let displayStr = displayEl.value || '';
  let justEvaluated = false;

  /* ------------------------- Formatting ------------------------- */

  // Format a real number, limiting precision to avoid floating point noise
  // (0.1+0.2 -> 0.30000000000000004).
  function formatReal(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 'Error';
    }
    if (!Number.isFinite(value)) {
      return value > 0 ? 'Infinity' : '-Infinity';
    }
    if (Object.is(value, -0)) value = 0;

    // Very large / very small numbers in exponential notation
    if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-9 && value !== 0)) {
      return value.toExponential(10).replace(/\.0+e/, 'e');
    }
    // Round to a sensible precision then strip trailing zeros
    const rounded = parseFloat(value.toPrecision(12));
    return String(rounded);
  }

  // Format a complex number {re, im} as "a + bi". Tiny floating-point
  // noise in either component is dropped (sqrt(-1) -> "i", not "0 + 1i").
  function formatComplex(z) {
    let re = z.re, im = z.im;
    if (Math.abs(re) < 1e-15) re = 0;
    if (Math.abs(im) < 1e-15) im = 0;
    if (re === 0 && im === 0) return '0';
    let s = '';
    if (re !== 0) s += formatReal(re);
    if (im !== 0) {
      const imAbs = formatReal(Math.abs(im));
      const imStr = imAbs === '1' ? 'i' : imAbs + 'i';
      if (im < 0) {
        s = s === '' ? '-' + imStr : s + ' - ' + imStr;
      } else {
        s = s === '' ? imStr : s + ' + ' + imStr;
      }
    }
    return s;
  }

  function formatResult(value) {
    if (value && typeof value === 'object' && value.__definedFunction) {
      return String(value.result);
    }
    if (value && typeof value === 'object' && typeof value.re === 'number') {
      return formatComplex(value);
    }
    return formatReal(value);
  }

  /* ----------------------- Display read/write ---------------------- */

  function syncDisplay() {
    displayEl.value = displayStr;
    // Notify other modules (e.g. the unit converter) that the value changed.
    document.dispatchEvent(new CustomEvent('calculator:display', { detail: displayStr }));
  }

  // Keep internal state in sync with manual keyboard typing in the input
  function bindDisplayInput() {
    displayEl.addEventListener('input', () => {
      displayStr = displayEl.value;
      justEvaluated = false;
    });
  }

  /* ------------------------- Token insertion ------------------------- */

  const OPERATOR_RE = /[÷×+−\-*/]/;

  // Unicode superscript/subscript digits, used for entry via the ↑n / ↓n
  // modes and for radix notation (e.g. 75₈).
  const SUP_DIGITS = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
                       '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  const SUB_DIGITS = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
                       '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };

  // Reverse maps for translateSymbols (unicode superscript → ASCII digit).
  const SUP_TO_ASCII = Object.create(null);
  Object.keys(SUP_DIGITS).forEach((k) => { SUP_TO_ASCII[SUP_DIGITS[k]] = k; });

  // ↑n / ↓n arm the next digit to be entered as a superscript / subscript
  // character. A single digit consumes the armed flag (GNOME behaves the
  // same way: Ctrl+<digit> / Alt+<digit> enter one raised/lowered digit).
  let superscriptArmed = false;
  let subscriptArmed = false;

  function armSuperscript() {
    subscriptArmed = false;
    superscriptArmed = !superscriptArmed;
  }

  function armSubscript() {
    superscriptArmed = false;
    subscriptArmed = !subscriptArmed;
  }

  function tailChar() {
    return displayStr[displayStr.length - 1] || '';
  }

  // Smart token appending: error recovery, implicit multiplication,
  // operator chaining, decimal-point guards and leading-zero handling.
  function insertToken(token) {
    // A digit typed while ↑n / ↓n is armed becomes a raised/lowered digit.
    // Any other token cancels the pending mode.
    if (superscriptArmed && /^[0-9]$/.test(token)) {
      token = SUP_DIGITS[token];
      superscriptArmed = false;
    } else if (subscriptArmed && /^[0-9]$/.test(token)) {
      token = SUB_DIGITS[token];
      subscriptArmed = false;
    } else if (superscriptArmed || subscriptArmed) {
      superscriptArmed = false;
      subscriptArmed = false;
    }

    // After an error/infinity result, start fresh on the next input
    if (displayStr === 'Error' || displayStr === 'Infinity' || displayStr === '-Infinity') {
      if (OPERATOR_RE.test(token)) return;
      displayStr = '';
    }

    // Right after "=" a value starts a brand-new entry, while an operator
    // continues from the result ("5 = then +2" -> "5+2").
    if (justEvaluated) {
      justEvaluated = false;
      if (!OPERATOR_RE.test(token) && token.trim() !== 'mod') {
        displayStr = '';
      }
    }

    // A leading "0" is a placeholder; replace it unless the incoming token
    // is a digit, decimal point, or operator (0+..., 0.5, 0×3)
    if (displayStr === '0' && !/^[0-9]$/.test(token) && token !== '.' && !OPERATOR_RE.test(token)) {
      displayStr = '';
    }

    const tail = tailChar();

    // Implicit multiplication: a value directly followed by "(", "π", "e"
    // or "i" becomes multiplication, e.g. "2(" -> "2 × (", "3π" -> "3 × π",
    // ")π" -> ") × π", "3i" -> "3 × i", "πe" -> "π × e".
    if (token === '(' || token === 'π' || token === 'e' || token === 'i') {
      if (tail && (/[0-9)!%πei]/.test(tail))) {
        displayStr += ' × ';
      }
    }

    if (token === '!') {
      // Factorial only after a number or a closing paren
      if (!tail || (!/\)/.test(tail) && !/[0-9]/.test(tail))) return;
    }

    // Operator chaining
    if (OPERATOR_RE.test(token)) {
      if (tail === '') {
        // Leading operator: only "-" or a digit-group allowed
        if (token !== '-') return;
      } else if (OPERATOR_RE.test(tail)) {
        if (token === '-' && tail !== '-') {
          // allow unary minus after another operator ("5 × -3")
          displayStr += '-';
          syncDisplay();
          return;
        }
        if (token === '-' && tail === '-') {
          return; // "--"
        }
        // otherwise replace the trailing operator
        displayStr = displayStr.slice(0, -1);
      }
      displayStr += token;
      syncDisplay();
      return;
    }

    // Prevent two decimal points in the same number
    if (token === '.') {
      const lastNum = displayStr.match(/[0-9.]+$/);
      if (lastNum && lastNum[0].indexOf('.') !== -1) return;
    }

    // Digit after "0" replaces the lone zero
    if (/^[0-9]$/.test(token) && displayStr === '0') {
      displayStr = token;
      syncDisplay();
      return;
    }

    displayStr += token;
    syncDisplay();
  }

  /* --------------------------- Evaluation --------------------------- */

  // Translate display symbols to plain evaluator syntax
  function translateSymbols(exp) {
    let out = exp;
    out = out.replace(/÷/g, '/');
    out = out.replace(/×/g, '*');
    out = out.replace(/π/g, 'pi');
    out = out.replace(/τ/g, 'tau');
    out = out.replace(/φ/g, 'phi');
    out = out.replace(/−/g, '-');
    out = out.replace(/⁻¹/g, '^(-1)');
    out = out.replace(/²/g, '^2');
    out = out.replace(/ⁿ/g, '^');
    out = out.replace(/⁻([⁰¹²³⁴⁵⁶⁷⁸⁹])/g, (_, d) => '^(-' + SUP_TO_ASCII[d] + ')');
    out = out.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (d) => '^' + SUP_TO_ASCII[d]);
    out = out.replace(/√/g, 'sqrt');
    return out;
  }

  function evaluate(expressionStr) {
    let expr = translateSymbols(String(expressionStr)).trim();
    if (expr === '') {
      return { ok: false, result: 'Error', message: 'Empty expression' };
    }
    try {
      const value = evaluator.evaluate(expr);
      return { ok: true, result: formatResult(value), value };
    } catch (err) {
      return { ok: false, result: 'Error', message: err.message };
    }
  }

  // Evaluate without the `_` side-effect; used by the unit converter.
  function computeValue(expressionStr) {
    let expr = translateSymbols(String(expressionStr)).trim();
    if (expr === '') {
      return { ok: false, result: 'Error', message: 'Empty expression' };
    }
    try {
      const value = evaluator.safeEvaluate(expr);
      return { ok: true, result: formatResult(value), value };
    } catch (err) {
      return { ok: false, result: 'Error', message: err.message };
    }
  }

  function calculate() {
    const expr = displayStr;
    const res = evaluate(expr);
    if (res.ok) {
      addHistory(expr, res.result);
    }
    displayStr = res.result;
    justEvaluated = true;
    syncDisplay();
    return res;
  }

  // Factor an integer result into prime powers ("a×b" button), e.g.
  // 144 -> "2^4×3^2". Non-integer / too-small / non-finite values are left
  // untouched.
  function factorize() {
    const expr = displayStr;
    const res = evaluate(expr);
    if (!res.ok || typeof res.value !== 'number' || !Number.isFinite(res.value) ||
        !Number.isInteger(res.value) || Math.abs(res.value) < 2) {
      return;
    }
    const n = Math.abs(res.value);
    let out = '';
    let m = n;
    let p = 2;
    while (p * p <= m) {
      let count = 0;
      while (m % p === 0) {
        m /= p;
        count++;
      }
      if (count > 0) {
        if (out) out += '×';
        out += count === 1 ? String(p) : p + '^' + count;
      }
      p = p === 2 ? 3 : p + 2;
    }
    if (m > 1) out = out ? out + '×' + m : String(m);
    if (res.value < 0) out = '-' + out;
    addHistory(expr, out);
    displayStr = out;
    justEvaluated = true;
    syncDisplay();
  }

  // Begin a user-function definition, GNOME's f(x) editor entry point. The
  // user replaces the name/parameter and types a body, e.g. "sq(x)=x*x".
  function startFunctionDefinition() {
    displayStr = 'func(x)=';
    justEvaluated = false;
    syncDisplay();
  }

  /* ---------------------------- Actions ----------------------------- */

  function clear() {
    displayStr = '0';
    justEvaluated = false;
    syncDisplay();
  }

  function undo() {
    if (justEvaluated) {
      justEvaluated = false;
      clear();
      return;
    }
    if (displayStr.length === 0) return;
    // remove a trailing function name / number / constant as one token
    const tokenMatch = displayStr.match(/(?:[A-Za-z0-9π.]+)$/);
    if (tokenMatch && tokenMatch[0].length > 0 && tokenMatch[0] !== displayStr) {
      displayStr = displayStr.slice(0, -tokenMatch[0].length);
    } else {
      displayStr = displayStr.slice(0, -1);
    }
    if (displayStr === '') displayStr = '0';
    syncDisplay();
  }

  /* ----------------------------- History ----------------------------- */

  // The history pane sits above the display in the .display-area and stacks
  // every completed calculation (expression = result), newest at the bottom,
  // GNOME-Calculator style. Clicking an entry restores its expression.
  const historyEl = document.getElementById('historyArea');
  const HISTORY_MAX = 200; // cap the session list to keep the DOM light
  let historyEntries = [];

  function renderHistory() {
    if (!historyEl) return;
    historyEl.replaceChildren();
    historyEntries.forEach((entry, i) => {
      const row = document.createElement('div');
      row.className = 'history-entry';
      row.dataset.index = String(i);

      const expr = document.createElement('span');
      expr.className = 'history-expr';
      expr.textContent = entry.expr;

      const value = document.createElement('span');
      value.className = 'history-value';
      value.textContent = '= ' + entry.result;

      row.appendChild(expr);
      row.appendChild(value);
      historyEl.appendChild(row);
    });
    historyEl.classList.toggle('empty', historyEntries.length === 0);
    // Keep the newest entry visible when the list overflows.
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  function addHistory(expr, result) {
    historyEntries.push({ expr, result });
    if (historyEntries.length > HISTORY_MAX) {
      historyEntries.shift();
    }
    renderHistory();
  }

  function clearHistory() {
    historyEntries = [];
    renderHistory();
  }

  // Load a past expression back into the display for editing/re-running.
  function restoreHistory(entry) {
    displayStr = entry.expr;
    justEvaluated = false;
    syncDisplay();
    displayEl.focus();
    // Keep the caret at the end of the restored expression so the user can
    // continue editing in place.
    if (displayEl.setSelectionRange) {
      displayEl.setSelectionRange(displayEl.value.length, displayEl.value.length);
    }
  }

  function initHistoryHandlers() {
    if (!historyEl) return;
    historyEl.addEventListener('click', (event) => {
      const row = event.target.closest ? event.target.closest('.history-entry') : null;
      if (!row) return;
      const entry = historyEntries[Number(row.dataset.index)];
      if (entry) restoreHistory(entry);
    });
    renderHistory();
  }

  /* ---------------------- On-screen button wiring ------------------- */

  // Map button labels to actions. Anything not listed (digits, ".", "%",
  // "(", ")") falls through to insertToken(label).
  const BUTTON_MAP = {
    'C': clear,
    '=': calculate,
    'mod': () => insertToken(' mod '),
    'π': () => insertToken('π'),
    '÷': () => insertToken('÷'),
    '×': () => insertToken('×'),
    '√': () => insertToken('sqrt('),
    'x²': () => insertToken('^2'),
    'xⁿ': () => insertToken('^'),
    'x-1': () => insertToken('^(-1)'),
    '×10ʸ': () => insertToken('×10^'),
    'a×b': factorize,
    '|x|': () => insertToken('abs('),
    'sin': () => insertToken('sin('),
    'cos': () => insertToken('cos('),
    'tan': () => insertToken('tan('),
    'sinh': () => insertToken('sinh('),
    'cosh': () => insertToken('cosh('),
    'tanh': () => insertToken('tanh('),
    'ln': () => insertToken('ln('),
    'log': () => insertToken('log('),
    'x!': () => insertToken('!'),
    'conj': () => insertToken('conj('),
    'Re': () => insertToken('re('),
    'Im': () => insertToken('im('),
    'Arg': () => insertToken('arg('),
    'e': () => insertToken('e'),
    'i': () => insertToken('i'),
    'f(x)': startFunctionDefinition,
    '↑n': armSuperscript,
    '↓n': armSubscript
  };

  function initButtonHandlers() {
    document.querySelectorAll('button').forEach((btn) => {
      const label = btn.textContent.trim();
      if (!label) return;

      btn.addEventListener('click', () => {
        const action = BUTTON_MAP[label];
        if (action) {
          action();
        } else {
          insertToken(label);
        }
      });
    });

    // The undo button is a background-image icon (no text label), so bind it
    // by id instead.
    const undoBtn = document.getElementById('undo');
    if (undoBtn) {
      undoBtn.addEventListener('click', undo);
    }
  }

  /* ----------------------------- Keyboard ---------------------------- */

  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      // structural keys
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
        return;
      }
      if (key === 'Escape' || key === 'Delete') {
        e.preventDefault();
        clear();
        return;
      }
      // Backspace drives the native input caret; the browser handles it.

      // Every other printable key falls through to the native input so the
      // user can type an entire expression by hand.
    });
  }

  /* ------------------------------ Exports ---------------------------- */

  global.Calculator = {
    syncDisplay,
    insertToken,
    evaluate,
    computeValue,
    calculate,
    clear,
    undo,
    addHistory,
    clearHistory,
    restoreHistory,
    translateSymbols,
    init: function () {
      bindDisplayInput();
      initButtonHandlers();
      initKeyboard();
      initHistoryHandlers();
      syncDisplay();
    },
    get display() {
      return displayStr;
    },
    get history() {
      return historyEntries.slice();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ----- test harness (node) ----- */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = global.Calculator;
}