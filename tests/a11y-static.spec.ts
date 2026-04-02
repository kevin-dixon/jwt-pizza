import { test } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("token");
  });
  await page.route("**/api/**", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });
});

test("WCAG AA scan: home", async ({ page }) => {
  await page.goto("/");
  await expectNoA11yViolations(page, test.info(), "home");
});

test("WCAG AA scan: about", async ({ page }) => {
  await page.goto("/about");
  await expectNoA11yViolations(page, test.info(), "about");
});

test("WCAG AA scan: history", async ({ page }) => {
  await page.goto("/history");
  await expectNoA11yViolations(page, test.info(), "history");
});

test("WCAG AA scan: not-found", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expectNoA11yViolations(page, test.info(), "not-found");
});
