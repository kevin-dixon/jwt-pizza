import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';

async function setupAuthMocks(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
  };

  await page.route('**/api/auth', async (route) => {
    const method = route.request().method();
    const body = route.request().postDataJSON();

    if (method === 'PUT') {
      const user = validUsers[body.email];
      if (!user || user.password !== body.password) {
        await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
        return;
      }
      loggedInUser = user;
      await route.fulfill({ json: { user, token: 'abcdef' } });
      return;
    }

    if (method === 'POST') {
      const newUser: User = {
        id: '99',
        name: body.name,
        email: body.email,
        password: body.password,
        roles: [{ role: Role.Diner }],
      };
      validUsers[newUser.email ?? ''] = newUser;
      loggedInUser = newUser;
      await route.fulfill({ json: { user: newUser, token: 'abcdef' } });
      return;
    }

    await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
  });

  await page.route('**/api/user/me', async (route) => {
    await route.fulfill({ json: loggedInUser ?? null });
  });

  await page.goto('/');
}

test('register (mocked)', async ({ page }) => {
  await setupAuthMocks(page);

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Example User');
  await page.getByRole('textbox', { name: 'Email address' }).fill('example@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('testpassword');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('link', { name: 'EU' })).toBeVisible();
});

test('login (mocked)', async ({ page }) => {
  await setupAuthMocks(page);

  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});
