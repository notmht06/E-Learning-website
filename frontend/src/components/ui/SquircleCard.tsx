'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SquircleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'accent' | 'glass';
  interactive?: boolean;
}

export const SquircleCard = React.forwardRef<HTMLDivElement, SquircleCardProps>(
  ({ children, className, variant = 'default', interactive = false, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-[#141518] border-stone-200/90 dark:border-neutral-800 text-stone-900 dark:text-stone-100 shadow-2xs',
      muted: 'bg-stone-100/70 dark:bg-[#101114] border-stone-200/60 dark:border-neutral-800/80 text-stone-800 dark:text-stone-200',
      accent: 'bg-[#8A532B]/5 dark:bg-[#C58B43]/10 border-[#8A532B]/20 dark:border-[#C58B43]/20 text-stone-900 dark:text-stone-100',
      glass: 'bg-white/80 dark:bg-[#141518]/80 backdrop-blur-md border-stone-200 dark:border-neutral-800 shadow-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-[2rem] sm:rounded-[2.5rem] border p-6 sm:p-8 transition duration-200',
          variants[variant],
          interactive && 'cursor-pointer hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SquircleCard.displayName = 'SquircleCard';
