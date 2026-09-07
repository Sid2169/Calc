import { describe, it, expect, beforeEach } from 'vitest';
import { openApp } from './bootstrap.js';

let app;

function expectValue(result, expected) {
  expect(result.ok).toBe(true);
  const v = result.value;

  if (typeof expected === 'object' && expected !== null && typeof expected.re === 'number') {
    if (typeof v === 'number') {
      expect(v).toBeCloseTo(expected.re, 9);
      expect(0).toBeCloseTo(expected.im, 9);
    } else {
      expect(v.re).toBeCloseTo(expected.re, 9);
      expect(v.im).toBeCloseTo(expected.im, 9);
    }
  } else if (typeof expected === 'string') {
    expect(result.result).toBe(expected);
  } else if (typeof expected === 'number') {
    if (!Number.isFinite(expected)) {
      expect(result.value).toBe(expected);
    } else {
      expect(result.value).toBeCloseTo(expected, 9);
    }
  }
}

function expectError(expr) {
  const result = app.Calculator.evaluate(expr);
  expect(result.ok).toBe(false);
  expect(result.result).toContain('Error');
}

describe('evaluator via Calculator.evaluate()', () => {
  beforeEach(() => {
    app = openApp();
  });

  describe('basic arithmetic', () => {
    it.each([
      ['2+3', 5],
      ['2-3', -1],
      ['2*3', 6],
      ['7/2', 3.5],
      ['10 mod 4', 2],
      ['2^10', 1024],
      ['2^3^2', 512],
      ['-2^2', -4],
      ['2^-2', 0.25],
      ['(2+3)*4', 20],
      ['2(3+4)', 14],
      ['2**3', 8],
    ])('%s => %s', (expr, expected) => {
      expectValue(app.Calculator.evaluate(expr), expected);
    });
  });

  describe('percentages (GNOME semantics)', () => {
    it.each([
      ['10%', 0.1],
      ['50+10%', 55],
      ['100-10%', 90],
      ['50/10%', 500],
      ['200*10%', 20],
      ['10%+10%', 0.11],
    ])('%s => %s', (expr, expected) => {
      expectValue(app.Calculator.evaluate(expr), expected);
    });
  });

  describe('constants and scientific notation', () => {
    it.each([
      ['π', Math.PI],
      ['2π', 2 * Math.PI],
      ['e', Math.E],
      ['2e2', 200],
      ['e2', 2 * Math.E],
      ['π3', 3 * Math.PI],
      ['3e-2', 0.03],
    ])('%s => %s', (expr, expected) => {
      expectValue(app.Calculator.evaluate(expr), expected);
    });
  });

  describe('elementary functions', () => {
    it.each([
      ['sin(0)', 0],
      ['cos(0)', 1],
      ['sqrt(16)', 4],
      ['sqrt(2)', Math.sqrt(2)],
      ['cbrt(27)', 3],
      ['cbrt(-8)', -2],
      ['abs(-3)', 3],
      ['ceil(2.1)', 3],
      ['floor(2.9)', 2],
      ['round(2.5)', 3],
      ['ln(e)', 1],
      ['exp(0)', 1],
      ['5!', 120],
      ['log(100)', 2],
      ['log10(100)', 2],
      ['log2(8)', 3],
      ['min(3,1,2)', 1],
      ['max(3,1,2)', 3],
      ['atan2(1,1)', Math.PI / 4],
      ['tan(π/4)', 1],
      ['sinh(1)', Math.sinh(1)],
      ['cosh(1)', Math.cosh(1)],
      ['tanh(1)', Math.tanh(1)],
    ])('%s => %s', (expr, expected) => {
      expectValue(app.Calculator.evaluate(expr), expected);
    });
  });

  describe('complex arithmetic', () => {
    it.each([
      ['i', { re: 0, im: 1 }],
      ['i*i', { re: -1, im: 0 }],
      ['i^2', { re: -1, im: 0 }],
      ['(1+i)^2', { re: 0, im: 2 }],
      ['sqrt(-1)', { re: 0, im: 1 }],
      ['sqrt(-4)', { re: 0, im: 2 }],
      ['conj(2+3i)', { re: 2, im: -3 }],
      ['re(2+3i)', 2],
      ['im(2+3i)', 3],
      ['abs(3+4i)', 5],
      ['arg(1+i)', Math.PI / 4],
      ['arg(i)', Math.PI / 2],
      ['2i', { re: 0, im: 2 }],
      ['(2+3i)+(2-3i)', { re: 4, im: 0 }],
      ['(1+i)*(1-i)', { re: 2, im: 0 }],
      ['(1+i)/(1-i)', { re: 0, im: 1 }],
      ['sin(i)', { re: 0, im: Math.sinh(1) }],
      ['cos(i)', Math.cosh(1)],
      ['exp(i*π)', { re: -1, im: 0 }],
      ['ln(-1)', { re: 0, im: Math.PI }],
      ['log(100)', 2],
      ['i^i', Math.exp(-Math.PI / 2)],
    ])('%s => %j', (expr, expected) => {
      expectValue(app.Calculator.evaluate(expr), expected);
    });
  });

  describe('error / invalid expressions', () => {
    it.each([
      ['2/0', 'Infinity'],
      ['log(0)', '-Infinity'],
      ['mod 5', 'ERR'],
      ['5 mod', 'ERR'],
      ['10 % 5', 'ERR'],
      ['abc', 'ERR'],
      ['2..3', 'ERR'],
      ['()', 'ERR'],
      ['(', 'ERR'],
      ['3+', 'ERR'],
      ['!5', 'ERR'],
      ['(-3)!', 'ERR'],
      ['sqrt(', 'ERR'],
    ])('%s => %s', (expr, expected) => {
      if (expected === 'ERR') {
        expectError(expr);
      } else {
        expectValue(app.Calculator.evaluate(expr), expected);
      }
    });
  });

  describe('implicit multiplication', () => {
    it.each([
      ['(2)(3)', 6],
      ['3π', 3 * Math.PI],
      ['2(4+1)', 10],
      ['2.5(2)', 5],
    ])('%s => %s', (expr, expected) => {
      expectValue(app.Calculator.evaluate(expr), expected);
    });
  });

  describe('division by zero', () => {
    it('1/0 => Infinity', () => {
      expectValue(app.Calculator.evaluate('1/0'), Infinity);
    });

    it('0/0 => NaN', () => {
      const result = app.Calculator.evaluate('0/0');
      expect(result.ok).toBe(true);
      expect(Number.isNaN(result.value)).toBe(true);
    });

    it('-1/0 => -Infinity', () => {
      expectValue(app.Calculator.evaluate('-1/0'), -Infinity);
    });
  });

  describe('unary minus interaction with exponent', () => {
    it('(-2)^2 => 4', () => {
      expectValue(app.Calculator.evaluate('(-2)^2'), 4);
    });

    it('2^-3 => 0.125', () => {
      expectValue(app.Calculator.evaluate('2^-3'), 0.125);
    });
  });

  describe('operator precedence', () => {
    it('2+3*4 => 14', () => {
      expectValue(app.Calculator.evaluate('2+3*4'), 14);
    });

    it('(2+3)*4 => 20', () => {
      expectValue(app.Calculator.evaluate('(2+3)*4'), 20);
    });
  });

  describe('sin/cos/tan in radians', () => {
    it('sin(π/2) ≈ 1', () => {
      expectValue(app.Calculator.evaluate('sin(π/2)'), 1);
    });

    it('cos(π) ≈ -1', () => {
      expectValue(app.Calculator.evaluate('cos(π)'), -1);
    });
  });

  describe('inverse trig', () => {
    it('asin(1) = π/2', () => {
      expectValue(app.Calculator.evaluate('asin(1)'), Math.PI / 2);
    });

    it('acos(0) = π/2', () => {
      expectValue(app.Calculator.evaluate('acos(0)'), Math.PI / 2);
    });

    it('atan(1) = π/4', () => {
      expectValue(app.Calculator.evaluate('atan(1)'), Math.PI / 4);
    });
  });
});
