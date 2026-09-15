import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(ROOT, 'manifest.webmanifest'), 'utf8'));
const serviceWorker = readFileSync(resolve(ROOT, 'service-worker.js'), 'utf8');
const registration = readFileSync(resolve(ROOT, 'js/pwa.js'), 'utf8');

function pngDimensions(relativePath) {
  const bytes = readFileSync(resolve(ROOT, relativePath));
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

describe('Installable web app', () => {
  it('links the manifest, theme color, touch icon, and service-worker registration', () => {
    expect(html).toContain('rel="manifest" href="manifest.webmanifest"');
    expect(html).toContain('name="theme-color" content="#2c2c2c"');
    expect(html).toContain('rel="apple-touch-icon" href="image/icon-192.png"');
    expect(html).toContain('src="js/pwa.js"');
    expect(registration).toContain("serviceWorker.register('./service-worker.js')");
  });

  it('provides standalone metadata and correctly sized install icons', () => {
    expect(manifest.name).toBe('Calculator');
    expect(manifest.short_name).toBe('Calculator');
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#2c2c2c');

    for (const size of [192, 512]) {
      const icon = manifest.icons.find((item) => item.sizes === `${size}x${size}`);
      expect(icon).toBeDefined();
      expect(icon.type).toBe('image/png');
      expect(existsSync(resolve(ROOT, icon.src))).toBe(true);
      expect(pngDimensions(icon.src)).toEqual({ width: size, height: size });
    }
  });

  it('pre-caches every local application resource required for offline startup', () => {
    const requiredFiles = [
      './index.html',
      './style.css',
      './manifest.webmanifest',
      './image/icon-192.png',
      './image/icon-512.png',
      './js/settings.js',
      './js/evaluator.js',
      './js/converter.js',
      './js/calculator.js',
      './js/app.js',
      './js/pwa.js',
    ];

    requiredFiles.forEach((path) => expect(serviceWorker).toContain(`'${path}'`));
    expect(serviceWorker).toContain("url.origin !== self.location.origin");
    expect(serviceWorker).toContain("caches.match('./index.html')");
  });
});
