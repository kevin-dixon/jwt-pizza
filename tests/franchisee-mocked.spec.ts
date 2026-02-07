import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';

async function setupFranchiseeMocks(page: Page) {
  let loggedInUser: User | undefined;
  const franchiseeUser: User = {
    id: '4',
    name: 'Franchise Owner',
    email: 'f@jwt.com',
    password: 'franchisee',
    roles: [{ role: Role.Franchisee, objectId: '2' }],
  };

  const franchise = {
    id: '2',
    name: 'topSpot',
    admins: [{ id: '4', name: 'Franchise Owner', email: 'f@jwt.com' }],
    stores: [
      { id: '201', name: 'Provo', totalRevenue: 120 },
      { id: '202', name: 'Orem', totalRevenue: 220 },
    ],
  };

  await page.route('**/api/auth', async (route) => {
    const body = route.request().postDataJSON();
    if (route.request().method() !== 'PUT') {
      await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
      return;
    }
    if (body.email !== franchiseeUser.email || body.password !== franchiseeUser.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = franchiseeUser;
    await route.fulfill({ json: { user: franchiseeUser, token: 'abcdef' } });
  });

  await page.route('**/api/user/me', async (route) => {
    await route.fulfill({ json: loggedInUser ?? null });
  });

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    await route.fulfill({ json: [franchise] });
  });

  await page.route(/\/api\/franchise\/[^/]+\/store$/, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
      return;
    }
    const body = route.request().postDataJSON();
    const newStore = { id: `new-${franchise.stores.length + 1}`, name: body.name, totalRevenue: 0 };
    franchise.stores = [...franchise.stores, newStore];
    await route.fulfill({ json: newStore });
  });

  await page.route(/\/api\/franchise\/[^/]+\/store\/[^/]+$/, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
      return;
    }
    const url = new URL(route.request().url());
    const storeId = url.pathname.split('/').pop();
    franchise.stores = franchise.stores.filter((store) => store.id !== storeId);
    await route.fulfill({ json: { message: 'store closed' } });
  });

  await page.goto('/');
}

async function loginAsFranchisee(page: Page) {
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();
}

test('franchise dashboard loads (mocked)', async ({ page }) => {
  await setupFranchiseeMocks(page);
  await loginAsFranchisee(page);

  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('heading', { name: 'topSpot' })).toBeVisible();
});

test('create store (mocked)', async ({ page }) => {
  await setupFranchiseeMocks(page);
  await loginAsFranchisee(page);

  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByPlaceholder('store name').fill('newStoreTest');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByRole('cell', { name: 'newStoreTest' })).toBeVisible();
});

test('close store (mocked)', async ({ page }) => {
  await setupFranchiseeMocks(page);
  await loginAsFranchisee(page);

  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await page.getByRole('row', { name: /Provo/ }).getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('cell', { name: 'Provo' })).toBeHidden();
});
