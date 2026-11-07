import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

/**
 * کامپوننت اسکلت بارگذاری بومی (VibeFarsi Skeleton)
 * بهینه‌شده برای چیدمان‌های راست‌چین با انیمیشن ملایم پالس و شیمر از راست‌به‌چپ
 */
export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-md bg-stone-200/80 dark:bg-zinc-800/80 border border-stone-200/40 dark:border-zinc-800/40",
        shimmer
          ? "relative overflow-hidden before:absolute before:inset-0 before:animate-shine-rtl before:bg-gradient-to-l before:from-transparent before:via-stone-300/50 dark:before:via-zinc-700/50 before:to-transparent"
          : "animate-pulse-soft",
        className
      )}
      {...props}
    />
  );
}

/**
 * ردیف آماده اسکلت برای فهرست جلسات، کامنت‌ها و آیتم‌های جدولی
 */
export function SkeletonRow({
  shimmer = true,
  className,
}: {
  shimmer?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <Skeleton shimmer={shimmer} className="size-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton shimmer={shimmer} className="h-3 w-3/4" />
        <Skeleton shimmer={shimmer} className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

/**
 * کانتینر ظهور از اسکلت بدون پرش ابعاد (Zero-CLS SkeletonReveal)
 * هر دو لایه اسکلت و محتوای اصلی در یک سلول مشترک CSS Grid قرار می‌گیرند.
 * با تغییر وضعیت loading، اسکلت فید/بلور اوت شده و محتوای اصلی با ترنزیشن نرم جایگزین می‌گردد.
 */
export function SkeletonReveal({
  loading,
  skeleton,
  children,
  duration = 350,
  className,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  const fade = (on: boolean): React.CSSProperties => ({
    opacity: on ? 1 : 0,
    filter: on ? 'blur(0px)' : 'blur(4px)',
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
  });

  return (
    <div className={cn("grid", className)} aria-busy={loading}>
      <div
        aria-hidden="true"
        className="col-start-1 row-start-1 will-change-[opacity,filter] pointer-events-none"
        style={fade(loading)}
      >
        <div style={loading ? { animation: 'pulse-soft 1.8s ease-in-out infinite' } : undefined}>
          {skeleton}
        </div>
      </div>
      <div
        aria-hidden={loading ? "true" : undefined}
        className={cn(
          "col-start-1 row-start-1 will-change-[transform,opacity,filter]",
          loading && "pointer-events-none"
        )}
        style={{
          ...fade(!loading),
          transform: loading ? 'translateY(6px)' : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
