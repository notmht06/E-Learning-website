'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, BookOpen, Edit3, Save, Printer, Sparkles } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';
import { Callout, KeyTerms } from '@/components/ui/LessonNote';

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
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiClient.courses
      .getChapterAiSummary(courseId, chapterId)
      .then((res) => {
        if (isMounted && res?.summary_fa) {
          setAiSummary(res.summary_fa);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [courseId, chapterId]);

  const handleCopyAiSummary = () => {
    triggerTactileHaptic('tick');
    if (typeof navigator !== 'undefined' && navigator.clipboard && aiSummary) {
      navigator.clipboard.writeText(`${chapterTitle}\n\n${aiSummary}`);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    }
  };

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

  const monographContent = dict.ui_in_this_foundational_lecture_on_ration;

  return (
    <div className="space-y-6 text-start">
      {/* AI Session Summary Card */}
      {aiSummary && (
        <article className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141518] border border-[#8A532B]/30 dark:border-[#C58B43]/30 space-y-4 shadow-xs animate-in fade-in-0 duration-200">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D8] dark:border-[#22242A] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/10 flex items-center justify-center text-[#8A532B] dark:text-[#C58B43]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  خلاصه تحلیلی جلسه (هوش مصنوعی حکمت‌یار)
                </h3>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">استخراج خودکار از صوت و جزوه رسمی استاد</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyAiSummary}
              className="px-2.5 py-1.5 rounded-xl border border-[#E6E1D8] dark:border-[#22242A] text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B] hover:text-[#8A532B] transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'کپی شد' : 'کپی خلاصه'}</span>
            </button>
          </header>
          <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed sm:leading-loose whitespace-pre-line">
            {aiSummary}
          </div>
        </article>
      )}

      {/* Monograph Card */}
      <article className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] space-y-4 shadow-xs">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D8] dark:border-[#22242A] pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <h3 className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              {dict.learn_monograph_title}
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
                    {dict.learn_monograph_copied}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{dict.learn_monograph_copy}</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Official Monograph Prose */}
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed sm:leading-loose">
          <p>{monographContent}</p>
        </div>

        {/* Core Philosophical Terminology & Callouts from VibeFarsi LessonNote */}
        <div className="space-y-4 pt-3 border-t border-[#E6E1D8]/60 dark:border-[#22242A]/60">
          <Callout kind="quote" title="فراز برگزیده از تدریس استاد">
            «حقیقت وجود، امری اصیل و مشکک است که ماهیات تنها به منزله حدود و تعیّنات عدمی آن در صقع عقل ادراک می‌شوند.»
          </Callout>

          <Callout kind="tip" title="مسئله محوری این جلسه">
            تمایز میان مفهوم وجود (که امری بدیهی و عام‌ترین مفاهیم است) با حقیقت عینی وجود (که کنه آن جز به شهود برهانی یا عیان معصوم درک نمی‌شود).
          </Callout>

          <KeyTerms
            terms={[
              {
                term: 'اصالت وجود (Fundamentality of Existence)',
                definition: 'مبنای بنیادین حکمت متعالیه که هستی را متن واقعیت و عین تحقق خارج دانسته و ماهیت را امر اعتباری و ظلّی برمی‌شمارد.',
              },
              {
                term: 'تشکیک در وجود (Gradation of Being)',
                definition: 'وحدت در عین کثرت و کثرت در عین وحدت؛ حقیقت هستی دارای مراتب طولی از فیض اقدس تا هیولای اولی است.',
              },
            ]}
          />
        </div>

        {/* Academic Source Citation Footnote */}
        <footer className="pt-3 border-t border-[#E6E1D8]/60 dark:border-[#22242A]/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>{courseTitle} • {chapterTitle}</span>
          <span>{dict.scholar_name}</span>
        </footer>
      </article>

      {/* Personal Notes Scratchpad */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              {dict.learn_personal_notes_title}
            </h4>
          </div>

          {isSaved && (
            <span className="text-[11px] font-mono text-[#C58B43] flex items-center gap-1">
              <Save className="w-3 h-3" />
              <span>{dict.learn_personal_notes_saved}</span>
            </span>
          )}
        </div>

        <textarea
          value={personalNotes}
          onChange={handleNotesChange}
          placeholder={
            dict.learn_personal_notes_placeholder
          }
          rows={5}
          className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#8A532B] transition placeholder:text-zinc-400 resize-y leading-relaxed"
        />
      </section>
    </div>
  );
}
