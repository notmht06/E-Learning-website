import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function runPhase1() {
  console.log('=== [PHASE 1] Public Core, Navigation, Themes, Search & Catalog ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'fa-IR',
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      networkErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  try {
    // 1. Visit Homepage
    console.log('[1.1] Navigating to homepage...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 2. Check Navbar Links
    console.log('[1.2] Testing Navbar links...');
    const logo = await page.$('a[href="/"]');
    if (!logo) throw new Error('Logo link to / not found');

    const coursesLink = await page.$('a[href="/courses"]');
    const articlesLink = await page.$('a[href="/articles"]');
    const roadmapLink = await page.$('a[href="/roadmap"]');
    console.log(`Navbar links found: courses=${Boolean(coursesLink)}, articles=${Boolean(articlesLink)}, roadmap=${Boolean(roadmapLink)}`);

    // 3. Test Theme Toggle
    console.log('[1.3] Testing Theme toggle...');
    const isDarkInitial = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const themeBtn = await page.$('button[aria-label*="تم"], button[aria-label*="theme"], button[title*="تم"], button[title*="theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(500);
      const isDarkAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`Theme toggled: before=${isDarkInitial}, after=${isDarkAfter}`);
      // Toggle back to keep consistency
      await themeBtn.click();
      await page.waitForTimeout(300);
    } else {
      console.log('Theme toggle button selector not found via aria-label, searching button icons...');
      const iconBtn = await page.$('nav button:has(svg.lucide-moon, svg.lucide-sun)');
      if (iconBtn) {
        await iconBtn.click();
        await page.waitForTimeout(500);
        console.log('Theme toggle clicked via icon');
      }
    }

    // 4. Test Cart Drawer Open/Close
    console.log('[1.4] Testing Cart Drawer...');
    const cartBtn = await page.$('button[aria-label="سبد خرید"], button:has(svg.lucide-shopping-bag)');
    if (cartBtn) {
      await cartBtn.click();
      await page.waitForTimeout(1000);
      const isCartVisible = await page.isVisible('div[role="dialog"]');
      console.log(`Cart drawer opened: ${isCartVisible}`);
      // Close cart by clicking the close button inside the dialog
      const dialogCloseBtn = await page.$('div[role="dialog"] button[aria-label="بستن"], div[role="dialog"] button:has(svg.lucide-x)');
      if (dialogCloseBtn) {
        await dialogCloseBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(600);
      const isCartClosed = !(await page.isVisible('div[role="dialog"]'));
      console.log(`Cart drawer closed successfully: ${isCartClosed}`);
    }

    // 5. Test Instant Search / Search Palette
    console.log('[1.5] Testing Search functionality...');
    const searchTrigger = await page.$('input[placeholder*="جست"], button:has-text("جست"), button:has(svg.lucide-search)');
    if (searchTrigger) {
      const tagName = await searchTrigger.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === 'input') {
        await searchTrigger.fill('اصالت وجود');
        await page.waitForTimeout(1000);
        console.log('Search input filled with query');
      } else {
        await searchTrigger.click();
        await page.waitForTimeout(1000);
        const searchInput = await page.$('input[type="text"], input[type="search"]');
        if (searchInput) {
          await searchInput.fill('اسفار');
          await page.waitForTimeout(1000);
          console.log('Search palette opened and searched for اسفار');
        }
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }

    // 6. Test FAQ Accordions
    console.log('[1.6] Testing FAQ Accordions on home page...');
    const faqButtons = await page.$$('section button:has(svg.lucide-chevron-down), details summary');
    console.log(`Found ${faqButtons.length} FAQ accordion triggers`);
    if (faqButtons.length > 0) {
      await faqButtons[0].click();
      await page.waitForTimeout(500);
      console.log('Clicked first FAQ accordion');
    }

    // 7. Test Catalog Navigation to /courses
    console.log('[1.7] Navigating to /courses...');
    await page.goto(`${BASE_URL}/courses`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Test course filter tabs
    const filterTabs = await page.$$('button:has-text("همه"), button:has-text("حکمت"), button:has-text("منطق")');
    console.log(`Found ${filterTabs.length} course category filter buttons`);
    if (filterTabs.length > 1) {
      await filterTabs[1].click();
      await page.waitForTimeout(800);
      console.log('Clicked category filter tab');
    }

    // 8. Test Course Detail Page
    console.log('[1.8] Navigating to Course Detail page (/courses/course-falsafe-asfar-1)...');
    await page.goto(`${BASE_URL}/courses/course-falsafe-asfar-1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const courseTitle = await page.textContent('h1');
    console.log(`Course title: "${courseTitle?.trim()}"`);

    // Check syllabus accordion on course detail
    const syllabusButtons = await page.$$('button:has(svg.lucide-chevron-down), div[role="button"]:has(svg.lucide-chevron-down)');
    console.log(`Found ${syllabusButtons.length} syllabus accordion items`);
    if (syllabusButtons.length > 0) {
      await syllabusButtons[0].click();
      await page.waitForTimeout(500);
      console.log('Toggled first syllabus item');
    }

    // Check CTA to learn page
    const learnBtn = await page.$('a[href*="/learn"]');
    console.log(`CTA to learn room found: ${Boolean(learnBtn)}`);

    console.log('=== [PHASE 1 COMPLETE] ===');
    console.log(`Console errors count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors.slice(0, 5));
    }
    console.log(`Network errors count: ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      console.log('Network errors:', networkErrors.slice(0, 5));
    }

    return {
      success: true,
      consoleErrors,
      networkErrors,
    };
  } catch (err) {
    console.error('Phase 1 error:', err);
    return {
      success: false,
      error: String(err),
      consoleErrors,
      networkErrors,
    };
  } finally {
    await browser.close();
  }
}

runPhase1().then((res) => {
  if (!res.success) {
    process.exit(1);
  }
});
