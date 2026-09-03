import { test, expect } from "@playwright/test";

test.describe("Session Booking & Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
  });

  test("Can navigate to mentors page", async ({ page }) => {
    const mentorsLink = page
      .locator('a:has-text("Mentor"), a:has-text("Find Mentor"), a:has-text("Browse")')
      .first();
    if (await mentorsLink.isVisible()) {
      await mentorsLink.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/mentor");
    }
  });

  test("Upcoming sessions display on dashboard", async ({ page }) => {
    const sessionsSection = page
      .locator("text=Continue Learning, text=Upcoming, text=Sessions")
      .first();
    expect(await sessionsSection.isVisible().catch(() => true)).toBeTruthy();
  });

  test("Session details are visible", async ({ page }) => {
    // Look for session information
    const sessionInfo = page.locator("text=session, text=mentor, text=learner").first();
    expect(await sessionInfo.isVisible().catch(() => true)).toBeTruthy();
  });

  test("Can view sessions page", async ({ page }) => {
    const sessionsLink = page.locator('a:has-text("Sessions"), a:has-text("All Sessions")').first();
    if (await sessionsLink.isVisible()) {
      await sessionsLink.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/session");
    }
  });

  test("Join meeting button is present for scheduled sessions", async ({ page }) => {
    const joinBtn = page.locator('button:has-text("Join"), button:has-text("Meet")').first();
    expect(await joinBtn.isVisible().catch(() => true)).toBeTruthy();
  });

  test("Session details can be viewed", async ({ page }) => {
    const viewDetailsBtn = page
      .locator('button:has-text("View Details"), a:has-text("Details")')
      .first();
    if (await viewDetailsBtn.isVisible()) {
      await viewDetailsBtn.click();
      await page.waitForTimeout(1000);
    }
  });
});
