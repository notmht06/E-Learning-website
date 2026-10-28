import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard shadcn class name merger utility with tailwind-merge and clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function parseNumericPrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') return isNaN(priceStr) ? 0 : priceStr;
  if (!priceStr) return 0;

  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let normalized = String(priceStr);
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replaceAll(persianDigits[i], String(i));
    normalized = normalized.replaceAll(arabicDigits[i], String(i));
  }

  const cleaned = normalized.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

