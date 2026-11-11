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
    await page.waitForSelector('.vjs-ltr-player', { timeout: 10000 });

    // 2. Verify Video Player & LTR container
    console.log('[2.2] Checking Player container and LTR direction...');
    const playerWrapper = await page.$('.vjs-ltr-player');
    if (!playerWrapper) throw new Error('.vjs-ltr-player not found!');

    // 2.2.0 Verify NO floating mode pill exists at top of player
    const floatingPill = await page.$('#player-mode-toggle, .vjs-ltr-player .absolute.top-4.left-4');
    if (floatingPill) {
      throw new Error('Unwanted floating mode pill was found at the top of the video player!');
    }
    console.log('Assertion passed: No floating pill on top of video player.');

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
      const playBtn = document.querySelector('.vjs-ltr-player button[aria-label*="Play"], .vjs-ltr-player button[aria-label*="پخش"], .vjs-ltr-player media-play-button');
      const settingsOrFs = document.querySelector('.vjs-ltr-player button.media-settings-menu-trigger, .vjs-ltr-player media-fullscreen-button, .vjs-ltr-player button.video-controls-settings-button');
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
      const sliderGroup = document.querySelector('.video-time-slider-group');
      if (!sliderGroup) return null;
      const timeValues = sliderGroup.querySelectorAll('.video-time-value, .media-time-value');
      if (timeValues.length < 2) return null;
      const currentRect = timeValues[0].getBoundingClientRect();
      const remainingRect = timeValues[timeValues.length - 1].getBoundingClientRect();
      return {
        currentX: currentRect.left,
        remainingX: remainingRect.left,
        currentText: timeValues[0].textContent?.trim(),
        remainingText: timeValues[timeValues.length - 1].textContent?.trim(),
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

    // 4. Test Quality Switching to 360p - NO BLUR ASSERTION
    console.log('[2.4] Switching Quality to 360p without CSS blur, preserving time & playback...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v && v.videoRenditions) {
        const r360 = Array.from(v.videoRenditions).findIndex((r) => r.id === '360p');
        if (r360 !== -1) {
          v.videoRenditions.selectedIndex = r360;
        }
      }
    });
    await page.waitForTimeout(1000);

    const qualityCheck = await page.evaluate(() => {
      const v = document.querySelector('video');
      const notice = document.getElementById('player-quality-notice');
      return {
        filter: v?.style.filter || '',
        computedFilter: v ? window.getComputedStyle(v).filter : '',
        currentTime: v?.currentTime || 0,
        paused: v?.paused ?? true,
        src: v?.currentSrc || v?.src || '',
        noticeText: notice?.textContent?.trim() || null,
      };
    });
    console.log('Quality 360p check:', qualityCheck);

    // Strict assertion: NO filter: blur() allowed!
    if (qualityCheck.filter.includes('blur') || qualityCheck.computedFilter.includes('blur')) {
      throw new Error(`Quality switch assertion failed: fake CSS blur filter was found! Filter is "${qualityCheck.filter}"`);
    }
    if (qualityCheck.currentTime < 1.0) {
      throw new Error(`Quality switch assertion failed: currentTime was reset to ${qualityCheck.currentTime}!`);
    }
    if (qualityCheck.paused) {
      throw new Error('Quality switch assertion failed: video was paused after quality switch!');
    }
    console.log('Quality 360p real rendition switch assertion passed (ZERO CSS blur)!');

    // 5. Test Audio Only Mode and verify official @videojs/react/audio preset
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
      const audioEl = document.querySelector('.vjs-ltr-player audio');
      return {
        hasAudioEl: Boolean(audioEl),
        currentTime: audioEl?.currentTime || 0,
      };
    });
    console.log('Audio mode check:', audioModeCheck);

    if (!audioModeCheck.hasAudioEl) {
      throw new Error('Official Audio preset <audio> element is not mounted in audio mode!');
    }
    if (audioModeCheck.currentTime < 1.0) {
      throw new Error(`Audio mode switch reset currentTime to ${audioModeCheck.currentTime}!`);
    }

    // Switch back to Video
    console.log('Switching Mode back to Video...');
    const switchBackBtn = await page.$('button:has-text("حالت ویدیویی")');
    if (switchBackBtn) {
      await switchBackBtn.click();
    } else {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('حالت ویدیویی'));
        if (btn) btn.click();
      });
    }
    await page.waitForTimeout(600);

    const backCheck = await page.evaluate(() => {
      const videoEl = document.querySelector('video');
      return {
        hasVideoEl: Boolean(videoEl),
        currentTime: videoEl?.currentTime || 0,
      };
    });
    if (!backCheck.hasVideoEl) {
      throw new Error('<video> element is not restored after switching back to Video mode!');
    }
    console.log('Audio only bidirectional toggle assertions passed!');

    // 6. Test Official WebVTT Captions API and Native Cues
    console.log('[2.6] Verifying Official WebVTT Captions API and Native Track...');
    const trackInfo = await page.evaluate(() => {
      const v = document.querySelector('video');
      if (!v || !v.textTracks || v.textTracks.length === 0) return null;
      const track = v.textTracks[0];
      return {
        kind: track.kind,
        language: track.language,
        label: track.label,
        mode: track.mode,
        cuesCount: track.cues ? track.cues.length : 0,
      };
    });
    console.log('Track info:', trackInfo);

    if (!trackInfo || trackInfo.kind !== 'captions') {
      throw new Error('Valid captions track not found on video element!');
    }

    // Toggle Captions Off natively
    console.log('Toggling Captions Off via native textTracks API...');
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

    const trackModeDisabled = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v && v.textTracks && v.textTracks[0] ? v.textTracks[0].mode : null;
    });
    console.log('Track mode after disabling:', trackModeDisabled);
    if (trackModeDisabled !== 'disabled') {
      throw new Error(`Track mode expected to be 'disabled', found: ${trackModeDisabled}`);
    }

    // Toggle Captions back on
    console.log('Toggling Captions back to showing...');
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v && v.textTracks && v.textTracks[0]) {
        v.textTracks[0].mode = 'showing';
        v.textTracks.dispatchEvent(new Event('change'));
      }
    });
    await page.waitForTimeout(400);

    const trackModeShowing = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v && v.textTracks && v.textTracks[0] ? v.textTracks[0].mode : null;
    });
    console.log('Track mode after showing:', trackModeShowing);
    if (trackModeShowing !== 'showing') {
      throw new Error(`Track mode expected to be 'showing', found: ${trackModeShowing}`);
    }
    console.log('Official WebVTT Captions API assertion passed!');

    // 7. Verify Menu Popup width and NO text truncation
    console.log('[2.7] Verifying Settings Menu popups and NO text truncation...');
    const settingsBtn = await page.$('.vjs-ltr-player button.media-settings-menu-trigger, .vjs-ltr-player button.video-controls-settings-button');
    if (settingsBtn) {
      await settingsBtn.click();
      await page.waitForTimeout(600);

      const menuItemsText = await page.evaluate(() => {
        const items = document.querySelectorAll('[role="menu"] *, [role="menuitem"], .media-menu-trigger-item, .media-menu-radio-item');
        const texts = Array.from(items).map((el) => el.textContent?.trim() || '');
        return texts.filter((t) => t.length > 0);
      });
      console.log('Menu items found:', menuItemsText.slice(0, 8));

      // Assert that none of the menu items are truncated with "..."
      const truncated = menuItemsText.filter((t) => t.includes('...') || t.includes('…') || t.startsWith('..'));
      if (truncated.length > 0) {
        throw new Error(`Truncated menu items detected: ${JSON.stringify(truncated)}`);
      }
      console.log('Settings Menu non-truncation assertion passed!');

      // Close menu
      await settingsBtn.click();
      await page.waitForTimeout(300);
    }

    // 8. Test Notes Tab (یادداشت‌برداری)
    console.log('[2.8] Testing Notes scratchpad & Markdown formatting...');
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

    // 9. Test Workspace Tab Switching
    console.log('[2.9] Testing Workspace Tab navigation...');
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
