import { test, expect } from '@playwright/test';

test.describe('Admin & Dashboard Panels Locale Retention', () => {
  test('Visiting /en/admin and /ar/admin retains locale and renders in proper language/direction', async ({ page }) => {
    // 1. Visit /en/admin
    await page.goto('/en/admin');
    console.log('Current URL on /en/admin:', page.url());
    expect(page.url()).toContain('/en/admin');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    // 2. Visit /ar/admin
    await page.goto('/ar/admin');
    console.log('Current URL on /ar/admin:', page.url());
    expect(page.url()).toContain('/ar/admin');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('Visiting /en/dashboard and /ar/dashboard retains locale and renders in proper language/direction', async ({ page }) => {
    // 1. Visit /en/dashboard
    await page.goto('/en/dashboard');
    console.log('Current URL on /en/dashboard:', page.url());
    expect(page.url()).toContain('/en/dashboard');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    // 2. Visit /ar/dashboard
    await page.goto('/ar/dashboard');
    console.log('Current URL on /ar/dashboard:', page.url());
    expect(page.url()).toContain('/ar/dashboard');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
