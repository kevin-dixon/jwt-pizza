import { test, expect } from 'playwright-test-coverage';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('token');
  });
  await page.route('**/api/**', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
});

test('about page renders key content', async ({ page }) => {
  await page.goto('/about');

  await expect(page.getByRole('heading', { name: 'The secret sauce' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Our employees' })).toBeVisible();
  await expect(page.getByAltText('Employee stock photo').first()).toBeVisible();
});

test('history page renders key content', async ({ page }) => {
  await page.goto('/history');

  await expect(page.getByRole('heading', { name: 'Mama Rucci, my my' })).toBeVisible();
  await expect(page.getByText("It all started in Mama Ricci's kitchen.")).toBeVisible();
});

test('not found page renders on invalid route', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');

  await expect(page.getByRole('heading', { name: 'Oops' })).toBeVisible();
  await expect(page.getByText('It looks like we have dropped a pizza on the floor.')).toBeVisible();
});
