import { test, expect } from '@playwright/test';
import { addChild, autoPlay, openGrownUps, startSession } from './helpers';

test('a child can be added and a whole session played with a grown-up', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await addChild(page, 'Sam');
  await startSession(page, 'Sam');
  const { partsSeen } = await autoPlay(page, { adult: true });
  expect(partsSeen).toEqual(['sound-forward', 'sound-reverse', 'lesson', 'word-work', 'spelling', 'read-aloud-ask', 'read-aloud', 'story-title', 'story', 'story-question']);
  await expect(page.getByText(/today: sound cards/i)).toBeVisible();
  await expect(page.getByText(/reading out loud/i)).toBeVisible();
  await page.getByRole('button', { name: /^done$/i }).click();

  await openGrownUps(page);
  await expect(page.getByText(/sessions in the last 14 days/i)).toBeVisible();
  await expect(page.locator('.stats')).toContainText('1');
  await expect(page.locator('.stats')).not.toContainText('never');
  expect(errors).toEqual([]);
});
