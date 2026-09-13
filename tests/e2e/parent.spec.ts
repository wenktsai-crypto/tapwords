import { test, expect } from '@playwright/test';
import { addChild, markPlacementList, openGrownUps } from './helpers';

test('a grown-up can find the starting point with the placement check', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /add a child/i }).click();
  await page.getByLabel(/name/i).fill('Mia');
  await page.getByRole('button', { name: /find the starting point/i }).click();
  await page.getByRole('button', { name: /begin/i }).click();
  await expect(page.getByText(/list 1 of/i)).toBeVisible();
  await markPlacementList(page, 8, 0);   // 1.1 passes
  await markPlacementList(page, 7, 1);   // 1.3 passes
  await markPlacementList(page, 2, 6);   // 1.6 fails; stop
  await expect(page.getByText(/we suggest starting at 1\.3/i)).toBeVisible();
  await page.getByRole('button', { name: /use this/i }).click();
  await expect(page.getByRole('button', { name: /^Mia$/ })).toBeVisible();
  await openGrownUps(page);
  await expect(page.locator('.path-current')).toContainText('1.3');
});

test('a backup made on one device restores on a fresh one', async ({ page, browser }) => {
  await addChild(page, 'Noah', '1.4');
  await openGrownUps(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /back up everything/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^tapwords-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();
  expect(path).not.toBeNull();

  const fresh = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true });
  const page2 = await fresh.newPage();
  await page2.goto('/');
  await expect(page2.getByText(/add a child to get started/i)).toBeVisible();
  await page2.getByLabel(/restore from a backup/i).setInputFiles(path!);
  await page2.getByRole('button', { name: /replace everything/i }).click();
  await expect(page2.getByRole('button', { name: /^Noah$/ })).toBeVisible();
  await openGrownUps(page2);
  await expect(page2.locator('.path-current')).toContainText('1.4');
  await fresh.close();
});
