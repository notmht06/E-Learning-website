import React from 'react';
import { cn } from '@/lib/utils';

interface ShadcnBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'accent' | 'emerald';
  className?: string;
}

export function ShadcnBadge({
  children,
  variant = 'default',
  className,
}: ShadcnBadgeProps) {
  const variants = {
    default: 'bg-stone-900 text-stone-50 dark:bg-[#1E2024] dark:border dark:border-[#C58B43]/30 dark:text-[#FAF8F5]',
    outline: 'border border-stone-300 dark:border-neutral-700 text-stone-700 dark:text-stone-300',
    secondary: 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-stone-300',
    accent: 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/20',
    emerald: 'bg-[#8A532B]/10 dark:bg-[#C58B43]/20 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors select-none font-num',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
