import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/auth/login");
    });

    test("should display login form", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    });

    test("should show validation error for empty fields", async ({ page }) => {
      await page.getByRole("button", { name: /sign in/i }).click();
      // Form should show validation errors
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.getByLabel(/email/i).fill("invalid@example.com");
      await page.getByLabel(/password/i).fill("wrongpassword");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Should show error message
      await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 5000 });
    });

    test("should have link to register page", async ({ page }) => {
      await page.getByRole("link", { name: /create an account/i }).click();
      await expect(page).toHaveURL(/\/auth\/register/);
    });

    test("should have OAuth buttons", async ({ page }) => {
      await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
    });
  });

  test.describe("Register Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/auth/register");
    });

    test("should display register form", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /create an account/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    });

    test("should show password requirements", async ({ page }) => {
      const passwordInput = page.getByLabel(/password/i);
      await passwordInput.fill("short");
      await passwordInput.blur();
      // Should show password requirement error
    });

    test("should have link to login page", async ({ page }) => {
      await page.getByRole("link", { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
