'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function AboutAndContactPage() {
  const { items: cartItems, isOpen: isCartOpen, openCart, closeCart, removeItem } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { currentLang } = useLanguage();
  const { siteConfig } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSent(true);
    setName('');
    setPhone('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors pb-14">
      <Navbar
        isDark={isDark}
        cartCount={cartItems.length}
        onThemeToggle={toggleTheme}
        onOpenCart={openCart}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full text-start">
        {/* Section 1: Scholar Biography */}
        <section className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-6 sm:p-10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
            <img
              src="/images/ostad_zanjirzan.jpg"
              alt={siteConfig.heroTitle}
              className="w-40 h-40 rounded-3xl object-cover border-2 border-[#8A532B]/40 shadow-md"
            />
            <div>
              <h1 className="text-lg font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
                {siteConfig.heroTitle}
              </h1>
              <p className="text-xs text-[#8A532B] dark:text-[#C58B43] font-bold mt-1">
                استاد سطوح عالی و خارج حوزه علمیه
              </p>
            </div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <span className="px-3 py-1 rounded-lg bg-[#8A532B]/12 text-[#8A532B] dark:text-[#E6CA85] text-xs font-bold inline-block">
              معرفی استاد و روش‌شناسی علمی
            </span>
            <h2 className="text-xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              {siteConfig.scholarBioTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-8 text-justify">
              {siteConfig.scholarBioText}
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1E24] border border-[#E6E1D8] dark:border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8A532B] dark:text-[#E6CA85]">
                <GraduationCap className="w-4 h-4" />
                <span>سوابق تدریس و پژوهش:</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {siteConfig.scholarEducation}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Contact Us & Direct Message Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-6 space-y-5 shadow-xs">
            <h3 className="text-base font-bold border-b border-[#E6E1D8] dark:border-zinc-800 pb-3">
              راه‌های ارتباطی و تماس با ما
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8A532B]/12 text-[#8A532B] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 block">شماره تماس دفتر:</span>
                  <strong className="font-num text-sm text-zinc-900 dark:text-white mt-0.5 block">
                    {siteConfig.contactPhone}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8A532B]/12 text-[#8A532B] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 block">پست الکترونیکی:</span>
                  <strong className="font-mono text-sm text-zinc-900 dark:text-white mt-0.5 block">
                    {siteConfig.contactEmail}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8A532B]/12 text-[#8A532B] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 block">نشانی دفتر:</span>
                  <strong className="text-xs text-zinc-900 dark:text-white mt-0.5 block leading-relaxed">
                    {siteConfig.contactAddress}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6E1D8] dark:border-zinc-800 flex flex-wrap gap-2">
              <a
                href={siteConfig.telegramChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#FAF8F5] dark:bg-zinc-900 hover:border-[#8A532B] border border-[#E6E1D8] dark:border-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>کانال تلگرام</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8A532B]" />
              </a>
              <a
                href={siteConfig.eitaaChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#FAF8F5] dark:bg-zinc-900 hover:border-[#8A532B] border border-[#E6E1D8] dark:border-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>کانال ایتا</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8A532B]" />
              </a>
            </div>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="lg:col-span-7 bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-6 space-y-4 shadow-xs"
          >
            <h3 className="text-base font-bold border-b border-[#E6E1D8] dark:border-zinc-800 pb-3">
              ارسال پیام مستقیم به دفتر استاد و پشتیبانی سایت
            </h3>

            {sent && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>پیام شما با موفقیت ثبت شد. کارشناسان دفتر با شما در ارتباط خواهند بود.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  نام و نام خانوادگی:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: علی موسوی"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-zinc-900 border border-[#E6E1D8] dark:border-zinc-800 text-xs font-bold outline-none focus:border-[#8A532B]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  شماره تماس:
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-zinc-900 border border-[#E6E1D8] dark:border-zinc-800 text-xs font-bold outline-none focus:border-[#8A532B]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                متن پیام، سؤال یا درخواست:
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-zinc-900 border border-[#E6E1D8] dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ارسال پیام</span>
            </button>
          </form>
        </section>
      </main>

      <CartModal
        isOpen={isCartOpen}
        items={cartItems}
        currentLang={currentLang}
        onClose={closeCart}
        onRemoveItem={removeItem}
      />
    </div>
  );
}
