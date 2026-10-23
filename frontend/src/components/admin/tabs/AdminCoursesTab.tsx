'use client';

import React, { useState } from 'react';
import {
  Headphones,
  Plus,
  Search,
  Trash2,
  Edit,
  Radio,
  Clock,
  ExternalLink,
  CheckCircle2,
  X,
  Upload,
} from 'lucide-react';
import { useData, AudioChapter } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { AudioCourse, coursesDatabase } from '@/lib/data';
import { AudioUploaderModal } from '@/components/AudioUploaderModal';

export function AdminCoursesTab() {
  const {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    addEpisode,
    updateEpisode,
    deleteEpisode,
    categories,
  } = useData();
  const { toLocale, dict } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedCourseForStudio, setSelectedCourseForStudio] = useState<string | null>(null);
  const [isAudioUploaderOpen, setIsAudioUploaderOpen] = useState(false);

  // Async submission & loading states
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [isSubmittingEpisode, setIsSubmittingEpisode] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingEpisodeId, setDeletingEpisodeId] = useState<number | null>(null);

  // New Course State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('حکمت متعالیه');
  const [newLevel, setNewLevel] = useState('سطح خارج و تخصصی');
  const [newPrice, setNewPrice] = useState('رایگان پژوهشی');
  const [newType, setNewType] = useState<'offline' | 'online'>('offline');
  const [newDesc, setNewDesc] = useState('');

  // New Chapter State inside Studio
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('۴۵:۰۰');
  const [newEpAudioUrl, setNewEpAudioUrl] = useState('');
  const [newEpIsFree, setNewEpIsFree] = useState(false);

  const coursesList = Object.values(courses).filter((c) => {
    const matchesSearch = !search || c.title_fa.includes(search);
    const matchesCat = selectedCategory === 'all' || c.subject === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmittingCourse) return;

    setIsSubmittingCourse(true);
    const id = `course-${Date.now()}`;
    const baseCourse = coursesDatabase['course1'] || Object.values(coursesDatabase)[0];
    const newCourse: AudioCourse = {
      ...baseCourse,
      id,
      title_fa: newTitle,
      title_ar: newTitle,
      title_en: newTitle,
      instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
      instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
      instructor_en: 'Hujjat al-Islam Dr. Zanjirzan Hosseini',
      subject: newCategory,
      level_fa: newLevel,
      level_ar: 'تخصصي',
      level_en: 'Advanced',
      price_fa: newPrice,
      price_ar: newPrice,
      price_en: 'Free',
      course_type: newType,
      desc_fa: newDesc || `درس‌گفتار استودیویی تدریس‌شده توسط حجت الاسلام دکتر زنجیر زن حسینی در شاخه ${newCategory}.`,
      duration_fa: '۴۵ ساعت',
      duration_ar: '٤٥ ساعة',
      duration_en: '45 Hours',
      episodes_count: 1,
      thumbnail: '/images/ostad_zanjirzan.jpg',
      chapters: [
        {
          id: 1,
          title_fa: 'مدخل و مقدمات اجتهادی',
          duration: '۴۵:۰۰',
          isFreePreview: true,
        },
      ],
    };

    try {
      await addCourse(newCourse);
      setIsAddCourseModalOpen(false);
      setNewTitle('');
      setNewDesc('');
    } catch {
      // Toast notification is managed by DataContext
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForStudio || !newEpTitle.trim() || isSubmittingEpisode) return;

    setIsSubmittingEpisode(true);
    const course = courses[selectedCourseForStudio];
    const newId = (course?.chapters?.length || 0) + 1;
    const ch: AudioChapter = {
      id: newId,
      title_fa: newEpTitle,
      duration: newEpDuration,
      audioUrl: newEpAudioUrl || undefined,
      isFreePreview: newEpIsFree,
    };

    try {
      await addEpisode(selectedCourseForStudio, ch);
      setNewEpTitle('');
      setNewEpAudioUrl('');
    } catch {
      // Toast notification is managed by DataContext
    } finally {
      setIsSubmittingEpisode(false);
    }
  };

  const activeStudioCourse = selectedCourseForStudio ? courses[selectedCourseForStudio] : null;

  return (
    <div className="space-y-6 text-start">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در عناوین دروس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-8 pe-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none text-zinc-700 dark:text-zinc-300"
          >
            <option value="all">همه شاخه‌های علمی</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name_fa}>
                {c.name_fa}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsAddCourseModalOpen(true)}
          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن دوره جدید</span>
        </button>
      </div>

      {/* Courses List Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">عنوان دوره</th>
                <th className="py-3 px-4 font-normal text-start">موضوع علمی</th>
                <th className="py-3 px-4 font-normal text-start">نوع برگزاری</th>
                <th className="py-3 px-4 font-normal text-start">تعداد جلسات</th>
                <th className="py-3 px-4 font-normal text-start">قیمت</th>
                <th className="py-3 px-4 font-normal text-start">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {coursesList.map((course) => (
                <tr key={course.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                    {course.title_fa}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-medium">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {course.subject || 'حکمت'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {course.course_type === 'online' ? 'کارگاه زنده اسکای‌روم' : 'استودیویی آفلاین'}
                  </td>
                  <td className="py-3 px-4 font-num text-zinc-600 dark:text-zinc-400">
                    {toLocale(course.chapters?.length || 0)} جلسه
                  </td>
                  <td className="py-3 px-4 font-bold text-[#8A532B]">
                    {course.price_fa || 'رایگان'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCourseForStudio(course.id)}
                        className="px-3 py-1 rounded-lg bg-[#8A532B]/10 hover:bg-[#8A532B]/20 text-[#8A532B] text-[11px] font-medium transition cursor-pointer"
                      >
                        استودیو جلسات
                      </button>
                      <button
                        disabled={deletingCourseId === course.id}
                        onClick={async () => {
                          if (confirm(`آیا از حذف دوره «${course.title_fa}» اطمینان دارید؟`)) {
                            setDeletingCourseId(course.id);
                            try {
                              await deleteCourse(course.id);
                            } catch {
                              // Toast managed by DataContext
                            } finally {
                              setDeletingCourseId(null);
                            }
                          }
                        }}
                        className="p-1 rounded-lg text-[#8A532B] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/20 disabled:opacity-50 transition cursor-pointer"
                        title="حذف دوره"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Episode Studio Modal / Drawer */}
      {activeStudioCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  استودیو جلسات: {activeStudioCourse.title_fa}
                </h3>
                <p className="text-xs text-zinc-500">
                  مدیریت فایل‌های صوتی ۴۸kHz، مدت‌زمان و وضعیت پیش‌نمایش رایگان
                </p>
              </div>
              <button
                onClick={() => setSelectedCourseForStudio(null)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Chapters List */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-zinc-400">فهرست جلسات ضبط‌شده</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activeStudioCourse.chapters?.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400">[{toLocale(idx + 1)}]</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{ch.title_fa}</span>
                      {ch.isFreePreview && (
                        <span className="px-2 py-0.5 rounded bg-[#8A532B]/10 text-[#8A532B] text-[10px] font-mono">
                          FREE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-num text-zinc-500">{ch.duration}</span>
                      <button
                        disabled={deletingEpisodeId === ch.id}
                        onClick={async () => {
                          setDeletingEpisodeId(ch.id);
                          try {
                            await deleteEpisode(activeStudioCourse.id, ch.id);
                          } catch {
                            // Toast managed by DataContext
                          } finally {
                            setDeletingEpisodeId(null);
                          }
                        }}
                        className="text-[#8A532B] hover:text-[#8A532B] disabled:opacity-50 cursor-pointer"
                        title="حذف جلسه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Episode Form */}
            <form onSubmit={handleAddEpisode} className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-mono text-zinc-400">افزودن جلسه صوتی جدید</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="عنوان جلسه (مثلاً: برهان امکان و وجوب)"
                  value={newEpTitle}
                  onChange={(e) => setNewEpTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  required
                />
                <input
                  type="text"
                  placeholder="مدت‌زمان (مثلاً: ۴۲:۱۵)"
                  value={newEpDuration}
                  onChange={(e) => setNewEpDuration(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freePreview"
                  checked={newEpIsFree}
                  onChange={(e) => setNewEpIsFree(e.target.checked)}
                  className="rounded border-zinc-300 text-[#8A532B] focus:ring-[#8A532B]"
                />
                <label htmlFor="freePreview" className="text-xs text-zinc-600 dark:text-zinc-400">
                  پیش‌نمایش رایگان (بدون نیاز به ثبت‌نام کامل)
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsAudioUploaderOpen(true)}
                  className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>آپلود فایل صوت ۴۸kHz</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingEpisode}
                  className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] disabled:opacity-50 text-white text-xs font-medium transition cursor-pointer"
                >
                  {isSubmittingEpisode ? 'در حال ثبت در سرور...' : 'ثبت جلسه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ایجاد دوره تخصصی جدید
              </h3>
              <button
                onClick={() => setIsAddCourseModalOpen(false)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">عنوان دوره</label>
                <input
                  type="text"
                  placeholder="مثال: شرح اسفار اربعه (سفر اول)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">موضوع علمی</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name_fa}>
                        {c.name_fa}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">شیوه برگزاری</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none"
                  >
                    <option value="offline">استودیویی آفلاین</option>
                    <option value="online">کارگاه زنده اسکای‌روم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">شهریه / وضعیت قیمت</label>
                <input
                  type="text"
                  placeholder="مثلاً: رایگان پژوهشی یا ۱,۲۰۰,۰۰۰ تومان"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">توضیحات اجمالی دوره</label>
                <textarea
                  rows={3}
                  placeholder="اهداف آموزشی، مبانی استدلال و پیش‌نیازها..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCourse}
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] disabled:opacity-50 text-white text-xs font-medium"
                >
                  {isSubmittingCourse ? 'در حال ثبت در سرور...' : 'ثبت دوره'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audio Uploader Modal */}
      {isAudioUploaderOpen && (
        <AudioUploaderModal
          isOpen={isAudioUploaderOpen}
          courseTitle={selectedCourseForStudio ? courses[selectedCourseForStudio]?.title_fa || 'درس‌گفتار استودیویی' : 'درس‌گفتار استودیویی'}
          onClose={() => setIsAudioUploaderOpen(false)}
          onUploadSuccess={(data) => {
            setNewEpTitle(data.title_fa);
            setNewEpDuration(data.duration);
            setNewEpAudioUrl(data.audioUrl);
            setNewEpIsFree(data.isFreePreview);
            setIsAudioUploaderOpen(false);
          }}
        />
      )}
    </div>
  );
}
