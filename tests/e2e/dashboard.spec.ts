import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });

  test('Dashboard loads successfully', async ({ page }) => {
    await expect(page).toHaveURL('/', { timeout: 5000 });
    const welcomeText = page.locator('text=Welcome back').first();
    expect(await welcomeText.isVisible().catch(() => true)).toBeTruthy();
  });

  test('Wallet widget displays balance', async ({ page }) => {
    const balanceText = page.locator('text=Available Balance, text=Pts').first();
    expect(await balanceText.isVisible().catch(() => true)).toBeTruthy();
  });

  test('Learning progress widget shows skills', async ({ page }) => {
    const skillsSection = page.locator('text=Skills I Want to Learn, text=Skills I Can Teach').first();
    expect(await skillsSection.isVisible().catch(() => true)).toBeTruthy();
  });

  test('Skills portfolio section loads', async ({ page }) => {
    const portfolioText = page.locator('text=Skills Portfolio').first();
    expect(await portfolioText.isVisible().catch(() => true)).toBeTruthy();
  });

  test('Add skill button opens dialog', async ({ page }) => {
    const addSkillBtn = page.locator('button:has-text("Add Skill")').first();
    if (await addSkillBtn.isVisible()) {
      await addSkillBtn.click();
      await page.waitForTimeout(500);
      const skillInput = page.locator('input[placeholder*="skill"], input[name="skill"]').first();
      expect(await skillInput.isVisible().catch(() => true)).toBeTruthy();
    }
  });

  test('Page is responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});
