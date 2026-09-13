import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const outDir = '.tmp-pwa-dist';

describe('production build is installable and offline-capable', () => {
  beforeAll(() => {
    execSync(`npx vite build --outDir ${outDir} --emptyOutDir`, { stdio: 'pipe' });
  }, 120000);

  it('emits a manifest with icons and standalone display', () => {
    const m = JSON.parse(readFileSync(`${outDir}/manifest.webmanifest`, 'utf8'));
    expect(m.name).toBe('Tapwords');
    expect(m.display).toBe('standalone');
    expect(m.icons.length).toBeGreaterThanOrEqual(3);
    for (const i of m.icons) expect(existsSync(`${outDir}/${i.src}`), i.src).toBe(true);
  });

  it('emits a service worker that precaches fonts, icons, and the page', () => {
    expect(existsSync(`${outDir}/sw.js`)).toBe(true);
    const sw = readFileSync(`${outDir}/sw.js`, 'utf8');
    expect(sw).toMatch(/\.woff2/);
    expect(sw).toMatch(/index\.html/);
    expect(sw).toMatch(/icon\.svg/);
    expect(sw).toMatch(/apple-touch-icon\.png/);
    expect(readdirSync(`${outDir}/assets`).some((f) => f.endsWith('.woff2'))).toBe(true);
  });

  it('links the manifest and iOS meta from index.html', () => {
    const html = readFileSync(`${outDir}/index.html`, 'utf8');
    expect(html).toContain('manifest.webmanifest');
    expect(html).toContain('apple-mobile-web-app-capable');
    expect(html).not.toContain('maximum-scale');
  });
});
