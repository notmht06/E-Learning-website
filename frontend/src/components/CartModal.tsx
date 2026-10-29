'use client';

import * as React from 'react';
import { useState } from 'react';
import { ShoppingBag, ShieldCheck, CheckCircle } from 'lucide-react';
import { SupportedLang } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { parseNumericPrice } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Separator,
} from '@/components/ui';

export interface CartItem {
  id: string;
  title: string;
  price: string;
}

interface CartModalProps {
  isOpen: boolean;
  items: CartItem[];
  currentLang?: SupportedLang;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  items,
  currentLang: propLang,
  onClose,
  onRemoveItem,
}) => {
  const { currentLang: ctxLang, dict } = useLanguage();
  const currentLang = propLang || ctxLang;
  const [isProcessing, setIsProcessing] = useState(false);

  const rawTotal = items.reduce((sum, item) => sum + parseNumericPrice(item.price), 0);
  const formattedTotal =
    currentLang === 'en'
      ? `$${Math.round(rawTotal / 10000)}.00`
      : `${rawTotal.toLocaleString('fa-IR')} تومان`;

  const handleCheckout = () => {
    setIsProcessing(true);
    try {
      if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(items);
        localStorage.setItem('zan_cart', serialized);
        localStorage.setItem('zan_cart_items', serialized);
        window.location.href = '/checkout';
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 space-y-4">
        <DialogHeader className="flex flex-row items-center gap-2 space-y-0 pb-2 border-b border-[#E6E1D8] dark:border-[#22242A] pe-10">
          <ShoppingBag className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
          <DialogTitle className="text-base font-bold truncate">
            {dict.cart_title || 'سبد خرید'}
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="py-8 text-center text-xs sm:text-sm text-zinc-500 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto opacity-30 text-zinc-400" />
            <p>{dict.cart_empty || 'سبد خرید شما خالی است.'}</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pe-1">
            {items.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-[#E6E1D8] dark:border-[#24262D] hover:border-[#8A532B]/40 hover:shadow-xs flex items-center justify-between gap-3 transition-all duration-200"
              >
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.title}
                  </h5>
                  <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] font-num">
                    {item.price}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 h-7 px-2"
                >
                  {dict.cart_remove_btn || 'حذف'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#E6E1D8] dark:border-[#22242A]">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-zinc-600 dark:text-zinc-400">
                {dict.cart_total || 'مجموع سفارش:'}
              </span>
              <span className="font-bold text-sm sm:text-base text-[#8A532B] dark:text-[#C58B43] font-num">
                {formattedTotal}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
              <span>{dict.cart_security_note || 'تراکنش امن در درگاه رسمی شاپرک'}</span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full font-bold text-xs sm:text-sm gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isProcessing ? 'در حال انتقال...' : dict.cart_checkout_btn || 'تکمیل سفارش و پرداخت'}</span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
