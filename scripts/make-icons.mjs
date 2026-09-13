import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const svg = readFileSync(resolve('public/icon.svg'), 'utf8');
const out = resolve('public/icons');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function render(size, file, padding = 0) {
  await page.setViewportSize({ width: size, height: size });
  const inner = size - padding * 2;
  await page.setContent(`<body style="margin:0;background:#f6f1e7"><div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center"><div style="width:${inner}px;height:${inner}px">${svg}</div></div></body>`);
  await page.screenshot({ path: `${out}/${file}`, clip: { x: 0, y: 0, width: size, height: size } });
  console.log('wrote', file);
}

await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
await render(512, 'maskable-512.png', 64);
await render(180, 'apple-touch-icon.png');
await browser.close();
