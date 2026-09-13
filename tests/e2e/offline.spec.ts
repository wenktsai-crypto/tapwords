import { test, expect } from '@playwright/test';
import { addChild } from './helpers';

test('the app links a manifest and registers a service worker', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest\.webmanifest/);
  const ready = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  expect(ready).toBe(true);
  const manifest = await page.evaluate(async () => (await fetch('manifest.webmanifest')).json());
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
});

test('after the first load, the app still opens and keeps its data while offline', async ({ page, context }) => {
  await addChild(page, 'Ola');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // Wait until the workbox precache actually holds index.html, rather than a fixed sleep, so the
  // offline reload below isn't racing the service worker's install/precache step.
  await page.waitForFunction(
    async () => {
      const keys = await caches.keys();
      for (const key of keys) {
        if (!key.includes('workbox-precache')) continue;
        const cache = await caches.open(key);
        const match = (await cache.match('index.html')) ?? (await cache.match('/'));
        if (match) return true;
      }
      return false;
    },
    null,
    { timeout: 15_000 },
  );
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Tapwords' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Ola$/ })).toBeVisible();
  await page.getByRole('button', { name: /^Ola$/ }).click();
  await expect(page.getByRole('button', { name: /that's it/i })).toBeVisible();
  await context.setOffline(false);
});
