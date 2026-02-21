import { test, expect } from "playwright-test-coverage";
import { Page } from "@playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function setupUserMocks(page: Page) {
  let loggedInUser: User | null = null;
  const calls = { register: 0, login: 0, updateUser: 0 };
  const usersByEmail: Record<string, User> = {};

  await page.route("**/api/auth", async (route) => {
    const method = route.request().method();
    const body = route.request().postDataJSON();

    if (method === "POST") {
      calls.register += 1;
      const newUser: User = {
        id: "101",
        name: body.name,
        email: body.email,
        password: body.password,
        roles: [{ role: Role.Diner }],
      };
      usersByEmail[newUser.email ?? ""] = newUser;
      loggedInUser = newUser;
      await route.fulfill({
        status: 200,
        json: { user: newUser, token: "register-token" },
      });
      return;
    }

    if (method === "PUT") {
      calls.login += 1;
      const user = usersByEmail[body.email];
      if (!user || user.password !== body.password) {
        await route.fulfill({ status: 401, json: { message: "unauthorized" } });
        return;
      }
      loggedInUser = user;
      await route.fulfill({
        status: 200,
        json: { user, token: "login-token" },
      });
      return;
    }

    if (method === "DELETE") {
      loggedInUser = null;
      await route.fulfill({
        status: 200,
        json: { message: "logout successful" },
      });
      return;
    }

    await route.fulfill({
      status: 405,
      json: { message: "method not allowed" },
    });
  });

  await page.route("**/api/user/me", async (route) => {
    await route.fulfill({ status: 200, json: loggedInUser });
  });

  await page.route("**/api/user/101", async (route) => {
    if (route.request().method() !== "PUT") {
      await route.fulfill({
        status: 405,
        json: { message: "method not allowed" },
      });
      return;
    }

    calls.updateUser += 1;
    const body = route.request().postDataJSON();
    const existing = loggedInUser ?? usersByEmail[body.email];
    const nextEmail = body.email || existing?.email;
    const nextPassword = body.password || existing?.password;
    const updatedUser: User = {
      id: body.id || existing?.id,
      name: body.name || existing?.name,
      email: nextEmail,
      password: nextPassword,
      roles: existing?.roles ?? [{ role: Role.Diner }],
    };

    if (existing?.email && existing.email !== nextEmail) {
      delete usersByEmail[existing.email];
    }
    usersByEmail[nextEmail ?? ""] = updatedUser;
    loggedInUser = updatedUser;

    await route.fulfill({
      status: 200,
      json: { user: updatedUser, token: "updated-token" },
    });
  });

  await page.route("**/api/order*", async (route) => {
    await route.fulfill({
      status: 200,
      json: { dinerId: loggedInUser?.id ?? "101", orders: [], page: 1 },
    });
  });

  return calls;
}

test("updateUser", async ({ page }) => {
  test.setTimeout(15000);
  const calls = await setupUserMocks(page);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("pizza diner");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Register" }).click();
  await expect.poll(() => calls.register).toBe(1);

  await page.goto("/diner-dashboard");
  await expect(page.getByRole("main")).toContainText("pizza diner");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  await page.getByRole("textbox").first().fill("pizza dinerx");
  await page.getByRole("button", { name: "Update" }).click();

  await expect.poll(() => calls.updateUser).toBe(1);
  await expect(page.getByRole("main")).toContainText("pizza dinerx");

  await page.getByRole("link", { name: "Logout" }).click();
  await page.waitForURL("/");
  await page.goto("/login");

  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("textbox", { name: "Password" }).press("Enter");

  await expect.poll(() => calls.login).toBe(1);
  await page.goto("/diner-dashboard");
  await expect(page.getByRole("main")).toContainText("pizza dinerx");
});
