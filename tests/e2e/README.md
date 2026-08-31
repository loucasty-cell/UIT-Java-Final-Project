# E2E Testing Guide

## Overview

This directory contains end-to-end (E2E) tests for SkillBridge using Playwright. These tests validate complete user workflows across authentication, dashboard, sessions, wallet, and skills management.

**Configuration:** `playwright.config.ts` (root)
**Tests:** Frontend at http://localhost:3000, Backend at http://localhost:9095

## Running Tests

### Prerequisites
- Node.js 18+ installed
- Dependencies: `npm install`
- Playwright browsers: `npm run playwright:install`

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# UI mode (interactive, recommended)
npm run test:e2e:ui

# Headed mode (visible browser)
npm run test:e2e:headed

# Debug mode (with debugger)
npm run test:e2e:debug

# Specific test file
npx playwright test tests/e2e/dashboard.spec.ts

# Specific test by name
npx playwright test -g "Dashboard loads successfully"
```

## Test Files

| File | Purpose |
|------|---------|
| `auth.spec.ts` | Login, Register, Logout, Protected routes |
| `dashboard.spec.ts` | Dashboard widgets, loading, responsiveness |
| `sessions.spec.ts` | Session booking, viewing, joining |
| `wallet.spec.ts` | Points balance, transactions |
| `skills.spec.ts` | Adding/removing skills, portfolio |

## Writing Tests

### Basic Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Click")').click();
    await expect(page).toHaveURL('/expected');
  });
});
```

### Best Practices
1. Use specific selectors (data-testid preferred)
2. Wait for elements properly (avoid hardcoded timeouts)
3. Test user workflows, not implementation
4. Keep tests independent and isolated
5. Use helper functions from `utils/test-helpers.ts`

## Test Data

Test users in `fixtures/auth.fixture.ts`:
- Email: test@example.com
- Password: TestPassword123!

## CI/CD

Tests run on GitHub Actions for:
- Pull requests to main/develop
- Pushes to main/develop
- Manual workflow dispatch

Artifacts uploaded: playwright-report, test-results

## Debugging

1. **UI Mode:** `npm run test:e2e:ui` - step through tests
2. **Debug Mode:** `npm run test:e2e:debug` - set breakpoints
3. **Screenshots:** Auto-captured on failure in CI
4. **Logs:** Check console output and network tab

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Verify frontend (3000) and backend (9095) running |
| Element not found | Check selector, use UI mode to inspect |
| Flaky tests | Use proper waits, avoid setTimeout |
| Auth failed | Check test credentials, session expiry |

## Resources

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/locators)
