import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the header with logo", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("link", { name: /prompthub/i })).toBeVisible();
  });

  test("should display search bar on desktop", async ({ page }) => {
    await expect(page.getByPlaceholder(/search prompts/i)).toBeVisible();
  });

  test("should display trending prompts section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /trending prompts/i })
    ).toBeVisible();
  });

  test("should display filter panel on desktop", async ({ page }) => {
    await expect(page.getByText(/categories/i)).toBeVisible();
    await expect(page.getByText(/ai platforms/i)).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("should filter prompts by category", async ({ page }) => {
    const categoryBadge = page.getByRole("button", { name: /programming/i });
    if (await categoryBadge.isVisible()) {
      await categoryBadge.click();
      await expect(page).toHaveURL(/category=Programming/i);
    }
  });

  test("should search for prompts", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search prompts/i);
    await searchInput.fill("test");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/q=test/);
  });

  test("should toggle theme", async ({ page }) => {
    const themeButton = page.getByRole("button", { name: /toggle theme/i });
    await themeButton.click();
    // Should show theme options or toggle theme
  });
});
