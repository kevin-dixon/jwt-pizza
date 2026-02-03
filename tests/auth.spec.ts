import { test, expect } from 'playwright-test-coverage';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5174/');await page.goto('http://localhost:5174/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('exampleuser');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('example@email.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('testpassword');
  await page.getByRole('button', { name: 'Register' }).click();

  //add verification for successful registration
});