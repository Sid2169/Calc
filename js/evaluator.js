/**
 * evaluator.js
 * A self-contained mathematical expression parser and evaluator.
 * Written from scratch: tokenizer -> Pratt (precedence-climbing) parser -> AST -> evaluator.
 *
 * Supports:
 *   - Numbers (decimals, scientific notation)
 *   - Binary operators: + - * / % ^
 *   - Unary operators: unary minus / plus
 *   - Postfix factorial: n!
 *   - Parentheses and implicit multiplication (e.g. 2pi, 2(3+1), (2)(3))
 *   - Functions: sin cos tan asin acos atan sinh cosh tanh log ln sqrt cbrt
 *               abs ceil floor round factorial re im conj arg
 *   - Constants: pi, e
 *
 * The evaluator is exposed globally as `Evaluator`.
 */

(function (global) {
  'use strict';

  /* ----------------------------- Errors ----------------------------- */

  function EvaluateError(message) {
    this.name = 'EvaluateError';
    this.message = message;
    this.stack = this instanceof Error ? '' : new Error(message).stack;
  }
  EvaluateError.prototype = Object.create(Error.prototype);
  EvaluateError.prototype.constructor = EvaluateError;

  /* --------------------------- Tokenizer ---------------------------- */

  function tokenize(input) {
    const tokens = [];
    let i = 0;
    const n = input.length;

    while (i < n) {
      const ch = input[i];

      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // Numbers: decimal and scientific notation (e.g. 1.5e-3)
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(input[i + 1] || ''))) {
        let start = i;
        let seenDot = false;
        let seenExp = false;
        while (i < n) {
          const c = input[i];
          if (/[0-9]/.test(c)) {
            i++;
          } else if (c === '.' && !seenDot && !seenExp) {
            seenDot = true;
            i++;
          } else if ((c === 'e' || c === 'E') && !seenExp) {
            seenExp = true;
            i++;
            if (i < n && (input[i] === '+' || input[i] === '-')) i++;
          } else {
            break;
          }
        }
        const text = input.slice(start, i);
        const value = Number(text);
        if (isNaN(value)) {
          throw new EvaluateError('Invalid number: ' + text);
        }
        tokens.push({ type: 'number', value, text });
        continue;
      }

      // Identifiers (function names and constants)
      if (/[a-zA-Z_]/i.test(ch)) {
        let start = i;
        while (i < n && /[a-zA-Z0-9_]/.test(input[i])) i++;
        tokens.push({ type: 'ident', text: input.slice(start, i) });
        continue;
      }

      // Multi-character map
      const two = input.substr(i, input.length - 1).length >= 2
        ? input.substr(i, 2) : '';
      if (two === '**') {
        tokens.push({ type: 'op', text: '^', value: '^' });
        i += 2;
        continue;
      }
      if (two === '//') {
        tokens.push({ type: 'op', text: '/', value: '/' });
        i += 2;
        continue;
      }

      // Single character operators
      const single = ['+', '-', '*', '/', '%', '^', '(', ')', '!', ','];
      if (single.indexOf(ch) !== -1) {
        tokens.push({ type: ch === '(' || ch === ')' || ch === ',' ? 'punc' : 'op', text: ch, value: ch });
        i++;
        continue;
      }

      throw new EvaluateError('Unexpected character: ' + ch);
    }
    return tokens;
  }

  /* ------------------------------ AST -------------------------------- */

  function Literal(value) {
    this.value = value;
  }
  Literal.prototype.eval = function () {
    return this.value;
  };

  function Identifier(name) {
    this.name = name;
  }
  Identifier.prototype.eval = function () {
    throw new EvaluateError('Unknown symbol: ' + this.name);
  };

  function Constant(name, value) {
    this.name = name;
    this.value = value;
  }
  Constant.prototype.eval = function () {
    return this.value;
  };

  function Unary(op, operand) {
    this.op = op;
    this.operand = operand;
  }
  Unary.prototype.eval = function () {
    const v = this.operand.eval();
    if (this.op === '-') return -v;
    return v;
  };

  function Binary(op, left, right) {
    this.op = op;
    this.left = left;
    this.right = right;
  }
  Binary.prototype.eval = function () {
    const l = this.left.eval();
    const r = this.right.eval();
    switch (this.op) {
      case '+': return l + r;
      case '-': return l - r;
      case '*': return l * r;
      case '/': return l / r;
      case '%': return l % r;
      case '^': return Math.pow(l, r);
      default:
        throw new EvaluateError('Unknown operator: ' + this.op);
    }
  };

  function MultiplicativeImplicit(left, right) {
    this.left = left;
    this.right = right;
  }
  MultiplicativeImplicit.prototype.eval = function () {
    return this.left.eval() * this.right.eval();
  };

  function FunctionCall(name, args) {
    this.name = name;
    this.args = args;
  }
  FunctionCall.prototype.eval = function () {
    return callFunction(this.name, this.args.map(function (a) { return a.eval(); }));
  };

  function Factorial(operand) {
    this.operand = operand;
  }
  Factorial.prototype.eval = function () {
    const v = this.operand.eval();
    if (!Number.isInteger(v) || v < 0) {
      throw new EvaluateError('Factorial is only defined for non-negative integers');
    }
    let result = 1;
    for (let k = 2; k <= v; k++) result *= k;
    return result;
  };

  /* --------------------------- Functions ----------------------------- */

  function callFunction(name, args) {
    if (!FUNCTIONS[name]) {
      throw new EvaluateError('Unknown function: ' + name);
    }
    return FUNCTIONS[name].apply(null, args);
  }

  const FUNCTIONS = {
    sin: function (x) { return Math.sin(x); },
    cos: function (x) { return Math.cos(x); },
    tan: function (x) { return Math.tan(x); },
    asin: function (x) { return Math.asin(x); },
    acos: function (x) { return Math.acos(x); },
    atan: function (x) { return Math.atan(x); },
    atan2: function (y, x) { return Math.atan2(y, x); },
    sinh: function (x) { return Math.sinh(x); },
    cosh: function (x) { return Math.cosh(x); },
    tanh: function (x) { return Math.tanh(x); },
    log: function (x) { return Math.log10(x); },
    ln: function (x) { return Math.log(x); },
    sqrt: function (x) { return Math.sqrt(x); },
    cbrt: function (x) { return Math.cbrt(x); },
    abs: function (x) { return Math.abs(x); },
    ceil: function (x) { return Math.ceil(x); },
    floor: function (x) { return Math.floor(x); },
    round: function (x) { return Math.round(x); },
    factorial: function (x) {
      if (!Number.isInteger(x) || x < 0) {
        throw new EvaluateError('Factorial is only defined for non-negative integers');
      }
      let result = 1;
      for (let k = 2; k <= x; k++) result *= k;
      return result;
    },
    re: function (x) { return x; },
    im: function () { return 0; },
    conj: function (x) { return x; },
    arg: function (x) { return x >= 0 ? 0 : Math.PI; },
    min: function () {
      if (arguments.length < 1) {
        throw new EvaluateError('Function min expects at least 1 argument');
      }
      return Math.min.apply(Math, arguments);
    },
    max: function () {
      if (arguments.length < 1) {
        throw new EvaluateError('Function max expects at least 1 argument');
      }
      return Math.max.apply(Math, arguments);
    },
    exp: function (x) { return Math.exp(x); }
  };

  // Alias ln -> natural log (already the same)
  FUNCTIONS.ln = Math.log;
  FUNCTIONS.log10 = Math.log10;
  FUNCTIONS.log2 = Math.log2;

  /* ---------------------------- Parser ------------------------------- */

  const PRECEDENCE = {
    '^': 4,
    '*': 3,
    '/': 3,
    '%': 3,
    '+': 2,
    '-': 2
  };

  // Precedence for the unary +/- operators: binds tighter than * / % but
  // looser than ^ so that -2^2 === -(2^2) and 2^-2 is accepted.
  const UNARY_PREC = 3.5;

  function Parser(input) {
    this.tokens = tokenize(input);
    this.pos = 0;
    this.lastToken = null;
  }

  Parser.prototype.peek = function () {
    return this.tokens[this.pos] || null;
  };

  Parser.prototype.next = function () {
    const t = this.tokens[this.pos] || null;
    this.pos++;
    this.lastToken = t;
    return t;
  };

  Parser.prototype.expect = function (text) {
    const t = this.next();
    if (!t || t.text !== text) {
      throw new EvaluateError('Expected "' + text + '" but found ' + (t ? '"' + t.text + '"' : 'end of input'));
    }
    return t;
  };

  Parser.prototype.parse = function () {
    if (this.tokens.length === 0) {
      throw new EvaluateError('Empty expression');
    }
    const expr = this.parseExpression(0);
    if (this.peek()) {
      throw new EvaluateError('Unexpected token: ' + this.peek().text);
    }
    return expr;
  };

  Parser.prototype.parseExpression = function (minPrec) {
    let left;

    const lead = this.peek();
    if (lead && lead.type === 'op' && (lead.text === '+' || lead.text === '-')) {
      // Prefix unary operator; its operand is parsed at UNARY_PREC so that
      // exponentiation binds tighter (e.g. -2^2 -> -(2^2)) but multiplication
      // element grouping still binds looser (e.g. -2pi -> (-2)pi in outer loop,
      // and -2*3 -> (-2)*3).
      const op = this.next().text;
      const operand = this.parseExpression(op === '-' ? UNARY_PREC : UNARY_PREC);
      left = new Unary(op, operand);
    } else {
      left = this.parsePostfix(this.parsePrimary());
    }

    while (true) {
      const nextTok = this.peek();
      if (!nextTok) break;

      if (nextTok.type === 'op' && PRECEDENCE[nextTok.text]) {
        const prec = PRECEDENCE[nextTok.text];
        if (prec < minPrec) break;
        const op = this.next().text;
        // Right-associative exponentiation: RHS parsed at prec, others at prec+1
        const right = this.parseExpression(op === '^' ? prec : prec + 1);
        left = new Binary(op, left, right);
        left = this.parsePostfix(left);
        continue;
      }

      // Implicit multiplication: value directly followed by an identifier
      // or an opening parenthesis.
      // e.g. 2pi, 2sin(3), (2)(3), 2(3)
      const canStartValue = (
        (nextTok.type === 'ident') ||
        (nextTok.type === 'punc' && nextTok.text === '(')
      );
      if (canStartValue) {
        if (PRECEDENCE['*'] < minPrec) break;
        const rightFactor = this.parseExpression(3);
        left = new MultiplicativeImplicit(left, rightFactor);
        left = this.parsePostfix(left);
        continue;
      }

      break;
    }
    return left;
  };

  Parser.prototype.parsePrimary = function () {
    const t = this.next();
    if (!t) throw new EvaluateError('Unexpected end of expression');

    switch (t.type) {
      case 'number':
        return new Literal(t.value);

      case 'punc':
        if (t.text === '(') {
          const inner = this.parseExpression(0);
          this.expect(')');
          return inner;
        }
        throw new EvaluateError('Unexpected token: ' + t.text);

      case 'ident': {
        // Function call?
        if (this.peek() && this.peek().type === 'punc' && this.peek().text === '(') {
          this.next(); // consume '('
          const args = [];
          if (this.peek() && this.peek().text !== ')') {
            // Multi-arg functions
            if (t.text === 'atan2' || t.text === 'min' || t.text === 'max') {
              args.push(this.parseExpression(0));
              while (this.peek() && this.peek().text === ',') {
                this.next();
                args.push(this.parseExpression(0));
              }
            } else {
              args.push(this.parseExpression(0));
            }
          }
          this.expect(')');
          return new FunctionCall(t.text, args);
        }

        // Constant?
        switch (t.text) {
          case 'pi':
          case 'π':
            return new Constant('pi', Math.PI);
          case 'e':
            return new Constant('e', Math.E);
          default:
            throw new EvaluateError('Unknown symbol: ' + t.text);
        }
      }

      default:
        throw new EvaluateError('Unexpected token: ' + t.text);
    }
  };

  Parser.prototype.parsePostfix = function (expr) {
    while (this.peek() && this.peek().text === '!') {
      this.next();
      expr = new Factorial(expr);
    }
    return expr;
  };

  /* ------------------------------ API -------------------------------- */

  function evaluate(expression) {
    const parser = new Parser(String(expression).trim());
    const ast = parser.parse();
    return ast.eval();
  }

  // Export
  global.Evaluator = {
    evaluate: evaluate,
    tokenize: tokenize,
    Error: EvaluateError
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ----- test harness (node) ----- */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = global.Evaluator;
}