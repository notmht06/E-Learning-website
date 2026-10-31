'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Headphones,
  Layers,
  BookOpen,
  FileText,
  MessageSquare,
  ShoppingBag,
  ShieldAlert,
  Tag,
  Radio,
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
  AdminBooksTab,
  AdminArticlesTab,
  AdminQATab,
  AdminOrdersTab,
  AdminDrmTab,
  AdminCouponsTab,
  AdminMediaTab,
  AdminSettingsTab,
} from '@/components/admin/tabs';

export type AdminTab =
  | 'stats'
  | 'courses'
  | 'categories'
  | 'books'
  | 'articles'
  | 'qa'
  | 'orders'
  | 'drm'
  | 'coupons'
  | 'media'
  | 'settings';

const tabLocalization: Record<'fa' | 'ar' | 'en', Record<AdminTab, string>> = {
  fa: {
    stats: 'داشبورد آماری و هوش تجاری',
    courses: 'استودیو درس‌گفتارها و جلسات صوتی',
    categories: 'مدیریت موضوعات و شاخه‌های علمی',
    books: 'انبارداری و انتشارات کتاب‌ها',
    articles: 'مدیریت مقالات علمی و جستارها',
    qa: 'پاسخگویی به پرسش‌های دانشجویان',
    orders: 'سفارش‌ها و پیگیری سفارش‌های پستی',
    drm: 'مرکز نظارت بر استریم و امنیت DRM',
    coupons: 'کدهای تخفیف و جوایز دوره‌ها',
    media: 'صف استودیویی پالایش صوت ۴۸kHz',
    settings: 'تنظیمات کلان و پویای سامانه (Zero-Code CMS)',
  },
  ar: {
    stats: 'الإحصاءات والتقارير المالية وذكاء الأعمال',
    courses: 'إدارة الدروس الصوتية والمحاضرات',
    categories: 'التصنيفات والعلوم العقلية والنقلية',
    books: 'المستودع وإدارة المطبوعات الورقية',
    articles: 'إدارة المقالات العلمية والبحوث',
    qa: 'الإجابة على أسئلة الطلاب',
    orders: 'الطلبات البريدية وتتبع الشحنات',
    drm: 'مركز الرقابة الأمنية وحماية البث DRM',
    coupons: 'قسائم الخصم والمكافآت الدراسية',
    media: 'قائمة المعالجة الصوتية النقية ٤٨kHz',
    settings: 'الإعدادات العامة للنظام (Zero-Code CMS)',
  },
  en: {
    stats: 'Business Intelligence & Revenue Analytics',
    courses: 'Lecture Studio & Audio Curriculum',
    categories: 'Scholarly Disciplines Taxonomy',
    books: 'Print Publishing & Inventory Stock',
    articles: 'Scholarly Articles & Research Papers',
    qa: 'Student Q&A Discussions Forum',
    orders: 'Postal Orders & Consignment Tracking',
    drm: 'DRM Stream Supervision & Security',
    coupons: 'Promotional Discount Coupons',
    media: '48kHz Audio Mastering Queue',
    settings: 'Site Configuration (Zero-Code CMS)',
  },
};

const navLabels: Record<'fa' | 'ar' | 'en', Record<AdminTab, string>> = {
  fa: {
    stats: 'آمار و گزارش‌های مالی',
    courses: 'مدیریت درس‌گفتارها',
    categories: 'دسته‌بندی‌های علمی',
    books: 'انبار و کتب چاپی',
    articles: 'مقالات و رساله‌ها',
    qa: 'تالار پرسش و پاسخ',
    orders: 'سفارش‌ها و مرسولات',
    drm: 'نشست‌ها و امنیت DRM',
    coupons: 'کدهای تخفیف و کوپن',
    media: 'صف استودیویی ۴۸kHz',
    settings: 'تنظیمات کلان CMS',
  },
  ar: {
    stats: 'الإحصاءات والتقارير',
    courses: 'إدارة الدروس',
    categories: 'التصنيفات العلمية',
    books: 'المستودع والكتب',
    articles: 'البحوث والرسائل',
    qa: 'الأسئلة والأجوبة',
    orders: 'الطلبات والمرسلات',
    drm: 'أمن البث DRM',
    coupons: 'قسائم الخصم',
    media: 'معالجة الصوت ٤٨kHz',
    settings: 'إعدادات النظام CMS',
  },
  en: {
    stats: 'Analytics & BI',
    courses: 'Course Studio',
    categories: 'Disciplines',
    books: 'Book Inventory',
    articles: 'Articles & Papers',
    qa: 'Q&A Discussions',
    orders: 'Postal Orders',
    drm: 'DRM Security',
    coupons: 'Discounts',
    media: '48kHz Queue',
    settings: 'Site Settings CMS',
  },
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { dict, currentLang, t, localizeHref } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  const langKey = (currentLang === 'ar' || currentLang === 'en') ? currentLang : 'fa';
  const titles = tabLocalization[langKey];
  const labels = navLabels[langKey];

  React.useEffect(() => {
    if (!user || !isAdmin) {
      router.push(localizeHref('/login'));
    }
  }, [user, isAdmin, router, localizeHref]);

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
    { id: 'books', label: t('admin_tab_books', labels.books), icon: BookOpen },
    { id: 'articles', label: t('admin_tab_articles', labels.articles), icon: FileText },
    { id: 'qa', label: t('admin_tab_qa', labels.qa), icon: MessageSquare },
    { id: 'orders', label: t('admin_tab_orders', labels.orders), icon: ShoppingBag },
    { id: 'drm', label: t('admin_tab_drm', labels.drm), icon: ShieldAlert },
    { id: 'coupons', label: t('admin_tab_coupons', labels.coupons), icon: Tag },
    { id: 'media', label: t('admin_tab_media', labels.media), icon: Radio },
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
      {activeTab === 'books' && <AdminBooksTab />}
      {activeTab === 'articles' && <AdminArticlesTab />}
      {activeTab === 'qa' && <AdminQATab />}
      {activeTab === 'orders' && <AdminOrdersTab />}
      {activeTab === 'drm' && <AdminDrmTab />}
      {activeTab === 'coupons' && <AdminCouponsTab />}
      {activeTab === 'media' && <AdminMediaTab />}
      {activeTab === 'settings' && <AdminSettingsTab />}
    </ShellLayout>
  );
}
