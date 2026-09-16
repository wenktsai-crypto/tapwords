import { test, expect } from '@playwright/test';
import { addChild, autoPlay, startSession } from './helpers';

test('at phone width nothing runs off the screen', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await addChild(page, 'Rosa', '4.5');
  // The child's own name must be readable, not clipped into its padding.
  const btn = page.getByRole('button', { name: /^Rosa$/ });
  const fit = await btn.evaluate((el) => ({ client: el.clientWidth, scroll: el.scrollWidth }));
  console.log('NAME BUTTON', JSON.stringify(fit));
  expect(fit.scroll, 'the name is clipped inside its own button').toBeLessThanOrEqual(fit.client);

  await startSession(page, 'Rosa');
  let worst = 0;
  await autoPlay(page, {
    onItem: async () => {
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      worst = Math.max(worst, over);
      const clipped = await page.evaluate(() =>
        [...document.querySelectorAll('.tile')].filter((e) => {
          const r = e.getBoundingClientRect();
          return r.left < 0 || r.right > window.innerWidth;
        }).length);
      expect(clipped, 'a letter tile is cut off by the edge of the screen').toBe(0);
    },
  });
  console.log('WORST HORIZONTAL OVERFLOW (px):', worst);
  expect(worst, 'the page scrolls sideways').toBeLessThanOrEqual(0);
});
