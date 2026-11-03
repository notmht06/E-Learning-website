'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Headphones,
  Layers,
  FileText,
  ShoppingBag,
  ShieldAlert,
  Tag,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShellLayout } from '@/components/shell/ShellLayout';
import { ShellAuthGate } from '@/components/shell/ShellAuthGate';
import { ShellNavItem } from '@/components/shell/ShellSidebar';
import {
  AdminStatsTab,
  AdminCoursesTab,
  AdminCategoriesTab,
  AdminArticlesTab,
  AdminOrdersTab,
  AdminDrmTab,
  AdminCouponsTab,
  AdminSettingsTab,
} from '@/components/admin/tabs';

export type AdminTab =
  | 'stats'
  | 'courses'
  | 'categories'
  | 'articles'
  | 'orders'
  | 'drm'
  | 'coupons'
  | 'settings';

const tabLocalization: Record<'fa' | 'ar' | 'en', Record<AdminTab, string>> = {
  fa: {
    stats: 'داشبورد آماری و هوش تجاری',
    courses: 'استودیو درس‌گفتارها و جلسات صوتی',
    categories: 'مدیریت موضوعات و شاخه‌های علمی',
    articles: 'مدیریت مقالات علمی و جستارها',
    orders: 'بانک اطلاعاتی دانش‌پژوهان و سوابق ثبت‌نام دوره‌ها',
    drm: 'مرکز نظارت بر استریم و امنیت DRM',
    coupons: 'کدهای تخفیف و جوایز دوره‌ها',
    settings: 'تنظیمات کلان و پویای سامانه (Zero-Code CMS)',
  },
  ar: {
    stats: 'الإحصاءات والتقارير المالية وذكاء الأعمال',
    courses: 'إدارة الدروس الصوتية والمحاضرات',
    categories: 'التصنيفات والعلوم العقلية والنقلية',
    articles: 'إدارة المقالات العلمية والبحوث',
    orders: 'سجلات تسجيل الطلاب والطلبات',
    drm: 'مركز الرقابة الأمنية وحماية البث DRM',
    coupons: 'قسائم الخصم والمكافآت الدراسية',
    settings: 'الإعدادات العامة للنظام (Zero-Code CMS)',
  },
  en: {
    stats: 'Business Intelligence & Revenue Analytics',
    courses: 'Lecture Studio & Audio Curriculum',
    categories: 'Scholarly Disciplines Taxonomy',
    articles: 'Scholarly Articles & Research Papers',
    orders: 'Student Database & Course Enrollments CRM',
    drm: 'DRM Stream Supervision & Security',
    coupons: 'Promotional Discount Coupons',
    settings: 'Site Configuration (Zero-Code CMS)',
  },
};

const navLabels: Record<'fa' | 'ar' | 'en', Record<AdminTab, string>> = {
  fa: {
    stats: 'آمار و گزارش‌های مالی',
    courses: 'مدیریت درس‌گفتارها',
    categories: 'دسته‌بندی‌های علمی',
    articles: 'مقالات و رساله‌ها',
    orders: 'دانش‌پژوهان و ثبت‌نام‌ها',
    drm: 'نشست‌ها و امنیت DRM',
    coupons: 'کدهای تخفیف و کوپن',
    settings: 'تنظیمات کلان CMS',
  },
  ar: {
    stats: 'الإحصاءات والتقارير',
    courses: 'إدارة الدروس',
    categories: 'التصنيفات العلمية',
    articles: 'البحوث والرسائل',
    orders: 'الطلاب والتسجيلات',
    drm: 'أمن البث DRM',
    coupons: 'قسائم الخصم',
    settings: 'إعدادات النظام CMS',
  },
  en: {
    stats: 'Analytics & BI',
    courses: 'Course Studio',
    categories: 'Disciplines',
    articles: 'Articles & Papers',
    orders: 'Students & Orders',
    drm: 'DRM Security',
    coupons: 'Discounts',
    settings: 'Site Settings CMS',
  },
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { dict, currentLang, t, localizeHref } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  const langKey = (currentLang === 'ar' || currentLang === 'en') ? currentLang : 'fa';
  const titles = tabLocalization[langKey];
  const labels = navLabels[langKey];

  React.useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push(localizeHref('/login'));
    }
  }, [user, isAdmin, isLoading, router, localizeHref]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D0E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#8A532B] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If user is not authenticated or not admin, show minimal access gate
  if (!user || !isAdmin) {
    return (
      <ShellAuthGate
        portalType="admin"
        demoActionLabel={dict.ui_go_to_login}
        onLogin={() => router.push(localizeHref('/login'))}
      />
    );
  }

  const navItems: ShellNavItem[] = [
    { id: 'stats', label: t('admin_tab_stats', labels.stats), icon: TrendingUp },
    { id: 'courses', label: t('admin_tab_courses', labels.courses), icon: Headphones },
    { id: 'categories', label: t('admin_tab_categories', labels.categories), icon: Layers },
    { id: 'articles', label: t('admin_tab_articles', labels.articles), icon: FileText },
    { id: 'orders', label: t('admin_tab_orders', labels.orders), icon: ShoppingBag },
    { id: 'drm', label: t('admin_tab_drm', labels.drm), icon: ShieldAlert },
    { id: 'coupons', label: t('admin_tab_coupons', labels.coupons), icon: Tag },
    { id: 'settings', label: t('admin_settings_title', labels.settings), icon: Settings },
  ];

  const portalBadge = dict.ui_admin_console;
  const portalTitle = dict.ui_hayat_administration;

  return (
    <ShellLayout
      portalType="admin"
      portalBadge={portalBadge}
      portalTitle={portalTitle}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as AdminTab)}
      headerTitle={titles[activeTab]}
      userName={user.name}
      userRole={user.role}
      onLogout={logout}
    >
      {activeTab === 'stats' && <AdminStatsTab />}
      {activeTab === 'courses' && <AdminCoursesTab />}
      {activeTab === 'categories' && <AdminCategoriesTab />}
      {activeTab === 'articles' && <AdminArticlesTab />}
      {activeTab === 'orders' && <AdminOrdersTab />}
      {activeTab === 'drm' && <AdminDrmTab />}
      {activeTab === 'coupons' && <AdminCouponsTab />}
      {activeTab === 'settings' && <AdminSettingsTab />}
    </ShellLayout>
  );
}
