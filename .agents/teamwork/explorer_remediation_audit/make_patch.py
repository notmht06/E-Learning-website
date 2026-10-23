import os
import sys
import difflib

# 1. Read DashboardOverviewTab.tsx
with open('frontend/src/components/dashboard/DashboardOverviewTab.tsx', 'r', encoding='utf-8') as f:
    orig_tab = f.read()

target_tab_chunk = """    const currentChapter = c.chapters && c.chapters[completed - 1]
      ? (currentLang === 'en' && c.chapters[completed - 1].title_en ? c.chapters[completed - 1].title_en : c.chapters[completed - 1].title_fa)
      : (currentLang === 'en' ? `Session ${completed}: Principles` : `جلسه ۰${completed}: مبادی و احکام`);"""

repl_tab_chunk = """    const chapterObj = c.chapters?.[completed - 1];
    const currentChapter: string =
      (currentLang === 'en' ? chapterObj?.title_en : currentLang === 'ar' ? chapterObj?.title_ar : chapterObj?.title_fa) ||
      chapterObj?.title_fa ||
      (currentLang === 'en'
        ? `Session ${completed}: Principles`
        : currentLang === 'ar'
        ? `الجلسة ٠${completed}: المبادئ والأحكام`
        : `جلسه ۰${completed}: مبادی و احکام`);"""

assert target_tab_chunk in orig_tab, "target_tab_chunk not found"
new_tab = orig_tab.replace(target_tab_chunk, repl_tab_chunk, 1)

# 2. Read data.ts
with open('frontend/src/lib/data.ts', 'r', encoding='utf-8') as f:
    orig_data = f.read()

lines = orig_data.splitlines(keepends=True)

fa_del = {2589, 2590, 2592, 2593, 2594, 2596, 2599, 2600, 2602, 2603, 2604, 2605, 2606, 2698, 2713, 2714}
ar_del = {3257, 3258, 3260, 3261, 3262, 3264, 3267, 3268, 3270, 3271, 3272, 3273, 3274, 3366, 3381, 3382}
en_del = {3925, 3926, 3928, 3929, 3930, 3932, 3935, 3936, 3938, 3939, 3940, 3941, 3942, 4034, 4049, 4050}
all_del = fa_del | ar_del | en_del

line_updates = {
    # fa dash_tabs
    2335: "    dash_tab_overview: 'میز کار پژوهشی',\n",
    2336: "    dash_tab_courses: 'درس‌گفتارهای من',\n",
    2337: "    dash_tab_books: 'کتابخانه و مونوگراف‌ها',\n",
    2338: "    dash_tab_notes: 'یادداشت‌ها و حواشی',\n",
    2340: "    dash_tab_orders: 'سفارش‌های پستی',\n",
    2341: "    dash_tab_certificates: 'گواهی‌نامه‌های علمی',\n",
    # fa learn_tabs
    2444: "    learn_tab_qa: 'پرسش‌ها و مباحثات علمی',\n",
    2445: "    learn_tab_handouts: 'تقریرات و جزوات درسی',\n",
    # fa admin_tabs
    2501: "    admin_tab_stats: 'آمار و هوش تجاری',\n",
    2502: "    admin_tab_courses: 'مدیریت درس‌گفتارها',\n",
    2503: "    admin_tab_books: 'انبار و کتب چاپی',\n",
    2504: "    admin_tab_orders: 'سفارش‌ها و مرسولات',\n",
    2505: "    admin_tab_drm: 'نظارت بر امنیت DRM',\n",
    2506: "    admin_tab_coupons: 'کدهای تخفیف و کوپن',\n",
    2507: "    admin_tab_media: 'صف پالایش صوت ۴۸kHz',\n",
    # ar dash_tabs
    3003: "    dash_tab_overview: 'لوحة المتابعة',\n",
    3004: "    dash_tab_courses: 'دوراتي ومحاضراتي',\n",
    3005: "    dash_tab_books: 'المكتبة والمونوغرافات',\n",
    3006: "    dash_tab_notes: 'الملاحظات والتعليقات',\n",
    3008: "    dash_tab_orders: 'الطلبات البريدية',\n",
    3009: "    dash_tab_certificates: 'الشهادات العلمية',\n",
    # ar learn_tabs
    3112: "    learn_tab_qa: 'الأسئلة والمباحثات العلمية',\n",
    3113: "    learn_tab_handouts: 'التقريرات والكراريس الدراسية',\n",
    # ar admin_tabs
    3169: "    admin_tab_stats: 'الإحصاءات والتقارير',\n",
    3170: "    admin_tab_courses: 'إدارة الدروس الصوتية',\n",
    3171: "    admin_tab_books: 'المطبوعات والمستودع',\n",
    3172: "    admin_tab_orders: 'الطلبات البريدية',\n",
    3173: "    admin_tab_drm: 'أمن البث وحماية DRM',\n",
    3174: "    admin_tab_coupons: 'قسائم الخصم',\n",
    3175: "    admin_tab_media: 'قائمة معالجة الصوت',\n",
    # en dash_tabs
    3671: "    dash_tab_overview: 'Overview',\n",
    3673: "    dash_tab_books: 'Library & Monographs',\n",
    3674: "    dash_tab_notes: 'Study Notes',\n",
    3676: "    dash_tab_orders: 'Orders',\n",
    3677: "    dash_tab_certificates: 'Certificates',\n",
    # en learn_tabs
    3781: "    learn_tab_handouts: 'Lecture Transcripts & Handouts',\n",
    # en admin_tabs
    3837: "    admin_tab_stats: 'Analytics & Stats',\n",
    3838: "    admin_tab_courses: 'Course Studio',\n",
    3839: "    admin_tab_books: 'Books & Inventory',\n",
    3840: "    admin_tab_orders: 'Orders Management',\n",
    3841: "    admin_tab_drm: 'DRM Security',\n",
    3842: "    admin_tab_coupons: 'Coupons',\n",
    3843: "    admin_tab_media: 'Media & Audio Queue',\n"
}

new_data_lines = []
for idx, line in enumerate(lines, 1):
    if idx in all_del:
        continue
    if idx in line_updates:
        new_data_lines.append(line_updates[idx])
    else:
        new_data_lines.append(line)

new_data = ''.join(new_data_lines)

# Generate diffs
diff_tab = list(difflib.unified_diff(
    orig_tab.splitlines(keepends=True),
    new_tab.splitlines(keepends=True),
    fromfile='a/frontend/src/components/dashboard/DashboardOverviewTab.tsx',
    tofile='b/frontend/src/components/dashboard/DashboardOverviewTab.tsx'
))

diff_data = list(difflib.unified_diff(
    orig_data.splitlines(keepends=True),
    new_data.splitlines(keepends=True),
    fromfile='a/frontend/src/lib/data.ts',
    tofile='b/frontend/src/lib/data.ts'
))

patch_text = ''.join(diff_tab) + ''.join(diff_data)
patch_path = '.agents/teamwork/explorer_remediation_audit/remediation.patch'

with open(patch_path, 'w', encoding='utf-8') as f:
    f.write(patch_text)

print(f"Generated patch {patch_path}: {len(patch_text)} bytes")
