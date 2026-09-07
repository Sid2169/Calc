import { describe, it, expect, beforeEach } from 'vitest';
import { openApp } from './bootstrap.js';

let app;

function clickHistory(index) {
  const rows = app.document.querySelectorAll('.history-entry');
  rows[index].dispatchEvent(new app.window.MouseEvent('click', { bubbles: true }));
}

function clickUndo() {
  app.document.getElementById('undo').dispatchEvent(
    new app.window.MouseEvent('click', { bubbles: true })
  );
}

describe('Calculator via jsdom DOM', () => {
  beforeEach(() => {
    app = openApp();
  });

  describe('Button wiring', () => {
    it('builds an expression by clicking digits and operators', () => {
      app.clickButton('5');
      expect(app.display()).toBe('5');
      app.clickButton('+');
      expect(app.display()).toBe('5+');
      app.clickButton('3');
      expect(app.display()).toBe('5+3');
    });

    it('C resets the display to "0"', () => {
      app.clickButton('5');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('C');
      expect(app.display()).toBe('0');
    });

    it('= evaluates a valid expression', () => {
      app.clickButton('5');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      expect(app.display()).toBe('8');
    });

    it('types a decimal point', () => {
      app.clickButton('.');
      expect(app.display()).toBe('0.');
      app.clickButton('5');
      expect(app.display()).toBe('0.5');
    });

    it('types parentheses', () => {
      app.clickButton('(');
      expect(app.display()).toBe('(');
      app.clickButton(')');
      expect(app.display()).toBe('()');
    });

    it('renders operator buttons ×, ÷ and -', () => {
      app.clickButton('5');
      app.clickButton('×');
      expect(app.display()).toBe('5×');
      app.clickButton('C');
      app.clickButton('5');
      app.clickButton('÷');
      expect(app.display()).toBe('5÷');
      app.clickButton('C');
      app.clickButton('5');
      app.clickButton('-');
      expect(app.display()).toBe('5-');
    });

    it('√ inserts "sqrt(" and evaluates after closing the paren', () => {
      app.clickButton('√');
      expect(app.display()).toBe('sqrt(');
      app.clickButton('1');
      app.clickButton('6');
      app.clickButton(')');
      expect(app.display()).toBe('sqrt(16)');
      app.clickButton('=');
      expect(app.display()).toBe('4');
    });
  });

  describe('evaluate() and calculate() via the = button', () => {
    it('2+3= → 5', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      expect(app.display()).toBe('5');
    });

    it('√16)= → 4', () => {
      app.clickButton('√');
      app.clickButton('1');
      app.clickButton('6');
      app.clickButton(')');
      app.clickButton('=');
      expect(app.display()).toBe('4');
    });

    it('50+10%= → 55 (GNOME % semantics)', () => {
      app.clickButton('5');
      app.clickButton('0');
      app.clickButton('+');
      app.clickButton('1');
      app.clickButton('0');
      app.clickButton('%');
      app.clickButton('=');
      expect(app.display()).toBe('55');
    });

    it('2^(3)= via xⁿ → 8', () => {
      app.clickButton('2');
      app.clickButton('xⁿ');
      app.clickButton('(');
      app.clickButton('3');
      app.clickButton(')');
      app.clickButton('=');
      expect(app.display()).toBe('8');
    });

    it('i xⁿ 2 = → -1', () => {
      app.clickButton('i');
      app.clickButton('xⁿ');
      app.clickButton('2');
      app.clickButton('=');
      expect(app.display()).toBe('-1');
    });
  });

  describe('justEvaluated behavior', () => {
    it('a digit after = starts a fresh entry instead of appending', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      expect(app.display()).toBe('5');
      app.clickButton('7');
      expect(app.display()).toBe('7');
    });

    it('an operator after = continues from the result', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      expect(app.display()).toBe('5');
      app.clickButton('+');
      expect(app.display()).toBe('5+');
      app.clickButton('2');
      expect(app.display()).toBe('5+2');
      app.clickButton('=');
      expect(app.display()).toBe('7');
    });
  });

  describe('Keyboard', () => {
    it('Enter calculates like =', () => {
      app.clickButton('5');
      app.clickButton('+');
      app.clickButton('3');
      app.key('Enter');
      expect(app.display()).toBe('8');
    });

    it('Escape clears to "0"', () => {
      app.clickButton('5');
      app.clickButton('+');
      app.clickButton('3');
      app.key('Escape');
      expect(app.display()).toBe('0');
    });

    it('Delete clears to "0"', () => {
      app.clickButton('7');
      app.clickButton('×');
      app.clickButton('8');
      app.key('Delete');
      expect(app.display()).toBe('0');
    });
  });

  describe('History feature', () => {
    it('records a completed calculation as one history row', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      expect(app.history()).toEqual([{ expr: '2+3', value: '= 5' }]);
    });

    it('appends rows with the newest at the bottom', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      app.clickButton('7');
      app.clickButton('×');
      app.clickButton('8');
      app.clickButton('=');
      expect(app.history()).toEqual([
        { expr: '2+3', value: '= 5' },
        { expr: '7×8', value: '= 56' },
      ]);
    });

    it('clicking the newest entry restores its expression', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      app.clickButton('7');
      app.clickButton('×');
      app.clickButton('8');
      app.clickButton('=');
      clickHistory(1);
      expect(app.display()).toBe('7×8');
    });

    it('re-evaluates a restored expression and pushes a third entry', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      app.clickButton('7');
      app.clickButton('×');
      app.clickButton('8');
      app.clickButton('=');
      clickHistory(1);
      app.clickButton('=');
      expect(app.history().length).toBe(3);
      expect(app.history()[2]).toEqual({ expr: '7×8', value: '= 56' });
    });

    it('does not record an erroring calculation', () => {
      app.clickButton('+');
      app.clickButton('=');
      expect(app.display()).toBe('Error');
      expect(app.history()).toEqual([]);
    });

    it('C does not clear history', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      app.clickButton('C');
      expect(app.display()).toBe('0');
      expect(app.history().length).toBe(1);
    });

    it('undo after = clears the display but leaves history intact', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      clickUndo();
      expect(app.display()).toBe('0');
      expect(app.history().length).toBe(1);
    });

    it('caps the session list at 200 entries', () => {
      for (let i = 0; i < 205; i++) {
        app.Calculator.addHistory(`expr-${i}`, '0');
      }
      expect(app.Calculator.history.length).toBe(200);
      expect(app.document.querySelectorAll('.history-entry').length).toBe(200);
    });
  });

  describe('Clear and Undo', () => {
    it('C resets the display to "0" and clears the just-evaluated flag', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      expect(app.display()).toBe('5');
      app.clickButton('C');
      expect(app.display()).toBe('0');
      app.clickButton('7');
      expect(app.display()).toBe('7');
    });

    it('undo after pressing = clears the display', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      app.clickButton('=');
      clickUndo();
      expect(app.display()).toBe('0');
    });

    it('undo in the middle of typing removes the last token', () => {
      app.clickButton('2');
      app.clickButton('+');
      app.clickButton('3');
      clickUndo();
      expect(app.display()).toBe('2+');
    });

    it('undo when the display is "0" does nothing', () => {
      clickUndo();
      expect(app.display()).toBe('0');
    });
  });

  describe('Display formatting', () => {
    it('renders complex results as "a + bi"', () => {
      for (const lbl of ['(', '2', '+', 'i', ')', 'xⁿ', '(', '2', ')']) {
        app.clickButton(lbl);
      }
      app.clickButton('=');
      expect(app.display()).toContain('3');
      expect(app.display()).toContain('4i');
    });

    it('avoids floating-point noise for repeated decimals', () => {
      app.clickButton('1');
      app.clickButton('÷');
      app.clickButton('3');
      app.clickButton('×');
      app.clickButton('3');
      app.clickButton('=');
      expect(Number(app.display())).toBeCloseTo(1, 9);
    });

    it('shows "55" for 50+10% rather than 55.000000', () => {
      for (const lbl of ['5', '0', '+', '1', '0', '%']) {
        app.clickButton(lbl);
      }
      app.clickButton('=');
      expect(app.display()).toBe('55');
    });
  });
});