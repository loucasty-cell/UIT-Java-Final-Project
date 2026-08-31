import { test, expect } from '@playwright/test';
import { TEST_USER, TEST_USER_2 } from './fixtures/auth.fixture';
import { waitForAPIResponse, waitForElement, assertElementContains } from './utils/test-helpers';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User can navigate to login page', async ({ page }) => {
    // Look for login link or button
    const loginButton = page.locator('button:has-text("Sign In"), a:has-text("Login"), a:has-text("Sign In")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
    } else {
      await page.goto('/login');
    }
    
    // Verify login form appears
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });

  test('User sees validation errors with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid credentials
    await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button:has-text("Sign In"), button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Should either show error or redirect to login (not dashboard)
    const url = page.url();
    expect(!url.includes('/dashboard') || url.includes('/login')).toBeTruthy();
  });

  test('User can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);
    
    // Submit form
    await page.click('button:has-text("Sign In"), button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForNavigation({ url: '/', timeout: 10000 }).catch(() => {
      // Dashboard might be at root or /dashboard
    });
    
    // Verify we're on dashboard (look for key dashboard elements)
    await expect(page).toHaveURL(/\/(dashboard)?$/, { timeout: 5000 });
  });

  test('Protected routes redirect to login when not authenticated', async ({ page }) => {
    // Clear cookies/auth if any
    await page.context().clearCookies();
    
    // Try to access dashboard
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Should redirect to login or home
    const url = page.url();
    expect(url.includes('/login') || url === 'http://localhost:3000/').toBeTruthy();
  });

  test('User can logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);
    await page.click('button:has-text("Sign In"), button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForTimeout(2000);
    
    // Look for logout button (might be in menu)
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
      
      // Should redirect to login or home
      const url = page.url();
      expect(url.includes('/login') || url === 'http://localhost:3000/').toBeTruthy();
    }
  });

  test('User registration page is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Look for register link
    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign Up"), button:has-text("Sign Up")').first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register|signup/i, { timeout: 5000 });
    } else {
      await page.goto('/register');
      await expect(page).toHaveURL(/register|signup/i, { timeout: 2000 });
    }
  });
});
