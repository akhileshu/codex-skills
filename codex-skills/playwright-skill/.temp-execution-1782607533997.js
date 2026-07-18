const { chromium } = require('playwright');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    executablePath: '/usr/bin/google-chrome',
  });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
  page.on('response', (res) => {
    if (res.request().resourceType() === 'document') {
      console.log('[doc]', res.status(), res.url());
    }
  });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  console.log('loaded', await page.url());

  const sidebarText = await page.locator('aside').innerText();
  console.log('sidebar:\n' + sidebarText);

  const facetLinks = await page.locator('aside a').evaluateAll((els) =>
    els.map((el) => ({ text: el.textContent?.trim(), href: el.getAttribute('href') }))
  );
  console.log('links', JSON.stringify(facetLinks, null, 2));

  async function report(label) {
    const url = page.url();
    const heading = await page.locator('main h1').innerText().catch(() => '');
    const productCount = await page.locator('article').count().catch(() => 0);
    const emptyText = await page.locator('text=No products match the current filter set.').isVisible().catch(() => false);
    const clearButtons = await page.locator('aside a[aria-label^="Clear "]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('aria-label')).filter(Boolean),
    ).catch(() => []);
    console.log(JSON.stringify({ label, url, heading, productCount, emptyText, clearButtons }));
  }

  await report('initial');

  await page.fill('input[name="q"]', 'atlas');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await report('after query atlas');

  const clearQuery = page.locator('aside a[aria-label="Clear query filter"]');
  if (await clearQuery.count()) {
    await clearQuery.click();
    await page.waitForLoadState('networkidle');
    await report('after clear query');
  }

  const statusArchived = page.locator('aside a[href*="status=ARCHIVED"]');
  if (await statusArchived.count()) {
    await statusArchived.click();
    await page.waitForLoadState('networkidle');
    await report('after status archived');
  }

  const clearStatus = page.locator('aside a[aria-label="Clear status filter"]');
  if (await clearStatus.count()) {
    await clearStatus.click();
    await page.waitForLoadState('networkidle');
    await report('after clear status');
  }

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  const categoryElectronics = page.locator('aside a[href*="category="]').filter({ hasText: 'Electronics' }).first();
  if (await categoryElectronics.count()) {
    await categoryElectronics.click();
    await page.waitForLoadState('networkidle');
    await report('after category electronics');
  }

  const clearCategory = page.locator('aside a[aria-label="Clear category filter"]');
  if (await clearCategory.count()) {
    await clearCategory.click();
    await page.waitForLoadState('networkidle');
    await report('after clear category');
  }

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.fill('input[name="ratingAverageMin"]', '4');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await report('after rating min 4');

  const clearRating = page.locator('aside a[aria-label="Clear ratingAverage range filter"]');
  if (await clearRating.count()) {
    await clearRating.click();
    await page.waitForLoadState('networkidle');
    await report('after clear rating');
  }

  const resetAll = page.locator('a', { hasText: 'Reset all' }).first();
  if (await resetAll.count()) {
    await resetAll.click();
    await page.waitForLoadState('networkidle');
    await report('after reset all');
  }

  await browser.close();
})();
