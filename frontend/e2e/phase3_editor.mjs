import { chromium } from 'playwright';
import { getAuthenticatedSession, injectAuth } from './auth_helper.mjs';

const BASE_URL = 'http://localhost:3000';

async function runPhase3() {
  console.log('=== [PHASE 3] Content Creation & RichText CMS Editor in Admin Panel ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'fa-IR',
  });

  const session = await getAuthenticatedSession('ADMIN');
  console.log('Authenticated session ready for admin:', session.profile.name);

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
    // 1. Navigate to Admin Panel
    console.log('[3.1] Navigating to /admin...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 2. Switch to Articles Tab
    console.log('[3.2] Switching to Articles Tab...');
    const articlesTabBtn = await page.$('button:has-text("مقالات"), button:has-text("رساله‌ها"), [role="tab"]:has-text("مقالات")');
    if (!articlesTabBtn) throw new Error('Articles tab button not found in Admin Sidebar!');
    await articlesTabBtn.click();
    await page.waitForTimeout(1000);

    // 3. Click "مقاله جدید" / New Article button
    console.log('[3.3] Opening New Article Modal...');
    const newArticleBtn = await page.$('button:has-text("مقاله جدید"), button:has-text("افزودن مقاله"), button:has(svg.lucide-plus)');
    if (!newArticleBtn) throw new Error('New article trigger button not found!');
    await newArticleBtn.click();
    await page.waitForTimeout(1000);

    // 4. Fill Article Metadata
    console.log('[3.4] Filling Article form fields...');
    const titleInput = await page.$('input[placeholder*="عنوان"], input[name*="title"], div[role="dialog"] input');
    if (titleInput) {
      await titleInput.fill('برهان صدیقین در اسفار اربعه و اعتباریت ماهیت');
      console.log('Filled Persian title');
    }

    const abstractTextarea = await page.$('textarea[placeholder*="چکیده"], div[role="dialog"] textarea');
    if (abstractTextarea) {
      await abstractTextarea.fill('بررسی جامع برهان صدیقین صدرالمتألهین و تحلیل اعتباریت ماهیات در مرحله نخست اسفار.');
      console.log('Filled abstract');
    }

    // 5. Test RichTextCmsEditor ContentEditable
    console.log('[3.5] Testing RichTextCmsEditor contentEditable typing and caret...');
    const editor = await page.$('div[contenteditable="true"]');
    if (!editor) throw new Error('RichTextCmsEditor contenteditable div not found!');

    await editor.click();
    await page.waitForTimeout(300);

    // Type text into editor
    await editor.fill('<p>اصالت وجود بنیادین‌ترین قاعده در حکمت متعالیه ملاصدرا است.</p>');
    await page.waitForTimeout(400);

    // Append more text to test typing
    await editor.press('End');
    await page.keyboard.type(' وجود حقیقت واحده ذات مشکک دارد.');
    await page.waitForTimeout(400);

    const editorContent = await editor.evaluate((el) => el.innerHTML);
    console.log(`Editor HTML content after typing: "${editorContent}"`);

    // 6. Test Editor Toolbar Buttons
    console.log('[3.6] Testing Editor Toolbar buttons...');

    // Test Bold
    const boldBtn = await page.$('div[role="dialog"] button:has(svg.lucide-bold)');
    if (boldBtn) {
      await boldBtn.click();
      console.log('Clicked Bold button');
      await page.waitForTimeout(200);
    }

    // Test Italic
    const italicBtn = await page.$('div[role="dialog"] button:has(svg.lucide-italic)');
    if (italicBtn) {
      await italicBtn.click();
      console.log('Clicked Italic button');
      await page.waitForTimeout(200);
    }

    // Test Heading 2
    const h2Btn = await page.$('div[role="dialog"] button:has(svg.lucide-heading-2)');
    if (h2Btn) {
      await h2Btn.click();
      console.log('Clicked Heading 2 button');
      await page.waitForTimeout(200);
    }

    // Test Quote
    const quoteBtn = await page.$('div[role="dialog"] button:has(svg.lucide-quote)');
    if (quoteBtn) {
      await quoteBtn.click();
      console.log('Clicked Quote button');
      await page.waitForTimeout(200);
    }

    // Test Bullet List
    const listBtn = await page.$('div[role="dialog"] button:has(svg.lucide-list)');
    if (listBtn) {
      await listBtn.click();
      console.log('Clicked Bullet List button');
      await page.waitForTimeout(200);
    }

    // Test Table
    const tableBtn = await page.$('div[role="dialog"] button:has(svg.lucide-table)');
    if (tableBtn) {
      await tableBtn.click();
      console.log('Clicked Table button');
      await page.waitForTimeout(200);
    }

    // Test Horizontal Rule
    const minusBtn = await page.$('div[role="dialog"] button:has(svg.lucide-minus)');
    if (minusBtn) {
      await minusBtn.click();
      console.log('Clicked Horizontal Rule button');
      await page.waitForTimeout(200);
    }

    // Test Preview Mode Toggle
    const previewBtn = await page.$('div[role="dialog"] button:has(svg.lucide-eye)');
    if (previewBtn) {
      await previewBtn.click();
      await page.waitForTimeout(500);
      console.log('Toggled Preview mode ON');
      const editBtn = await page.$('div[role="dialog"] button:has(svg.lucide-edit-3)');
      if (editBtn) {
        await editBtn.click();
        await page.waitForTimeout(300);
        console.log('Toggled Preview mode back to Edit');
      }
    }

    // 7. Submit / Save Article
    console.log('[3.7] Submitting new article...');
    const submitBtn = await page.$('div[role="dialog"] button:has-text("انتشار"), div[role="dialog"] button:has-text("ثبت"), div[role="dialog"] button:has-text("ذخیره")');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(1500);
      console.log('Submitted article form');
    }

    // Verify modal closes or success toast
    const isModalOpen = await page.isVisible('div[role="dialog"]');
    console.log(`Article modal closed after submission: ${!isModalOpen}`);

    // 8. Public Article Page
    console.log('[3.8] Verifying public /articles page...');
    await page.goto(`${BASE_URL}/articles`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const articlesCards = await page.$$('article, a[href*="/articles/"]');
    console.log(`Found ${articlesCards.length} articles on public page`);

    console.log('=== [PHASE 3 COMPLETE] ===');
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
    console.error('Phase 3 error:', err);
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

runPhase3().then((res) => {
  if (!res.success) {
    process.exit(1);
  }
});
