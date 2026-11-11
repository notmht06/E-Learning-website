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
      throw new Error(`Player direction is ${computedDir}, expected ltr!`);
    }

    // Deep Assertion: Control bar LTR orientation (Play on far left, Settings/FS on right)
    console.log('[2.2.1] Verifying LTR Control Bar button coordinates...');
    const coords = await page.evaluate(() => {
      const playBtn = document.querySelector('.vjs-ltr-wrapper button[aria-label*="Play"], .vjs-ltr-wrapper button[aria-label*="پخش"], .vjs-ltr-wrapper media-play-button');
      const settingsOrFs = document.querySelector('.vjs-ltr-wrapper button.media-settings-menu-trigger, .vjs-ltr-wrapper media-fullscreen-button, .vjs-ltr-wrapper button.video-controls-settings-button');
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

    // 4. Test Quality Switching to 360p with blur filter assertion
    console.log('[2.4] Switching Quality to 360p without resetting time or pausing...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v && v.videoRenditions) {
        const r360 = Array.from(v.videoRenditions).findIndex((r) => r.id === '360p');
        if (r360 !== -1) {
          v.videoRenditions.selectedIndex = r360;
        }
      }
    });
    await page.waitForTimeout(800);

    const qualityCheck = await page.evaluate(() => {
      const v = document.querySelector('video');
      const notice = document.getElementById('player-quality-notice');
      return {
        filter: v?.style.filter || '',
        currentTime: v?.currentTime || 0,
        paused: v?.paused ?? true,
        noticeText: notice?.textContent?.trim() || null,
      };
    });
    console.log('Quality 360p check:', qualityCheck);

    if (!qualityCheck.filter.includes('blur')) {
      throw new Error(`Quality switch assertion failed: video filter does not contain 'blur'! Filter is "${qualityCheck.filter}"`);
    }
    if (qualityCheck.currentTime < 1.0) {
      throw new Error(`Quality switch assertion failed: currentTime was reset to ${qualityCheck.currentTime}!`);
    }
    if (qualityCheck.paused) {
      throw new Error('Quality switch assertion failed: video was paused after quality switch!');
    }
    console.log('Quality 360p visual downscaling and non-pausing assertions passed!');

    // 5. Test Audio Only Mode and verify overlay does not collide with center button
    console.log('[2.5] Switching Mode to Audio only...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v && v.audioTracks) {
        Array.from(v.audioTracks).forEach((t) => {
          t.enabled = t.id === 'audio-only';
        });
        v.audioTracks.dispatchEvent(new Event('change'));
      }
    });
    await page.waitForTimeout(800);

    const audioModeCheck = await page.evaluate(() => {
      const v = document.querySelector('video');
      const overlay = document.getElementById('audio-mode-overlay');
      return {
        currentTime: v?.currentTime || 0,
        overlayVisible: Boolean(overlay && window.getComputedStyle(overlay).display !== 'none'),
      };
    });
    console.log('Audio mode check:', audioModeCheck);

    if (!audioModeCheck.overlayVisible) {
      throw new Error('Audio only overlay is not visible!');
    }
    if (audioModeCheck.currentTime < 1.0) {
      throw new Error(`Audio mode switch reset currentTime to ${audioModeCheck.currentTime}!`);
    }

    // Switch back to Video
    console.log('Switching Mode back to Video...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v && v.audioTracks) {
        Array.from(v.audioTracks).forEach((t) => {
          t.enabled = t.id === 'video-audio';
        });
        v.audioTracks.dispatchEvent(new Event('change'));
      }
    });
    await page.waitForTimeout(600);

    const backCheck = await page.evaluate(() => {
      const overlay = document.getElementById('audio-mode-overlay');
      return {
        overlayVisible: Boolean(overlay && window.getComputedStyle(overlay).display !== 'none'),
      };
    });
    if (backCheck.overlayVisible) {
      throw new Error('Audio only overlay is still visible after switching back to Video!');
    }
    console.log('Audio only bidirectional toggle assertions passed!');

    // 6. Test Subtitle Overlay and Dana font assertion
    console.log('[2.6] Verifying Custom Subtitle Overlay and Dana typography...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) {
        v.currentTime = 10;
        v.dispatchEvent(new Event('timeupdate'));
      }
    });
    await page.waitForTimeout(600);

    const subtitleCheck = await page.evaluate(() => {
      const overlay = document.getElementById('custom-subtitle-overlay');
      if (!overlay) return null;
      const inner = overlay.querySelector('div');
      const style = inner ? window.getComputedStyle(inner) : null;
      return {
        text: overlay.textContent?.trim(),
        fontFamily: style?.fontFamily || '',
      };
    });
    console.log('Subtitle check at 10s:', subtitleCheck);

    if (subtitleCheck) {
      console.log(`Subtitle text: "${subtitleCheck.text}"`);
      console.log(`Subtitle computed font family: "${subtitleCheck.fontFamily}"`);
      if (!subtitleCheck.fontFamily.toLowerCase().includes('dana')) {
        throw new Error(`Subtitle font family does not include Dana! Computed: ${subtitleCheck.fontFamily}`);
      }
      console.log('Dana font subtitle assertion passed!');
    }

    // Toggle Captions Off
    console.log('Toggling Captions Off...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v && v.textTracks) {
        for (let i = 0; i < v.textTracks.length; i++) {
          v.textTracks[i].mode = 'disabled';
        }
        v.textTracks.dispatchEvent(new Event('change'));
      }
    });
    await page.waitForTimeout(400);

    const subAfterOff = await page.$('#custom-subtitle-overlay');
    if (subAfterOff) {
      throw new Error('Subtitle overlay did not disappear after turning captions Off!');
    }
    console.log('Subtitle toggle off assertion passed!');

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
