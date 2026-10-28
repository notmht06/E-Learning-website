'use client';

import React from 'react';
import { FloatingNavigationPill } from '@/components/navigation/FloatingNavigationPill';
import { SupportedLang } from '@/locales';

export interface NavbarProps {
  currentLang?: SupportedLang;
  isDark?: boolean;
  cartCount?: number;
  onLanguageChange?: (lang: SupportedLang) => void;
  onThemeToggle?: () => void;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
}) => {
  return (
    <FloatingNavigationPill
      cartCount={cartCount}
      onOpenCart={onOpenCart}
    />
  );
};

export default Navbar;
