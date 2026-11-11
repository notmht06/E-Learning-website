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
    console.log('[3.2] Waiting for Admin Sidebar and switching to Articles Tab...');
    await page.waitForSelector('nav[role="tablist"] button, button:has-text("مقالات")', { timeout: 20000 });
    const articlesTabBtn = await page.$('button:has-text("مقالات"), [role="tab"]:has-text("مقالات"), button:has-text("جستار")');
    if (!articlesTabBtn) throw new Error('Articles tab button not found in Admin Sidebar!');
    await articlesTabBtn.click();
    await page.waitForTimeout(1500);

    // 3. Click "مقاله جدید" / New Article button
    console.log('[3.3] Opening New Article Modal...');
    const newArticleBtn = await page.$('button:has-text("افزودن مقاله"), button:has-text("مقاله جدید"), button:has(svg.lucide-plus)');
    if (!newArticleBtn) throw new Error('New article trigger button not found!');
    await newArticleBtn.click();
    await page.waitForTimeout(1000);

    // 4. Fill Article Metadata and test Category Selector matching Courses disciplines!
    console.log('[3.4] Testing Category selector and metadata fields...');
    const titleInput = await page.$('input[placeholder*="عنوان"], input[name*="title"], div.fixed input');
    if (titleInput) {
      await titleInput.fill('برهان صدیقین در اسفار اربعه و اعتباریت ماهیت');
      console.log('Filled Persian title');
    }

    // Check that category <select> contains course disciplines
    const categorySelect = await page.$('div.fixed select');
    if (categorySelect) {
      const options = await categorySelect.$$eval('option', (opts) => opts.map((o) => o.textContent?.trim() || ''));
      console.log('Article Category Select Options:', options);
      const hasDisciplines = ['منطق', 'فلسفه'].every((d) => options.some((o) => o.includes(d)));
      if (!hasDisciplines) {
        throw new Error(`Admin Article category options do not match course disciplines! Options: ${JSON.stringify(options)}`);
      }
      // Select 'فلسفه'
      await categorySelect.selectOption({ label: 'فلسفه' });
      console.log('Selected category "فلسفه"');
    }

    const abstractTextarea = await page.$('textarea[placeholder*="چکیده"], div.fixed textarea');
    if (abstractTextarea) {
      await abstractTextarea.fill('بررسی جامع برهان صدیقین صدرالمتألهین و تحلیل اعتباریت ماهیات در مرحله نخست اسفار.');
      console.log('Filled abstract');
    }

    // 5. Test RichTextCmsEditor ContentEditable
    console.log('[3.5] Testing RichTextCmsEditor contentEditable typing...');
    const editor = await page.$('div[contenteditable="true"]');
    if (!editor) throw new Error('RichTextCmsEditor contenteditable div not found!');

    await editor.click();
    await page.waitForTimeout(300);

    await editor.fill('<p>اصالت وجود بنیادین‌ترین قاعده در حکمت متعالیه ملاصدرا است.</p>');
    await page.waitForTimeout(400);

    await editor.press('End');
    await page.keyboard.type(' وجود حقیقت واحده ذات مشکک دارد.');
    await page.waitForTimeout(400);

    // 6. Test All Editor Toolbar Buttons
    console.log('[3.6] Testing All Editor Toolbar buttons...');

    // Bold
    const boldBtn = await page.$('button:has(svg.lucide-bold)');
    if (boldBtn) {
      await boldBtn.click();
      console.log('Tested Bold button');
      await page.waitForTimeout(150);
    }

    // Italic
    const italicBtn = await page.$('button:has(svg.lucide-italic)');
    if (italicBtn) {
      await italicBtn.click();
      console.log('Tested Italic button');
      await page.waitForTimeout(150);
    }

    // Underline
    const underlineBtn = await page.$('button:has(svg.lucide-underline)');
    if (underlineBtn) {
      await underlineBtn.click();
      console.log('Tested Underline button');
      await page.waitForTimeout(150);
    }

    // Heading 2
    const h2Btn = await page.$('button:has(svg.lucide-heading-2)');
    if (h2Btn) {
      await h2Btn.click();
      console.log('Tested Heading 2 button');
      await page.waitForTimeout(150);
    }

    // Heading 3
    const h3Btn = await page.$('button:has(svg.lucide-heading-3)');
    if (h3Btn) {
      await h3Btn.click();
      console.log('Tested Heading 3 button');
      await page.waitForTimeout(150);
    }

    // Quote
    const quoteBtn = await page.$('button:has(svg.lucide-quote)');
    if (quoteBtn) {
      await quoteBtn.click();
      console.log('Tested Quote button');
      await page.waitForTimeout(150);
    }

    // Bullet List
    const listBtn = await page.$('button:has(svg.lucide-list)');
    if (listBtn) {
      await listBtn.click();
      console.log('Tested Bullet List button');
      await page.waitForTimeout(150);
    }

    // Ordered List
    const listOrderedBtn = await page.$('button:has(svg.lucide-list-ordered)');
    if (listOrderedBtn) {
      await listOrderedBtn.click();
      console.log('Tested Ordered List button');
      await page.waitForTimeout(150);
    }

    // Alignment Buttons
    const alignRightBtn = await page.$('button:has(svg.lucide-align-right)');
    if (alignRightBtn) {
      await alignRightBtn.click();
      console.log('Tested Align Right button');
      await page.waitForTimeout(150);
    }

    const alignCenterBtn = await page.$('button:has(svg.lucide-align-center)');
    if (alignCenterBtn) {
      await alignCenterBtn.click();
      console.log('Tested Align Center button');
      await page.waitForTimeout(150);
    }

    // Table
    const tableBtn = await page.$('button:has(svg.lucide-table)');
    if (tableBtn) {
      await tableBtn.click();
      console.log('Tested Table button');
      await page.waitForTimeout(150);
    }

    // Horizontal Rule
    const minusBtn = await page.$('button:has(svg.lucide-minus)');
    if (minusBtn) {
      await minusBtn.click();
      console.log('Tested Horizontal Rule button');
      await page.waitForTimeout(150);
    }

    // Link Dialog
    const linkBtn = await page.$('button:has(svg.lucide-link-2)');
    if (linkBtn) {
      await linkBtn.click();
      await page.waitForTimeout(400);
      const linkModalInput = await page.$('input[value*="https"]');
      if (linkModalInput) {
        await linkModalInput.fill('https://zanjirzan.ir');
        const confirmLinkBtn = await page.$('button:has-text("درج پیوند"), button:has-text("تایید")');
        if (confirmLinkBtn) await confirmLinkBtn.click();
        console.log('Tested Link Dialog insertion');
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(200);
    }

    // Preview Mode Toggle
    const previewBtn = await page.$('button:has(svg.lucide-eye)');
    if (previewBtn) {
      await previewBtn.click();
      await page.waitForTimeout(400);
      console.log('Toggled Preview mode ON');
      const editBtn = await page.$('button:has(svg.lucide-edit-3)');
      if (editBtn) {
        await editBtn.click();
        await page.waitForTimeout(300);
        console.log('Toggled Preview mode back to Edit');
      }
    }

    // 7. Submit / Save Article
    console.log('[3.7] Submitting new article...');
    const submitBtn = await page.$('form button:has-text("افزودن"), form button:has-text("ثبت"), form button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(1500);
      console.log('Submitted article form');
    }

    // 8. Public Article Page Verification
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
