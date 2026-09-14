import { test, expect } from '@playwright/test';
import { addChild, autoPlay, openGrownUps, startSession } from './helpers';

/** What we learn about the first silent-e word-work item we run into, for the test to report. */
interface SilentEFound {
  word: string;
  tiles: number;
  dots: number;
  bridgeWidth: number;
}

test('a Book 4 silent-e session shows the bridge and one dot per sound, then plays to the end', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await addChild(page, 'Eve');
  await openGrownUps(page);
  await page.getByLabel(/move to/i).selectOption('4.1');
  await page.getByRole('button', { name: /^move$/i }).click();
  await expect(page.locator('.path-current')).toContainText('4.1');
  await page.getByRole('button', { name: /^back$/i }).click();

  await startSession(page, 'Eve');

  // Section 4.1's word bank mixes silent-e words (a_e, i_e) with review words that aren't, so
  // the first word-work "tap" item we see may not be a silent-e word. Keep looking at every
  // word-work item as the session plays through it, and assert on the first one whose tile count
  // exceeds its dot count (its silent letter gets a tile but taps no sound of its own).
  let found: SilentEFound | null = null;

  const { partsSeen } = await autoPlay(page, {
    adult: true,
    onItem: async (part, kind) => {
      if (found || kind !== 'word-work') return;
      if ((await part.getAttribute('data-item')) !== 'tap') return;
      const tiles = await part.locator('.tile').count();
      const dots = await part.locator('button.dot').count();
      if (tiles <= dots) return; // not a silent-e word on screen; keep looking

      const word = (await part.locator('.tile').allTextContents()).join('');
      const bridge = page.getByTestId('vce-bridge').first();
      await expect(bridge).toBeVisible();
      const box = await bridge.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(20); // a real arc, not a collapsed one
      expect(dots).toBe(tiles - 1); // one dot per sound; the silent tile gets none

      found = { word, tiles, dots, bridgeWidth: box!.width };
    },
  });

  expect(found, 'no word-work item with more tiles than dots (a silent-e word) turned up before word-work ended').not.toBeNull();

  // Nothing in the six session parts broke on Book 4 content.
  expect(partsSeen).toEqual(['sound-forward', 'sound-reverse', 'lesson', 'word-work', 'spelling', 'read-aloud-ask', 'read-aloud', 'story-title', 'story', 'story-question']);
  await expect(page.getByText(/nice work today/i)).toBeVisible();
  expect(errors).toEqual([]);

  console.log('silent-e word-work item found:', found);
});
