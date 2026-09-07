import { describe, it, expect, beforeEach } from 'vitest';
import { openApp } from './bootstrap.js';

let app;

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('Converter', () => {
  beforeEach(() => {
    app = openApp();
  });

  describe('API surface', () => {
    it('exposes Converter with a non-empty active quantity after init', () => {
      expect(app.window.Converter).toBeDefined();
      expect(typeof app.Converter.setQuantity).toBe('function');
      expect(typeof app.Converter.doConvert).toBe('function');
      expect(typeof app.Converter.convert).toBe('function');
      expect(typeof app.Converter.init).toBe('function');
      expect(typeof app.Converter.quantity).toBe('string');
      expect(app.Converter.quantity.length).toBeGreaterThan(0);
    });

    it('doConvert() runs without throwing and returns a non-NaN number', () => {
      app.Converter.setQuantity('length');
      const result = app.Converter.doConvert('length', 'meter', 'foot', 1);
      expect(Number.isNaN(result)).toBe(false);
      expect(result).toBeCloseTo(3.28084, 2);
    });
  });

  describe('Temperature (affine conversions)', () => {
    beforeEach(() => {
      app.Converter.setQuantity('temperature');
    });

    it('100 C -> 212 F', () => {
      expect(app.Converter.doConvert('temperature', 'celsius', 'fahrenheit', 100))
        .toBeCloseTo(212, 9);
    });

    it('32 F -> 0 C', () => {
      expect(app.Converter.doConvert('temperature', 'fahrenheit', 'celsius', 32))
        .toBeCloseTo(0, 9);
    });

    it('0 C -> 273.15 K', () => {
      expect(app.Converter.doConvert('temperature', 'celsius', 'kelvin', 0))
        .toBeCloseTo(273.15, 9);
    });

    it('roundtrips 50 C -> F -> C', () => {
      const f = app.Converter.doConvert('temperature', 'celsius', 'fahrenheit', 50);
      expect(app.Converter.doConvert('temperature', 'fahrenheit', 'celsius', f))
        .toBeCloseTo(50, 5);
    });
  });

  describe('Length', () => {
    beforeEach(() => {
      app.Converter.setQuantity('length');
    });

    it('1000 meters -> 1 kilometer', () => {
      expect(app.Converter.doConvert('length', 'meter', 'kilometer', 1000))
        .toBeCloseTo(1, 6);
    });

    it('1 meter -> 3.28084 feet', () => {
      expect(app.Converter.doConvert('length', 'meter', 'foot', 1))
        .toBeCloseTo(3.28084, 2);
    });

    it('roundtrips 1 meter -> foot -> meter', () => {
      const ft = app.Converter.doConvert('length', 'meter', 'foot', 1);
      expect(app.Converter.doConvert('length', 'foot', 'meter', ft))
        .toBeCloseTo(1, 5);
    });
  });

  describe('Currency', () => {
    it('uses rates from the injected fetch stub', async () => {
      let calls = 0;
      const stub = async () => {
        calls += 1;
        return {
          ok: true,
          json: async () => ({ amount: 1, base: 'EUR', rates: { USD: 1.08, INR: 90.5, EUR: 1 } }),
        };
      };

      app = openApp(stub);
      app.window.fetch = stub;
      app.Converter.setQuantity('currency');
      await flush();

      expect(calls).toBeGreaterThan(0);
      expect(app.Converter.doConvert('currency', 'eur', 'usd', 10)).toBeCloseTo(10.8, 6);
      expect(app.Converter.doConvert('currency', 'usd', 'inr', 2))
        .toBeCloseTo(2 * 90.5 / 1.08, 1);
    });

    it('does not throw when the fetch stub rejects (cache stays empty -> NaN)', async () => {
      let calls = 0;
      const stub = () => {
        calls += 1;
        return Promise.reject(new Error('network down'));
      };

      app = openApp(stub);
      app.window.fetch = stub;
      app.Converter.setQuantity('currency');
      await flush();

      expect(calls).toBeGreaterThan(0);
      const result = app.Converter.doConvert('currency', 'usd', 'eur', 1);
      expect(Number.isNaN(result)).toBe(true);

      expect(() => app.Converter.doConvert('currency', 'usd', 'eur', 1)).not.toThrow();
    });

    it('falls back to STATIC_EUR_RATES for codes the API omits', async () => {
      const stub = async () => ({
        ok: true,
        json: async () => ({ amount: 1, base: 'EUR', rates: { USD: 1.08, EUR: 1 } }),
      });

      app = openApp(stub);
      app.window.fetch = stub;
      app.Converter.setQuantity('currency');
      await flush();

      const result = app.Converter.doConvert('currency', 'rub', 'aed', 1);
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeCloseTo(4.265 / 100, 9);
    });
  });

  describe('Quantity switching', () => {
    it('reports the new quantity after setQuantity()', () => {
      expect(app.Converter.quantity).toBe('angle');
      app.Converter.setQuantity('temperature');
      expect(app.Converter.quantity).toBe('temperature');
      app.Converter.doConvert('temperature', 'celsius', 'fahrenheit', 100);
      app.Converter.setQuantity('length');
      expect(app.Converter.quantity).toBe('length');
    });

    it('moves converter-active between containers on setQuantity()', () => {
      const angle = app.document.querySelector('.converter-container.angle');
      const length = app.document.querySelector('.converter-container.length');
      expect(angle.classList.contains('converter-active')).toBe(true);
      expect(angle.classList.contains('converter-hidden')).toBe(false);

      app.Converter.setQuantity('length');

      expect(angle.classList.contains('converter-active')).toBe(false);
      expect(angle.classList.contains('converter-hidden')).toBe(true);
      expect(length.classList.contains('converter-active')).toBe(true);
      expect(length.classList.contains('converter-hidden')).toBe(false);
    });
  });

  describe('Table exhaustiveness', () => {
    it('converts every from/to pair in every quantity without producing NaN', async () => {
      const currencyRates = {};
      app.document.querySelectorAll('.converter-container.currency option').forEach((opt) => {
        currencyRates[opt.value] = 1;
      });
      const stub = async () => ({
        ok: true,
        json: async () => ({ amount: 1, base: 'EUR', rates: currencyRates }),
      });
      app.window.fetch = stub;
      app.Converter.setQuantity('currency');
      await flush();

      const quantities = [...app.document.querySelectorAll('#quantitySelector option')]
        .map((opt) => opt.value);

      expect(quantities.length).toBeGreaterThan(0);

      for (const quantity of quantities) {
        const container = [...app.document.querySelectorAll('.converter-container')]
          .find((c) => c.classList.contains(quantity));
        expect(container, `container for "${quantity}"`).toBeTruthy();

        const froms = [...container.querySelectorAll('.from-unit option')].map((o) => o.value);
        const tos = [...container.querySelectorAll('.to-unit option')].map((o) => o.value);

        for (const from of froms) {
          for (const to of tos) {
            const result = app.Converter.doConvert(quantity, from, to, 1);
            expect(Number.isFinite(result), `${quantity}: ${from} -> ${to}`).toBe(true);
          }
        }
      }
    });
  });
});