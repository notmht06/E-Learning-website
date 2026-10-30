import { test, expect } from '@playwright/test';

test.describe('Navbar Locale Retention Comprehensive Suite', () => {
  test('Navbar links and Mega Menu items in /en preserve /en', async ({ page }) => {
    await page.goto('/en');

    const isMobile = (page.viewportSize()?.width || 1440) < 1280;

    // 1. Check Brand Logo
    const logo = page.locator('header a[href="/en"]').first();
    expect(await logo.getAttribute('href')).toBe('/en');

    if (!isMobile) {
      // 2. Check Desktop Nav Links
      const homeLink = page.locator('header nav a:has-text("Home")');
      expect(await homeLink.getAttribute('href')).toBe('/en');

      const roadmapLink = page.locator('header nav a:has-text("Roadmap")');
      expect(await roadmapLink.getAttribute('href')).toBe('/en/roadmap');

      const booksLink = page.locator('header nav a:has-text("Monographs"), header nav a:has-text("Books")');
      expect(await booksLink.getAttribute('href')).toBe('/en/books');

      const articlesLink = page.locator('header nav a:has-text("Articles")');
      expect(await articlesLink.getAttribute('href')).toBe('/en/articles');

      // 3. Courses link in navbar
      const coursesLink = page.locator('header nav a:has-text("Courses")');
      expect(await coursesLink.getAttribute('href')).toBe('/en/courses');

      // Hover to open mega menu
      await coursesLink.hover();

      // Check "View All" link in mega menu
      const viewAllLink = page.locator('a:has-text("View Full Archive")');
      await expect(viewAllLink).toBeVisible();
      expect(await viewAllLink.getAttribute('href')).toBe('/en/courses');

      // Check category links in mega menu
      const categoryLinks = page.locator('a[href*="/courses?subject="]');
      const count = await categoryLinks.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const href = await categoryLinks.nth(i).getAttribute('href');
        expect(href).toMatch(/^\/en\/courses\?subject=/);
      }

      // Check featured course in mega menu
      const featuredLink = page.locator('a[href*="course-falsafe-asfar-1"]').first();
      expect(await featuredLink.getAttribute('href')).toBe('/en/courses/course-falsafe-asfar-1');

      // 4. Click a category link and verify browser navigates to /en/courses?subject=...
      await categoryLinks.first().click();
      await page.waitForURL(/.*courses\?subject=.*/);
      console.log('Navigated URL after clicking mega-menu category in /en:', page.url());
      expect(page.url()).toContain('/en/courses?subject=');
    } else {
      // Mobile Drawer Verification
      const menuBtn = page.locator('header button[aria-controls="mobile-nav-drawer"]');
      await menuBtn.click();
      await page.waitForSelector('#mobile-nav-drawer');

      const drawer = page.locator('#mobile-nav-drawer');
      const mobileHome = drawer.locator('a[href="/en"]').first();
      expect(await mobileHome.getAttribute('href')).toBe('/en');

      const mobileCourses = drawer.locator('a[href="/en/courses"]').first();
      expect(await mobileCourses.getAttribute('href')).toBe('/en/courses');

      const mobileRoadmap = drawer.locator('a[href="/en/roadmap"]').first();
      expect(await mobileRoadmap.getAttribute('href')).toBe('/en/roadmap');

      const mobileBooks = drawer.locator('a[href="/en/books"]').first();
      expect(await mobileBooks.getAttribute('href')).toBe('/en/books');

      const mobileArticles = drawer.locator('a[href="/en/articles"]').first();
      expect(await mobileArticles.getAttribute('href')).toBe('/en/articles');

      // Click mobile courses link
      await mobileCourses.click();
      await page.waitForURL(/.*\/en\/courses/);
      expect(page.url()).toContain('/en/courses');
    }
  });

  test('Navbar links and Mega Menu items in /ar preserve /ar', async ({ page }) => {
    await page.goto('/ar');

    const isMobile = (page.viewportSize()?.width || 1440) < 1280;

    // 1. Check Brand Logo
    const logo = page.locator('header a[href="/ar"]').first();
    expect(await logo.getAttribute('href')).toBe('/ar');

    if (!isMobile) {
      // 2. Check Nav Links in AR
      const roadmapLink = page.locator('header nav a[href*="roadmap"]');
      expect(await roadmapLink.getAttribute('href')).toBe('/ar/roadmap');

      const booksLink = page.locator('header nav a[href*="books"]');
      expect(await booksLink.getAttribute('href')).toBe('/ar/books');

      const articlesLink = page.locator('header nav a:has-text("المقالات"), header nav a[href*="articles"]');
      expect(await articlesLink.getAttribute('href')).toBe('/ar/articles');

      // Courses Link in AR
      const coursesLink = page.locator('header nav a:has-text("الدورات")');
      expect(await coursesLink.getAttribute('href')).toBe('/ar/courses');

      // Hover to open mega menu
      await coursesLink.hover();

      // Category links in AR
      const categoryLinks = page.locator('a[href*="/courses?subject="]');
      const count = await categoryLinks.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const href = await categoryLinks.nth(i).getAttribute('href');
        expect(href).toMatch(/^\/ar\/courses\?subject=/);
      }

      // Click category link in AR
      await categoryLinks.first().click();
      await page.waitForURL(/.*courses\?subject=.*/);
      console.log('Navigated URL after clicking mega-menu category in /ar:', page.url());
      expect(page.url()).toContain('/ar/courses?subject=');
    } else {
      // Mobile Drawer Verification in AR
      const menuBtn = page.locator('header button[aria-controls="mobile-nav-drawer"]');
      await menuBtn.click();
      await page.waitForSelector('#mobile-nav-drawer');

      const drawer = page.locator('#mobile-nav-drawer');
      const mobileHome = drawer.locator('a[href="/ar"]').first();
      expect(await mobileHome.getAttribute('href')).toBe('/ar');

      const mobileCourses = drawer.locator('a[href="/ar/courses"]').first();
      expect(await mobileCourses.getAttribute('href')).toBe('/ar/courses');

      const mobileRoadmap = drawer.locator('a[href="/ar/roadmap"]').first();
      expect(await mobileRoadmap.getAttribute('href')).toBe('/ar/roadmap');

      const mobileBooks = drawer.locator('a[href="/ar/books"]').first();
      expect(await mobileBooks.getAttribute('href')).toBe('/ar/books');

      const mobileArticles = drawer.locator('a[href="/ar/articles"]').first();
      expect(await mobileArticles.getAttribute('href')).toBe('/ar/articles');

      // Click mobile courses link in AR
      await mobileCourses.click();
      await page.waitForURL(/.*\/ar\/courses/);
      expect(page.url()).toContain('/ar/courses');
    }
  });
});
