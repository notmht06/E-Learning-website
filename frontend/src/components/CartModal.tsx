'use client';

import React, { useState } from 'react';
import { ShoppingBag, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { SupportedLang } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { FluidModal } from '@/components/motion/MotionPrimitives';

import { parseNumericPrice } from '@/lib/utils';

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
  isOpen, items, currentLang: propLang, onClose, onRemoveItem,
}) => {
  const { currentLang: ctxLang, dict } = useLanguage();
  const currentLang = propLang || ctxLang;
  const [isProcessing, setIsProcessing] = useState(false);

  const rawTotal = items.reduce((sum, item) => sum + parseNumericPrice(item.price), 0);
  const formattedTotal = currentLang === 'en'
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
    <FluidModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" className="p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
            {dict.cart_title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition duration-200 cursor-pointer"
          title="بستن سبد"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-xs sm:text-sm text-book-subtext dark:text-stone-400 space-y-2">
          <ShoppingBag className="w-8 h-8 mx-auto opacity-30 text-book-subtext" />
          <p>{dict.cart_empty}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pe-1">
          {items.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-book-border dark:border-zinc-700 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="min-w-0">
                <h5 className="text-xs sm:text-sm font-bold text-book-text dark:text-white truncate">
                  {item.title}
                </h5>
                <span className="text-xs font-bold text-book-accent font-num">
                  {item.price}
                </span>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-xs text-[#8A532B] hover:text-[#8A532B] font-bold px-3 py-1 rounded-lg hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/30 transition shrink-0 cursor-pointer"
              >
                {dict.cart_remove_btn}
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-book-border dark:border-book-darkBorder">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="font-bold text-book-subtext">{dict.cart_total}</span>
            <span className="font-bold text-sm sm:text-base text-book-accent font-num">
              {formattedTotal}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-book-subtext">
            <ShieldCheck className="w-4 h-4 text-[#8A532B] shrink-0" />
            <span>{dict.cart_security_note}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-full bg-book-accent text-white font-bold text-xs sm:text-sm hover:bg-book-accentHover transition shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isProcessing ? 'در حال انتقال...' : dict.cart_checkout_btn}</span>
          </button>
        </div>
      )}
    </FluidModal>
  );
};
