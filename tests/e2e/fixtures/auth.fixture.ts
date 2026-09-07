import { test as base } from "@playwright/test";

/**
 * Test user credentials for E2E testing
 */
export const TEST_USER = {
  email: "test@example.com",
  password: "TestPassword123!",
  firstName: "Test",
  lastName: "User",
  displayName: "Test User",
};

export const TEST_USER_2 = {
  email: "mentor@example.com",
  password: "MentorPassword123!",
  firstName: "Mentor",
  lastName: "User",
  displayName: "Mentor User",
};

/**
 * Extended test fixture with authenticated user
 */
export const test = base.extend({
  authenticatedPage: async ({ page }, providePage) => {
    // Navigate to login page
    await page.goto("/");

    // Check if already logged in (look for dashboard)
    const isDashboard = await page
      .locator('[data-testid="dashboard-container"]')
      .isVisible()
      .catch(() => false);

    if (!isDashboard) {
      // Perform login
      await page.goto("/login");
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button:has-text("Sign In")');

      // Wait for redirect to dashboard
      await page.waitForURL("/", { timeout: 10000 });
    }

    await providePage(page);
  },
});

export { expect } from "@playwright/test";
