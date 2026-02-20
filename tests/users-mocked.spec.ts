import { test, expect } from "playwright-test-coverage";
import { Page } from "@playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function setupUsersMocks(page: Page) {
  let loggedInUser: User | undefined;
  const adminUser: User = {
    id: "1",
    name: "Admin User",
    email: "a@jwt.com",
    password: "admin",
    roles: [{ role: Role.Admin }],
  };
  let usersPage0 = {
    users: [
      {
        id: "10",
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [{ role: Role.Diner }],
      },
      {
        id: "11",
        name: "Buddy",
        email: "b@jwt.com",
        roles: [{ role: Role.Admin }],
      },
    ],
    more: true,
  };
  const usersPage1 = {
    users: [
      {
        id: "12",
        name: "Lara",
        email: "l@jwt.com",
        roles: [{ role: Role.Diner }],
      },
    ],
    more: false,
  };

  await page.route("**/api/auth", async (route) => {
    const method = route.request().method();
    if (method !== "PUT") {
      await route.fulfill({
        status: 405,
        json: { message: "Method Not Allowed" },
      });
      return;
    }

    const body = route.request().postDataJSON();
    if (
      body.email !== adminUser.email ||
      body.password !== adminUser.password
    ) {
      await route.fulfill({ status: 401, json: { message: "Unauthorized" } });
      return;
    }

    loggedInUser = adminUser;
    await route.fulfill({
      status: 200,
      json: { user: adminUser, token: "admin-token" },
    });
  });

  await page.route("**/api/user/me", async (route) => {
    await route.fulfill({ status: 200, json: loggedInUser ?? null });
  });

  await page.route("**/api/user**", async (route) => {
    if (route.request().method() === "DELETE") {
      const userId = route.request().url().split("/").pop();
      usersPage0 = {
        ...usersPage0,
        users: usersPage0.users.filter((user) => user.id !== userId),
      };
      await route.fulfill({ status: 200, json: { message: "user deleted" } });
      return;
    }

    const url = route.request().url();
    if (url.includes("name=*Kai*")) {
      await route.fulfill({
        status: 200,
        json: { users: [usersPage0.users[0]], more: false },
      });
      return;
    }

    if (url.includes("page=1")) {
      await route.fulfill({ status: 200, json: usersPage1 });
      return;
    }

    await route.fulfill({ status: 200, json: usersPage0 });
  });

  await page.route("**/api/franchise**", async (route) => {
    await route.fulfill({ status: 200, json: { franchises: [], more: false } });
  });
}

async function loginAdmin(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Login", exact: true }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
}

test("list users (mocked)", async ({ page }) => {
  await setupUsersMocks(page);
  await loginAdmin(page);

  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Kai Chen" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Buddy" })).toBeVisible();
});

test("list users pagination and filter (mocked)", async ({ page }) => {
  await setupUsersMocks(page);
  await loginAdmin(page);

  await page.getByRole("link", { name: "Admin" }).click();

  await page.getByRole("button", { name: "»" }).last().click();
  await expect(page.getByRole("cell", { name: "Lara" })).toBeVisible();

  await page.getByPlaceholder("Filter users").fill("Kai");
  await page.getByRole("button", { name: "Submit" }).last().click();
  await expect(page.getByRole("cell", { name: "Kai Chen" })).toBeVisible();
});

test("delete user", async ({ page }) => {
  await setupUsersMocks(page);
  await loginAdmin(page);

  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByRole("cell", { name: "Buddy" })).toBeVisible();

  await page
    .getByRole("row", { name: /Buddy/ })
    .getByRole("button", { name: "Close" })
    .click();
  await expect(page.getByRole("cell", { name: "Buddy" })).toBeHidden();
});
