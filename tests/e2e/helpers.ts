import { expect, type Locator, type Page } from '@playwright/test';

export async function addChild(page: Page, name: string, substep = '1.1') {
  await page.goto('/');
  await page.getByRole('button', { name: /add a child/i }).click();
  await page.getByLabel(/name/i).fill(name);
  await page.getByLabel(/start/i).selectOption(substep);
  await page.getByRole('button', { name: /^save$/i }).click();
  await expect(page.getByRole('button', { name: new RegExp(`^${name}$`) })).toBeVisible();
}

export async function startSession(page: Page, name: string) {
  await page.getByRole('button', { name: new RegExp(`^${name}$`) }).click();
  await expect(page.getByRole('button', { name: /stop for now/i })).toBeVisible();
}

export async function openGrownUps(page: Page) {
  const btn = page.getByRole('button', { name: /grown-ups/i }).first();
  const box = await btn.boundingBox();
  if (!box) throw new Error('hold button not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1800);
  await page.mouse.up();
  await expect(page.getByText(/grown-up area/i)).toBeVisible();
}

/** Marks one placement list: `got` "Got it" taps then `missed` "Missed it" taps. */
export async function markPlacementList(page: Page, got: number, missed: number) {
  for (let i = 0; i < got; i++) await page.getByRole('button', { name: /got it/i }).click();
  for (let i = 0; i < missed; i++) await page.getByRole('button', { name: /missed it/i }).click();
}

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pieceName = (g: string) => new RegExp(`^${escapeRegex(g)}( \\d+)?$`);

async function buildFrom(page: Page, pieces: string[]) {
  const tray = page.getByTestId('tray');
  for (const g of pieces) {
    const candidates = tray.getByRole('button', { name: pieceName(g) });
    // Wait for the tray THIS word needs, not just any tray. The build item shows a preview
    // first and swaps in the tray after it speaks the word and pauses; a plain .count() does
    // not auto-wait, so on a machine with no speech voices (every CI box) it reads the
    // previous item's tray, finds nothing, and reports the first letter missing. Waiting on a
    // matching piece makes the tray's arrival the thing we synchronise on.
    await expect(candidates.first()).toBeVisible();
    const n = await candidates.count();
    let clicked = false;
    for (let i = 0; i < n; i++) {
      const c = candidates.nth(i);
      if (!((await c.getAttribute('class')) ?? '').includes('tile-dim')) {
        await c.click();
        // Confirm the tap registered before hunting for the next piece: the dim class is how
        // we tell a used piece from a free one, and reading it before React commits would make
        // us click the same piece twice and silently drop a letter.
        await expect(c).toHaveClass(/tile-dim/);
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      const names = await tray.getByRole('button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
      throw new Error(`no free piece for ${g} (wanted ${pieces.join(',')}; tray holds ${names.join(',')})`);
    }
  }
  await page.getByRole('button', { name: /^done$/i }).click();
}


async function tapOut(page: Page, n: number) {
  for (let k = 1; k <= n; k++) await page.getByRole('button', { name: `Sound ${k}` }).click();
  await page.getByRole('button', { name: 'Blend' }).click();
  // Blending speaks the word aloud (a real browser voice, unlike the unit-test fake audio) before
  // advancing, which takes noticeably longer than a click. Wait for that advance to actually land —
  // either this word's dots reset for a fresh try/tap item, or the dots disappear entirely because the
  // session moved to a different part — before the outer loop re-reads the screen. Without this, the
  // loop can re-read the still-blending word, re-tap its (now inert) dots, and hang waiting for a
  // "Blend" button that stays hidden until the transition it's still waiting on completes.
  await page.waitForFunction(() => {
    const dots = document.querySelectorAll('.dot');
    return dots.length === 0 || Array.from(dots).some((d) => !d.classList.contains('dot-lit'));
  });
}

/** Plays the current session to the end screen, answering everything correctly. adult=false declines the read-aloud.
 * `onItem`, if given, runs on every part just before it's answered — a chance to inspect the
 * screen (tiles, dots, the vce bridge, ...) while it's still showing its unanswered state. */
export async function autoPlay(
  page: Page,
  opts: { adult?: boolean; stopAfterParts?: number; onItem?: (part: Locator, kind: string) => Promise<void> } = {},
) {
  const adult = opts.adult ?? true;
  const partsSeen: string[] = [];
  for (let guard = 0; guard < 400; guard++) {
    const part = page.getByTestId('part').first();
    const niceWork = page.getByText(/nice work today/i);
    // The end screen can mount a beat after the last part unmounts (a real transition, not
    // instant like the unit tests' fake audio/timers), so a one-shot isVisible() check for it
    // followed by an unconditional wait for `part` can land in that gap and hang the full
    // timeout waiting for a part that is never coming back. Race both instead of guessing which
    // comes first.
    await Promise.race([
      part.waitFor({ state: 'visible', timeout: 20_000 }),
      niceWork.waitFor({ state: 'visible', timeout: 20_000 }),
    ]);
    if (await niceWork.isVisible().catch(() => false)) return { partsSeen };
    const kind = (await part.getAttribute('data-part')) ?? '';
    if (partsSeen[partsSeen.length - 1] !== kind) partsSeen.push(kind);
    if (opts.stopAfterParts && new Set(partsSeen).size > opts.stopAfterParts) {
      await page.getByRole('button', { name: /stop for now/i }).click();
      await expect(page.getByText(/nice work today/i)).toBeVisible();
      return { partsSeen };
    }
    if (opts.onItem) await opts.onItem(part, kind);
    const answer = (await part.getAttribute('data-answer')) ?? '';
    switch (kind) {
      case 'sound-forward':
        await page.getByRole('button', { name: /that's it/i }).click();
        break;
      case 'sound-reverse':
        await part.getByRole('button', { name: new RegExp(`^${escapeRegex(answer)}$`) }).click();
        break;
      case 'lesson': {
        const step = await part.getAttribute('data-step');
        if (step === 'try') await tapOut(page, await part.getByRole('button', { name: /^Sound \d+$/ }).count());
        else await page.getByRole('button', { name: /^next$/i }).click();
        break;
      }
      case 'word-work': {
        const item = await part.getAttribute('data-item');
        // NOT Number(answer): for a 'tap' item data-answer is the word's *tile* count
        // (word.parts.length), which over-counts a silent-e word by one (its silent letter gets
        // a tile but no dot — see SoundTiles/TapDots). Count the actual dot buttons instead.
        if (item === 'tap') await tapOut(page, await part.locator('button.dot').count());
        else if (item === 'find') await part.getByRole('button', { name: new RegExp(`^${escapeRegex(answer)}$`) }).click();
        else await buildFrom(page, answer.split(','));
        break;
      }
      case 'spelling': {
        const item = await part.getAttribute('data-item');
        if (item === 'sound') await part.getByRole('button', { name: new RegExp(`^${escapeRegex(answer)}$`) }).click();
        else if (item === 'word') await buildFrom(page, answer.split(','));
        else await buildFrom(page, answer.split('|'));
        break;
      }
      case 'read-aloud-ask':
        await page.getByRole('button', { name: adult ? /^yes$/i : /not right now/i }).click();
        break;
      case 'read-aloud':
        await page.getByRole('button', { name: /got it/i }).click();
        break;
      case 'story-title':
        await page.getByRole('button', { name: /^start$/i }).click();
        break;
      case 'story':
        await page.getByRole('button', { name: /^next$/i }).click();
        break;
      case 'story-question':
        await part.getByRole('button', { name: new RegExp(`^${escapeRegex(answer)}$`) }).click();
        break;
      default:
        throw new Error(`unknown part ${kind}`);
    }
  }
  throw new Error('autoPlay did not reach the end screen');
}
