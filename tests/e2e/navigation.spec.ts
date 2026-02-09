import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to home from logo", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("link", { name: /promptopia/i }).first().click();
    await expect(page).toHaveURL("/");
  });

  test("should show 404 page for invalid routes", async ({ page }) => {
    await page.goto("/invalid-route-12345");
    await expect(page.getByText(/404/)).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test("should have working go home button on 404", async ({ page }) => {
    await page.goto("/invalid-route");
    await page.getByRole("link", { name: /go home/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("should redirect to login when accessing protected routes", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should redirect to login when creating prompt without auth", async ({ page }) => {
    await page.goto("/prompts/new");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should redirect to login when accessing settings without auth", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should show mobile search button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /search/i })).toBeVisible();
  });

  test("should show mobile filter button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /filters/i })).toBeVisible();
  });

  test("should open filter sheet on mobile", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /filters/i }).click();
    await expect(page.getByText(/categories/i)).toBeVisible();
  });
});
