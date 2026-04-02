import { test } from "@playwright/test";
import { Page } from "@playwright/test";
import { expectNoA11yViolations } from "./a11y-helpers";
import { Role } from "../src/service/pizzaService";

async function setupOrderMocks(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("token", "test-token");
  });

  await page.route("**/api/user/me", async (route) => {
    await route.fulfill({
      json: {
        id: "3",
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    });
  });

  await page.route("**/api/order/menu", async (route) => {
    await route.fulfill({
      json: [
        {
          id: 1,
          title: "Veggie",
          image: "pizza1.png",
          price: 0.0038,
          description: "A garden of delight",
        },
        {
          id: 2,
          title: "Pepperoni",
          image: "pizza2.png",
          price: 0.0042,
          description: "Spicy treat",
        },
      ],
    });
  });

  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    await route.fulfill({
      json: {
        franchises: [
          { id: 2, name: "LotaPizza", stores: [{ id: 4, name: "Lehi" }] },
        ],
        more: false,
      },
    });
  });

  await page.route("**/api/order", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { dinerId: "3", orders: [], page: 1 } });
    } else {
      await route.fulfill({ json: { order: { id: 23 }, jwt: "eyJpYXQ" } });
    }
  });
}

test("menu page has no WCAG AA violations", async ({ page }) => {
  await setupOrderMocks(page);
  await page.goto("/menu");
  await expectNoA11yViolations(page, test.info(), "menu");
});

test("diner dashboard has no WCAG AA violations", async ({ page }) => {
  await setupOrderMocks(page);
  await page.goto("/diner-dashboard");
  await expectNoA11yViolations(page, test.info(), "diner-dashboard");
});

test("delivery page has no WCAG AA violations", async ({ page }) => {
  await page.addInitScript(() => {
    history.replaceState(
      {
        order: { id: "23", items: [{ price: 0.003 }], date: "2024-01-02" },
        jwt: "eyJpYXQ",
      },
      "",
      "/delivery",
    );
  });
  await page.route("**/api/order/verify", async (route) => {
    await route.fulfill({
      json: { message: "valid", payload: { sub: "order", id: "23" } },
    });
  });
  await page.route("**/api/**", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });
  await page.goto("/delivery");
  await expectNoA11yViolations(page, test.info(), "delivery");
});
