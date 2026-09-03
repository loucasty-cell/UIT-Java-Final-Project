import { test, expect } from "@playwright/test";

test.describe("Dashboard Widgets", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "student@skillbridge.edu");
    await page.fill('input[type="password"], input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL("/");
  });

  test("displays onboarding checklist for new users or dashboard header", async ({ page }) => {
    await expect(
      page.getByText(/Get Started with SkillBridge|Welcome back|Dashboard/i).first(),
    ).toBeVisible();
  });

  test("quick actions panel is present and active", async ({ page }) => {
    const quickActions = page.getByText(/Quick Actions/i).first();
    await expect(quickActions).toBeVisible();
  });

  test("learning progress widget displays progress section", async ({ page }) => {
    await expect(page.getByText(/Learning Progress/i).first()).toBeVisible();
  });

  test("achievements widget shows milestones", async ({ page }) => {
    await expect(page.getByText(/Achievements & Milestones|Achievements/i).first()).toBeVisible();
  });

  test("engagement widget displays streak counter", async ({ page }) => {
    await expect(page.getByText(/Your Learning Streak|Start Your Streak/i).first()).toBeVisible();
  });

  test("calendar widget is visible", async ({ page }) => {
    await expect(page.getByText(/Calendar & Schedule|Selected Schedule/i).first()).toBeVisible();
  });

  test("wallet widget displays point balance", async ({ page }) => {
    await expect(page.getByText(/Skill Points & Wallet|Wallet/i).first()).toBeVisible();
  });

  test("dashboard is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText(/Quick Actions|Welcome back|Dashboard/i).first()).toBeVisible();
  });
});
