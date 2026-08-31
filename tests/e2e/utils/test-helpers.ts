import { Page, expect } from '@playwright/test';

/**
 * Wait for API response matching a pattern
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Common test selectors
 */
export const selectors = {
  // Navigation
  dashboardLink: 'a:has-text("Dashboard")',
  mentorsLink: 'a:has-text("Find Mentor")',
  sessionsLink: 'a:has-text("Sessions")',
  walletLink: 'a:has-text("Wallet")',
  
  // Dashboard widgets
  calendarWidget: '[data-testid="calendar-widget"]',
  walletWidget: '[data-testid="wallet-widget"]',
  progressWidget: '[data-testid="progress-widget"]',
  achievementsWidget: '[data-testid="achievements-widget"]',
  engagementWidget: '[data-testid="engagement-widget"]',
  
  // Buttons
  addSkillBtn: 'button:has-text("Add Skill")',
  bookMentorBtn: 'button:has-text("Book Mentor")',
  loginBtn: 'button:has-text("Sign In")',
  logoutBtn: 'button:has-text("Sign Out")',
  
  // Forms
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  skillInput: 'input[placeholder*="skill"]',
};

/**
 * Wait for element and click
 */
export async function clickElement(page: Page, selector: string) {
  await page.locator(selector).click();
}

/**
 * Fill form field
 */
export async function fillField(page: Page, selector: string, value: string) {
  const field = page.locator(selector);
  await field.fill(value);
}

/**
 * Get element text
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
  return page.locator(selector).textContent() as Promise<string>;
}

/**
 * Check element visibility
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).isVisible().catch(() => false);
}

/**
 * Wait for element to be visible
 */
export async function waitForElement(page: Page, selector: string, timeout = 10000) {
  await page.locator(selector).waitFor({ state: 'visible', timeout });
}

/**
 * Assert element contains text
 */
export async function assertElementContains(
  page: Page,
  selector: string,
  text: string
) {
  await expect(page.locator(selector)).toContainText(text);
}

/**
 * Take screenshot for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `./test-results/${name}.png` });
}
