/*
import { test, expect } from 'playwright-test-coverage';

test('login as admin', async ({ page }) => {
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('link', { name: 'admin-dashboard' }).click();
});

test('add a new franchise', async ({ page }) => {
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('newFranchiseName');
    await page.getByRole('textbox', { name: 'franchise name' }).press('Tab');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('a@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();
    await page.getByRole('textbox', { name: 'Filter franchises' }).click();
    await page.getByRole('textbox', { name: 'Filter franchises' }).fill('newFranchise');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('cell', { name: 'newFranchiseName' }).click();
});

test('remove a franchise', async ({ page }) => {
    //remove a franchise
    await page.getByRole('link', { name: 'Admin', exact: true }).click();
    await page.getByRole('link', { name: 'admin-dashboard' }).click();
    await page.getByRole('textbox', { name: 'Filter franchises' }).click();
    await page.getByRole('textbox', { name: 'Filter franchises' }).press('ArrowRight');
    await page.getByRole('textbox', { name: 'Filter franchises' }).fill('newFranchiseName');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByRole('cell', { name: 'newFranchiseName', exact: true }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByText('Sorry to see you go').click();
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('textbox', { name: 'Filter franchises' }).click();
    await page.getByRole('textbox', { name: 'Filter franchises' }).fill('newFranchiseName');
    await page.getByRole('button', { name: 'Submit' }).click();
});

*/