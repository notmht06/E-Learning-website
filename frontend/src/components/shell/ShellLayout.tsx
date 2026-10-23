'use client';

import React, { useState } from 'react';
import { ShellSidebar, ShellNavItem } from './ShellSidebar';
import { ShellHeader } from './ShellHeader';

export interface ShellLayoutProps {
  portalType: 'student' | 'admin';
  portalBadge: string;
  portalTitle: string;
  navItems: ShellNavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  headerTitle: string;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export function ShellLayout({
  portalType,
  portalBadge,
  portalTitle,
  navItems,
  activeTab,
  onTabChange,
  headerTitle,
  userName,
  userRole,
  onLogout,
  children,
}: ShellLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 flex transition-colors">
      {/* Reusable Navigational Sidebar */}
      <ShellSidebar
        portalType={portalType}
        portalBadge={portalBadge}
        portalTitle={portalTitle}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={onLogout}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Minimalist Header */}
        <ShellHeader
          portalType={portalType}
          portalBadge={portalBadge}
          activeTabTitle={headerTitle}
          userName={userName}
          userRole={userRole}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
