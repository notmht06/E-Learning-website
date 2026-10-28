import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#8A532B] text-white hover:bg-[#724321] dark:bg-[#C58B43] dark:text-[#0C0D0E]',
        secondary:
          'border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-700',
        outline:
          'text-zinc-800 dark:text-zinc-200 border-[#E6E1D8] dark:border-[#24262D]',
        accent:
          'border-[#8A532B]/30 bg-[#8A532B]/10 text-[#8A532B] dark:border-[#C58B43]/30 dark:bg-[#C58B43]/15 dark:text-[#C58B43]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
