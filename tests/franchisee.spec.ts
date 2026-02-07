/*

import { test, expect } from 'playwright-test-coverage';

test('login as franchisee', async ({ page }) => {

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'pf' }).click();
    await page.getByText('pizza franchisee').click();
});

test('add store as franchisee', async ({ page }) => {

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await page.getByRole('button', { name: 'Create store' }).click();
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('newStoreTest');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('link', { name: 'franchise-dashboard' }).click();
    await page.getByRole('cell', { name: 'newStoreTest' }).click();
});

test('remove store as franchisee', async ({ page }) => {

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await page.getByRole('link', { name: 'franchise-dashboard' }).click();
    await page.getByRole('cell', { name: 'newStoreTest' }).click();
    await page.getByRole('row', { name: 'newStoreTest 0 ₿ Close' }).getByRole('button').click();
    await page.getByText('Sorry to see you go').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('link', { name: 'franchise-dashboard' }).click();
});

*/