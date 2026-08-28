import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('logs practice, links a work use, and survives offline reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notice where practice becomes useful.');

  await page.locator('#open-entry').click();
  await page.getByLabel('Topic *').fill('TCP retransmission');
  await page.getByLabel('Source *').fill('TCP/IP Illustrated');
  await page.getByLabel('Retrieval prompt *').fill('What separates packet loss from delay?');
  await page.getByLabel('Open question optional').fill('How does the timer adapt?');
  await page.getByRole('button', { name: 'Save practice' }).click();

  await expect(page.getByRole('heading', { name: 'TCP retransmission' })).toBeVisible();
  await page.getByRole('button', { name: 'Link a work use' }).click();
  await page.getByLabel('Application note *').fill('Recognised a retry pattern and chose the next signal to inspect.');
  await page.getByRole('button', { name: 'Link this use' }).click();
  await expect(page.getByText('Recognised a retry pattern and chose the next signal to inspect.')).toBeVisible();

  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload();
  }
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'TCP retransmission' })).toBeVisible();
  await expect(page.getByText(/Offline — local logging and export still work/)).toBeVisible();
});

test('has no serious accessibility violations in light and dark treatments', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#evidence-list')).toHaveAttribute('aria-busy', 'false');
  for (const theme of ['Light', 'Dark']) {
    await page.getByLabel('Color theme').selectOption({ label: theme });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('legal routes and keyboard dialog path work', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page).toHaveTitle(/Privacy/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to evidence log')).toBeFocused();
  await page.getByRole('button', { name: 'Data & access' }).click();
  await expect(page.getByRole('dialog', { name: 'Your data & access' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Your data & access' })).not.toBeVisible();
});

test('a cached verified license reveals only the additive review tools', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sb_license:work-study-evidence-log:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() })));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open transfer review' }).click();
  await expect(page.getByRole('dialog', { name: 'Transfer review' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'View archive' }).click();
  await expect(page.getByRole('heading', { name: 'Archive lens' })).toBeVisible();
  await page.getByRole('button', { name: 'Data & access' }).click();
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
});
