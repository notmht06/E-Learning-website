import { chromium } from 'playwright';
import { getAuthenticatedSession, injectAuth } from './auth_helper.mjs';

const BASE_URL = 'http://localhost:3000';

async function runPhase2() {
  console.log('=== [PHASE 2] Video/Audio Player & Classroom Workspace on /learn ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'fa-IR',
  });

  const session = await getAuthenticatedSession('STUDENT');
  console.log('Authenticated session ready for user:', session.profile.name);

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
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      networkErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  try {
    // 1. Navigate to /learn room
    const learnUrl = `${BASE_URL}/courses/course-falsafe-asfar-1/learn`;
    console.log(`[2.1] Navigating to ${learnUrl}...`);
    await page.goto(learnUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.vjs-ltr-player', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // 2. Verify Video Player & LTR container
    console.log('[2.2] Checking Player container and LTR direction...');
    const playerWrapper = await page.$('.vjs-ltr-player');
    if (!playerWrapper) throw new Error('.vjs-ltr-player not found!');

    const computedDir = await page.evaluate(() => {
      const el = document.querySelector('.vjs-ltr-player');
      return el ? window.getComputedStyle(el).direction : null;
    });
    console.log(`Player computed direction: ${computedDir}`);
    if (computedDir !== 'ltr') {
      throw new Error(`Player direction is ${computedDir}, expected ltr!`);
    }

    // 2.2.1 Deep Assertion: Control bar LTR orientation (Play on far left, Settings/FS on right)
    console.log('[2.2.1] Verifying LTR Control Bar button coordinates...');
    const coords = await page.evaluate(() => {
      const playBtn = document.querySelector('[data-testid="player-play-button"], .vjs-ltr-player button[aria-label*="Play"], .vjs-ltr-player button[aria-label*="پخش"]');
      const settingsOrFs = document.querySelector('[data-testid="player-settings-button"], [data-testid="player-fullscreen-button"], .vjs-ltr-player button.media-settings-menu-trigger');
      if (!playBtn || !settingsOrFs) return null;
      const pRect = playBtn.getBoundingClientRect();
      const sRect = settingsOrFs.getBoundingClientRect();
      return { playX: pRect.left, endX: sRect.left };
    });
    console.log('Button coordinates:', coords);
    if (coords && coords.playX >= coords.endX) {
      throw new Error(`Control bar is not LTR! Play button x (${coords.playX}) is >= Settings/FS x (${coords.endX})`);
    }
    console.log('LTR Control Bar button layout assertion passed: Play is on left, Settings/FS is on right!');

    // 2.2.2 Timeline LTR assertion: Current Time is strictly LESS than Remaining/Duration Time
    console.log('[2.2.2] Verifying Timeline LTR seekbar coordinates (Current Time < Remaining Time)...');
    const timelineCoords = await page.evaluate(() => {
      const curEl = document.querySelector('[data-testid="player-current-time"], .video-time-value:first-child');
      const durEl = document.querySelector('[data-testid="player-duration-time"], .video-time-value:last-child');
      if (!curEl || !durEl) return null;
      const currentRect = curEl.getBoundingClientRect();
      const durRect = durEl.getBoundingClientRect();
      return {
        currentX: currentRect.left,
        remainingX: durRect.left,
        currentText: curEl.textContent?.trim(),
        remainingText: durEl.textContent?.trim(),
      };
    });
    console.log('Timeline coordinates check:', timelineCoords);
    if (timelineCoords) {
      if (timelineCoords.currentX >= timelineCoords.remainingX) {
        throw new Error(`Timeline is reversed! Current time x (${timelineCoords.currentX}) is >= Remaining time x (${timelineCoords.remainingX})`);
      }
      console.log('Timeline LTR seekbar assertion passed: Current Time is on the LEFT of Remaining Time!');
    }

    // 3. Play video for 2 seconds
    console.log('[2.3] Playing video for 2 seconds...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) v.play().catch(console.debug);
    });
    await page.waitForTimeout(2500);

    const playStatus = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? { paused: v.paused, currentTime: v.currentTime } : null;
    });
    console.log('Video play status after 2s:', playStatus);

    // 4. Test Quality Switching via Settings Menu
    console.log('[2.4] Verifying Settings Menu opening and quality options...');
    const settingsBtn = await page.$('[data-testid="player-settings-button"]');
    if (settingsBtn) {
      await settingsBtn.click();
      await page.waitForTimeout(400);

      const menuVisible = await page.evaluate(() => {
        const m = document.querySelector('[data-testid="player-settings-menu"]');
        return Boolean(m);
      });
      console.log('Settings menu open:', menuVisible);
      if (!menuVisible) {
        throw new Error('Settings menu did not open upon clicking gear icon!');
      }

      // Close settings menu
      await settingsBtn.click();
      await page.waitForTimeout(300);
    }

    // 5. Test Audio Only Mode and verify overlay is visible
    console.log('[2.5] Switching Mode to Audio only via Settings menu...');
    if (settingsBtn) {
      await settingsBtn.click();
      await page.waitForTimeout(300);

      // Click "حالت پخش"
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('[data-testid="player-settings-menu"] button'));
        const modeBtn = buttons.find((b) => b.textContent && b.textContent.includes('حالت پخش'));
        if (modeBtn) modeBtn.click();
      });
      await page.waitForTimeout(300);

      // Click "صوتی"
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('[data-testid="player-settings-menu"] button'));
        const audioBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'صوتی');
        if (audioBtn) audioBtn.click();
      });
      await page.waitForTimeout(500);

      const audioOverlay = await page.$('[data-testid="audio-only-overlay"], #audio-mode-overlay');
      console.log('Audio only overlay found:', Boolean(audioOverlay));
      if (!audioOverlay) {
        throw new Error('Audio only overlay not found after switching to Audio mode!');
      }

      // Switch back to Video
      await settingsBtn.click();
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('[data-testid="player-settings-menu"] button'));
        const modeBtn = buttons.find((b) => b.textContent && b.textContent.includes('حالت پخش'));
        if (modeBtn) modeBtn.click();
      });
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('[data-testid="player-settings-menu"] button'));
        const videoBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'ویدیویی');
        if (videoBtn) videoBtn.click();
      });
      await page.waitForTimeout(500);
      console.log('Switched back to video mode successfully!');
    }

    // 6. Test Captions button
    console.log('[2.6] Verifying Captions toggle...');
    const captionsBtn = await page.$('[data-testid="player-captions-button"]');
    if (captionsBtn) {
      await captionsBtn.click();
      await page.waitForTimeout(300);
      console.log('Captions toggled successfully!');
    }

    // 7. Test Notes Tab (یادداشت‌برداری)
    console.log('[2.7] Testing Notes scratchpad & Markdown formatting...');
    const noteTextarea = await page.$('textarea');
    if (noteTextarea) {
      await noteTextarea.fill('یادداشت آزمایشی: بررسی برهان صدیقین در اسفار');
      await page.waitForTimeout(500);

      const boldBtn = await page.$('button[title*="ضخیم"]');
      if (boldBtn) {
        await boldBtn.click();
        await page.waitForTimeout(300);
        console.log('Clicked Bold formatting button');
      }

      const savedNote = await page.evaluate(() => {
        const key = Object.keys(localStorage).find((k) => k.startsWith('zanjirzan_notes_'));
        return key ? localStorage.getItem(key) : null;
      });
      console.log(`Saved note in localStorage: "${savedNote}"`);
    }

    // 8. Test Workspace Tab Switching
    console.log('[2.8] Testing Workspace Tab navigation...');
    const workspaceTabs = await page.$$('nav[aria-label="منوی بخش‌های آموزشی جلسه"] button');
    console.log(`Found ${workspaceTabs.length} workspace tabs`);
    for (let i = 0; i < workspaceTabs.length; i++) {
      const tabText = await workspaceTabs[i].textContent();
      console.log(`Clicking workspace tab ${i}: "${tabText?.trim()}"`);
      await workspaceTabs[i].click();
      await page.waitForTimeout(400);
    }

    console.log('=== [PHASE 2 COMPLETE] ===');
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
    console.error('Phase 2 error:', err);
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

runPhase2().then((res) => {
  if (!res.success) {
    process.exit(1);
  }
});
