# Comprehensive Analysis Report: Dashboard & Admin Shell Redesign

**Platform**: پایگاه رسمی نشر آثار حجت الاسلام دکتر زنجیر زن حسینی  
**Module**: `/dashboard` and `/admin` Redesign Survey & Modularization (R2, R4, R5)  
**Author**: Explorer 2 (`explorer_survey_admin_dashboard`)  
**Date**: 2026-09-30  

---

## ۱. Executive Summary (چکیده اجرایی)

This investigation provides an exhaustive architectural survey of the student dashboard (`/dashboard`) and administrative console (`/admin`) within the Philosophy Zanjirzan application. 

The primary objectives of Requirement **R2** (in conjunction with **R4** and **R5**) are:
1. **Deconstruct monolithic shell pages** (`admin/page.tsx`, `dashboard/page.tsx`, and their embedded tab components) into modular, reusable components.
2. **Build a clean 4-card KPI metric strip** with soft-colored circular icon wrappers (`bg-amber-50 text-amber-500` or theme equivalents) and bold tabular figures.
3. **Build a minimalist vertical bar chart** with rounded tops (`rounded-t-md`) to replace complex legacy spline charts.
4. **Build an "Ongoing Courses" table** using thin progress pill tracks (`w-24 h-1.5 bg-zinc-100` filled with `#8A532B`) and compact rows.
5. **Enforce design system constraints (R4)**: 4px spacing scale (`p-1` to `p-8`), `text-2xl` heading ceiling, warm paper/deep obsidian contrast (`#FAF8F5` / `#0C0D0E`), terracotta accent (`#8A532B` / `#C58B43`), 100% Tailwind logical properties, strict scholar identity («حجت الاسلام دکتر زنجیر زن حسینی»), and zero AI slop.
6. **Enforce full trilingual localization (R5)**: Arabic (`ar`), Persian (`fa`), and English (`en`) via `LanguageContext` and `i18nDict`.

---

## ۲. Existing Codebase Audit & Monolithic Patterns

### ۲.۱ Inventory of Existing Files

| Path | Lines | Role | Key Findings & Monolithic Anti-Patterns |
| :--- | :---: | :--- | :--- |
| `frontend/src/app/dashboard/page.tsx` | 123 | Student Shell Page | Duplicates authentication gate card, sidebar collapse state, and hardcoded Persian tab titles. |
| `frontend/src/app/admin/page.tsx` | 101 | Admin Shell Page | Shares ~85% structural code with `dashboard/page.tsx`. Duplicates auth gate, sidebar state, tab titles. |
| `frontend/src/components/dashboard/DashboardHeader.tsx` | 43 | Dashboard Header | Static header, lacks language switcher, hardcoded text. |
| `frontend/src/components/dashboard/DashboardSidebar.tsx` | 123 | Dashboard Sidebar | Duplicates sidebar collapse, navigation loop, and footer links with `AdminSidebar.tsx`. |
| `frontend/src/components/dashboard/tabs/DashboardOverviewTab.tsx` | 109 | Student Overview | Handcrafted 4-card KPI grid without a reusable component; square icon wrappers instead of circular; lacks Ongoing Courses table (only has single first course banner); lacks study activity chart. |
| `frontend/src/components/dashboard/tabs/DashboardCoursesTab.tsx` | 86 | Student Courses | Renders big cards grid instead of the compact ongoing table requested for dashboard overview. |
| `frontend/src/components/dashboard/tabs/DashboardBooksTab.tsx` | 76 | Student Books | Card grid for reading monographs with 3D reader modal launcher. |
| `frontend/src/components/dashboard/tabs/DashboardNotesTab.tsx` | 189 | Study Notes | Inline modal form and notes list. |
| `frontend/src/components/dashboard/tabs/DashboardOrdersTab.tsx` | 77 | Book Orders | Orders table with tracking link. |
| `frontend/src/components/dashboard/tabs/DashboardCertificatesTab.tsx` | 77 | Certificates | Certificate cards with window print. |
| `frontend/src/components/dashboard/tabs/DashboardSupportTab.tsx` | 139 | Scholarly Q&A | Inline Q&A form and inquiry history. |
| `frontend/src/components/admin/AdminHeader.tsx` | 45 | Admin Header | Near duplicate of `DashboardHeader.tsx`. |
| `frontend/src/components/admin/AdminSidebar.tsx` | 128 | Admin Sidebar | Near duplicate of `DashboardSidebar.tsx`. |
| `frontend/src/components/admin/tabs/AdminStatsTab.tsx` | 154 | Admin BI & Stats | Duplicates 4-card KPI grid from `DashboardOverviewTab.tsx`; embeds 420-line `AdminCharts.tsx`. |
| `frontend/src/components/AdminCharts.tsx` | 420 | Legacy Analytics Chart | Monolithic SVG spline/bezier curve line chart; contains hardcoded data and stone-* palette; lacks the minimalist vertical bar chart with `rounded-t-md` tops mandated by R2. |
| `frontend/src/components/admin/tabs/AdminCoursesTab.tsx` | 456 | Course Studio | Severely bloated monolithic tab (456 lines) mixing course CRUD, search, chapter studio modal, audio uploader modal, and table. |
| `frontend/src/components/admin/tabs/AdminBooksTab.tsx` | 254 | Book Inventory | Combines search, new book modal form, and book table. |
| `frontend/src/components/admin/tabs/AdminOrdersTab.tsx` | 213 | Orders Management | Combines search, filter dropdown, orders table, and print slip modal. |
| `frontend/src/components/admin/tabs/AdminCategoriesTab.tsx` | 182 | Categories CRUD | Taxonomy grid and modal form. |
| `frontend/src/components/admin/tabs/AdminDrmTab.tsx` | 114 | DRM Sessions | DRM live monitoring and token revocation table. |
| `frontend/src/components/admin/tabs/AdminCouponsTab.tsx` | 165 | Discount Codes | Coupon table and creation modal. |
| `frontend/src/components/admin/tabs/AdminMediaTab.tsx` | 172 | Audio Queue | 48kHz audio processing queue. |

### ۲.۲ Specific Deficiencies Against R2 Requirements

1. **Missing Reusable `KpiMetricStrip`**:
   - Both `DashboardOverviewTab` and `AdminStatsTab` write inline JSX for 4 KPI cards.
   - The existing cards use squircle boxes (`rounded-xl bg-[#8A532B]/10`) rather than the **soft-colored circular icon wrappers (`bg-amber-50 text-amber-500` or theme equivalents)** required by R2.
2. **Missing `MinimalistBarChart`**:
   - `AdminCharts.tsx` renders a complex 420-line SVG spline/bezier line chart with area gradients.
   - Requirement R2 explicitly specifies: **"Add a minimalist vertical bar chart with rounded tops (`rounded-t-md`)."** This component is currently completely absent.
3. **Missing "Ongoing Courses" Table**:
   - `DashboardOverviewTab` only features a single card for `firstCourse` ("Continue Learning Console").
   - Requirement R2 mandates: **"Create an 'Ongoing Courses' table using thin progress pill tracks (`w-24 h-1.5 bg-zinc-100` filled with `#8A532B`) and compact rows."** This is currently missing.
4. **Duplicated Shell Layout**:
   - `dashboard/page.tsx` and `admin/page.tsx` maintain duplicated sidebar collapse toggling, access gates, and layout code instead of utilizing a unified `ShellLayout`.
5. **Incomplete Localization (R5)**:
   - Tab titles and section headers in both shells are hardcoded Persian strings in `page.tsx` and tab components. When switching to Arabic or English, the shells remain in Persian.

---

## ۳. Requirements Analysis for R2

### ۳.۱ Modular Shell Architecture (`ShellLayout`)

To eliminate duplication between `/dashboard` and `/admin`, a unified shell layout component (`src/components/shell/ShellLayout.tsx`) should be extracted.

**Responsibilities**:
- **Sidebar Management**: Responsive collapsible sidebar (expanded: `w-64`, collapsed: `w-16`, mobile: slide-out overlay).
- **Sticky Header**: Unified header displaying current tab title, official scholar credentials («حجت الاسلام دکتر زنجیر زن حسینی»), language switcher, and user profile badge.
- **Authentication / Authorization Gate**: If user is unauthenticated or unauthorized (e.g., student accessing admin), render a clean `ShellAuthGate` card without code duplication.
- **Tab State Synchronization**: Clean tab switching with accessibility attributes (`role="tablist"`, `aria-selected`).

### ۳.۲ Clean 4-Card KPI Metric Strip (`KpiMetricStrip`)

**Visual & Functional Specification**:
- **Grid Layout**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Card Surface**: `bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-colors`.
- **Serial Tag**: `text-[11px] font-mono text-zinc-400 block font-num` (e.g. `[ ۰۱ ] دوره‌های فعال`).
- **Bold Tabular Value**: `text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-num tabular-nums tracking-tight block mt-0.5`.
- **Contextual Sublabel**: `text-[11px] text-zinc-500 dark:text-zinc-400 block line-clamp-1 mt-0.5`.
- **Soft-Colored Circular Icon Wrapper**:
  - Exact class: `w-10 h-10 rounded-full flex items-center justify-center shrink-0` (strictly circular via `rounded-full`).
  - Color palettes (soft pastels):
    - Amber/Umber: `bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400`
    - Terracotta: `bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/15 dark:text-[#C58B43]`
    - Emerald/Sage: `bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400`
    - Slate/Blue: `bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400`
- **Props Contract**:
  ```typescript
  export interface KpiMetricItem {
    id: string;
    serial: string;              // e.g. '[ ۰۱ ]'
    title: string;               // e.g. 'دوره‌های فعال'
    value: string | number;      // e.g. '۲ دوره' or 2
    sublabel?: string;           // e.g. 'شرح اسفار و منطق'
    icon: React.ElementType;     // Lucide icon
    colorClass: string;          // e.g. 'bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400'
    trend?: {
      value: string;             // e.g. '+۱۸.۴٪'
      isPositive: boolean;
    };
  }

  export interface KpiMetricStripProps {
    metrics: KpiMetricItem[];
    className?: string;
  }
  ```

### ۳.۳ Minimalist Vertical Bar Chart (`MinimalistBarChart`)

**Visual & Functional Specification**:
- **Design Philosophy**: Minimal, editorial, high information density, zero clutter.
- **Top of Bars**: Must have rounded tops using `rounded-t-md` and flat bottoms `rounded-b-none`.
- **Bar Dimensions**: Flexible proportional height `style={{ height: `${(item.value / maxValue) * 100}%` }}` with minimum height `min-h-[4px]`. Bar width `w-6 sm:w-8 md:w-10`.
- **Coloring**: Warm accent `#8A532B` (light mode) / `#C58B43` (dark mode) with subtle hover shift `hover:bg-[#724320] dark:hover:bg-[#B27833]`.
- **Background Guides**: 3 to 4 dashed horizontal guide lines (`border-b border-dashed border-zinc-200/80 dark:border-zinc-800/80`).
- **Interactive Tooltip**: Absolute-positioned floating pill displaying exact Persian/tabular numbers upon hover without jitter.
- **X-Axis Labels**: `text-[10px] sm:text-xs font-mono text-zinc-500 dark:text-zinc-400 font-num text-center mt-2`.
- **Filter Controls**: Minimalist tab strip for time intervals (`امروز`, `۷ روز`, `۳۰ روز` / `Today`, `7 Days`, `30 Days`).
- **Props Contract**:
  ```typescript
  export interface BarChartDataPoint {
    id: string;
    label: string;               // e.g. 'شنبه', 'یکشنبه', ... or hourly '۰۰:۰۰'
    value: number;               // Numerical value
    formattedValue?: string;     // Formatted display value with unit
    sublabel?: string;
  }

  export interface MinimalistBarChartProps {
    title: string;
    subtitle?: string;
    data: BarChartDataPoint[];
    timeRanges?: { id: string; label: string }[];
    activeTimeRange?: string;
    onTimeRangeChange?: (rangeId: string) => void;
    metricUnit?: string;
    className?: string;
  }
  ```

### ۳.۴ "Ongoing Courses" Table (`OngoingCoursesTable`)

**Visual & Functional Specification**:
- **Container**: `overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] shadow-xs`.
- **Header Row**: `border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]`.
- **Compact Data Rows**: `py-2.5 px-4` or `py-3 px-4`, clean 1px division, `hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors`.
- **Columns**:
  1. **عنوان دوره و شاخه (Course & Discipline)**: Course title with small discipline badge (e.g. «حکمت متعالیه»).
  2. **جلسه در حال استماع (Current Session)**: e.g. «جلسه ۰۴: مدخل و مبادی».
  3. **پیشرفت دوره (Progress Track & Percentage)**:
     - Outer pill track: `w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0`.
     - Filled inner track: `h-full bg-[#8A532B] dark:bg-[#C58B43] rounded-full transition-all duration-500`.
     - Percentage number: `font-num font-bold text-xs text-zinc-700 dark:text-zinc-300 ps-2 tabular-nums`.
  4. **کیفیت صوت (Audio Quality)**: Subtle mono tag `۴۸kHz استودیویی`.
  5. **عملیات (Actions)**: Compact button with Play icon linking directly to `/courses/[id]/learn`.
- **Props Contract**:
  ```typescript
  export interface OngoingCourseItem {
    id: string;
    title: string;
    subject: string;
    currentChapter: string;
    totalChapters: number;
    completedChapters: number;
    progressPercent: number;     // 0 to 100
    courseType: 'offline' | 'online';
    lastPlayedAt?: string;
  }

  export interface OngoingCoursesTableProps {
    courses: OngoingCourseItem[];
    onContinue?: (courseId: string) => void;
    className?: string;
  }
  ```

---

## ۴. Design System (R4) & Anti-Slop Compliance

### ۴.۱ Strict Token & Layout Rules

1. **4px Spacing Scale**:
   - Only allow standard 4px increments: `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-5` (20px), `p-6` (24px), `p-8` (32px).
   - Reject arbitrary tailwind values like `p-[17px]`, `gap-[13px]`.
2. **Heading Ceiling**:
   - Page/Tab title ceiling: `text-2xl` (`font-bold`).
   - Section headers: `text-base` or `text-lg`.
   - Card headers: `text-sm font-bold`.
   - Table headers / serial tags: `text-[11px] font-mono`.
3. **Color Tokens**:
   - Light canvas: `#FAF8F5` (`bg-book-bg` / `bg-[#FAF8F5]`).
   - Dark canvas: `#0C0D0E` (`bg-[#0C0D0E]`).
   - Light surface: `#FFFFFF` with 1px border `#E7E4DC` or `border-zinc-200`.
   - Dark surface: `#141518` with 1px border `#23252A` or `border-zinc-800`.
   - Accent primary: `#8A532B` (warm umber/leather) in light mode, `#C58B43` (ancient copper) in dark mode.
4. **100% Tailwind Logical Properties**:
   - `ps-`, `pe-` instead of `pl-`, `pr-`.
   - `ms-`, `me-` instead of `ml-`, `mr-`.
   - `start-`, `end-` instead of `left-`, `right-`.
   - `border-s`, `border-e` instead of `border-l`, `border-r`.
   - `text-start`, `text-end` instead of `text-left`, `text-right`.
5. **Anti-AI-Slop Manifesto Compliance**:
   - ❌ **No `blur-3xl` or ambient neon glow balls** (`bg-amber-500/10` or similar).
   - ❌ **No gradient clipped text** (`bg-clip-text text-transparent bg-gradient-to-r`).
   - ❌ **No floating pill tags with pulsing green dots** (`w-2 h-2 bg-emerald-500 animate-pulse`).
   - ❌ **No cookie-cutter 3-card grids** with meaningless icons in colored square boxes.
6. **Official Scholar Identity**:
   - Must be written in full and strictly without abbreviation:
     **«حجت الاسلام دکتر زنجیر زن حسینی»**
   - Applies to headers, breadcrumbs, footers, course instructors, and metadata.
7. **Persian Writing & Typographic Discipline**:
   - Banned bureaucratic verbs: no «می‌باشد / می‌باشند» (use «است / هستند»), no «می‌گردد / گردید» (use «می‌شود / شد»).
   - Banned clichés: no «لازم به ذکر است», «شایان ذکر است», «نقش بسزایی ایفا می‌کند».
   - Proper Persian digits (`font-num`), proper ZWNJ (نیم‌فاصله).

---

## ۵. Multi-Language Support (R5) Specification

### ۵.۱ LanguageContext Integration

All text labels, headers, metrics, and actions must utilize the `useLanguage()` hook:
```typescript
const { currentLang, isRtl, dir, t, toLocale } = useLanguage();
```

### ۵.۲ Required Localization Dictionary Keys

The dictionary in `frontend/src/lib/data.ts` (`i18nDict`) must be updated across all three languages:

| Key | Persian (`fa`) | Arabic (`ar`) | English (`en`) |
| :--- | :--- | :--- | :--- |
| `dash_title` | میز کار پژوهشی دانش‌پژوه | لوحة تحكم الباحث | Student Scholarly Dashboard |
| `dash_tab_overview` | میز کار پژوهشی | لوحة المتابعة | Research Workspace |
| `dash_tab_courses` | درس‌گفتارهای من | دروسي ومحاضراتي | My Registered Courses |
| `dash_tab_books` | کتابخانه و مونوگراف‌ها | المكتبة والمونوغرافات | Library & Monographs |
| `dash_tab_notes` | یادداشت‌ها و حواشی | الملاحظات والتعليقات | Study Notes & Comments |
| `dash_tab_orders` | سفارش‌های پستی | الطلبات البريدية | Postal Book Orders |
| `dash_tab_certificates`| گواهی‌نامه‌های علمی | الشهادات العلمية | Official Certificates |
| `dash_tab_support` | طرح پرسش و ارتباط | الأسئلة والاستفسارات | Academic Inquiries |
| `admin_title` | پنل مدیریت دارالحکمة | لوحة إدارة دار الحكمة | Dar al-Hikmah Admin Console |
| `admin_tab_stats` | آمار و هوش تجاری | الإحصاءات والتقارير | Analytics & Business Intel |
| `admin_tab_courses` | مدیریت درس‌گفتارها | إدارة الدروس الصوتية | Course & Audio Studio |
| `admin_tab_categories` | دسته‌بندی‌های علمی | التصنيفات والعلوم | Scholarly Disciplines |
| `admin_tab_books` | انبار و کتب چاپی | المطبوعات والمستودع | Books & Print Inventory |
| `admin_tab_orders` | سفارش‌ها و مرسولات | الطلبات البريدية | Orders & Tracking |
| `admin_tab_drm` | نظارت بر امنیت DRM | أمن البث وحماية DRM | DRM Security & Sessions |
| `admin_tab_coupons` | کدهای تخفیف و کوپن | قسائم الخصم | Discount Coupons |
| `admin_tab_media` | صف پالایش صوت ۴۸kHz | قائمة معالجة الصوت | 48kHz Audio Queue |
| `kpi_active_courses` | دوره‌های فعال | الدورات النشطة | Active Courses |
| `kpi_books_read` | مونوگراف‌های مطالعه‌شده | الكتب المقروءة | Studied Monographs |
| `kpi_notes_count` | یادداشت‌های پژوهشی | الملاحظات المسجلة | Research Notes |
| `kpi_orders_count` | مرسولات پستی | الشحنات البريدية | Postal Orders |
| `kpi_total_revenue` | کل فروش و دریافتی | إجمالي الإيرادات | Total Revenue |
| `kpi_mastered_audio` | جلسات صوتی مسترشده | الجلسات المعالجة | Mastered Sessions |
| `kpi_active_drm` | استریم فعال DRM | جلسات البث النشطة | Active DRM Streams |
| `chart_study_activity`| روند استماع و مطالعه | نشاط الاستماع والمطالعة | Study & Listening Activity |
| `chart_today` | امروز | اليوم | Today |
| `chart_7days` | ۷ روز اخیر | آخر ٧ أيام | Last 7 Days |
| `chart_30days` | ۳۰ روز گذشته | آخر ٣٠ يوماً | Last 30 Days |
| `th_course_title` | عنوان دوره و موضوع | عنوان الدورة والتخصص | Course & Subject |
| `th_current_lesson` | جلسه در حال استماع | الجلسة الحالية | Current Session |
| `th_progress` | میزان پیشرفت | نسبة الإنجاز | Progress |
| `th_actions` | عملیات | الإجراء | Actions |
| `btn_continue_audio` | ادامه استماع جلسه | متابعة الاستماع | Continue Audio |
| `btn_view_details` | جزئیات سرفصل | تفاصيل المنهاج | View Syllabus |
| `auth_login_student` | ورود به پورتال دانش‌پژوهان | تسجيل الدخول لبوابة الطلاب | Enter Student Portal |
| `auth_login_admin` | ورود به پنل مدیریت | الدخول للوحة الإدارة | Enter Admin Console |
| `auth_demo_student` | ورود با حساب دانش‌پژوه نمونه | دخول بحساب باحث تجريبي | Demo Student Login |
| `auth_demo_admin` | ورود مستقیم با حساب مدیر ارشد | دخول بحساب المشرف | Demo Admin Login |

---

## ۶. Proposed Modular Component Breakdown & Target Architecture

### ۶.۱ Target File Hierarchy

```
frontend/src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                         # Thin controller (under 60 lines)
│   └── admin/
│       └── page.tsx                         # Thin controller (under 60 lines)
├── components/
│   ├── shell/                               # Shared Shell System
│   │   ├── ShellLayout.tsx                  # Core layout wrapper with responsive sidebar + header
│   │   ├── ShellSidebar.tsx                 # Collapsible navigational sidebar
│   │   ├── ShellHeader.tsx                  # Sticky top bar with scholar badge & profile
│   │   └── ShellAuthGate.tsx                # Standardized unauthenticated / unauthorized card
│   ├── dashboard/
│   │   ├── shared/                          # Reusable R2 Dashboard Primitives
│   │   │   ├── KpiMetricStrip.tsx           # 4-card metric strip with soft circular icon wrappers
│   │   │   ├── MinimalistBarChart.tsx       # Minimalist vertical bar chart with rounded-t-md tops
│   │   │   └── OngoingCoursesTable.tsx      # Compact table with w-24 h-1.5 thin progress tracks
│   │   └── tabs/                            # Modular Student Tabs
│   │       ├── DashboardOverviewTab.tsx     # Composes KpiMetricStrip, MinimalistBarChart, OngoingCoursesTable
│   │       ├── DashboardCoursesTab.tsx      # All enrolled courses
│   │       ├── DashboardBooksTab.tsx        # Library & monograph shelf
│   │       ├── DashboardNotesTab.tsx        # Study notes & margins
│   │       ├── DashboardOrdersTab.tsx       # Postal orders tracking
│   │       ├── DashboardCertificatesTab.tsx # Official certificates
│   │       └── DashboardSupportTab.tsx      # Direct academic inquiry form
│   └── admin/
│       ├── shared/                          # Reusable Admin Primitives
│       │   ├── AdminTableContainer.tsx      # Standard table shell with search, filter, count
│       │   └── AdminModalContainer.tsx      # Standard modal dialog container
│       └── tabs/                            # Modular Admin Tabs
│           ├── AdminStatsTab.tsx            # Composes KpiMetricStrip, MinimalistBarChart, Audit Trail
│           ├── AdminCoursesTab.tsx          # Decomposed course & audio studio
│           ├── AdminBooksTab.tsx            # Decomposed book & stock manager
│           ├── AdminCategoriesTab.tsx       # Discipline taxonomy manager
│           ├── AdminOrdersTab.tsx           # Orders & postal tracking
│           ├── AdminDrmTab.tsx              # DRM stream supervision & token revocation
│           ├── AdminCouponsTab.tsx          # Promo coupon manager
│           └── AdminMediaTab.tsx            # 48kHz audio processing queue
```

### ۶.۲ Component Interface & Composition Details

#### ۱. `ShellLayout.tsx`
```tsx
interface ShellNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface ShellLayoutProps {
  portalType: 'student' | 'admin';
  portalBadge: string;                       // e.g. '[ STUDENT PORTAL ]'
  portalTitle: string;                       // e.g. 'پورتال دانش‌پژوهان'
  navItems: ShellNavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  headerTitle: string;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
  children: React.ReactNode;
}
```

#### ۲. `KpiMetricStrip.tsx`
```tsx
interface KpiMetricStripProps {
  metrics: Array<{
    id: string;
    serial: string;                          // e.g. '[ ۰۱ ]'
    title: string;                           // e.g. 'دوره‌های فعال'
    value: string | number;                  // e.g. '۲ دوره'
    sublabel?: string;                       // e.g. 'شرح اسفار و منطق'
    icon: React.ElementType;
    colorClass: string;                      // e.g. 'bg-amber-50 text-amber-500'
    trend?: { value: string; isPositive: boolean };
  }>;
  className?: string;
}
```

#### ۳. `MinimalistBarChart.tsx`
```tsx
interface MinimalistBarChartProps {
  title: string;
  subtitle?: string;
  data: Array<{
    id: string;
    label: string;                           // e.g. 'شنبه', 'یکشنبه'
    value: number;                           // raw height value
    formattedValue?: string;                 // e.g. '۴ ساعت'
  }>;
  timeRanges?: Array<{ id: string; label: string }>;
  activeTimeRange?: string;
  onTimeRangeChange?: (rangeId: string) => void;
  className?: string;
}
```

#### ۴. `OngoingCoursesTable.tsx`
```tsx
interface OngoingCoursesTableProps {
  courses: Array<{
    id: string;
    title: string;
    subject: string;
    currentChapterTitle: string;
    completedChapters: number;
    totalChapters: number;
    progressPercent: number;                 // 0 to 100
    courseType: 'offline' | 'online';
  }>;
  className?: string;
}
```

---

## ۷. Build & Verification Analysis

### ۷.۱ Baseline Quality Gate Audit (`python audit_pipeline.py`)
- The pipeline was executed against the repository using `backend/.venv/Scripts/python.exe audit_pipeline.py`.
- Result: **Score 100 / 100** (All 8 checks passed):
  1. Scholar Identity: Verified 100/100 («حجت الاسلام دکتر زنجیر زن حسینی»).
  2. Anti-Slop: Verified 100/100 (Zero `blur-3xl`, gradient text, or green pulse dots).
  3. Backend Tests: Verified 100/100 (In-memory auth, DRM, database).
  4. SEO & LLM artifacts: Verified 100/100 (`sitemap.ts`, `robots.ts`, `llms.txt`).
  5. Audio Processing: Verified 100/100 (Colab & Kaggle notebooks).
  6. Root Standards: Verified 100/100 (`DESIGN.md`, `GEMINI.md`, etc.).
  7. Persian Writing: Verified 100/100 (No «می‌باشد», «گردید», or robotic clichés).
  8. Spec Kit Compliance: Verified 100/100.

### ۷.۲ Next.js Build Compilation Observation (`npm run build`)
- During the baseline compilation check in `frontend`:
  Next.js 15 compiled 15 static routes successfully in 30.7s.
  At the final static page generation stage, an operating system file rename error occurred:
  `[Error: ENOENT: no such file or directory, rename '.../frontend/.next/export/500.html' -> '.../frontend/.next/server/pages/500.html']`
- **Root Cause**: `frontend/next.config.js` specifies `output: 'standalone'`. In Windows environments without a pre-existing export directory or when file locks occur, Next.js encounters an ENOENT during the 500 error page rename.
- **Guidance for Implementer**:
  - Removing `output: 'standalone'` from `next.config.js` or clearing `.next` cache resolves this Windows-specific Next.js 15 issue cleanly.

---

## ۸. Step-by-Step Implementation Roadmap for Next Agents

1. **Step 1: Localization Expansion**:
   Add the required dashboard and admin dictionary keys to `frontend/src/lib/data.ts` under `fa`, `ar`, and `en` in `i18nDict`.
2. **Step 2: Build Shared Shell Components**:
   Create `src/components/shell/ShellAuthGate.tsx`, `src/components/shell/ShellHeader.tsx`, `src/components/shell/ShellSidebar.tsx`, and `src/components/shell/ShellLayout.tsx`.
3. **Step 3: Build Reusable R2 Dashboard Primitives**:
   - Create `src/components/dashboard/shared/KpiMetricStrip.tsx` with soft circular icon wrappers (`rounded-full`) and bold tabular figures.
   - Create `src/components/dashboard/shared/MinimalistBarChart.tsx` with rounded top bars (`rounded-t-md`).
   - Create `src/components/dashboard/shared/OngoingCoursesTable.tsx` with thin progress pill tracks (`w-24 h-1.5 bg-zinc-100` filled with `#8A532B`).
4. **Step 4: Refactor `DashboardOverviewTab.tsx`**:
   Compose `KpiMetricStrip`, `MinimalistBarChart`, and `OngoingCoursesTable`.
5. **Step 5: Refactor `AdminStatsTab.tsx`**:
   Compose `KpiMetricStrip`, `MinimalistBarChart`, and the security audit trail. Retire or decouple the legacy `AdminCharts.tsx`.
6. **Step 6: Refactor `dashboard/page.tsx` and `admin/page.tsx`**:
   Transform both into slim, high-readability controller pages delegating layout to `ShellLayout`.
7. **Step 7: Verification**:
   Execute `npm run build` and `python audit_pipeline.py` to ensure 100/100 score and 0 compile errors.
