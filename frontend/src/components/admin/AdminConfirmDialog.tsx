'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2, ShieldAlert, Loader2 } from 'lucide-react';

export interface AdminConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function AdminConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'تأیید و اجرا',
  cancelLabel = 'انصراف',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) {
  const Icon = variant === 'danger' ? Trash2 : variant === 'warning' ? AlertTriangle : ShieldAlert;

  const btnColor =
    variant === 'danger'
      ? 'bg-rose-700 hover:bg-rose-800 text-white'
      : variant === 'warning'
      ? 'bg-[#8A532B] hover:bg-[#724320] text-white'
      : 'bg-[#8A532B] hover:bg-[#724320] text-white';

  const iconBg =
    variant === 'danger'
      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
      : 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/20 dark:text-[#C58B43] border-[#8A532B]/20 dark:border-[#C58B43]/30';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="max-w-md p-6 font-sans text-start border border-zinc-200 dark:border-zinc-800 bg-[#FAF8F5] dark:bg-[#141518] shadow-2xl rounded-2xl">
        <DialogHeader className="gap-3 text-start">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </DialogTitle>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                <DialogDescription asChild>
                  <div>{description}</div>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-row items-center justify-end gap-2 pt-4 mt-2 border-t border-zinc-200/80 dark:border-zinc-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50 ${btnColor}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
