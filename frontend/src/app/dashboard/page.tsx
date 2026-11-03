'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Headphones,
  BookOpen,
  BookMarked,
  Package,
  Award,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShellLayout } from '@/components/shell/ShellLayout';
import { ShellAuthGate } from '@/components/shell/ShellAuthGate';
import { ShellNavItem } from '@/components/shell/ShellSidebar';
import {
  DashboardOverviewTab,
  DashboardCoursesTab,
  DashboardBooksTab,
  DashboardNotesTab,
  DashboardOrdersTab,
  DashboardCertificatesTab,
  DashboardSecurityTab,
} from '@/components/dashboard/tabs';
import { CourseScopedAITutor } from '@/components/learn/CourseScopedAITutor';

const BookReader3D = dynamic(
  () => import('@/components/BookReader3D').then((mod) => mod.BookReader3D),
  { ssr: false }
);

export type DashboardTab =
  | 'overview'
  | 'courses'
  | 'ai'
  | 'books'
  | 'notes'
  | 'orders'
  | 'certificates'
  | 'security';

const tabLocalization: Record<'fa' | 'ar' | 'en', Record<DashboardTab, string>> = {
  fa: {
    overview: 'پیشخوان پژوهشی دانش‌پژوه',
    courses: 'درس‌گفتارهای ثبت‌نام‌شده من',
    ai: 'حکمت‌یار دوره‌های دانش‌پژوه (AI)',
    books: 'کتابخانه و رسالات فلسفی',
    notes: 'دفتر یادداشت و حاشیه‌نگاری دروس',
    orders: 'سفارشات پستی و رهگیری مرسولات',
    certificates: 'گواهی‌نامه‌های رسمی پایان دوره',
    security: 'امنیت حساب و دستگاه‌های متصل (DRM)',
  },
  ar: {
    overview: 'لوحة الباحث العلمي',
    courses: 'دوراتي ومحاضراتي المسجلة',
    ai: 'المساعد العلمي للدورات (AI)',
    books: 'المكتبة والرسائل الفلسفية',
    notes: 'دفتر الملاحظات والحواشي الدراسية',
    orders: 'الطلبات البريدية وتتبع الشحنات',
    certificates: 'شهادات إتمام الدورات الرسمية',
    security: 'الأمان وإدارة الأجهزة المتصلة',
  },
  en: {
    overview: 'Student Scholarly Dashboard',
    courses: 'My Registered Lectures',
    ai: 'AI Scholarly Tutor',
    books: 'Library & Philosophical Monographs',
    notes: 'Study Notes & Margin Commentary',
    orders: 'Postal Orders & Tracking',
    certificates: 'Official Academic Certificates',
    security: 'Account Security & Active Devices',
  },
};

const navLabels: Record<'fa' | 'ar' | 'en', Record<DashboardTab, string>> = {
  fa: {
    overview: 'پیشخوان پژوهشی',
    courses: 'دوره‌های من',
    ai: 'حکمت‌یار هوشمند (AI)',
    books: 'کتابخانه و رسالات',
    notes: 'دفتر یادداشت',
    orders: 'سفارشات پستی',
    certificates: 'گواهی‌نامه‌ها',
    security: 'امنیت و نشست‌ها',
  },
  ar: {
    overview: 'لوحة الباحث',
    courses: 'دوراتي',
    ai: 'المساعد الذكي (AI)',
    books: 'المكتبة والرسائل',
    notes: 'دفتر الملاحظات',
    orders: 'الطلبات البريدية',
    certificates: 'الشهادات',
    security: 'الأجهزة المتصلة',
  },
  en: {
    overview: 'Research Workspace',
    courses: 'My Lectures',
    ai: 'AI Course Tutor',
    books: 'Library & Books',
    notes: 'Notes & Margins',
    orders: 'Postal Orders',
    certificates: 'Certificates',
    security: 'Active Devices',
  },
};

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { currentLang, t, dict, localizeHref } = useLanguage();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedBookId, setSelectedBookId] = useState<string>('book1');
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const langKey = currentLang === 'ar' || currentLang === 'en' ? currentLang : 'fa';
  const titles = tabLocalization[langKey];
  const labels = navLabels[langKey];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D0E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#8A532B] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <ShellAuthGate
        portalType="student"
        onLogin={() => router.push(localizeHref('/login'))}
      />
    );
  }

  const navItems: ShellNavItem[] = [
    { id: 'overview', label: t('dash_tab_overview', labels.overview), icon: Compass },
    { id: 'courses', label: t('dash_tab_courses', labels.courses), icon: Headphones },
    { id: 'ai', label: t('dash_tab_ai', labels.ai), icon: Sparkles },
    { id: 'notes', label: t('dash_tab_notes', labels.notes), icon: BookMarked },
    { id: 'orders', label: t('dash_tab_orders', labels.orders), icon: Package },
    { id: 'certificates', label: t('dash_tab_certificates', labels.certificates), icon: Award },
    { id: 'security', label: t('dash_tab_security', labels.security), icon: ShieldCheck },
  ];

  const portalBadge =
    dict.ui_student_portal;

  const portalTitle =
    dict.ui_student_scholarly_console;

  const firstEnrolledCourse = user.enrolledCourseIds?.[0] || 'course-student-enrolled';

  return (
    <>
      <ShellLayout
        portalType="student"
        portalBadge={portalBadge}
        portalTitle={portalTitle}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as DashboardTab)}
        headerTitle={titles[activeTab]}
        userName={user.name}
        onLogout={logout}
      >
        {activeTab === 'overview' && <DashboardOverviewTab />}
        {activeTab === 'courses' && <DashboardCoursesTab />}
        {activeTab === 'ai' && (
          <CourseScopedAITutor
            courseId={firstEnrolledCourse}
            courseTitle={dict.ai_tutor_enrolled_courses_title}
            subject="همه"
          />
        )}
        {activeTab === 'books' && (
          <DashboardBooksTab
            onOpenReader={(bookId) => {
              setSelectedBookId(bookId);
              setIsReaderOpen(true);
            }}
          />
        )}
        {activeTab === 'notes' && <DashboardNotesTab />}
        {activeTab === 'orders' && <DashboardOrdersTab />}
        {activeTab === 'certificates' && <DashboardCertificatesTab />}
        {activeTab === 'security' && <DashboardSecurityTab />}
      </ShellLayout>

      {isReaderOpen && (
        <BookReader3D
          bookId={selectedBookId}
          isOpen={isReaderOpen}
          currentLang={currentLang}
          onClose={() => setIsReaderOpen(false)}
        />
      )}
    </>
  );
}
