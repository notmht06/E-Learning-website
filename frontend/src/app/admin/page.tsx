'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Headphones,
  Compass,
  Layers,
  FileText,
  ShoppingBag,
  ShieldAlert,
  Tag,
  Star,
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
  AdminRoadmapTab,
  AdminCategoriesTab,
  AdminArticlesTab,
  AdminOrdersTab,
  AdminDrmTab,
  AdminCouponsTab,
  AdminReviewsTab,
  AdminSettingsTab,
} from '@/components/admin/tabs';

export type AdminTab =
  | 'stats'
  | 'courses'
  | 'roadmap'
  | 'categories'
  | 'articles'
  | 'orders'
  | 'drm'
  | 'coupons'
  | 'reviews'
  | 'settings';

const tabLocalization: Record<'fa' | 'ar' | 'en', Record<AdminTab, string>> = {
  fa: {
    stats: 'داشبورد آماری و هوش تجاری',
    courses: 'استودیو درس‌گفتارها و جلسات صوتی/ویدیویی',
    roadmap: 'استودیو مدیریت سیر مطالعاتی و مراحل علمی',
    categories: 'مدیریت موضوعات و شاخه‌های علمی',
    articles: 'مدیریت مقالات علمی و جستارها',
    orders: 'بانک اطلاعاتی دانشجویان و سوابق ثبت‌نام دوره‌ها',
    drm: 'مرکز نظارت بر استریم و امنیت DRM',
    coupons: 'کدهای تخفیف و جوایز دوره‌ها',
    reviews: 'مدیریت نظرات و امتیازهای دانشجویان',
    settings: 'تنظیمات سراسری سامانه',
  },
  ar: {
    stats: 'الإحصاءات والتقارير المالية وذكاء الأعمال',
    courses: 'إدارة الدروس الصوتية والمحاضرات',
    roadmap: 'استوديو إدارة المسار الدراسي والمراحل العلمية',
    categories: 'التصنيفات والعلوم العقلية والنقلية',
    articles: 'إدارة المقالات العلمية والبحوث',
    orders: 'سجلات تسجيل الطلاب والطلبات',
    drm: 'مركز الرقابة الأمنية وحماية البث DRM',
    coupons: 'قسائم الخصم والمكافآت الدراسية',
    reviews: 'إدارة التقييمات وآراء الطلاب',
    settings: 'الإعدادات العامة للنظام',
  },
  en: {
    stats: 'Business Intelligence & Revenue Analytics',
    courses: 'Lecture Studio & Audio Curriculum',
    roadmap: 'Curriculum Roadmap & Scientific Stages Studio',
    categories: 'Scholarly Disciplines Taxonomy',
    articles: 'Scholarly Articles & Research Papers',
    orders: 'Student Database & Course Enrollments CRM',
    drm: 'DRM Stream Supervision & Security',
    coupons: 'Promotional Discount Coupons',
    reviews: 'Course Reviews & Ratings Moderation',
    settings: 'Platform Settings',
  },
};

const navLabels: Record<'fa' | 'ar' | 'en', Record<AdminTab, string>> = {
  fa: {
    stats: 'آمار و گزارش‌های مالی',
    courses: 'مدیریت درس‌گفتارها',
    roadmap: 'سیر مطالعاتی و مراحل',
    categories: 'دسته‌بندی‌های علمی',
    articles: 'مقالات و رساله‌ها',
    orders: 'دانشجویان و ثبت‌نام‌ها',
    drm: 'نشست‌ها و امنیت DRM',
    coupons: 'کدهای تخفیف و کوپن',
    reviews: 'نظرات و امتیازها',
    settings: 'تنظیمات کلان CMS',
  },
  ar: {
    stats: 'الإحصاءات والتقارير',
    courses: 'إدارة الدروس',
    roadmap: 'المسار الدراسي',
    categories: 'التصنيفات العلمية',
    articles: 'البحوث والرسائل',
    orders: 'الطلاب والتسجيلات',
    drm: 'أمن البث DRM',
    coupons: 'قسائم الخصم',
    reviews: 'التقييمات والآراء',
    settings: 'إعدادات النظام CMS',
  },
  en: {
    stats: 'Analytics & BI',
    courses: 'Course Studio',
    roadmap: 'Curriculum Roadmap',
    categories: 'Disciplines',
    articles: 'Articles & Papers',
    orders: 'Students & Orders',
    drm: 'DRM Security',
    coupons: 'Discounts',
    reviews: 'Reviews',
    settings: 'Site Settings CMS',
  },
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { dict, currentLang, t, localizeHref } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  const langKey = currentLang === 'ar' || currentLang === 'en' ? currentLang : 'fa';
  const titles = tabLocalization[langKey];
  const labels = navLabels[langKey];

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(localizeHref('/login?redirect=/admin'));
      } else if (!isAdmin) {
        router.push(localizeHref('/dashboard'));
      }
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
        demoActionLabel={!user ? dict.ui_go_to_login : 'ورود به داشبورد دانشجو'}
        onLogin={() => router.push(localizeHref(!user ? '/login?redirect=/admin' : '/dashboard'))}
      />
    );
  }

  const navItems: ShellNavItem[] = [
    { id: 'stats', label: t('admin_tab_stats', labels.stats), icon: TrendingUp },
    { id: 'courses', label: t('admin_tab_courses', labels.courses), icon: Headphones },
    { id: 'roadmap', label: labels.roadmap, icon: Compass },
    { id: 'categories', label: t('admin_tab_categories', labels.categories), icon: Layers },
    { id: 'articles', label: t('admin_tab_articles', labels.articles), icon: FileText },
    { id: 'orders', label: t('admin_tab_orders', labels.orders), icon: ShoppingBag },
    { id: 'drm', label: t('admin_tab_drm', labels.drm), icon: ShieldAlert },
    { id: 'coupons', label: t('admin_tab_coupons', labels.coupons), icon: Tag },
    { id: 'reviews', label: t('admin_tab_reviews', labels.reviews), icon: Star },
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
      <div className="animate-in fade-in-0 duration-200">
        {activeTab === 'stats' && <AdminStatsTab />}
        {activeTab === 'courses' && <AdminCoursesTab />}
        {activeTab === 'roadmap' && <AdminRoadmapTab />}
        {activeTab === 'categories' && <AdminCategoriesTab />}
        {activeTab === 'articles' && <AdminArticlesTab />}
        {activeTab === 'orders' && <AdminOrdersTab />}
        {activeTab === 'drm' && <AdminDrmTab />}
        {activeTab === 'coupons' && <AdminCouponsTab />}
        {activeTab === 'reviews' && <AdminReviewsTab />}
        {activeTab === 'settings' && <AdminSettingsTab />}
      </div>
    </ShellLayout>
  );
}
