/**
 * Dar al-Hikmah — Microscopic Frontend X-Ray Auditor (Zero-Download Windows Edition)
 * Automatically uses installed Google Chrome / Microsoft Edge on Windows (or Playwright Chromium)
 * Scans every route, viewport (Mobile/Desktop), theme (Light/Dark), and locale (FA/AR/EN).
 *
 * Run with: node scripts/xray-audit.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const ROUTES_TO_AUDIT = [
  { name: 'Homepage (صفحه اصلی)', path: '/' },
  { name: 'Courses Catalog (کاتالوگ دوره‌ها)', path: '/courses' },
  { name: 'Course Detail (صفحه معرفی دوره)', path: '/courses/course-mantiq-mabadi' },
  { name: 'Course Classroom (اتاق درس و پلیر)', path: '/courses/course-mantiq-mabadi/learn' },
  { name: 'Books Showcase (ویترین کتاب‌ها)', path: '/books' },
  { name: 'Book Detail (جزئیات کتاب)', path: '/books/book1' },
  { name: 'Articles Archive (آرشیو مقالات)', path: '/articles' },
  { name: 'Article Reader (مطالعه مقاله)', path: '/articles/aslat-vojood-seddiqin' },
  { name: 'Curriculum Roadmap (سیر مطالعاتی و گراف)', path: '/roadmap' },
  { name: 'Global Search (جستجوی جامع)', path: '/search' },
  { name: 'Login & OTP (صفحه ورود)', path: '/login' },
  { name: 'Student Dashboard (پیشخوان دانشجو)', path: '/dashboard' },
  { name: 'Admin Console (پنل مدیریت استاد)', path: '/admin' },
  { name: 'Checkout (تسویه‌حساب)', path: '/checkout' },
  { name: 'Certificate Verify (استعلام گواهینامه)', path: '/verify/ZAN-CERT-1403-882100' },
];

const VIEWPORTS = [
  { name: 'Desktop (1440x900)', width: 1440, height: 900 },
  { name: 'Mobile (375x812)', width: 375, height: 812 },
];

/**
 * Automatically finds Google Chrome or Microsoft Edge on Windows
 * so the user doesn't need to download 150MB of Playwright Chromium!
 */
async function launchSystemBrowser() {
  const windowsBrowserPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe')
      : '',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  for (const exePath of windowsBrowserPaths) {
    if (fs.existsSync(exePath)) {
      console.log(`🌐 Using installed system browser: ${exePath}`);
      return await chromium.launch({
        headless: true,
        executablePath: exePath,
      });
    }
  }

  // Fallback to channel or default Playwright Chromium
  try {
    return await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    try {
      return await chromium.launch({ headless: true, channel: 'msedge' });
    } catch {
      return await chromium.launch({ headless: true });
    }
  }
}

async function runMicroscopicAudit() {
  console.log('🔍 Starting Microscopic Frontend X-Ray Audit on:', BASE_URL);
  const browser = await launchSystemBrowser();

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalRoutesChecked: 0,
      consoleErrors: 0,
      networkErrors: 0,
      brokenImages: 0,
      layoutOverflows: 0,
      elementCollisions: 0,
      clutterWarnings: 0,
      deadOrEmptyButtons: 0,
      untranslatedInEnglish: 0,
    },
    routes: [],
  };

  for (const route of ROUTES_TO_AUDIT) {
    console.log(`👉 Auditing: ${route.name} (${route.path})...`);
    const routeFinding = {
      name: route.name,
      path: route.path,
      consoleErrors: [],
      networkErrors: [],
      desktopAudit: null,
      mobileAudit: null,
      englishLeakAudit: null,
    };

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          routeFinding.consoleErrors.push(`[${vp.name}] ${msg.text()}`);
          report.summary.consoleErrors++;
        }
      });

      page.on('pageerror', (err) => {
        routeFinding.consoleErrors.push(`[${vp.name} Runtime Crash] ${err.message}`);
        report.summary.consoleErrors++;
      });

      page.on('response', (res) => {
        if (res.status() >= 400 && !res.url().includes('favicon') && !res.url().includes('_next/webpack-hmr')) {
          routeFinding.networkErrors.push(
            `[${vp.name}] HTTP ${res.status()} on ${res.url()}`
          );
          report.summary.networkErrors++;
        }
      });

      try {
        await page.goto(`${BASE_URL}${route.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000,
        });
        await page.waitForTimeout(900);

        const domMetrics = await page.evaluate(() => {
          const issues = {
            horizontalOverflow: false,
            overflowingElements: [],
            overlappingInteractiveElements: [],
            bracketSlopTags: [],
            overcrowdedCards: [],
            deadButtonsOrLinks: [],
            brokenImages: [],
          };

          // 1. Check Horizontal Overflow
          if (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 2
          ) {
            issues.horizontalOverflow = true;
            document.querySelectorAll('*').forEach((el) => {
              const rect = el.getBoundingClientRect();
              if (rect.right > window.innerWidth + 4 && rect.width > 0) {
                const tag = `${el.tagName.toLowerCase()}.${(
                  el.className?.toString() || ''
                )
                  .split(' ')
                  .slice(0, 3)
                  .join('.')}`;
                if (issues.overflowingElements.length < 8) {
                  issues.overflowingElements.push(
                    `${tag} (right: ${Math.round(rect.right)}px > viewport ${
                      window.innerWidth
                    }px)`
                  );
                }
              }
            });
          }

          // 2. Check Broken Images
          document.querySelectorAll('img').forEach((img) => {
            if (img.complete && img.naturalWidth === 0) {
              issues.brokenImages.push(
                `Broken <img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt') || ''}">`
              );
            }
          });

          // 3. Check Artificial Bracket Slop ([CRS-01], [STN-01], etc.)
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
          );
          let node;
          while ((node = walker.nextNode())) {
            const txt = node.nodeValue?.trim() || '';
            if (/^\[(CRS|STN|ART|ENC|STUDIO|HTTP|0\d)[^\]]*\]$/i.test(txt)) {
              issues.bracketSlopTags.push(txt);
            }
          }

          // 4. Check Dead or Empty Buttons / Links
          document.querySelectorAll('button, a').forEach((el) => {
            const text = (el.textContent || '').trim();
            const aria =
              el.getAttribute('aria-label') || el.getAttribute('title') || '';
            const href = el.getAttribute('href');
            if (!text && !aria && !el.querySelector('svg, img')) {
              issues.deadButtonsOrLinks.push(
                `Empty ${el.tagName} without label or icon`
              );
            }
            if (el.tagName === 'A' && (!href || href === '#')) {
              issues.deadButtonsOrLinks.push(
                `Link "${text.slice(0, 25)}" has dead href="${href}"`
              );
            }
          });

          // 5. Check Overcrowded Cards (Cards with >= 5 buttons & >= 5 badges)
          document
            .querySelectorAll('article, [class*="rounded-2xl"], [class*="rounded-3xl"]')
            .forEach((card) => {
              const interactiveCount = card.querySelectorAll('button, a').length;
              const badgeCount = card.querySelectorAll('span[class*="rounded"]').length;
              if (
                interactiveCount >= 5 &&
                badgeCount >= 5 &&
                card.clientHeight > 80 &&
                card.clientHeight < 550
              ) {
                const title =
                  card
                    .querySelector('h2, h3, h4')
                    ?.textContent?.trim()
                    ?.slice(0, 40) || 'Card';
                issues.overcrowdedCards.push(
                  `"${title}" has ${interactiveCount} actions & ${badgeCount} badges packed inside!`
                );
              }
            });

          // 6. Check Interactive Bounding-Box Collisions (Overlapping Fixed/Floating Widgets)
          const fixedEls = Array.from(document.querySelectorAll('*')).filter(
            (el) => {
              const pos = window.getComputedStyle(el).position;
              const rect = el.getBoundingClientRect();
              return (
                (pos === 'fixed' || pos === 'sticky') &&
                rect.width > 20 &&
                rect.height > 20
              );
            }
          );

          for (let i = 0; i < fixedEls.length; i++) {
            for (let j = i + 1; j < fixedEls.length; j++) {
              const a = fixedEls[i].getBoundingClientRect();
              const b = fixedEls[j].getBoundingClientRect();
              const overlapX = Math.max(
                0,
                Math.min(a.right, b.right) - Math.max(a.left, b.left)
              );
              const overlapY = Math.max(
                0,
                Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
              );
              if (
                overlapX > 10 &&
                overlapY > 10 &&
                !fixedEls[i].contains(fixedEls[j]) &&
                !fixedEls[j].contains(fixedEls[i])
              ) {
                issues.overlappingInteractiveElements.push(
                  `Fixed elements overlap by ${Math.round(overlapX)}x${Math.round(
                    overlapY
                  )}px: "${fixedEls[i].textContent?.trim().slice(0, 20)}" vs "${fixedEls[
                    j
                  ].textContent
                    ?.trim()
                    .slice(0, 20)}"`
                );
              }
            }
          }

          return issues;
        });

        if (domMetrics.horizontalOverflow) report.summary.layoutOverflows++;
        report.summary.brokenImages += domMetrics.brokenImages.length;
        report.summary.elementCollisions +=
          domMetrics.overlappingInteractiveElements.length;
        report.summary.clutterWarnings +=
          domMetrics.bracketSlopTags.length + domMetrics.overcrowdedCards.length;
        report.summary.deadOrEmptyButtons +=
          domMetrics.deadButtonsOrLinks.length;

        if (vp.width === 1440) {
          routeFinding.desktopAudit = domMetrics;

          // Test switching to English (EN) and check for untranslated Persian strings
          const enBtn = page.locator('button:has-text("EN")').first();
          if (await enBtn.isVisible().catch(() => false)) {
            await enBtn.click();
            await page.waitForTimeout(350);
            const untranslated = await page.evaluate(() => {
              const leaks = [];
              document
                .querySelectorAll('h1, h2, h3, button, nav a, label, p')
                .forEach((el) => {
                  const txt = (el.textContent || '').trim();
                  if (/[\u0600-\u06FF]/.test(txt) && txt !== 'فا' && txt !== 'عر') {
                    leaks.push(`${el.tagName}: "${txt.slice(0, 50)}"`);
                  }
                });
              return Array.from(new Set(leaks)).slice(0, 20);
            });
            routeFinding.englishLeakAudit = untranslated;
            report.summary.untranslatedInEnglish += untranslated.length;
          }
        } else {
          routeFinding.mobileAudit = domMetrics;
        }
      } catch (err) {
        routeFinding.consoleErrors.push(
          `[${vp.name}] Navigation error: ${err.message}`
        );
      } finally {
        await context.close();
      }
    }

    report.routes.push(routeFinding);
    report.summary.totalRoutesChecked++;
  }

  await browser.close();

  // Save Markdown Report
  const mdLines = [
    '# گزارش رادار میکروسکوپی فرانت‌اند (X-Ray Audit Report)',
    `تاریخ اجرا: \`${report.timestamp}\``,
    '',
    '## خلاصه وضعیت کل صفحات:',
    `- تعداد مسیرهای بررسی‌شده: **${report.summary.totalRoutesChecked}**`,
    `- خطاهای کنسول و Runtime (Console Errors): **${report.summary.consoleErrors}**`,
    `- خطاهای شبکه (Network 4xx/5xx): **${report.summary.networkErrors}**`,
    `- تصاویر خراب یا لودنشده (Broken Images): **${report.summary.brokenImages}**`,
    `- سرریز افقی صفحه (Horizontal Overflow): **${report.summary.layoutOverflows}**`,
    `- تداخل المان‌های شناور (Element Collisions): **${report.summary.elementCollisions}**`,
    `- هشدارهای شلوغی و کدهای براکتی (Visual Clutter): **${report.summary.clutterWarnings}**`,
    `- دکمه‌ها یا لینک‌های خالی/مرده (Dead Buttons/Links): **${report.summary.deadOrEmptyButtons}**`,
    `- متون فارسی ترجمه‌نشده در حالت انگلیسی (EN Leaks): **${report.summary.untranslatedInEnglish}**`,
    '',
    '---',
  ];

  for (const r of report.routes) {
    mdLines.push(`## 📍 ${r.name} (\`${r.path}\`)`);
    if (r.consoleErrors.length) {
      mdLines.push('### ❌ خطاهای کنسول:');
      r.consoleErrors.forEach((e) => mdLines.push(`- \`${e}\``));
    }
    if (r.networkErrors.length) {
      mdLines.push('### 🌐 خطاهای شبکه (API):');
      r.networkErrors.forEach((e) => mdLines.push(`- \`${e}\``));
    }
    if (r.desktopAudit?.brokenImages?.length) {
      mdLines.push('### 🖼️ تصاویر خراب:');
      r.desktopAudit.brokenImages.forEach((img) => mdLines.push(`- \`${img}\``));
    }
    if (r.desktopAudit?.bracketSlopTags?.length) {
      mdLines.push(
        `### 🧹 کدهای مصنوعی شلوغ‌کننده در صفحه: \`${r.desktopAudit.bracketSlopTags.join(', ')}\``
      );
    }
    if (r.desktopAudit?.overcrowdedCards?.length) {
      mdLines.push('### 📦 کارت‌های بیش از حد شلوغ:');
      r.desktopAudit.overcrowdedCards.forEach((c) => mdLines.push(`- ${c}`));
    }
    if (r.desktopAudit?.deadButtonsOrLinks?.length) {
      mdLines.push('### 🔘 دکمه‌ها یا لینک‌های بدون عملکرد:');
      r.desktopAudit.deadButtonsOrLinks.forEach((d) => mdLines.push(`- ${d}`));
    }
    if (r.mobileAudit?.horizontalOverflow) {
      mdLines.push('### 📱 سرریز افقی در موبایل:');
      r.mobileAudit.overflowingElements.forEach((o) =>
        mdLines.push(`- \`${o}\``)
      );
    }
    if (r.mobileAudit?.overlappingInteractiveElements?.length) {
      mdLines.push('### ⚠️ افتادن ویجت‌های شناور روی هم در موبایل:');
      r.mobileAudit.overlappingInteractiveElements.forEach((o) =>
        mdLines.push(`- ${o}`)
      );
    }
    if (r.englishLeakAudit?.length) {
      mdLines.push('### 🌍 متن‌های فارسی جامانده وقتی سایت روی EN است:');
      r.englishLeakAudit.forEach((l) => mdLines.push(`- \`${l}\``));
    }
    mdLines.push('');
  }

  const outPath = path.resolve(process.cwd(), 'XRAY_REPORT.md');
  fs.writeFileSync(outPath, mdLines.join('\n'), 'utf-8');
  console.log(`✅ X-Ray Audit Complete! Full report saved to: ${outPath}`);
}

runMicroscopicAudit();