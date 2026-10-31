'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  X,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface ShellNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export interface ShellSidebarProps {
  portalType: 'student' | 'admin';
  portalBadge: string;
  portalTitle: string;
  navItems: ShellNavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function ShellSidebar({
  portalType,
  portalBadge,
  portalTitle,
  navItems,
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}: ShellSidebarProps) {
  const { dict, currentLang, isRtl, toLocale, localizeHref } = useLanguage();

  const homeLabel = dict.ui_main_website;

  const logoutLabel = dict.ui_sign_out;

  const collapseTooltip = isCollapsed
    ? (currentLang === 'en' ? 'Expand Sidebar' : 'گسترش منو')
    : (currentLang === 'en' ? 'Collapse Sidebar' : 'جمع کردن منو');

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between">
      {/* Top Header & Collapse Controller */}
      <div>
        <div className="h-16 flex items-center justify-between px-3 border-b border-zinc-200 dark:border-zinc-800">
          {!isCollapsed ? (
            <div className="ps-2 min-w-0">
              <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] block">
                {portalBadge}
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                {portalTitle}
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title={collapseTooltip}
            aria-label={collapseTooltip}
          >
            {isCollapsed ? (
              <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Mobile close toggle */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close Mobile Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1" role="tablist" aria-label="Portal Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-[#8A532B] text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-mono rounded-md font-num tabular-nums shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {typeof item.badge === 'number' ? toLocale(item.badge) : item.badge}
                  </span>
                )}
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
          title={isCollapsed ? homeLabel : undefined}
        >
          <Home className="w-4 h-4 shrink-0 text-zinc-500" />
          {!isCollapsed && <span className="truncate">{homeLabel}</span>}
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#8A532B] dark:text-[#C58B43] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/20 transition cursor-pointer"
          title={isCollapsed ? logoutLabel : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">{logoutLabel}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-[#141518] border-e border-zinc-200 dark:border-zinc-800 transition duration-200 shrink-0 select-none z-30 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={onCloseMobile}
              aria-hidden="true"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-72 max-w-[85vw] bg-white dark:bg-[#141518] border-e border-zinc-200 dark:border-zinc-800 h-full shadow-2xl z-10 overflow-y-auto"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
