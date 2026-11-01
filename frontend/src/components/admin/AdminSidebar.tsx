'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Headphones,
  BookOpen,
  ShoppingBag,
  ShieldAlert,
  Tag,
  Radio,
  Layers,
  ChevronRight,
  ChevronLeft,
  Home,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export type AdminTab = 'stats' | 'courses' | 'categories' | 'books' | 'orders' | 'drm' | 'coupons' | 'media';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onLogout,
}: AdminSidebarProps) {
  const { dict, toLocale, localizeHref } = useLanguage();

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'stats', label: dict.admin_tab_stats, icon: TrendingUp },
    { id: 'courses', label: dict.admin_tab_courses, icon: Headphones },
    { id: 'categories', label: dict.admin_tab_categories, icon: Layers },
    { id: 'books', label: dict.admin_tab_books, icon: BookOpen },
    { id: 'orders', label: dict.admin_tab_orders, icon: ShoppingBag },
    { id: 'drm', label: dict.admin_tab_drm, icon: ShieldAlert },
    { id: 'coupons', label: dict.admin_tab_coupons, icon: Tag },
    { id: 'media', label: dict.admin_tab_media, icon: Radio },
  ];

  return (
    <aside
      className={cn(
        'bg-white dark:bg-[#141518] border-e border-zinc-200 dark:border-zinc-800 transition duration-200 flex flex-col justify-between shrink-0 select-none z-30',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Brand & Collapse Bar */}
      <div>
        <div className="h-16 flex items-center justify-between px-3 border-b border-zinc-200 dark:border-zinc-800">
          {!isCollapsed && (
            <div className="ps-2">
              <span className="text-[11px] font-medium tracking-wider text-[#8A532B] dark:text-[#C58B43] block">
                {dict.auth_tag_admin}
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                {dict.admin_brand_name}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer mx-auto"
            title={isCollapsed ? (dict.admin_menu_expand) : (dict.admin_menu_collapse)}
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
          title={isCollapsed ? (dict.admin_btn_home) : undefined}
        >
          <Home className="w-4 h-4 shrink-0 text-zinc-500" />
          {!isCollapsed && <span>{dict.admin_btn_home}</span>}
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#8A532B] dark:text-[#C58B43] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/20 transition cursor-pointer"
          title={isCollapsed ? (dict.admin_btn_logout) : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{dict.admin_btn_logout}</span>}
        </button>
      </div>
    </aside>
  );
}
