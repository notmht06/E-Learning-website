'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, BookOpen, Edit3, Save, Printer } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

export interface LessonNotesTabProps {
  courseId: string;
  chapterId: number;
  courseTitle: string;
  chapterTitle: string;
}

export function LessonNotesTab({
  courseId,
  chapterId,
  courseTitle,
  chapterTitle,
}: LessonNotesTabProps) {
  const { toLocale, dict, currentLang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const storageKey = `zanjirzan_notes_${courseId}_${chapterId}`;

  // Hydrate personal notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setPersonalNotes(saved);
        } else {
          setPersonalNotes('');
        }
      } catch (err) {
        console.debug('Failed to read notes from localStorage:', err);
      }
    }
  }, [storageKey]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPersonalNotes(val);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, val);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } catch (err) {
        console.debug('Failed to write notes to localStorage:', err);
      }
    }
  };

  const handleCopyMonograph = () => {
    triggerTactileHaptic('tick');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${chapterTitle}\n\n${monographContent}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const monographContent = currentLang === 'en'
    ? `In this foundational lecture on rational sciences and ontological foundations, Hojjat al-Islam Dr. Zanjirzan Hosseini examines the primordial distinction between conception (Tasawwur) and assent (Tasdiq). The investigation begins by addressing whether existence is self-evident in its conceptual essence while demanding rigorous dialectical proof in its external reality. Drawing upon the first journey of Asfar al-Arba'ah, the discussion illuminates how mental existence relates to concrete individuation, demonstrating that reality is fundamentally singular, gradational, and active rather than composed of static essences.`
    : currentLang === 'ar'
    ? `في هذا الدرس التأسيسي من دروس الحكمة والعلوم العقلية، يتناول حجة الإسلام الدكتور زنجير زن حسيني التمايز الجوهري بين التصور والتصديق، مبيناً أن حقيقة الوجود بدهية التصور نظرية التصديق في مراتب تحققها الخارجي. ويستند البحث إلى السفر الأول من الأسفار الأربعة لتحقيق مسألة الوجود الذهني وأصالته، ودفع شبهات القائلين بأصالة الماهية، مؤكداً أن الحقيقة العينية واحدة مشككة ذات مراتب لا تتناهى.`
    : `در این درس‌گفتار بنیادین از مباحث علوم عقلی و حکمت صدرایی، حجت الاسلام دکتر زنجیر زن حسینی به تبیین دقیق تمایز میان تصور و تصدیق و بررسی اصالت حقیقت وجود می‌پردازند. محور اصلی بحث بر این برهان استوار است که مفهوم وجود از بدیهی‌ترین مفاهیم ذهنی است، در حالی که حقیقت عینی آن کمال صرف، بسیط و مشکک است. با بازخوانی عبارات سفر اول کتاب اسفار اربعه، نشان داده می‌شود که ماهیات اموری اعتباری بوده و تنها به واسطه نور وجود در خارج تحقق می‌یابند. این تبیین برهانی، بنیاد استوار ورود به مباحث حرکت جوهری و اثبات توحید وجودی را فراهم می‌سازد.`;

  return (
    <div className="space-y-6 text-start">
      {/* Monograph Card */}
      <article className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] space-y-4 shadow-xs">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D8] dark:border-[#22242A] pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <h3 className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              {dict.learn_monograph_title || 'متن پیاده‌شده و مصحح جلسه'}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyMonograph}
              className="px-3 py-1.5 rounded-xl border border-[#E6E1D8] dark:border-[#22242A] text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B] hover:text-[#8A532B] transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {dict.learn_monograph_copied || 'متن تقریر کپی شد'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{dict.learn_monograph_copy || 'کپی متن تقریر'}</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Official Monograph Prose */}
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed sm:leading-loose">
          <p>{monographContent}</p>
        </div>

        {/* Academic Source Citation Footnote */}
        <footer className="pt-3 border-t border-[#E6E1D8]/60 dark:border-[#22242A]/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>{courseTitle} • {chapterTitle}</span>
          <span>{dict.scholar_name || 'حجت الاسلام دکتر زنجیر زن حسینی'}</span>
        </footer>
      </article>

      {/* Personal Notes Scratchpad */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              {dict.learn_personal_notes_title || 'دفترچه یادداشت‌های شخصی دانش‌پژوه'}
            </h4>
          </div>

          {isSaved && (
            <span className="text-[11px] font-mono text-[#C58B43] flex items-center gap-1">
              <Save className="w-3 h-3" />
              <span>{dict.learn_personal_notes_saved || 'یادداشت‌ها در حافظه مرورگر ذخیره شد'}</span>
            </span>
          )}
        </div>

        <textarea
          value={personalNotes}
          onChange={handleNotesChange}
          placeholder={
            dict.learn_personal_notes_placeholder ||
            'اشکالات، نکات برهانی و برداشت‌های خود از این جلسه را اینجا ثبت فرمایید (ذخیره خودکار در مرورگر)...'
          }
          rows={5}
          className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#8A532B] transition placeholder:text-zinc-400 resize-y leading-relaxed"
        />
      </section>
    </div>
  );
}
