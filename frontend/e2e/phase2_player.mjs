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

  page.on('requestfailed', (req) => {
    console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText);
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
    await page.waitForTimeout(2500);

    // 2. Verify Video Player & LTR container
    console.log('[2.2] Checking Player container and LTR direction...');
    const playerWrapper = await page.$('.vjs-ltr-wrapper');
    if (!playerWrapper) throw new Error('.vjs-ltr-wrapper not found!');

    const computedDir = await page.evaluate(() => {
      const el = document.querySelector('.vjs-ltr-wrapper');
      return el ? window.getComputedStyle(el).direction : null;
    });
    console.log(`Player computed direction: ${computedDir}`);
    if (computedDir !== 'ltr') {
      console.warn(`WARNING: Player direction is ${computedDir}, expected ltr!`);
    }

    // 3. Test Play / Pause Controls
    console.log('[2.3] Testing Play / Pause controls...');
    const playStatusBefore = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? { paused: v.paused, currentTime: v.currentTime, duration: v.duration } : null;
    });
    console.log('Video status before play:', playStatusBefore);

    // Click native Play button
    const playBtn = await page.$('.vjs-ltr-wrapper button[aria-label*="Play"], .vjs-ltr-wrapper button[aria-label*="پخش"], .vjs-ltr-wrapper button:has(svg.lucide-play), .vjs-ltr-wrapper media-play-button');
    if (playBtn) {
      console.log('Found Play button, clicking...');
      await playBtn.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('Triggering video.play() directly via DOM...');
      await page.evaluate(() => {
        const v = document.querySelector('video');
        if (v) v.play().catch(console.debug);
      });
      await page.waitForTimeout(2000);
    }

    const playStatusAfter = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? { paused: v.paused, currentTime: v.currentTime } : null;
    });
    console.log('Video status after play:', playStatusAfter);

    // Pause
    console.log('Pausing video...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) v.pause();
    });
    await page.waitForTimeout(500);
    const isPaused = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? v.paused : null;
    });
    console.log(`Video paused successfully: ${isPaused}`);

    // 4. Test Time Scrubbing / Seeking
    console.log('[2.4] Testing TimeSlider seek...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) v.currentTime = 45;
    });
    await page.waitForTimeout(500);
    const scrubbedTime = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? v.currentTime : null;
    });
    console.log(`Seek position: ${scrubbedTime}s`);

    // 5. Test Settings Gear Menu & Submenus
    console.log('[2.5] Testing Settings Gear Menu...');
    const settingsBtn = await page.$('.vjs-ltr-wrapper button.media-settings-menu-trigger, .vjs-ltr-wrapper button.video-controls-settings-button');
    if (settingsBtn) {
      console.log('Found Settings button, clicking...');
      await settingsBtn.click();
      await page.waitForTimeout(1000);

      const menuInfo = await page.evaluate(() => {
        // Collect items from open popover / menu
        const items = Array.from(document.querySelectorAll('[role="menuitem"], [role="menuitemradio"], [role="menu"] button'))
          .map(b => b.textContent?.trim() || '');
        return {
          count: items.length,
          items,
        };
      });
      console.log('Settings Menu items found:', menuInfo);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      console.log('Settings button not found in wrapper');
    }

    // 6. Test Video Renditions & Audio Tracks APIs
    console.log('[2.6] Verifying videoRenditions and audioTracks polyfills...');
    const mediaTracksInfo = await page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) return null;
      const renditions = v.videoRenditions ? Array.from(v.videoRenditions).map((r) => ({ id: r.id, label: r.label, selected: r.selected })) : null;
      const audioTracks = v.audioTracks ? Array.from(v.audioTracks).map((a) => ({ id: a.id, label: a.label, enabled: a.enabled })) : null;
      const textTracks = v.textTracks ? Array.from(v.textTracks).map((t) => ({ label: t.label, kind: t.kind, mode: t.mode })) : null;
      return { renditions, audioTracks, textTracks };
    });
    console.log('Media Tracks polyfill info:', JSON.stringify(mediaTracksInfo, null, 2));

    // 7. Test Notes Tab (یادداشت‌برداری)
    console.log('[2.7] Testing Notes scratchpad & Markdown formatting...');
    const noteTextarea = await page.$('textarea');
    if (noteTextarea) {
      console.log('Found personal notes textarea, typing note...');
      await noteTextarea.fill('یادداشت آزمایشی: بررسی برهان صدیقین در اسفار');
      await page.waitForTimeout(500);

      // Test Bold formatting button
      const boldBtn = await page.$('button[title*="ضخیم"]');
      if (boldBtn) {
        await boldBtn.click();
        await page.waitForTimeout(300);
        console.log('Clicked Bold formatting button');
      }

      // Verify localStorage persistence
      const savedNote = await page.evaluate(() => {
        const key = Object.keys(localStorage).find(k => k.startsWith('zanjirzan_notes_'));
        return key ? localStorage.getItem(key) : null;
      });
      console.log(`Saved note in localStorage: "${savedNote}"`);
    } else {
      console.log('Notes textarea not found');
    }

    // 8. Test Workspace Tab Switching (Attachments & AI Q&A)
    console.log('[2.8] Testing Workspace Tab navigation...');
    const workspaceTabs = await page.$$('nav[aria-label="منوی بخش‌های آموزشی جلسه"] button');
    console.log(`Found ${workspaceTabs.length} workspace tabs`);
    for (let i = 0; i < workspaceTabs.length; i++) {
      const tabText = await workspaceTabs[i].textContent();
      console.log(`Clicking workspace tab ${i}: "${tabText?.trim()}"`);
      await workspaceTabs[i].click();
      await page.waitForTimeout(500);
    }

    // 9. Test Curriculum / Sessions Tab
    console.log('[2.9] Testing Curriculum sessions accordion...');
    const curriculumTab = await page.$('button:has-text("سرفصل"), button:has-text("جلسات"), [role="tab"]:has-text("سرفصل")');
    if (curriculumTab) {
      await curriculumTab.click();
      await page.waitForTimeout(800);
      console.log('Switched back to Curriculum tab');
    }

    const chapterItems = await page.$$('div:has-text("جلسه"), button:has-text("جلسه")');
    console.log(`Found ${chapterItems.length} chapter items`);

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
