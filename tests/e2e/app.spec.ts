import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function logPractice(page: Page, topic = 'TCP retransmission'): Promise<void> {
  await page.locator('#open-entry').click();
  await page.getByLabel('Topic *').fill(topic);
  await page.getByLabel('Source *').fill('TCP/IP Illustrated');
  await page.getByLabel('Retrieval prompt *').fill('What separates packet loss from delay?');
  await page.getByLabel('Open question optional').fill('How does the timer adapt?');
  await page.getByRole('button', { name: 'Save practice' }).click();
  await expect(page.getByRole('heading', { name: topic })).toBeVisible();
}

async function captureBlobDownloads(page: Page): Promise<void> {
  await page.evaluate(() => {
    const state = window as Window & { __capturedDownloads?: string[] };
    state.__capturedDownloads = [];
    const original = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (value: Blob | MediaSource): string => {
      if (value instanceof Blob) void value.text().then((text) => state.__capturedDownloads?.push(text));
      return original(value);
    };
  });
}

test('@claim:demo-isolation sample mode is seeded, resettable, and separate from the real log', async ({ page }) => {
  await page.goto('/');
  await logPractice(page, 'My private DNS notes');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();

  await expect(page).toHaveURL(/\/demo$/);
  await expect(page).toHaveTitle('Demo — Practice Evidence Log');
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample data');
  await expect(page.getByRole('heading', { name: 'Reading retry signals' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Comparing query plans' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My private DNS notes' })).toHaveCount(0);

  await logPractice(page, 'Demo-only cache notes');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { name: 'Demo-only cache notes' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Reading retry signals' })).toBeVisible();

  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'My private DNS notes' })).toBeVisible();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('practice-evidence-log');
  expect(databases).not.toContain('demo:practice-evidence-log');
});

test('@claim:offline-reload sample log reloads offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Reading retry signals' })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Reading retry signals' })).toBeVisible();
  await expect(page.getByText(/Offline — local logging and export still work/)).toBeVisible();
});

test('@claim:portable-data JSON and CSV exports contain every sample record and JSON restores it', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Reading retry signals' })).toBeVisible();
  await captureBlobDownloads(page);
  await page.getByRole('button', { name: 'Data & access' }).click();
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await page.getByRole('button', { name: 'Export CSV' }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __capturedDownloads?: string[] }).__capturedDownloads?.length)).toBe(2);
  const downloads = await page.evaluate(() => (window as unknown as { __capturedDownloads: string[] }).__capturedDownloads);
  const jsonText = downloads.find((text) => text.trim().startsWith('{'))!;
  const csvText = downloads.find((text) => text.startsWith('"practice_date"'))!;
  const bundle = JSON.parse(jsonText) as { entries: unknown[] };
  expect(bundle.entries).toHaveLength(2);
  expect(csvText.trim().split('\n')).toHaveLength(3);
  expect(csvText).toContain('"Reading retry signals"');
  expect(csvText).toContain('"Comparing query plans"');
  await page.keyboard.press('Escape');
  await logPractice(page, 'Temporary demo record');
  await page.getByRole('button', { name: 'Data & access' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#import-json').evaluate((input, content) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([content], 'practice-evidence.json', { type: 'application/json' }));
    (input as HTMLInputElement).files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, jsonText);
  await expect(page.locator('#toast')).toContainText('Import complete');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Temporary demo record' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Reading retry signals' })).toBeVisible();
});

test('@claim:local-privacy normal demo logging sends no record data or analytics away', async ({ page }) => {
  const requests: Array<{ url: string; method: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/demo');
  await logPractice(page, 'Private queue notes');
  await page.getByRole('button', { name: 'Link a work use' }).last().click();
  await page.getByLabel('Application note *').fill('Recognised the queue pattern and checked consumer lag.');
  await page.getByRole('button', { name: 'Link this use' }).click();
  const crossOrigin = requests.filter((request) => new URL(request.url).origin !== new URL(page.url()).origin);
  expect(crossOrigin).toEqual([]);
  expect(requests.filter((request) => request.method !== 'GET')).toEqual([]);
  await expect(page.getByText(/no account or analytics/i)).toBeVisible();
});

test('@claim:free-core-paid-review core logging and exports are free while the $12 review is optional', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Log your practice' })).toBeVisible();
  await page.getByRole('button', { name: 'Data & access' }).click();
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
  await expect(page.getByText('Evidence pass · $12 once')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy the evidence pass' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/work-study-evidence-log/checkout');
});

test('malformed imports are rejected without replacing valid data or breaking reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await logPractice(page, 'Known-good practice');
  await page.getByRole('button', { name: 'Data & access' }).click();
  const malformed = JSON.stringify({
      product: 'work-study-evidence-log', version: 1, exportedAt: '2026-08-28T10:00:00Z', entries: [{
        id: 'broken', practicedOn: '2026-08-28', topic: 'Incomplete', minutes: 30,
        openQuestion: '', applications: [], createdAt: '2026-08-28T10:00:00Z', updatedAt: '2026-08-28T10:00:00Z'
      }]
    });
  await page.locator('#import-json').evaluate((input, content) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([content], 'incomplete.json', { type: 'application/json' }));
    (input as HTMLInputElement).files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, malformed);
  await expect(page.locator('#toast')).toContainText('incomplete or invalid practice entry');
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Known-good practice' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('@claim:core-workflow practice blocks can be created, linked, edited, and deleted with valid fields and dates', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#open-entry').click();
  await page.getByLabel('Date *').fill('2026-08-20');
  await page.getByLabel('Topic *').fill('   ');
  await page.getByLabel('Source *').fill('   ');
  await page.getByLabel('Retrieval prompt *').fill('   ');
  await page.getByRole('button', { name: 'Save practice' }).click();
  await expect(page.locator('#entry-error')).toContainText('text, not spaces');
  await page.getByLabel('Topic *').fill('Tracing retry storms');
  await page.getByLabel('Source *').fill('Incident response handbook');
  await page.getByLabel('Retrieval prompt *').fill('Which signal shows synchronized retries?');
  await page.getByLabel('Minutes *').fill('9');
  await page.getByRole('button', { name: 'Save practice' }).click();
  await expect(page.locator('#entry-error')).toContainText('10 to 60 minutes');
  await page.getByLabel('Minutes *').fill('60');
  await page.getByRole('button', { name: 'Save practice' }).click();

  await page.getByRole('button', { name: 'Link a work use' }).click();
  await page.getByLabel('Date used *').fill('2026-08-19');
  await page.getByLabel('Application note *').fill('Noticed the retry pattern.');
  await page.getByRole('button', { name: 'Link this use' }).click();
  await expect(page.locator('#application-error')).toContainText('practice date or a later date');
  await page.getByLabel('Date used *').fill('2026-08-20');
  await page.getByRole('button', { name: 'Link this use' }).click();
  await expect(page.getByText('Noticed the retry pattern.')).toBeVisible();
  const slip = page.locator('.evidence-slip').filter({ hasText: 'Tracing retry storms' });
  await slip.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Topic *').fill('Tracing coordinated retries');
  await page.getByRole('button', { name: 'Save practice' }).click();
  await expect(page.getByText('Noticed the retry pattern.')).toBeVisible();
  await page.locator('.evidence-slip').filter({ hasText: 'Tracing coordinated retries' }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('dialog', { name: 'Delete this practice block?' })).toContainText('1 linked work-use note');
  await page.getByRole('button', { name: 'Delete practice' }).click();
  await expect(page.getByRole('heading', { name: 'Tracing coordinated retries' })).toHaveCount(0);
});

test('@claim:license-check license verification sends only the token and never log content', async ({ page }) => {
  const requests: string[] = [];
  await page.route('https://api.sociobot.in/**', async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Data & access' }).click();
  await page.getByLabel('Have a license? Paste it here').fill('sample-license-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('#license-status')).toContainText('License verified');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toContain('license=sample-license-token');
  expect(requests[0]).not.toContain('Reading%20retry%20signals');
});

test('metadata, manifest, 404, and deployment response policy are complete', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Practice Evidence Log — Link study to work');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://work-study-evidence-log.sociobot.in/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.jpg$/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/assets/apple-touch-icon.png');
  const manifestResponse = await request.get('/manifest.webmanifest');
  expect(manifestResponse.headers()['content-type']).toContain('application/manifest+json');
  const config = await (await request.get('/staticwebapp.config.json')).json();
  expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  expect(config.routes.find((route: { route: string }) => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
  expect(config.routes.find((route: { route: string }) => route.route === '/manifest.webmanifest').headers['Content-Type']).toBe('application/manifest+json');
  expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('That page is not here.');
});

test('@claim:accessible-themes desktop, mobile, keyboard, zoom, and accessibility checks pass', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#evidence-list')).toHaveAttribute('aria-busy', 'false');
  for (const theme of ['Light', 'Dark']) {
    await page.getByLabel('Color theme').selectOption({ label: theme });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText(/For working professionals who study around a job/)).toBeVisible();
  await expect(page.getByText('Private:', { exact: false })).toBeVisible();
  await expect(page.getByText('Offline:', { exact: false })).toBeVisible();
  await expect(page.getByText('Price:', { exact: false })).toBeVisible();
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const undersized = await page.locator('a, button, select, input, textarea, label.file-button').evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0;
    })
    .filter((element) => element.getBoundingClientRect().height < 43.5)
    .map((element) => ({ text: element.textContent?.trim(), tag: element.tagName, height: element.getBoundingClientRect().height })));
  expect(undersized).toEqual([]);

  await page.keyboard.press('Home');
  for (let index = 0; index < 18; index += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return null;
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height };
    });
    if (focused) expect(focused.width > 1 && focused.height > 1).toBe(true);
  }

  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  for (const route of ['/privacy/', '/terms/', '/404.html']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
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
