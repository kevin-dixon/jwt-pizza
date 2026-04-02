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

test("WCAG AA scan: login", async ({ page }) => {
  await page.goto("/login");
  await expectNoA11yViolations(page, test.info(), "login");
});

test("WCAG AA scan: register", async ({ page }) => {
  await page.goto("/register");
  await expectNoA11yViolations(page, test.info(), "register");
});
