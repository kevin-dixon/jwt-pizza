import { test } from "@playwright/test";
import { Page } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y-helpers";
import { Role } from "../src/service/pizzaService";

async function setupAdminMocks(page: Page) {
  const adminUser = {
    id: "1",
    name: "Admin User",
    email: "a@jwt.com",
    roles: [{ role: Role.Admin }],
  };

  await page.addInitScript(() => {
    localStorage.setItem("token", "admin-token");
  });

  await page.route("**/api/user/me", async (route) => {
    await route.fulfill({ json: adminUser });
  });

  await page.route(/\/api\/franchise\?.*$/, async (route) => {
    await route.fulfill({
      json: {
        franchises: [
          {
            id: "10",
            name: "LotaPizza",
            admins: [{ id: "1", name: "Admin User", email: "a@jwt.com" }],
            stores: [{ id: "101", name: "Lehi", totalRevenue: 100 }],
          },
        ],
        more: false,
      },
    });
  });
}

async function setupFranchiseeMocks(page: Page) {
  const franchiseeUser = {
    id: "4",
    name: "Franchise Owner",
    email: "f@jwt.com",
    roles: [{ role: Role.Franchisee, objectId: "2" }],
  };

  await page.addInitScript(() => {
    localStorage.setItem("token", "franchise-token");
  });

  await page.route("**/api/user/me", async (route) => {
    await route.fulfill({ json: franchiseeUser });
  });

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    await route.fulfill({
      json: [
        {
          id: "2",
          name: "topSpot",
          admins: [{ id: "4", name: "Franchise Owner", email: "f@jwt.com" }],
          stores: [{ id: "201", name: "Provo", totalRevenue: 120 }],
        },
      ],
    });
  });
}

test("WCAG AA scan: admin-dashboard", async ({ page }) => {
  await setupAdminMocks(page);
  await page.goto("/admin-dashboard");
  await expectNoA11yViolations(page, test.info(), "admin-dashboard");
});

test("WCAG AA scan: franchise-dashboard", async ({ page }) => {
  await setupFranchiseeMocks(page);
  await page.goto("/franchise-dashboard");
  await expectNoA11yViolations(page, test.info(), "franchise-dashboard");
});
