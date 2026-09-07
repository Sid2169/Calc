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

  // `e`/`E` starts a scientific-notation exponent only when a digit follows
  // (optionally after a sign). This keeps "3e" = 3 * e (Euler's constant)
  // while still accepting "2e3" = 2000.
  function isExponentStart(input, i) {
    const nextPos = i + 1;
    if (nextPos >= input.length) return false;
    const c = input[nextPos];
    if (/[0-9]/.test(c)) return true;
    if ((c === '+' || c === '-') && nextPos + 1 < input.length) {
      return /[0-9]/.test(input[nextPos + 1]);
    }
    return false;
  }

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
          } else if ((c === 'e' || c === 'E') && !seenExp && isExponentStart(input, i)) {
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

      // Identifiers (function names and constants). The keyword "mod" is
      // lexed as a binary modulus operator.
      if (/[a-zA-Z_]/i.test(ch)) {
        let start = i;
        while (i < n && /[a-zA-Z0-9_]/.test(input[i])) i++;
        const text = input.slice(start, i);
        if (text === 'mod') {
          tokens.push({ type: 'op', text: 'mod', value: 'mod' });
        } else {
          tokens.push({ type: 'ident', text });
        }
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

  /* ----------------------------- Complex ----------------------------- */

  // Values are real JS numbers, or complex objects { re, im }.
  const Complex = {
    isC(x) {
      return typeof x === 'object' && x !== null && typeof x.re === 'number';
    },
    // real part of a value (number or complex object)
    real(z) {
      return Complex.isC(z) ? z.re : z;
    },
    // imaginary part of a value
    imag(z) {
      return Complex.isC(z) ? z.im : 0;
    },
    // rectangular constructor
    c(a, b) {
      return { re: a, im: b };
    },
    norm(z) {
      return Complex.isC(z) && z.im === 0 ? z.re : z;
    },
    toC(x) {
      return Complex.isC(x) ? x : { re: x, im: 0 };
    },
    add(a, b) {
      const A = Complex.toC(a), B = Complex.toC(b);
      return Complex.norm({ re: A.re + B.re, im: A.im + B.im });
    },
    sub(a, b) {
      const A = Complex.toC(a), B = Complex.toC(b);
      return Complex.norm({ re: A.re - B.re, im: A.im - B.im });
    },
    mul(a, b) {
      const A = Complex.toC(a), B = Complex.toC(b);
      return Complex.norm({
        re: A.re * B.re - A.im * B.im,
        im: A.re * B.im + A.im * B.re
      });
    },
    div(a, b) {
      const A = Complex.toC(a), B = Complex.toC(b);
      // preserve plain real division (1/0 = Infinity, 0/0 = NaN)
      if (A.im === 0 && B.im === 0) return A.re / B.re;
      const den = B.re * B.re + B.im * B.im;
      if (den === 0) return NaN;
      return Complex.norm({
        re: (A.re * B.re + A.im * B.im) / den,
        im: (A.im * B.re - A.re * B.im) / den
      });
    },
    neg(a) {
      if (Complex.isC(a)) return Complex.norm({ re: -a.re, im: -a.im });
      return -a;
    },
    // a^b via polar form
    pow(a, b) {
      const B = Complex.isC(b) ? b : { re: b, im: 0 };
      if (B.im === 0 && Number.isInteger(B.re)) {
        // integer powers via repeated squaring (keeps precision & sign)
        let n = Math.abs(B.re);
        let base = Complex.toC(a), result = { re: 1, im: 0 };
        while (n > 0) {
          if (n % 2 === 1) result = Complex.mul(base, result);
          base = Complex.mul(base, base);
          n = Math.floor(n / 2);
        }
        if (B.re < 0) result = Complex.div(1, result);
        return Complex.norm(result);
      }
      // general: exp(b * log(a))
      const la = complexLog(a);
      const prod = Complex.mul(la, B);
      return complexExp(prod);
    },
    mod(a, b) {
      // modulo is only meaningful for reals
      const A = Complex.toC(a), B = Complex.toC(b);
      if (A.im !== 0 || B.im !== 0) throw new EvaluateError('mod is not defined for complex numbers');
      return A.re % B.re;
    },
    eq(a, b) {
      const A = Complex.toC(a), B = Complex.toC(b);
      return A.re === B.re && A.im === B.im;
    }
  };

  function complexAbs(z) {
    const Z = Complex.toC(z);
    return Math.hypot(Z.re, Z.im);
  }

  function complexArg(z) {
    const Z = Complex.toC(z);
    return Math.atan2(Z.im, Z.re);
  }

  function complexConj(z) {
    const Z = Complex.toC(z);
    return Complex.norm({ re: Z.re, im: -Z.im });
  }

  function complexExp(z) {
    if (!Complex.isC(z)) return Math.exp(z);
    const ea = Math.exp(z.re);
    return Complex.norm({ re: ea * Math.cos(z.im), im: ea * Math.sin(z.im) });
  }

  function complexLog(z) {
    const Z = Complex.toC(z);
    if (Z.re === 0 && Z.im === 0) return -Infinity;
    return Complex.norm({
      re: Math.log(complexAbs(Z)),
      im: Math.atan2(Z.im, Z.re)
    });
  }

  function complexSqrt(z) {
    if (!Complex.isC(z) && z >= 0) return Math.sqrt(z);
    const Z = Complex.toC(z);
    if (Z.im === 0 && Z.re >= 0) return Math.sqrt(Z.re);
    const r = Math.hypot(Z.re, Z.im);
    const re = Math.sqrt((r + Z.re) / 2);
    const im = Math.sign(Z.im || (Z.re < 0 ? 1 : 0)) * Math.sqrt((r - Z.re) / 2);
    return Complex.norm({ re, im });
  }

  function complexCbrt(z) {
    if (!Complex.isC(z)) return Math.cbrt(z);
    if (z.im === 0) return Math.cbrt(z.re);
    return complexExp(Complex.div(complexLog(z), 3));
  }

  function complexSin(z) {
    if (!Complex.isC(z)) return Math.sin(z);
    return Complex.norm({
      re: Math.sin(z.re) * Math.cosh(z.im),
      im: Math.cos(z.re) * Math.sinh(z.im)
    });
  }

  function complexCos(z) {
    if (!Complex.isC(z)) return Math.cos(z);
    return Complex.norm({
      re: Math.cos(z.re) * Math.cosh(z.im),
      im: -Math.sin(z.re) * Math.sinh(z.im)
    });
  }

  function complexTan(z) {
    if (!Complex.isC(z)) return Math.tan(z);
    return Complex.div(complexSin(z), complexCos(z));
  }

  function complexSinh(z) {
    if (!Complex.isC(z)) return Math.sinh(z);
    return Complex.norm({
      re: Math.sinh(z.re) * Math.cos(z.im),
      im: Math.cosh(z.re) * Math.sin(z.im)
    });
  }

  function complexCosh(z) {
    if (!Complex.isC(z)) return Math.cosh(z);
    return Complex.norm({
      re: Math.cosh(z.re) * Math.cos(z.im),
      im: Math.sinh(z.re) * Math.sin(z.im)
    });
  }

  function complexTanh(z) {
    if (!Complex.isC(z)) return Math.tanh(z);
    return Complex.div(complexSinh(z), complexCosh(z));
  }

  function complexAsin(z) {
    if (!Complex.isC(z) && Math.abs(z) <= 1) return Math.asin(z);
    const Z = Complex.toC(z);
    const root = complexSqrt(Complex.sub(1, Complex.mul(Z, Z)));
    const iz = Complex.mul(Complex.c(0, -1), Z);
    return Complex.mul(Complex.c(0, -1), complexLog(Complex.add(iz, root)));
  }

  function complexAcos(z) {
    if (!Complex.isC(z) && Math.abs(z) <= 1) return Math.acos(z);
    const Z = Complex.toC(z);
    return Complex.sub(Math.PI / 2, complexAsin(Z));
  }

  function complexAtan(z) {
    if (!Complex.isC(z)) return Math.atan(z);
    const Z = Complex.toC(z);
    const iz = Complex.mul(Complex.c(0, 1), Z);
    const num = complexLog(Complex.add(Complex.c(0, 1), iz));
    const den = complexLog(Complex.sub(Complex.c(0, 1), iz));
    return Complex.mul(Complex.c(0, 0.5), Complex.sub(num, den));
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
    if (this.op === '-') return Complex.neg(v);
    return v;
  };

  function Binary(op, left, right) {
    this.op = op;
    this.left = left;
    this.right = right;
  }
  Binary.prototype.eval = function () {
    // A postfix percent operand is "percentage of the base" when combined
    // with + or -; otherwise it is simply x/100.
    if (this.right instanceof Percent) {
      const l = this.left.eval();
      const rv = this.right.operand.eval();
      const r = rv / 100;
      switch (this.op) {
        case '+': return Complex.add(l, Complex.mul(l, r));
        case '-': return Complex.sub(l, Complex.mul(l, r));
        case '*': return Complex.mul(l, r);
        case '/': return Complex.div(l, r);
        case '^': return Complex.pow(l, r);
        default:  return l % r;
      }
    }
    const l = this.left.eval();
    const r = this.right.eval();
    switch (this.op) {
      case '+': return Complex.add(l, r);
      case '-': return Complex.sub(l, r);
      case '*': return Complex.mul(l, r);
      case '/': return Complex.div(l, r);
      case 'mod': return Complex.mod(l, r);
      case '^': return Complex.pow(l, r);
      default:
        throw new EvaluateError('Unknown operator: ' + this.op);
    }
  };

  function MultiplicativeImplicit(left, right) {
    this.left = left;
    this.right = right;
  }
  MultiplicativeImplicit.prototype.eval = function () {
    return Complex.mul(this.left.eval(), this.right.eval());
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

  // Postfix percent. In GNOME Calculator "%" means "percentage of the base":
  //   - trailing operand (no base, e.g. "10%")            -> x / 100
  //   - right side of + or -                              -> base * x / 100
  //   - right side of * or / or ^                         -> x / 100
  // The Binary.eval below special-cases a Percent operand.
  function Percent(operand) {
    this.operand = operand;
  }
  Percent.prototype.eval = function () {
    return this.operand.eval() / 100;
  };

  /* --------------------------- Functions ----------------------------- */

  function callFunction(name, args) {
    if (!FUNCTIONS[name]) {
      throw new EvaluateError('Unknown function: ' + name);
    }
    return FUNCTIONS[name].apply(null, args);
  }

  const FUNCTIONS = {
    sin: complexSin,
    cos: complexCos,
    tan: complexTan,
    asin: complexAsin,
    acos: complexAcos,
    atan: complexAtan,
    atan2: function (y, x) { return Math.atan2(Complex.real(y), Complex.real(x)); },
    sinh: complexSinh,
    cosh: complexCosh,
    tanh: complexTanh,
    log: function (x) { return Complex.div(complexLog(x), Math.LN10); },
    ln: function (x) { return complexLog(x); },
    log10: function (x) { return Complex.div(complexLog(x), Math.LN10); },
    log2: function (x) { return Complex.div(complexLog(x), Math.LN2); },
    sqrt: complexSqrt,
    cbrt: complexCbrt,
    abs: complexAbs,
    ceil: function (x) { return Math.ceil(Complex.real(x)); },
    floor: function (x) { return Math.floor(Complex.real(x)); },
    round: function (x) { return Math.round(Complex.real(x)); },
    factorial: function (x) {
      if (!Number.isInteger(x) || x < 0) {
        throw new EvaluateError('Factorial is only defined for non-negative integers');
      }
      let result = 1;
      for (let k = 2; k <= x; k++) result *= k;
      return result;
    },
    re: function (x) { return Complex.real(x); },
    im: function (x) {
      if (Complex.isC(x)) return x.im;
      return 0;
    },
    conj: complexConj,
    arg: complexArg,
    min: function () {
      if (arguments.length < 1) {
        throw new EvaluateError('Function min expects at least 1 argument');
      }
      return Math.min.apply(Math, Array.prototype.map.call(arguments, Complex.real));
    },
    max: function () {
      if (arguments.length < 1) {
        throw new EvaluateError('Function max expects at least 1 argument');
      }
      return Math.max.apply(Math, Array.prototype.map.call(arguments, Complex.real));
    },
    exp: complexExp
  };

  /* ---------------------------- Parser ------------------------------- */

  const PRECEDENCE = {
    '^': 4,
    '*': 3,
    '/': 3,
    'mod': 3,
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
          case 'i':
            return new Constant('i', { re: 0, im: 1 });
          default:
            // Allow a constant immediately followed by digits, e.g. "e2"
            // means e*2 and "pi3" means pi*3 and "i2" means i*2.
            const m = /^(pi|e|π|i)(\d+)$/.exec(t.text);
            if (m) {
              let c;
              if (m[1] === 'i') c = new Constant('i', { re: 0, im: 1 });
              else c = new Constant(m[1], m[1] === 'e' ? Math.E : Math.PI);
              return new MultiplicativeImplicit(c, new Literal(Number(m[2])));
            }
            throw new EvaluateError('Unknown symbol: ' + t.text);
        }
      }

      default:
        throw new EvaluateError('Unexpected token: ' + t.text);
    }
  };

  Parser.prototype.parsePostfix = function (expr) {
    while (this.peek()) {
      const t = this.peek();
      if (t.text === '!') {
        this.next();
        expr = new Factorial(expr);
      } else if (t.text === '%') {
        // "%" is the postfix percentage operator (its UI button tooltip is
        // "Percentage"). Binary modulus is written with the keyword "mod".
        this.next();
        expr = new Percent(expr);
      } else {
        break;
      }
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