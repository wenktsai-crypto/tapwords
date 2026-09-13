import { test, expect } from '@playwright/test';
import { addChild, autoPlay, openGrownUps, startSession } from './helpers';

test('when no grown-up is around, the read-aloud is offered first next time', async ({ page }) => {
  await addChild(page, 'Kim');
  await startSession(page, 'Kim');
  const first = await autoPlay(page, { adult: false });
  expect(first.partsSeen).not.toContain('read-aloud');
  await expect(page.getByText(/reading out loud/i)).not.toBeVisible();
  await page.getByRole('button', { name: /^done$/i }).click();

  await startSession(page, 'Kim');
  await expect(page.getByTestId('part')).toHaveAttribute('data-part', 'read-aloud-ask');
  const second = await autoPlay(page, { adult: true });
  expect(second.partsSeen[0]).toBe('read-aloud-ask');
  expect(second.partsSeen[1]).toBe('read-aloud');
  expect(second.partsSeen).toContain('lesson');
});

test('a parent can move the child, and the next session opens with the full lesson', async ({ page }) => {
  await addChild(page, 'Lee');
  await startSession(page, 'Lee');
  const first = await autoPlay(page, { adult: false });
  expect(first.partsSeen).toContain('lesson');
  await page.getByRole('button', { name: /^done$/i }).click();

  // second session: lesson is the short review (only "try" steps)
  await startSession(page, 'Lee');
  await autoPlay(page, { adult: false, stopAfterParts: 3 });
  await page.getByRole('button', { name: /^done$/i }).click();

  await openGrownUps(page);
  await page.getByLabel(/move to/i).selectOption('1.1');
  await page.getByRole('button', { name: /^move$/i }).click();
  await expect(page.getByText(/moved to 1\.1/i)).toBeVisible();
  await page.getByRole('button', { name: /back/i }).click();

  await startSession(page, 'Lee');
  // skip the sound cards, then the lesson must start with a spoken "say" step (full lesson)
  for (;;) {
    const part = page.getByTestId('part').first();
    await part.waitFor();
    const kind = await part.getAttribute('data-part');
    if (kind === 'lesson') break;
    if (kind === 'sound-forward') await page.getByRole('button', { name: /that's it/i }).click();
    else if (kind === 'sound-reverse') {
      const a = (await part.getAttribute('data-answer')) ?? '';
      await part.getByRole('button', { name: new RegExp(`^${a}$`) }).click();
    } else if (kind === 'read-aloud-ask') await page.getByRole('button', { name: /not right now/i }).click();
    else throw new Error(`unexpected part ${kind}`);
  }
  await expect(page.getByTestId('part')).toHaveAttribute('data-step', 'say');
});

test('stopping early keeps the child and the session', async ({ page }) => {
  await addChild(page, 'Ana');
  await startSession(page, 'Ana');
  await page.getByRole('button', { name: /that's it/i }).click();
  await page.getByRole('button', { name: /stop for now/i }).click();
  await expect(page.getByText(/you stopped early/i)).toBeVisible();
  await page.getByRole('button', { name: /^done$/i }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: /^Ana$/ })).toBeVisible();
  await openGrownUps(page);
  await expect(page.locator('.stats')).toContainText('1');
});
