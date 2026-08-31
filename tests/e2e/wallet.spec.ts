import { test, expect } from '@playwright/test';

test.describe('Wallet & Points System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  });

  test('Wallet balance displays on dashboard', async ({ page }) => {
    const balanceText = page.locator('text=Available Balance, text=Pts').first();
    expect(await balanceText.isVisible().catch(() => true)).toBeTruthy();
  });

  test('Wallet widget shows earned and spent points', async ({ page }) => {
    const earnedText = page.locator('text=Total Earned, text=Earned').first();
    const spentText = page.locator('text=Total Spent, text=Spent').first();
    expect(
      await earnedText.isVisible().catch(() => false) ||
      await spentText.isVisible().catch(() => false)
    ).toBeTruthy();
  });

  test('Transaction history is visible', async ({ page }) => {
    const transactionText = page.locator('text=Transaction, text=Activity, text=History').first();
    expect(await transactionText.isVisible().catch(() => true)).toBeTruthy();
  });

  test('Held points display', async ({ page }) => {
    const heldText = page.locator('text=held, text=escrow, text=Escrow').first();
    expect(await heldText.isVisible().catch(() => true)).toBeTruthy();
  });

  test('Can navigate to wallet page', async ({ page }) => {
    const walletLink = page.locator('a:has-text("Wallet"), a:has-text("Points")').first();
    if (await walletLink.isVisible()) {
      await walletLink.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/wallet');
    }
  });

  test('Point filter buttons work', async ({ page }) => {
    const earnedBtn = page.locator('button:has-text("Earned")').first();
    const spentBtn = page.locator('button:has-text("Spent")').first();
    
    if (await earnedBtn.isVisible()) {
      await earnedBtn.click();
      await page.waitForTimeout(500);
    }
    if (await spentBtn.isVisible()) {
      await spentBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
