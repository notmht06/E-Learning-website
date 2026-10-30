'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Headphones,
  BookOpen,
  BookMarked,
  Package,
  Award,
  MessageSquare,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export type DashboardTab = 'overview' | 'courses' | 'books' | 'notes' | 'orders' | 'certificates';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onLogout,
}: DashboardSidebarProps) {
  const { localizeHref } = useLanguage();
  const navItems: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'داشبورد', icon: Compass },
    { id: 'courses', label: 'دوره‌های من', icon: Headphones },
    { id: 'books', label: 'کتاب‌ها و آثار چاپی', icon: BookOpen },
    { id: 'notes', label: 'یادداشت‌های من', icon: BookMarked },
    { id: 'orders', label: 'سفارش‌های پستی', icon: Package },
    { id: 'certificates', label: 'گواهی‌نامه‌های علمی', icon: Award },
  ];

  return (
    <aside
      className={cn(
        'bg-white dark:bg-[#141518] border-e border-zinc-200 dark:border-zinc-800 transition duration-200 flex flex-col justify-between shrink-0 select-none z-30',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Header & Collapse Button */}
      <div>
        <div className="h-16 flex items-center justify-between px-3 border-b border-zinc-200 dark:border-zinc-800">
          {!isCollapsed && (
            <div className="ps-2">
              <span className="text-xs font-mono text-[#8A532B] dark:text-[#C58B43] block">
                [ STUDENT PORTAL ]
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                پورتال دانش‌پژوهان
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer mx-auto"
            title={isCollapsed ? 'گسترش منو' : 'جمع کردن منو'}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4 rtl:rotate-180" /> : <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium transition cursor-pointer',
                  isActive
                    ? 'bg-[#8A532B] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-zinc-500')} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        <Link
          href={localizeHref('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          title={isCollapsed ? 'مشاهده سایت اصلی' : undefined}
        >
          <Home className="w-4 h-4 shrink-0 text-zinc-500" />
          {!isCollapsed && <span>صفحه اصلی سایت</span>}
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#8A532B] dark:text-[#C58B43] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/20 transition cursor-pointer"
          title={isCollapsed ? 'خروج از حساب' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>خروج از حساب</span>}
        </button>
      </div>
    </aside>
  );
}
