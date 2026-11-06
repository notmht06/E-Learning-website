'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Globe,
  MessageSquare,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export function AdminSettingsTab() {
  const { siteConfig, updateSiteConfig } = useData();
  const { dict } = useLanguage();

  const [activeSection, setActiveSection] = useState<'hero' | 'bio' | 'links' | 'ai'>('hero');
  const [formData, setFormData] = useState<Record<string, any>>({ ...siteConfig });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const { apiClient } = await import('@/services/apiClient');
      const res = await apiClient.admin.uploadMedia(file);
      if (res?.file_url) {
        const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');
        const fullUrl = res.file_url.startsWith('/static/') ? `${apiOrigin}${res.file_url}` : res.file_url;
        setFormData((prev: any) => ({ ...prev, scholar_avatar: fullUrl }));
        toast.success('تصویر جدید استاد با موفقیت بارگذاری شد.');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('خطا در بارگذاری تصویر');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (siteConfig && Object.keys(siteConfig).length > 0) {
      setFormData({ ...siteConfig });
    }
  }, [siteConfig]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Always enforce official scholar identity
      const payload = {
        ...formData,
        scholar_name_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
        scholar_name_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
        scholar_name_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
      };
      await updateSiteConfig(payload);
      toast.success('تنظیمات پایگاه با موفقیت در سرور ذخیره شد.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('خطا در ذخیره تنظیمات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#8A532B]" />
            <span>تنظیمات سراسری پایگاه و سامانه مدیریت محتوا (Zero-Code CMS)</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            ویرایش مستقیم عنوان صفحه اول، بنر اعلانات، زندگینامه، پیوندهای شبکه‌های ارتباطی و تنظیمات دستیار هوش مصنوعی
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره سراسری تنظیمات'}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl gap-1.5 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveSection('hero')}
          className={`px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer font-bold flex items-center gap-2 shrink-0 ${
            activeSection === 'hero'
              ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>صفحه نخست و نوار اعلان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('bio')}
          className={`px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer font-bold flex items-center gap-2 shrink-0 ${
            activeSection === 'bio'
              ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>زندگینامه و آماره‌های پلتفرم</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('links')}
          className={`px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer font-bold flex items-center gap-2 shrink-0 ${
            activeSection === 'links'
              ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>راه‌های ارتباطی و پخش زنده</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('ai')}
          className={`px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer font-bold flex items-center gap-2 shrink-0 ${
            activeSection === 'ai'
              ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>دستیار هوش مصنوعی و RAG</span>
        </button>
      </div>

      {/* Main Settings Form Container */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
        {/* SECTION 1: HERO & ANNOUNCEMENT */}
        {activeSection === 'hero' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                نام رسمی استاد (SCHOLAR IDENTITY)
              </label>
              <input
                type="text"
                disabled
                value="حجت الاسلام دکتر زنجیر زن حسینی"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-zinc-400 mt-0.5 block">
                تثبیت‌شده طبق دستورالعمل‌های بنیادین معماری
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  عنوان اصلی هیرو (صفحه نخست)
                </label>
                <input
                  type="text"
                  value={formData.hero_title_fa || ''}
                  onChange={(e) => handleChange('hero_title_fa', e.target.value)}
                  placeholder="پایگاه تخصصی حکمت اسلامی و علوم عقلی"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  زیرعنوان هیرو
                </label>
                <input
                  type="text"
                  value={formData.hero_subtitle_fa || ''}
                  onChange={(e) => handleChange('hero_subtitle_fa', e.target.value)}
                  placeholder="تحت اشراف و تدریس حجت الاسلام دکتر زنجیر زن حسینی"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">نوار اعلان سراسری بالای سایت</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">نمایش پیام‌های مهم، تقویم ترم جدید یا ثبت‌نام کلاس‌ها در بالاترین بخش تمامی صفحات</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(formData.announcement_bar_active)}
                  onClick={() => handleChange('announcement_bar_active', !formData.announcement_bar_active)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0 ${
                    formData.announcement_bar_active
                      ? 'bg-[#8A532B] dark:bg-[#C58B43]'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      formData.announcement_bar_active ? 'ltr:translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <input
                type="text"
                value={formData.announcement_bar_text || ''}
                onChange={(e) => handleChange('announcement_bar_text', e.target.value)}
                placeholder="آغاز ثبت‌نام دوره جامع حکمت اشراق و اسفار اربعه — سال تحصیلی جدید"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
              />
            </div>
          </div>
        )}

        {/* SECTION 2: BIO & SRE STATS */}
        {activeSection === 'bio' && (
          <div className="space-y-5">
            {/* Academic Scholar Profile Card with Direct Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <img
                src={formData.scholar_avatar || '/images/ostad_zanjirzan.jpg'}
                alt="حجت الاسلام دکتر زنجیر زن حسینی"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#8A532B]/40 shadow-sm"
              />
              <div className="space-y-2 text-center sm:text-start flex-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  تصویر رسمی پروفایل استاد (حجت الاسلام دکتر زنجیر زن حسینی)
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  این تصویر در کارت‌های معرفی، هیرو و شناسنامه علمی استاد در سراسر سامانه به صورت زنده نمایش داده می‌شود.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold cursor-pointer transition-all active:scale-95">
                  <span>{isUploadingAvatar ? 'در حال بارگذاری تصویر...' : 'انتخاب و آپلود عکس استاد از کامپیوتر'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                شرح حال و زندگینامه علمی استاد (پاورقی و صفحه درباره استاد)
              </label>
              <textarea
                rows={4}
                value={formData.bio_fa || ''}
                onChange={(e) => handleChange('bio_fa', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] resize-none leading-relaxed transition-colors"
              />
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3">آماره‌های سامانه (Platform SRE Metrics)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-500 block mb-1">سابقه تدریس (سال)</label>
                  <input
                    type="text"
                    value={formData.stat_years || ''}
                    onChange={(e) => handleChange('stat_years', e.target.value)}
                    placeholder="۲۵+"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-num"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 block mb-1">جلسات صوتی ضبط‌شده</label>
                  <input
                    type="text"
                    value={formData.stat_sessions || ''}
                    onChange={(e) => handleChange('stat_sessions', e.target.value)}
                    placeholder="۱,۲۰۰+"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-num"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 block mb-1">آثار مکتوب و شروح</label>
                  <input
                    type="text"
                    value={formData.stat_books || ''}
                    onChange={(e) => handleChange('stat_books', e.target.value)}
                    placeholder="۱۴"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-num"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 block mb-1">دانش‌پژوهان فعال</label>
                  <input
                    type="text"
                    value={formData.stat_students || ''}
                    onChange={(e) => handleChange('stat_students', e.target.value)}
                    placeholder="۵,۰۰۰+"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-num"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: COMMUNICATIONS & SUPPORT */}
        {activeSection === 'links' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  پشتیبانی تلگرام
                </label>
                <input
                  type="text"
                  value={formData.telegram_support || ''}
                  onChange={(e) => handleChange('telegram_support', e.target.value)}
                  placeholder="https://t.me/zanjirzan_support"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  کانال تلگرام درس‌گفتارها
                </label>
                <input
                  type="text"
                  value={formData.telegram_channel || ''}
                  onChange={(e) => handleChange('telegram_channel', e.target.value)}
                  placeholder="https://t.me/zanjirzan_philosophy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  کانال ایتا
                </label>
                <input
                  type="text"
                  value={formData.eitaa_channel || ''}
                  onChange={(e) => handleChange('eitaa_channel', e.target.value)}
                  placeholder="https://eitaa.com/zanjirzan_philosophy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  اتاق پخش زنده اسکای‌روم (پیش‌فرض)
                </label>
                <input
                  type="text"
                  value={formData.skyroom_default_url || ''}
                  onChange={(e) => handleChange('skyroom_default_url', e.target.value)}
                  placeholder="https://www.skyroom.online/ch/zanjirzan/live"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                متن حق تالیف و پاورقی (Footer Copyright)
              </label>
              <input
                type="text"
                value={formData.footer_copyright_fa || ''}
                onChange={(e) => handleChange('footer_copyright_fa', e.target.value)}
                placeholder="تمامی حقوق مادی و معنوی متعلق به پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی است."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
              />
            </div>
          </div>
        )}

        {/* SECTION 4: AI ASSISTANT & RAG */}
        {activeSection === 'ai' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                پیام آغازین دستیار هوشمند علمی
              </label>
              <textarea
                rows={3}
                value={formData.ai_welcome_message || ''}
                onChange={(e) => handleChange('ai_welcome_message', e.target.value)}
                placeholder="سلام! من دستیار هوشمند علمی پایگاه حجت الاسلام دکتر زنجیر زن حسینی هستم..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] resize-none leading-relaxed transition-colors"
              />
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>پاسخ‌گویی انحصاری بر اساس متون و دروس استاد (Strict Corpus Mode)</span>
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  در صورت فعال بودن، مدل هوش مصنوعی تنها به متون معتبر تدریس‌های استاد استناد می‌کند و از حدس‌های متفرقه امتناع می‌ورزد.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(formData.strict_corpus_only)}
                onClick={() => handleChange('strict_corpus_only', !formData.strict_corpus_only)}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0 ${
                  formData.strict_corpus_only
                    ? 'bg-[#8A532B] dark:bg-[#C58B43]'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                    formData.strict_corpus_only ? 'ltr:translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                پرسش‌های پیشنهادی سریع (هر خط یک پرسش)
              </label>
              <textarea
                rows={4}
                value={
                  Array.isArray(formData.suggested_questions)
                    ? formData.suggested_questions.join('\n')
                    : formData.suggested_questions || ''
                }
                onChange={(e) =>
                  handleChange(
                    'suggested_questions',
                    e.target.value.split('\n').filter((q) => q.trim().length > 0)
                  )
                }
                placeholder="اصالت وجود در حکمت متعالیه چیست؟&#10;سلسله مراتب انوار در حکمت اشراق&#10;برهان صدیقین در اثبات واجب تعالی"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] font-mono leading-relaxed transition-colors"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'در حال اعمال تغییرات...' : 'ثبت نهایی و انتشار بر روی پایگاه'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
