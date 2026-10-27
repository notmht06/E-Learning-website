'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { useLanguage } from '@/context/LanguageContext';

interface LocalNoteItem {
  id: string;
  courseTitle: string;
  title: string;
  content: string;
  date: string;
}

const getInitialNotes = (lang: string): LocalNoteItem[] => {
  if (lang === 'en') {
    return [
      {
        id: 'note-1',
        courseTitle: 'Explanation of the Four Journeys (Asfar) - Vol 1',
        title: 'Distinction between the concept and reality of existence',
        content:
          'The concept of existence by primary essential predication is the most self-evident concept, whereas the reality of existence by secondary technical predication is simple and cannot be delimited by definition.',
        date: '2024-09-11',
      },
    ];
  }
  if (lang === 'ar') {
    return [
      {
        id: 'note-1',
        courseTitle: 'شرح الأسفار الأربعة (السفر الأول)',
        title: 'التمايز بين مفهوم الوجود وحقيقته في مدخل الأسفار',
        content:
          'مفهوم الوجود بالحمل الأولي الذاتي أعرف الأشياء وبديهي، أما حقيقته بالحمل الشائع الصناعي فبسيطة ولا تُعرَّف بالحد والرسم.',
        date: '2024-09-11',
      },
    ];
  }
  return [
    {
      id: 'note-1',
      courseTitle: 'شرح اسفار اربعه (سفر اول)',
      title: 'تمایز مفهوم و حقیقت وجود در مدخل اسفار',
      content:
        'مفهوم وجود به حمل اولی ذاتی، اعرف الاشیاء و بدیهی است؛ اما حقیقت وجود به حمل شایع صناعی، غایة الغایات و بسیط است و تعریف‌پذیر نیست.',
      date: '2024-09-11',
    },
  ];
};

export function DashboardNotesTab() {
  const { dict, currentLang, toLocale } = useLanguage();
  const [notes, setNotes] = useState<LocalNoteItem[]>(() => getInitialNotes(currentLang));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('course-falsafe-asfar-1');
  const [newContent, setNewContent] = useState('');

function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days = (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + 78 + jd;
  const jmDays = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336];
  days += jmDays[jm - 1] || 0;
  let gyear = gy + 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days >= 36525) {
    days--;
    gyear += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gyear += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days >= 366) {
    days--;
    gyear += Math.floor(days / 365);
    days %= 365;
  }
  const salA = [0, 31, ((gyear % 4 === 0 && gyear % 100 !== 0) || (gyear % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gmonth = 0;
  while (gmonth < 12 && days >= salA[gmonth + 1]) {
    days -= salA[gmonth + 1];
    gmonth++;
  }
  return new Date(gyear, gmonth, days + 1);
}

function parseSolarDate(str: string): Date | null {
  if (!str) return null;
  const normalized = str
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const match = normalized.match(/^(1[34]\d{2})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) return null;
  return jalaliToGregorian(parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10));
}

  const formatNoteDate = (isoOrDateStr: string) => {
    if (!isoOrDateStr) return '';
    try {
      const solarDate = parseSolarDate(isoOrDateStr);
      const d = solarDate || new Date(isoOrDateStr);
      if (isNaN(d.getTime())) return toLocale(isoOrDateStr);
      if (currentLang === 'en') {
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
      if (currentLang === 'ar') {
        return d.toLocaleDateString('ar-SA');
      }
      return d.toLocaleDateString('fa-IR');
    } catch {
      return toLocale(isoOrDateStr);
    }
  };

  useEffect(() => {
    let mounted = true;
    apiClient.notes
      .getAll()
      .then((serverNotes) => {
        if (mounted && Array.isArray(serverNotes) && serverNotes.length > 0) {
          setNotes(
            serverNotes.map((n) => ({
              id: n.id,
              courseTitle: n.course_id,
              title: n.title,
              content: n.content,
              date: n.created_at,
            }))
          );
        }
      })
      .catch((err) => { console.warn('Failed to load notes:', err); })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isSaving) return;

    setIsSaving(true);
    const nowIso = new Date().toISOString();
    try {
      const created = await apiClient.notes.create(newCourse, 1, newTitle.trim(), newContent.trim(), 0);
      setNotes((prev) => [
        {
          id: created.id,
          courseTitle: created.course_id,
          title: created.title,
          content: created.content,
          date: created.created_at || nowIso,
        },
        ...prev,
      ]);
    } catch (saveErr) {
      console.warn('Failed to save note via API, using local fallback:', saveErr);
      setNotes((prev) => [
        {
          id: `note-${Date.now()}`,
          courseTitle: newCourse,
          title: newTitle.trim(),
          content: newContent.trim(),
          date: nowIso,
        },
        ...prev,
      ]);
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiClient.notes.delete(id);
    } catch (delErr) {
      console.warn('Failed to delete note via API:', delErr);
    }
  };

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
            {dict.dash_notes_header || 'یادداشت‌های درسی من'}
          </h2>
          <p className="text-xs text-zinc-500">
            {dict.dash_notes_sub || 'ثبت نکات کلیدی و یادداشت‌های درسی شما در طول دوره'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.dash_notes_add_btn || 'ثبت یادداشت جدید'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#8A532B]" />
          <span>
            {currentLang === 'en'
              ? 'Loading study notes...'
              : currentLang === 'ar'
              ? 'جارٍ تحميل الملاحظات الدراسية...'
              : 'در حال بارگذاری یادداشت‌ها...'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8A532B]/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#8A532B] dark:text-[#C58B43]">
                    {note.courseTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-zinc-400 hover:text-[#8A532B] transition cursor-pointer"
                    title={
                      dict.dash_notes_del_title ||
                      (currentLang === 'en'
                        ? 'Delete Note'
                        : currentLang === 'ar'
                        ? 'حذف الملاحظة'
                        : 'حذف یادداشت')
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">{note.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E6E1D8] dark:border-[#22242A] flex justify-between text-[11px] text-zinc-400 font-num">
                <span>
                  {currentLang === 'en'
                    ? 'Date: '
                    : currentLang === 'ar'
                    ? 'تاريخ التدوين: '
                    : 'تاریخ ثبت: '}
                  {formatNoteDate(note.date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl max-w-md w-full p-6 space-y-4 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6E1D8] dark:border-[#22242A] pb-3">
              <h3 className="text-base font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
                {currentLang === 'en'
                  ? 'Add New Study Note'
                  : currentLang === 'ar'
                  ? 'إضافة ملاحظة دراسية جديدة'
                  : 'افزودن یادداشت جدید'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {currentLang === 'en'
                    ? 'Related Course ID / Title'
                    : currentLang === 'ar'
                    ? 'معرف أو عنوان الدورة المرتبطة'
                    : 'شناسه یا عنوان دوره مرتبط'}
                </label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs outline-none focus:border-[#8A532B]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {currentLang === 'en'
                    ? 'Note Topic / Title'
                    : currentLang === 'ar'
                    ? 'موضوع الملاحظة'
                    : 'موضوع یادداشت'}
                </label>
                <input
                  type="text"
                  placeholder={
                    currentLang === 'en'
                      ? 'e.g. The circularity problem in defining motion'
                      : currentLang === 'ar'
                      ? 'مثال: إشكال الدور في تعريف الحركة'
                      : 'مثلاً: اشکال دور در تعریف حرکت'
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs outline-none focus:border-[#8A532B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {currentLang === 'en'
                    ? 'Analytical Content'
                    : currentLang === 'ar'
                    ? 'النص التحليلي للملاحظة'
                    : 'متن تحلیلی یادداشت'}
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    currentLang === 'en'
                      ? 'Key insights expounded by the professor...'
                      : currentLang === 'ar'
                      ? 'النقاط التحقيقية التي تفضل بها الأستاذ...'
                      : 'نکات فرموده‌شده توسط استاد...'
                  }
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs outline-none focus:border-[#8A532B]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1D8] dark:border-[#22242A] text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer"
                >
                  {currentLang === 'en'
                    ? 'Cancel'
                    : currentLang === 'ar'
                    ? 'إلغاء'
                    : 'انصراف'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {isSaving
                    ? currentLang === 'en'
                      ? 'Saving...'
                      : currentLang === 'ar'
                      ? 'جارٍ الحفظ...'
                      : 'در حال ثبت...'
                    : currentLang === 'en'
                    ? 'Save Note'
                    : currentLang === 'ar'
                    ? 'حفظ الملاحظة'
                    : 'ثبت یادداشت'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
