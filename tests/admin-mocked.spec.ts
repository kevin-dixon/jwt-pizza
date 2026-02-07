import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';

async function setupAdminMocks(page: Page) {
  let loggedInUser: User | undefined;
  const adminUser: User = { id: '1', name: 'Admin User', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] };

  const franchiseList = {
    franchises: [
      {
        id: '10',
        name: 'LotaPizza',
        admins: [{ id: '1', name: 'Admin User', email: 'a@jwt.com' }],
        stores: [
          { id: '101', name: 'Lehi', totalRevenue: 100 },
          { id: '102', name: 'Springville', totalRevenue: 250 },
        ],
      },
    ],
    more: false,
  };

  await page.route('**/api/auth', async (route) => {
    const body = route.request().postDataJSON();
    if (route.request().method() !== 'PUT') {
      await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
      return;
    }
    if (body.email !== adminUser.email || body.password !== adminUser.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = adminUser;
    await route.fulfill({ json: { user: adminUser, token: 'abcdef' } });
  });

  await page.route('**/api/user/me', async (route) => {
    await route.fulfill({ json: loggedInUser ?? null });
  });

  await page.route(/\/api\/franchise\?.*$/, async (route) => {
    await route.fulfill({ json: franchiseList });
  });

  await page.route('**/api/franchise', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
      return;
    }
    const body = route.request().postDataJSON();
    await route.fulfill({
      json: {
        id: '999',
        name: body.name,
        admins: body.admins ?? [],
        stores: [],
      },
    });
  });

  await page.route(/\/api\/franchise\/[^/]+\/store\/[^/]+$/, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
      return;
    }
    await route.fulfill({ json: { message: 'store closed' } });
  });

  await page.route(/\/api\/franchise\/[^/]+$/, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
      return;
    }
    await route.fulfill({ json: { message: 'franchise closed' } });
  });

  await page.goto('/');
}

async function loginAsAdmin(page: Page) {
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
}

test('admin dashboard loads (mocked)', async ({ page }) => {
  await setupAdminMocks(page);
  await loginAsAdmin(page);

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
  await expect(page.getByText('LotaPizza')).toBeVisible();
});

test('create franchise (mocked)', async ({ page }) => {
  await setupAdminMocks(page);
  await loginAsAdmin(page);

  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').fill('newFranchiseName');
  await page.getByPlaceholder('franchisee admin email').fill('a@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
});

test('close franchise (mocked)', async ({ page }) => {
  await setupAdminMocks(page);
  await loginAsAdmin(page);

  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Close' }).first().click();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
});
