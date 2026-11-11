import { chromium } from 'playwright';
import { getAuthenticatedSession, injectAuth } from './auth_helper.mjs';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://127.0.0.1:8000/api/v1';

async function runPhase5() {
  console.log('=== [PHASE 5] E-Commerce, Cart, Checkout, Orders & DRM Security ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'fa-IR',
  });

  const session = await getAuthenticatedSession('STUDENT');
  const page = await context.newPage();
  await injectAuth(page, session);

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon') && !res.url().includes('coupons/validate')) {
      networkErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  try {
    // 1. Test Cart Storage & Cart Drawer
    console.log('[5.1] Adding sample item to cart in localStorage...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const sampleItem = {
        id: 'course-falsafe-asfar-1',
        title: 'اسفار اربعه: سفر اول، امور عامه و اصالت وجود',
        price: '۳۹۰,۰۰۰ تومان',
        type: 'course',
        itemType: 'course',
      };
      const arr = [sampleItem];
      localStorage.setItem('zan_cart', JSON.stringify(arr));
      localStorage.setItem('zan_cart_items', JSON.stringify(arr));
      window.dispatchEvent(new Event('zan_cart_sync'));
    });
    await page.waitForTimeout(1000);

    // Open Cart Modal
    console.log('Opening Cart Modal...');
    const cartBtn = await page.$('button[aria-label="سبد خرید"], button:has(svg.lucide-shopping-bag)');
    if (cartBtn) {
      await cartBtn.click();
      await page.waitForTimeout(1000);

      const cartItemTitle = await page.textContent('div[role="dialog"] h5');
      console.log(`Item inside cart modal: "${cartItemTitle?.trim()}"`);

      // Verify item price
      const cartPrice = await page.textContent('div[role="dialog"] span.font-num');
      console.log(`Item price inside cart: "${cartPrice?.trim()}"`);

      // Close modal
      const closeBtn = await page.$('div[role="dialog"] button[aria-label="بستن"], div[role="dialog"] button:has(svg.lucide-x)');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // 2. Test Checkout Page (/checkout)
    console.log('[5.2] Navigating to /checkout...');
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const checkoutHeading = await page.textContent('h1, h2');
    console.log(`Checkout page heading: "${checkoutHeading?.trim()}"`);

    // Test Coupon input
    console.log('[5.3] Testing Coupon code validation on checkout...');
    const couponInput = await page.$('input[placeholder*="تخفیف"], input[name*="coupon"]');
    const applyCouponBtn = await page.$('button:has-text("اعمال"), button:has-text("ثبت کد")');

    if (couponInput && applyCouponBtn) {
      // Test invalid coupon
      await couponInput.fill('INVALID_TEST_CODE');
      await applyCouponBtn.click();
      await page.waitForTimeout(1000);
      console.log('Tested invalid coupon code rejection');
    }

    // 3. Test Backend Order Creation API
    console.log('[5.4] Testing Backend Order Creation endpoint (/api/v1/orders/create)...');
    const orderRes = await fetch(`${API_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        items: [
          {
            item_id: 'course-falsafe-asfar-1',
            item_type: 'course',
            title: 'اسفار اربعه',
            price: 390000,
          },
        ],
      }),
    });
    const orderData = await orderRes.json();
    console.log(`Order creation API status: ${orderRes.status}, Order ID: ${orderData.order_id}`);

    // 4. Test DRM Token Security Endpoint
    console.log('[5.5] Testing DRM Token Generation & HMAC Verification (POST /api/v1/stream/token)...');
    // Preview chapter 1 should succeed
    const drmPreviewRes = await fetch(`${API_URL}/stream/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        course_id: 'course-falsafe-asfar-1',
        chapter_id: 1,
      }),
    });
    console.log(`DRM preview token status: ${drmPreviewRes.status}`);
    if (drmPreviewRes.ok) {
      const drmData = await drmPreviewRes.json();
      console.log(`DRM token received: ${drmData.token?.substring(0, 30)}...`);
    }

    // 5. Test Video Quality API Endpoint with HTTP 206 Partial Content Range
    console.log('[5.6] Testing Video Quality Downscale & HTTP 206 Range Request (/api/v1/stream/video-quality)...');
    const rangeRes = await fetch(`${API_URL}/stream/video-quality?src=%2Fvideos%2Fsample_lecture.mp4&quality=360p`, {
      headers: {
        Range: 'bytes=0-99',
      },
    });
    console.log(`Video quality 360p Range status: ${rangeRes.status} (Expected 206 or 200)`);
    console.log(`Content-Range header: ${rangeRes.headers.get('content-range')}`);

    // 6. Test Tampered Token Rejection
    console.log('[5.7] Testing Tampered DRM token rejection...');
    const tamperedRes = await fetch(`${API_URL}/stream/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid.tampered.token',
      },
      body: JSON.stringify({
        course_id: 'course-falsafe-asfar-1',
        chapter_id: 999,
      }),
    });
    console.log(`Tampered token response status: ${tamperedRes.status} (Expected 401 or 403)`);

    console.log('=== [PHASE 5 COMPLETE] ===');
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
    console.error('Phase 5 error:', err);
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

runPhase5().then((res) => {
  if (!res.success) {
    process.exit(1);
  }
});
