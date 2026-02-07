import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';

async function setupDinerDashboardMocks(
  page: Page,
  options: {
    user: User;
    orders: Array<{ id: string; items: Array<{ price: number }>; date: string | Date }>;
    includeMenuRoutes?: boolean;
    setAuthToken?: boolean;
  }
) {
  const { user, orders, includeMenuRoutes, setAuthToken = true } = options;

  if (setAuthToken) {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'test-token');
    });
  }

  await page.route('**/api/user/me', async (route) => {
    await route.fulfill({ json: user });
  });

  await page.route('**/api/order', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
      return;
    }
    await route.fulfill({ json: { id: 'history-1', dinerId: user.id, orders } });
  });

  if (includeMenuRoutes) {
    await page.route('**/api/order/menu', async (route) => {
      await route.fulfill({
        json: [
          {
            id: '1',
            title: 'Veggie',
            image: 'pizza1.png',
            price: 0.003,
            description: 'A garden of delight',
          },
        ],
      });
    });

    await page.route(/\/api\/franchise\?.*$/, async (route) => {
      await route.fulfill({
        json: {
          franchises: [
            {
              id: '2',
              name: 'topSpot',
              stores: [{ id: '10', name: 'Provo' }],
            },
          ],
          more: false,
        },
      });
    });
  }

  await page.goto('/diner-dashboard');
}

function setupDeliveryState(page: Page, order: { id: string; items: Array<{ price: number }>; date?: string }, jwt: string) {
  return page.addInitScript(
    ({ orderState, jwtState }) => {
      history.replaceState({ order: orderState, jwt: jwtState }, '', '/delivery');
    },
    { orderState: order, jwtState: jwt }
  );
}

test('shows user info and role formatting', async ({ page }) => {
  await setupDinerDashboardMocks(page, {
    user: {
      id: '3',
      name: 'Kai Chen',
      email: 'd@jwt.com',
      roles: [{ role: Role.Diner }, { role: Role.Franchisee, objectId: '7' }],
    },
    orders: [],
  });

  await expect(page.getByText('Kai Chen')).toBeVisible();
  await expect(page.getByText('d@jwt.com')).toBeVisible();
  await expect(page.getByText('Franchisee on 7')).toBeVisible();
});

test('shows empty state and buy link', async ({ page }) => {
  await setupDinerDashboardMocks(page, {
    user: {
      id: '3',
      name: 'Kai Chen',
      email: 'd@jwt.com',
      roles: [{ role: Role.Diner }],
    },
    orders: [],
    includeMenuRoutes: true,
  });

  await expect(page.getByText('How have you lived this long without having a pizza?')).toBeVisible();
  await page.getByRole('link', { name: 'Buy one' }).click();
  await expect(page.getByRole('heading', { name: 'Awesome is a click away' })).toBeVisible();
});

test('shows order history table with totals', async ({ page }) => {
  await setupDinerDashboardMocks(page, {
    user: {
      id: '3',
      name: 'Kai Chen',
      email: 'd@jwt.com',
      roles: [{ role: Role.Diner }],
    },
    orders: [
      {
        id: 'order-1',
        items: [{ price: 0.003 }, { price: 0.003 }],
        date: new Date('2024-01-02T03:04:05Z'),
      },
    ],
  });

  await expect(page.getByText('Here is your history of all the good times.')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'order-1' })).toBeVisible();
  await expect(page.getByRole('row', { name: /order-1/ })).toContainText('0.006');
});

test('delivery verify shows valid payload', async ({ page }) => {
  await setupDeliveryState(
    page,
    { id: '23', items: [{ price: 0.003 }, { price: 0.003 }], date: '2024-01-02T03:04:05Z' },
    'eyJpYXQ'
  );

  await page.route('**/api/order/verify', async (route) => {
    await route.fulfill({ json: { message: 'valid', payload: { sub: 'order', id: '23' } } });
  });

  await page.goto('/delivery');

  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.getByText('JWT Pizza - valid')).toBeVisible();
});
