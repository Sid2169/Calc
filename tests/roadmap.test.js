import { describe, it, expect, beforeEach } from 'vitest';
import { openApp } from './bootstrap.js';

let app;

beforeEach(() => {
  app = openApp();
});

// Financial functions — will be implemented as a dedicated mode.
describe.skip('financial mode (roadmap)', () => {
  it('CTRm — compound trade return months', () => {
    // CTRM(5000; 10000; 0.05) ≈ 180.1
    const res = app.Calculator.evaluate('ctrm(5000;10000;0.05)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(180.1, 0);
  });

  it('DDB — double-depreciating balance depreciation', () => {
    // DDB(10000; 1000; 5; 1) = 4000
    const res = app.Calculator.evaluate('ddb(10000;1000;5;1)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(4000, 0);
  });

  it('FV — future value', () => {
    // FV(0.005; 36; 200; 5000; 0) ≈ 12800
    const res = app.Calculator.evaluate('fv(0.005;36;200;5000;0)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(12800, 0);
  });

  it('GPM — gross profit margin', () => {
    // GPM(80; 100) = 80%
    const res = app.Calculator.evaluate('gpm(80;100)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(80, 0);
  });

  it('PMT — periodic payment', () => {
    // PMT(0.005; 36; 10000; 0; 0) ≈ -304.22
    const res = app.Calculator.evaluate('pmt(0.005;36;10000;0;0)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(-304.22, 1);
  });

  it('PV — present value', () => {
    // PV(0.05; 10; 1000; 0; 0) ≈ -7721.73
    const res = app.Calculator.evaluate('pv(0.05;10;1000;0;0)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(-7721.73, 0);
  });

  it('RATE — periodic interest rate', () => {
    // RATE(12; -100; 1000; 0; 0; 0.1) ≈ 0.02
    const res = app.Calculator.evaluate('rate(12;-100;1000;0;0;0.1)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(0.02, 2);
  });

  it('SLN — straight-line depreciation', () => {
    // SLN(10000; 1000; 5) = 1800
    const res = app.Calculator.evaluate('sln(10000;1000;5)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(1800, 0);
  });

  it('SYD — sum-of-years digits depreciation', () => {
    // SYD(10000; 1000; 5; 1) = 3000
    const res = app.Calculator.evaluate('syd(10000;1000;5;1)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(3000, 0);
  });

  it('TERM — number of periods', () => {
    // TERM(500; 0.005; 20000; 0; 1) ≈ 36
    const res = app.Calculator.evaluate('term(500;0.005;20000;0;1)');
    expect(res.ok).toBe(true);
    expect(res.value).toBeCloseTo(36, 0);
  });
});

// Programming mode — will add number-base display, bitwise ops, etc.
describe.skip('programming mode (roadmap)', () => {
  it('HEX display of 255', () => {
    // Expect hex output when mode is active
    const res = app.Calculator.evaluate('0xFF');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(255);
  });

  it('binary AND', () => {
    // Expect bitwise AND: 12 AND 10 = 8
    const res = app.Calculator.evaluate('12 AND 10');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(8);
  });

  it('bitwise OR', () => {
    const res = app.Calculator.evaluate('12 OR 10');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(14);
  });

  it('bitwise XOR', () => {
    const res = app.Calculator.evaluate('12 XOR 10');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(6);
  });

  it('bitwise NOT', () => {
    const res = app.Calculator.evaluate('NOT 5');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(-6);
  });

  it('left shift', () => {
    const res = app.Calculator.evaluate('1 LSH 3');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(8);
  });

  it('right shift', () => {
    const res = app.Calculator.evaluate('16 RSH 2');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(4);
  });

  it('base prefix 0b for binary', () => {
    const res = app.Calculator.evaluate('0b1010');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(10);
  });

  it('base prefix 0o for octal', () => {
    const res = app.Calculator.evaluate('0o77');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(63);
  });

  it('base prefix 0x for hex', () => {
    const res = app.Calculator.evaluate('0xFF');
    expect(res.ok).toBe(true);
    expect(res.value).toBe(255);
  });
});
