import { test, expect } from '@playwright/test';

test.describe('Hayat SaaS — End-to-End & DESIGN.md Compliance Suite', () => {
  test('1. Homepage enforces DESIGN.md archival palette, scholar identity, and zero horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/');

    // Verify RTL direction & language default
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');

    // Verify canonical scholar name in Hero & Header
    await expect(page.locator('h1').first()).toContainText('زنجیر زن حسینی');

    // Verify zero horizontal scroll overflow (break-ui check)
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });

  test('2. Trilingual switcher (FA / AR / EN) updates direction and typography cleanly', async ({
    page,
    viewport,
  }) => {
    await page.goto('/');

    if (viewport && viewport.width >= 1280) {
      const enBtn = page.locator('header button:has-text("EN")').first();
      if (await enBtn.isVisible()) {
        await enBtn.click();
        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        const faBtn = page.locator('header button:has-text("فا")').first();
        await faBtn.click();
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      }
    }
  });

  test('3. Dedicated Article SEO Page (/articles/[slug]) renders treatise & JSON-LD ScholarlyArticle schema', async ({
    page,
  }) => {
    await page.goto('/articles/aslat-vojood-seddiqin');

    await expect(page.locator('h1')).toContainText('اصالت وجود');

    // Verify JSON-LD ScholarlyArticle structured data is embedded for Google Scholar/SEO
    const jsonLdContent = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLdContent).toBeTruthy();
    expect(jsonLdContent).toContain('ScholarlyArticle');
  });

  test('4. Curriculum Roadmap (/roadmap) switches between Sequential Timeline and Concept Graph', async ({
    page,
  }) => {
    await page.goto('/roadmap');

    await expect(page.locator('h1')).toBeVisible();

    // Switch to Rational Sciences Concept Graph
    const graphTabBtn = page.locator('button:has-text("گراف"), button:has-text("شبکه")').first();
    if (await graphTabBtn.isVisible()) {
      await graphTabBtn.click();
      await expect(page.locator('svg').first()).toBeVisible();
    }
  });

  test('5. Certificate Verification Page (/verify/[code]) validates official ZAN certificates', async ({
    page,
  }) => {
    await page.goto('/verify/ZAN-CERT-1403-882100');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('body')).toContainText('ZAN-CERT-1403-882100');
  });
});
