## 2026-10-07T04:03:38Z
You are an Explorer subagent for the Next.js Frontend PWA & Enterprise i18n / Clean Architecture Restructure project.
Your identity: explorer_survey_i18n_1
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_i18n_1

MANDATORY FIRST STEP:
Read e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (especially the Follow-up section from 2026-10-07T03:59:53Z).
Also read e:\personal\philosophy_zanjirzan_app\.agents\rules\persian-writing.md and e:\personal\philosophy_zanjirzan_app\.agents\rules\scholar-identity.md.

TASK:
Investigate Enterprise i18n Architecture (Requirement R2 and acceptance criteria):
- Check frontend/src/context/LanguageContext.tsx and how languages ('fa', 'ar', 'en') and direction ('rtl', 'ltr') are managed.
- Check frontend/src/lib/data.ts (inspect the existing i18nDict, dictionary size, and structure).
- Audit all pages and components in frontend/src/ that consume translations (useLanguage, i18nDict, etc.).
- Design the enterprise i18n folder structure:
  - Dedicated directory: e.g. frontend/src/locales/ or frontend/src/messages/
  - Strict dictionary files: fa.ts, en.ts, ar.ts.
  - TypeScript type-safety: Define a strongly-typed Dictionary type or TranslationKey type such that keys in fa.ts, en.ts, and ar.ts are type-checked at compile-time and missing keys in any language are caught by TypeScript.
  - Easy feature additions and seamless integration with LanguageContext (e.g. t(key) helper function or typed dict accessor).
  - Ensure zero loss of any of the existing ~611 keys, and strict adherence to Persian writing rules (no «می‌باشد», proper ZWNJ, Persian numbers) and official scholar identity («حجت الاسلام دکتر زنجیر زن حسینی»).

Deliver a structured exploration report to:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_i18n_1\report.md

When finished, send a message to orchestrator_2 (parent) with a summary and the path to your report.
