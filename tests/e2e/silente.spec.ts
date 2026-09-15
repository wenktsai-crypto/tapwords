import { test, expect, type Locator, type Page } from '@playwright/test';
import { addChild, autoPlay, openGrownUps, startSession } from './helpers';

/** What we learn about the first silent-e word-work item we run into, for the test to report. */
interface SilentEFound {
  word: string;
  tiles: number;
  dots: number;
  arcWidth: number;
  arcHeight: number;
}

/**
 * Asserts the bridge is a real, painted arc joining the two tiles it claims to join, at whatever
 * size the screen happens to be right now.
 *
 * The thing to be careful about: the `<svg>` that holds the arc is CSS-sized to the whole tile row
 * (`.vce-bridge { inset: 0; width: 100%; height: 100% }`), so measuring *the svg* reports the row's
 * width whether or not anything is drawn inside it — and the svg renders whenever the content says
 * the word has a silent-e pair, not when an arc exists. Everything below therefore measures the
 * `<path>` itself, and checks that it is painted as well as present. The arc's *geometry* is
 * already covered by tests/ui/soundtiles.test.tsx (it pins the exact path data against mocked
 * rects); what only a real browser can check is the CSS — whether the child can see the line at
 * all — and whether a real relayout re-measures it. That is what this adds.
 */
async function expectBridgeDrawn(row: Locator): Promise<{ width: number; height: number }> {
  const svg = row.getByTestId('vce-bridge');
  const path = svg.locator('path');
  let ink = { width: 0, height: 0 };

  // A relayout re-measures asynchronously (ResizeObserver, then a state update), so retry the
  // whole block rather than racing it.
  await expect(async () => {
    await expect(path).toHaveCount(1);

    // Which two tiles the component says this arc joins.
    const pairs = await svg.getAttribute('data-pairs');
    expect(pairs, 'the bridge does not say which tiles it joins').toBeTruthy();
    const [vowel, silent] = pairs!.split(' ')[0].split('-').map(Number);

    const rowBox = await row.boundingBox();
    const aBox = await row.locator('.tile').nth(vowel).boundingBox();
    const bBox = await row.locator('.tile').nth(silent).boundingBox();
    const inkBox = await path.boundingBox();
    expect(rowBox && aBox && bBox && inkBox, 'a box could not be measured').toBeTruthy();

    // The path's own ink box, not the container's.
    expect(inkBox!.width, 'the arc spans less than a tile').toBeGreaterThan(40);
    expect(inkBox!.height, 'the arc does not curve').toBeGreaterThan(10);
    ink = { width: inkBox!.width, height: inkBox!.height };

    // Its ends sit on the two tile centres *as measured right now*. A measurement left stale by a
    // relayout fails here even though the arc is still perfectly drawn somewhere else.
    const d = await path.getAttribute('d');
    const m = /^M (\S+) (\S+) Q \S+ \S+ (\S+) (\S+)$/.exec(d ?? '');
    expect(m, `unexpected path data: ${d}`).not.toBeNull();
    const [x1, y, x2] = [Number(m![1]), Number(m![2]), Number(m![3])];
    expect(Math.abs(x1 - (aBox!.x + aBox!.width / 2 - rowBox!.x)), 'arc start is not on the vowel tile').toBeLessThan(2);
    expect(Math.abs(x2 - (bBox!.x + bBox!.width / 2 - rowBox!.x)), 'arc end is not on the silent tile').toBeLessThan(2);
    expect(Math.abs(y - (aBox!.y + aBox!.height - rowBox!.y)), 'arc does not hang off the bottom of the tiles').toBeLessThan(2);

    // And it is actually painted. Every check above passes with `stroke: none` — the path keeps
    // perfect coordinates and paints nothing — so this is the one that catches an invisible line.
    const paint = await path.evaluate((el) => {
      const s = getComputedStyle(el);
      return { stroke: s.stroke, width: parseFloat(s.strokeWidth), opacity: parseFloat(s.opacity) };
    });
    expect(paint.stroke, 'the arc has no stroke colour, so nothing is painted').not.toBe('none');
    expect(paint.width, 'the arc has no stroke width, so nothing is painted').toBeGreaterThan(1);
    expect(paint.opacity, 'the arc is fully transparent').toBeGreaterThan(0.1);
  }).toPass({ timeout: 15_000 });

  return ink;
}

/** The tile row that holds the bridge, so tiles and arc are measured against the same box. */
function bridgeRow(part: Locator, page: Page): Locator {
  return part.locator('.tilerow').filter({ has: page.getByTestId('vce-bridge') }).first();
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
      const row = bridgeRow(part, page);
      await expect(row.getByTestId('vce-bridge')).toBeVisible();
      const ink = await expectBridgeDrawn(row);
      expect(dots).toBe(tiles - 1); // one dot per sound; the silent tile gets none

      // Then relayout for real and check the arc followed its tiles. The half of the resize fix
      // that watches the tiles themselves can never be exercised under jsdom (every rect there is
      // zero), so this is the only place it is checked at all. 560px is under the 600px
      // breakpoint in styles.css, so this is a genuine change of tile size, not just of the row.
      await page.setViewportSize({ width: 560, height: 800 });
      const small = await expectBridgeDrawn(row);
      expect(small.width, 'the arc did not change with the layout').not.toBe(ink.width);
      await page.setViewportSize({ width: 1024, height: 768 });
      await expectBridgeDrawn(row);

      found = { word, tiles, dots, arcWidth: ink.width, arcHeight: ink.height };
    },
  });

  expect(found, 'no word-work item with more tiles than dots (a silent-e word) turned up before word-work ended').not.toBeNull();

  // Nothing in the six session parts broke on Book 4 content.
  expect(partsSeen).toEqual(['sound-forward', 'sound-reverse', 'lesson', 'word-work', 'spelling', 'read-aloud-ask', 'read-aloud', 'story-title', 'story', 'story-question']);
  await expect(page.getByText(/nice work today/i)).toBeVisible();
  expect(errors).toEqual([]);

  console.log('silent-e word-work item found:', found);
});
