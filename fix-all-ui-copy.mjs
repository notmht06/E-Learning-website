/**
 * Comprehensive UI Copy & Localization Cleanup Script
 * Fixes awkward translations, technical jargon (AST, 48kHz, 320kbps, FLAC, DRM, AES, LangGraph RAG,
 * "6-digit code" repetition, "Gateway Simulator", Zero-Code CMS, etc.) across:
 * - frontend/src/locales/fa.ts
 * - frontend/src/locales/en.ts
 * - frontend/src/locales/ar.ts
 * - frontend/src/hooks/useAuthForm.ts
 * - frontend/src/app/admin/page.tsx
 * - frontend/src/components/admin/tabs/AdminSettingsTab.tsx
 *
 * Strictly preserves all invariants required by backend/tests/test_i18n_parity.py:
 * 1. Exact key count & key order parity across fa.ts, ar.ts, en.ts
 * 2. Official scholar name in all 3 languages
 * 3. Zero forbidden bureaucratic Persian verbs (میباشد / میگردد / لازم به ذکر است / شایان ذکر است)
 *
 * Usage: node fix-all-ui-copy.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const faReplacements = {
  // 1. Auth & Login Modal (Clean, natural Persian without robotic "6-digit" repetition)
  auth_modal_title: 'ورود یا ثبت‌نام در پایگاه',
  auth_modal_subtitle: 'پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی',
  auth_tab_login: 'ورود به حساب',
  auth_tab_register: 'ثبت‌نام دانش‌پژوه',
  auth_otp_login_mode: 'ورود با رمز یکبارمصرف پیامکی',
  auth_password_login_mode: 'ورود با رمز عبور',
  auth_otp_step_title: 'تأیید شماره تلفن همراه',
  auth_otp_sent_to: 'کد تأیید به شماره {phone} پیامک شد.',
  auth_otp_change_phone: 'ویرایش شماره همراه',
  auth_otp_code_label: 'کد تأیید پیامکی',
  auth_otp_resend_code: 'ارسال دوباره کد تأیید',
  auth_otp_resend_countdown: 'ارسال مجدد تا {time} دیگر',
  auth_otp_verify_btn: 'تأیید و ورود به حساب کاربری',
  auth_otp_verifying: 'در حال بررسی کد تأیید...',
  auth_otp_sending: 'در حال ارسال پیامک...',
  auth_register_otp_submit: 'دریافت کد تأیید و ثبت‌نام',
  auth_otp_invalid_error: 'کد واردشده نادرست است یا مهلت آن به پایان رسیده است.',
  auth_otp_dev_hint: 'کد تایید (محیط توسعه): {code}',
  auth_otp_login_btn: 'دریافت کد تأیید پیامکی',
  auth_or_divider: 'یا',
  auth_name_label: 'نام و نام خانوادگی',
  auth_name_placeholder: 'نام و نام خانوادگی خود را وارد کنید',
  auth_phone_label: 'شماره تلفن همراه',
  auth_phone_placeholder: '۰۹۱۲۳۴۵۶۷۸۹',
  auth_password_label: 'رمز عبور',
  auth_password_placeholder: 'حداقل ۶ کاراکتر',
  auth_confirm_password_label: 'تکرار رمز عبور',
  auth_confirm_password_placeholder: 'رمز عبور را دوباره وارد کنید',
  auth_direct_register: 'ثبت‌نام با رمز عبور ثابت',
  auth_login_submitting: 'در حال ورود به حساب...',
  auth_login_submit_btn: 'ورود به حساب کاربری',
  auth_otp_login_notice: 'کد تأیید یکبارمصرف به شماره همراه شما پیامک می‌شود.',
  auth_step_otp_verify_desc: 'کد ارسال‌شده به تلفن همراه خود را وارد کنید',
  auth_step_login_desc: 'ورود به میز مطالعه و دوره‌های ثبت‌نامی',
  auth_step_register_desc: 'ایجاد حساب کاربری برای شرکت در دوره‌ها و دریافت جزوات',
  auth_back_to_home: 'بازگشت به صفحه اصلی',
  auth_close_modal: 'بستن پنجره',
  auth_otp_mock_server_label: 'کد آزمایشی: ',
  auth_otp_fill_mock_btn: 'درج خودکار کد',
  auth_otp_resend_prefix: 'ارسال مجدد تا: ',
  auth_otp_sms_validation_tag: 'تأیید پیامکی',
  auth_otp_student_prefix: 'دانش‌پژوه: ',
  auth_otp_sent_prefix: 'کد تأیید به شماره ',
  auth_otp_sent_suffix: ' ارسال شد.',
  login_title: 'ورود به پایگاه حجت الاسلام دکتر زنجیر زن حسینی',
  login_sub: 'دسترسی به دوره‌های ثبت‌نام‌شده و میز مطالعه',
  login_phone_label: 'شماره تلفن همراه:',
  login_send_otp_btn: 'دریافت کد تأیید پیامکی',
  login_otp_label: 'کد تأیید پیامکی:',
  login_verify_btn: 'تأیید و ورود به میز مطالعه',
  login_quick_roles: 'ورود سریع:',
  login_role_student: 'ورود دانش‌پژوه',
  login_role_admin: 'ورود مدیر سایت',

  // 2. Remove Technical Jargon (AST, 48kHz, 320kbps, FLAC, DRM, AES, LangGraph RAG, Zero-Code CMS)
  hero_folio_stamp: 'پایگاه رسمی نشر آثار و دروس حجت الاسلام دکتر زنجیر زن حسینی',
  hero_book_format: 'قطع وزیری • چاپ و صفحه‌آرایی پژوهشی',
  hero_book_paper: 'جلد گالینگور با کاغذ بالک کرم مخصوص مطالعه',
  player_mastered_badge: 'ضبط رسمی جلسه',
  player_audio_quality_badge: 'صوت باکیفیت جلسه درس',
  player_drm_protected_badge: 'پخش اختصاصی دانش‌پژوهان',
  player_mode_audio: 'پخش صوتی جلسه',
  player_mode_video: 'پخش تصویری جلسه',
  ongoing_audio_badge: 'صوت کامل جلسه',
  table_audio_mastered_tag: 'ضبط رسمی',
  dash_metric_quality: 'کیفیت عالی پخش',
  dash_studio_quality_badge: 'صوت درس',
  admin_online_aes: 'نشست فعال',
  admin_drm_status: 'پخش زنده:',
  admin_kpi_courses_sub: 'دوره‌های فعال آموزشی',
  admin_kpi_drm_title: 'نشست‌های پخش فعال',
  admin_kpi_drm_sub: 'دانشجویان در حال مشاهده درس',
  admin_drm_title: 'نظارت بر نشست‌های پخش جلسات',
  admin_drm_desc: 'مدیریت دسترسی‌ها و نشست‌های فعال دانشجویان در دوره‌ها',
  admin_tab_drm: 'نشست‌های پخش',
  admin_tab_media: 'رسانه و جلسات',
  admin_courses_studio_desc: 'مدیریت فایل‌های صوتی و تصویری، زمان جلسه و پیش‌نمایش رایگان',
  admin_courses_studio_btn_upload_audio: 'آپلود فایل صوتی یا ویدیویی جلسه',
  admin_media_banner_title: 'مدیریت رسانه، زیرنویس جلسات و حافظه دستیار هوشمند',
  admin_media_banner_desc: 'آپلود متن و زیرنویس جلسات برای پاسخگویی دقیق دستیار هوشمند به دانشجویان',
  admin_media_rag_title: 'افزودن متن جلسه یا جزوه به حافظه دستیار هوشمند',
  admin_media_btn_ingest: 'ثبت در حافظه هوشمند دوره',
  admin_settings_title: 'تنظیمات عمومی پایگاه و محتوای صفحات',
  discourse_subtitle: 'پخش آنلاین جلسات درس با تفکیک موضوعی و زیرنویس همگام',
  discourse_drm_label: 'پخش رسمی دروس پایگاه حجت الاسلام دکتر زنجیر زن حسینی',
  guard_benefit_1: 'دسترسی دائمی به فایل‌های صوتی، تصویری و جزوات مکتوب دوره',
  learn_attachment_audio_master: 'فایل صوتی کامل جلسه (قابل دانلود)',
  learn_attachment_pdf_handout: 'جزوه مکتوب و خلاصه جلسه (PDF)',
  learn_attachment_concept_map: 'نمودار درختی مباحث و استدلال‌های جلسه',
  ui_high_fidelity_audio_stream_remastered_: 'فایل صوتی کامل و پالایش‌شده جلسه درس.',
  ui_45_mb_mp3_320kbps: 'فایل صوتی MP3',
  ui_comprehensive_textual_monograph_includ: 'جزوه و تقریر مکتوب جلسه به همراه عبارات عربی و نکات کلیدی.',
  ui_18_pages_pdf_3_4_mb: 'فایل جزوه PDF',
  ui_dialectical_ast_concept_graph_detailin: 'نمودار ساختار استدلال‌ها و ارتباط مقدمات بحث در این جلسه.',
  ui_a3_sheet_vector_svg: 'نمودار آموزشی جلسه',
  ui_forensic_watermark: 'حفاظت حساب کاربری',
  ui_two_factor_auth: 'تأیید دو مرحله‌ای پیامکی',
  ui_active_via_mobile_otp: 'فعال با پیامک تلفن همراه',
  ai_tutor_title: 'دستیار هوشمند پاسخگویی به سؤالات درسی',
  dash_tab_ai: 'دستیار هوشمند دوره‌ها',
  checkout_gateway_title: 'درگاه پرداخت اینترنتی شاپرک',
};

const arReplacements = {
  hero_folio_stamp: 'الموقع الرسمي لنشر آثار ودروس حجة الإسلام الدكتور زنجير زن حسيني',
  hero_book_paper: 'تجليد فني فاخر • ورق بالک أصفر مخصص للقراءة',
  player_mastered_badge: 'تسجيل رسمي للدرس',
  player_audio_quality_badge: 'صوت عالي الدقة للدرس',
  player_drm_protected_badge: 'بث مخصص للطلاب المسجلين',
  player_mode_audio: 'استماع إلى الدرس',
  ongoing_audio_badge: 'صوت كامل للدرس',
  table_audio_mastered_tag: 'تسجيل رسمي',
  dash_metric_quality: 'جودة بث ممتازة',
  admin_kpi_courses_sub: 'دورات تعليمية نشطة',
  admin_drm_title: 'مراقبة جلسات بث الدروس',
  admin_courses_studio_desc: 'إدارة ملفات الصوت والمدة وحالة العرض المجاني',
  admin_courses_studio_btn_upload_audio: 'رفع ملف صوتي أو مرئي للدرس',
  admin_media_banner_title: 'إدارة وسائط الدروس والترجمة وذاكرة المساعد الذكي',
  discourse_subtitle: 'استماع إلى دروس الدورة مع تبويب الفصول وترجمة متزامنة',
  guard_benefit_1: 'وصول دائم لملفات الصوت والتقريرات المكتوبة',
  learn_attachment_audio_master: 'التسجيل الصوتي الكامل للدرس',
  learn_attachment_concept_map: 'مخطط هيكلي لمباحث الدرس',
  ui_dialectical_ast_concept_graph_detailin: 'مخطط شجري لتفاصيل الاستدلالات وتدفق المباحث في هذا الدرس.',
  ui_a3_sheet_vector_svg: 'مخطط الدرس التعليمي',
  ui_forensic_watermark: 'حماية حساب المستخدم',
  ui_two_factor_auth: 'التحقق الثنائي عبر الرسائل',
  ui_active_via_mobile_otp: 'مفعل برمز الرسائل القصيرة',
  ai_tutor_title: 'المساعد العلمي الذكي للإجابة عن الأسئلة',
  dash_tab_ai: 'المساعد الذكي للدورات',
  admin_settings_title: 'الإعدادات العامة للنظام وإدارة المحتوى',
  checkout_gateway_title: 'بوابة الدفع الإلكتروني المصرفي',
  ui_45_mb_mp3_320kbps: '٤٥ ميغابايت • ملف صوتي عالي الدقة',
};

const enReplacements = {
  hero_folio_stamp: 'Official Demonstrative Wisdom Portal of Hujjat al-Islam Dr. Zanjirzan Hosseini',
  hero_book_paper: 'Cream Reading Bulk Paper • Gold-stamped Hardcover',
  auth_otp_login_mode: 'Sign In with SMS Passcode',
  auth_otp_code_label: 'SMS Verification Code',
  auth_otp_verify_btn: 'Verify & Sign In',
  auth_register_otp_submit: 'Send Verification Code & Register',
  auth_direct_register: 'Register with a password',
  auth_login_submit_btn: 'Sign In to Account',
  player_mastered_badge: 'Official Lecture Recording',
  player_audio_quality_badge: 'High-Clarity Lecture Audio',
  player_drm_protected_badge: 'Authenticated Student Stream',
  player_mode_audio: 'Official Lecture Audio',
  ongoing_audio_badge: 'Full Lecture Audio',
  table_audio_mastered_tag: 'Official Audio',
  dash_metric_quality: 'High-Quality Audio Stream',
  admin_kpi_courses_sub: 'Active Learning Curricula',
  admin_drm_title: 'Lecture Stream & Playback Supervision',
  admin_courses_studio_desc: 'Manage lecture audio & video files, duration, and free preview status',
  admin_courses_studio_btn_upload_audio: 'Upload Lecture Audio or Video File',
  admin_media_banner_title: 'Lecture Media, Subtitles & AI Scholarly Memory Management',
  discourse_subtitle: 'Listen to verified lecture recordings with chapter segmentation and synchronized subtitles',
  guard_benefit_1: 'Lifetime access to audio recordings and detailed lecture monographs',
  learn_attachment_audio_master: 'Full Lecture Audio Recording',
  learn_attachment_concept_map: 'Lecture Concept Hierarchy & Argument Tree',
  ui_dialectical_ast_concept_graph_detailin: 'Conceptual diagram detailing premise dependencies and logical flow of the lecture.',
  ui_a3_sheet_vector_svg: 'Lecture Concept Diagram',
  ui_forensic_watermark: 'Account Integrity Protection',
  ui_two_factor_auth: 'SMS Two-Factor Verification',
  ui_active_via_mobile_otp: 'Active via Mobile SMS OTP',
  ai_tutor_title: 'Course AI Scholarly Assistant',
  dash_tab_ai: 'Course AI Assistant',
  admin_settings_title: 'General Platform & Content Settings',
  checkout_gateway_title: 'Official Online Banking Gateway',
  ui_45_mb_mp3_320kbps: '45 MB • High-Fidelity Audio File',
};

function updateLocaleFile(relPath, replacements) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;

  for (const [key, newVal] of Object.entries(replacements)) {
    const escapedVal = newVal.replace(/'/g, "\\'");
    const regex = new RegExp(`(^\\s*${key}\\s*:\\s*)(['"\`])([\\s\\S]*?)\\2(\\s*,?)`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `$1'${escapedVal}'$4`);
      count++;
    }
  }

  // Ensure zero forbidden bureaucratic Persian verbs in fa.ts
  if (relPath.endsWith('fa.ts')) {
    content = content
      .replace(/میباشد/g, 'است')
      .replace(/می باشد/g, 'است')
      .replace(/میباشند/g, 'هستند')
      .replace(/می باشند/g, 'هستند')
      .replace(/میگردد/g, 'میشود')
      .replace(/لازم به ذکر است/g, 'شایان توجه است')
      .replace(/شایان ذکر است/g, 'قابل توجه است');
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`[UI-COPY] Updated ${count} keys in ${relPath}`);
}

updateLocaleFile('frontend/src/locales/fa.ts', faReplacements);
updateLocaleFile('frontend/src/locales/ar.ts', arReplacements);
updateLocaleFile('frontend/src/locales/en.ts', enReplacements);

// Clean validation & error messages in frontend/src/hooks/useAuthForm.ts
const authHookPath = path.join(ROOT, 'frontend/src/hooks/useAuthForm.ts');
if (fs.existsSync(authHookPath)) {
  let hookCode = fs.readFileSync(authHookPath, 'utf8');
  hookCode = hookCode
    .replace('لطفاً شماره تلفن همراه را وارد کنید.', 'شماره تلفن همراه را وارد کنید.')
    .replace('شماره تماس باید ۱۱ رقم و با ۰۹ آغاز شود.', 'شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.')
    .replace('لطفاً کلمه عبور را وارد کنید.', 'کلمه عبور را وارد کنید.')
    .replace('کلمه عبور باید حداقل ۶ نویسه باشد.', 'کلمه عبور باید حداقل ۶ کاراکتر باشد.')
    .replace('لطفاً نام و نام خانوادگی خود را وارد کنید.', 'نام و نام خانوادگی خود را وارد کنید.')
    .replace('تکرار کلمه عبور با کلمه عبور اصلی همخوانی ندارد.', 'تکرار کلمه عبور با رمز عبور اصلی همخوانی ندارد.')
    .replace('شماره تماس یا کلمه عبور وارد شده نادرست است.', 'شماره تلفن همراه یا رمز عبور نادرست است.')
    .replace('این شماره تماس قبلاً در سامانه ثبت شده است. لطفاً وارد شوید.', 'این شماره قبلاً در سامانه ثبت شده است. وارد شوید.')
    .replace(/میباشد/g, 'است')
    .replace(/میگردد/g, 'میشود');
  fs.writeFileSync(authHookPath, hookCode, 'utf8');
  console.log('[UI-COPY] Cleaned validation messages in frontend/src/hooks/useAuthForm.ts');
}

// Clean hardcoded technical labels in TSX files
const adminPagePath = path.join(ROOT, 'frontend/src/app/admin/page.tsx');
if (fs.existsSync(adminPagePath)) {
  let adminCode = fs.readFileSync(adminPagePath, 'utf8');
  adminCode = adminCode
    .replace("settings: 'تنظیمات کلان و پویای سامانه (Zero-Code CMS)'", "settings: 'تنظیمات سراسری سامانه'")
    .replace("settings: 'الإعدادات العامة للنظام (Zero-Code CMS)'", "settings: 'الإعدادات العامة للنظام'")
    .replace("settings: 'Site Configuration (Zero-Code CMS)'", "settings: 'Platform Settings'");
  fs.writeFileSync(adminPagePath, adminCode, 'utf8');
  console.log('[UI-COPY] Cleaned Zero-Code CMS in frontend/src/app/admin/page.tsx');
}

const adminSettingsPath = path.join(ROOT, 'frontend/src/components/admin/tabs/AdminSettingsTab.tsx');
if (fs.existsSync(adminSettingsPath)) {
  let settingsCode = fs.readFileSync(adminSettingsPath, 'utf8');
  settingsCode = settingsCode.replace(
    'تنظیمات سراسری پایگاه و سامانه مدیریت محتوا (Zero-Code CMS)',
    'تنظیمات سراسری پایگاه و سامانه مدیریت محتوا'
  );
  fs.writeFileSync(adminSettingsPath, settingsCode, 'utf8');
  console.log('[UI-COPY] Cleaned Zero-Code CMS in frontend/src/components/admin/tabs/AdminSettingsTab.tsx');
}

console.log('\nAll UI microcopy, auth forms, and technical jargon successfully cleaned and standardized!');
