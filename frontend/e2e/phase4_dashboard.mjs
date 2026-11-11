import { chromium } from 'playwright';
import { getAuthenticatedSession, injectAuth } from './auth_helper.mjs';

const BASE_URL = 'http://localhost:3000';

async function runPhase4() {
  console.log('=== [PHASE 4] Authentication, Student Dashboard, Calendar & Certificates ===');
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
    // 1. Visit /login page unauthenticated
    console.log('[4.1] Testing /login flow with SMS OTP...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Test phone input
    const phoneInput = await page.$('input[type="tel"], input[placeholder*="09"], input[placeholder*="۰۹"]');
    if (!phoneInput) throw new Error('Phone number input not found on /login!');

    await phoneInput.fill('09123456789');
    console.log('Filled mobile number 09123456789');
    await page.waitForTimeout(300);

    // Click Send OTP
    const sendOtpBtn = await page.$('button:has-text("کد"), button:has-text("ارسال"), button[type="submit"]');
    if (sendOtpBtn) {
      await sendOtpBtn.click();
      await page.waitForTimeout(1500);
      console.log('Clicked Send OTP button');

      // Check OTP input screen
      const otpInputs = await page.$$('input[data-input-otp-slot], input[maxlength="1"], input[type="text"]');
      console.log(`Found ${otpInputs.length} OTP slot inputs`);

      // Fill OTP code 12345
      if (otpInputs.length >= 4) {
        for (let i = 0; i < Math.min(otpInputs.length, 5); i++) {
          await otpInputs[i].fill(String(i + 1));
          await page.waitForTimeout(100);
        }
        console.log('Entered OTP code into slots');
      }

      // Check submit button
      const verifyBtn = await page.$('button:has-text("ورود"), button:has-text("تایید"), button[type="submit"]');
      if (verifyBtn) {
        await verifyBtn.click();
        await page.waitForTimeout(2000);
        console.log('Clicked OTP verify submit');
      }
    }

    // 2. Authenticated Session on /dashboard
    console.log('[4.2] Navigating to authenticated /dashboard...');
    const session = await getAuthenticatedSession('STUDENT');
    await injectAuth(page, session);

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    const dashboardTitle = await page.textContent('h1, h2');
    console.log(`Dashboard greeting/heading: "${dashboardTitle?.trim()}"`);

    // 3. Test Online Classes Calendar Card
    console.log('[4.3] Testing OnlineClassesCalendarCard...');
    const calendarCard = await page.$('div:has-text("کلاس‌های برخط"), div:has-text("تقویم")');
    console.log(`Calendar card rendered: ${Boolean(calendarCard)}`);

    const navArrows = await page.$$('button:has(svg.lucide-chevron-right), button:has(svg.lucide-chevron-left)');
    console.log(`Found ${navArrows.length} calendar navigation arrows`);
    if (navArrows.length >= 2) {
      await navArrows[0].click();
      await page.waitForTimeout(500);
      console.log('Clicked next month in calendar');
      await navArrows[1].click();
      await page.waitForTimeout(500);
      console.log('Clicked previous month in calendar');
    }

    // 4. Test Enrolled Courses Grid
    console.log('[4.4] Checking Enrolled Courses...');
    const courseCards = await page.$$('a[href*="/courses/"], div:has-text("درصد")');
    console.log(`Found ${courseCards.length} course cards/progress items on dashboard`);

    // 5. Test Profile Settings Tab
    console.log('[4.5] Testing Profile Settings tab...');
    const settingsTab = await page.$('button:has-text("تنظیمات"), [role="tab"]:has-text("تنظیمات"), [role="tab"]:has-text("پروفایل")');
    if (settingsTab) {
      await settingsTab.click();
      await page.waitForTimeout(800);
      console.log('Switched to Profile Settings tab');

      const nameInput = await page.$('input[name*="name"], input[placeholder*="نام"]');
      if (nameInput) {
        const val = await nameInput.inputValue();
        console.log(`Current profile name input value: "${val}"`);
      }
    }

    // 6. Test Certificate Verification Page (/verify/[code])
    console.log('[4.6] Testing Certificate Verification (/verify/CERT-1403-ASFAR)...');
    await page.goto(`${BASE_URL}/verify/CERT-1403-ASFAR`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const verifyHeading = await page.textContent('h1, h2');
    console.log(`Verify Certificate heading: "${verifyHeading?.trim()}"`);

    const isVerifiedBadge = await page.isVisible('div:has-text("معتبر"), div:has-text("اصالت"), div:has-text("تایید")');
    console.log(`Certificate authenticity verified badge: ${isVerifiedBadge}`);

    console.log('=== [PHASE 4 COMPLETE] ===');
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
    console.error('Phase 4 error:', err);
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

runPhase4().then((res) => {
  if (!res.success) {
    process.exit(1);
  }
});
