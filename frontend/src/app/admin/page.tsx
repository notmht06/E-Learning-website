'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Headphones,
  Layers,
  BookOpen,
  ShoppingBag,
  ShieldAlert,
  Tag,
  Radio,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShellLayout } from '@/components/shell/ShellLayout';
import { ShellAuthGate } from '@/components/shell/ShellAuthGate';
import { ShellNavItem } from '@/components/shell/ShellSidebar';
import { AdminStatsTab } from '@/components/admin/tabs/AdminStatsTab';
import { AdminCoursesTab } from '@/components/admin/tabs/AdminCoursesTab';
import { AdminCategoriesTab } from '@/components/admin/tabs/AdminCategoriesTab';
import { AdminBooksTab } from '@/components/admin/tabs/AdminBooksTab';
import { AdminOrdersTab } from '@/components/admin/tabs/AdminOrdersTab';
import { AdminDrmTab } from '@/components/admin/tabs/AdminDrmTab';
import { AdminCouponsTab } from '@/components/admin/tabs/AdminCouponsTab';
import { AdminMediaTab } from '@/components/admin/tabs/AdminMediaTab';

export type AdminTab =
  | 'stats'
  | 'courses'
  | 'categories'
  | 'books'
  | 'orders'
  | 'drm'
  | 'coupons'
  | 'media';

const tabLocalization: Record<'fa' | 'ar' | 'en', Record<AdminTab, string>> = {
  fa: {
    stats: 'داشبورد آماری و هوش تجاری',
    courses: 'استودیو درس‌گفتارها و جلسات صوتی',
    categories: 'مدیریت موضوعات و شاخه‌های علمی',
    books: 'انبارداری و انتشارات کتاب‌ها',
    orders: 'سفارش‌ها و پیگیری سفارش‌های پستی',
    drm: 'مرکز نظارت بر استریم و امنیت DRM',
    coupons: 'کدهای تخفیف و جوایز دوره‌ها',
    media: 'صف استودیویی پالایش صوت ۴۸kHz',
  },
  ar: {
    stats: 'الإحصاءات والتقارير المالية وذكاء الأعمال',
    courses: 'إدارة الدروس الصوتية والمحاضرات',
    categories: 'التصنيفات والعلوم العقلية والنقلية',
    books: 'المستودع وإدارة المطبوعات الورقية',
    orders: 'الطلبات البريدية وتتبع الشحنات',
    drm: 'مركز الرقابة الأمنية وحماية البث DRM',
    coupons: 'قسائم الخصم والمكافآت الدراسية',
    media: 'قائمة المعالجة الصوتية النقية ٤٨kHz',
  },
  en: {
    stats: 'Business Intelligence & Revenue Analytics',
    courses: 'Lecture Studio & Audio Curriculum',
    categories: 'Scholarly Disciplines Taxonomy',
    books: 'Print Publishing & Inventory Stock',
    orders: 'Postal Orders & Consignment Tracking',
    drm: 'DRM Stream Supervision & Security',
    coupons: 'Promotional Discount Coupons',
    media: '48kHz Audio Mastering Queue',
  },
};

const navLabels: Record<'fa' | 'ar' | 'en', Record<AdminTab, string>> = {
  fa: {
    stats: 'آمار و گزارش‌های مالی',
    courses: 'مدیریت درس‌گفتارها',
    categories: 'دسته‌بندی‌های علمی',
    books: 'انبار و کتب چاپی',
    orders: 'سفارش‌ها و مرسولات',
    drm: 'نشست‌ها و امنیت DRM',
    coupons: 'کدهای تخفیف و کوپن',
    media: 'صف استودیویی ۴۸kHz',
  },
  ar: {
    stats: 'الإحصاءات والتقارير',
    courses: 'إدارة الدروس',
    categories: 'التصنيفات العلمية',
    books: 'المستودع والكتب',
    orders: 'الطلبات والمرسلات',
    drm: 'أمن البث DRM',
    coupons: 'قسائم الخصم',
    media: 'معالجة الصوت ٤٨kHz',
  },
  en: {
    stats: 'Analytics & BI',
    courses: 'Course Studio',
    categories: 'Disciplines',
    books: 'Book Inventory',
    orders: 'Postal Orders',
    drm: 'DRM Security',
    coupons: 'Discounts',
    media: '48kHz Queue',
  },
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { currentLang, t, localizeHref } = useLanguage();
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
        demoActionLabel={currentLang === 'en' ? 'Go to Login' : currentLang === 'ar' ? 'الانتقال إلى تسجيل الدخول' : 'ورود به سامانه'}
        onDemoLogin={() => router.push(localizeHref('/login'))}
      />
    );
  }

  const navItems: ShellNavItem[] = [
    { id: 'stats', label: t('admin_tab_stats', labels.stats), icon: TrendingUp },
    { id: 'courses', label: t('admin_tab_courses', labels.courses), icon: Headphones },
    { id: 'categories', label: t('admin_tab_categories', labels.categories), icon: Layers },
    { id: 'books', label: t('admin_tab_books', labels.books), icon: BookOpen },
    { id: 'orders', label: t('admin_tab_orders', labels.orders), icon: ShoppingBag },
    { id: 'drm', label: t('admin_tab_drm', labels.drm), icon: ShieldAlert },
    { id: 'coupons', label: t('admin_tab_coupons', labels.coupons), icon: Tag },
    { id: 'media', label: t('admin_tab_media', labels.media), icon: Radio },
  ];

  const portalBadge = currentLang === 'en'
    ? 'ADMIN CONSOLE'
    : currentLang === 'ar'
    ? 'لوحة الإدارة'
    : 'پنل مدیریت';

  const portalTitle = currentLang === 'en'
    ? 'Hayat Administration'
    : currentLang === 'ar'
    ? 'إدارة حياة'
    : 'حیات فلسفه';

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
      {activeTab === 'orders' && <AdminOrdersTab />}
      {activeTab === 'drm' && <AdminDrmTab />}
      {activeTab === 'coupons' && <AdminCouponsTab />}
      {activeTab === 'media' && <AdminMediaTab />}
    </ShellLayout>
  );
}
