import { test, expect } from 'playwright-test-coverage';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('token');
  });
  await page.route('**/api/**', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
});

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});