'use client';

import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Upload,
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  RotateCw,
  Video,
  Headphones,
  Check,
  FileText,
} from 'lucide-react';
import { useData, AudioChapter } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { AudioCourse, coursesDatabase } from '@/lib/data';
import { AudioUploaderModal } from '@/components/AudioUploaderModal';
import { apiClient } from '@/services/apiClient';
import { AdminConfirmDialog } from '../AdminConfirmDialog';
import RichTextCmsEditor from '../RichTextCmsEditor';

export function AdminCoursesTab() {
  const {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    addEpisode,
    deleteEpisode,
    categories,
  } = useData();
  const { toLocale, dict } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [selectedCourseForStudio, setSelectedCourseForStudio] = useState<string | null>(null);
  const [isMediaUploaderOpen, setIsMediaUploaderOpen] = useState(false);
  const handoutFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingHandout, setIsUploadingHandout] = useState(false);
  const [selectedChapterForHandout, setSelectedChapterForHandout] = useState<{ id: number; title: string } | null>(null);

  const handleHandoutUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeStudioCourse) return;
    setIsUploadingHandout(true);
    try {
      const uploadRes = await apiClient.admin.uploadMedia(file);
      const chId = selectedChapterForHandout?.id;
      const chTitle = selectedChapterForHandout?.title || '';
      await apiClient.admin.uploadAndIndexHandout(activeStudioCourse.id, {
        title: chTitle ? `جزوه جلسه: ${chTitle}` : `جزوه رسمی ${file.name.replace(/\.[^/.]+$/, '')}`,
        file_url: uploadRes.file_url,
        chapter_id: chId,
      });
    } catch (err: any) {
      console.error('Failed to upload/index handout:', err);
    } finally {
      setIsUploadingHandout(false);
      setSelectedChapterForHandout(null);
      if (e.target) e.target.value = '';
    }
  };

  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Reusable confirmation states replacing native confirm()
  const [courseToDelete, setCourseToDelete] = useState<AudioCourse | null>(null);
  const [episodeToDelete, setEpisodeToDelete] = useState<{
    courseId: string;
    episodeId: number;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Course Form State (Create & Edit)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('فلسفه');
  const [formLevel, setFormLevel] = useState('سطوح عالی و خارج');
  const [formPrice, setFormPrice] = useState('رایگان');
  const [formType, setFormType] = useState<'offline' | 'online'>('offline');
  const [formMediaType, setFormMediaType] = useState<'video' | 'audio' | 'hybrid'>('hybrid');
  const [formThumbnail, setFormThumbnail] = useState('/images/ostad_zanjirzan.jpg');
  const [formDesc, setFormDesc] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const coursesList = Object.values(courses).filter((c) => {
    const matchesSearch = !search || c.title_fa.includes(search);
    const matchesCat = selectedCategory === 'all' || c.subject === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openCreateCourseModal = () => {
    setEditingCourseId(null);
    setFormTitle('');
    setFormCategory(categories[0]?.name_fa || 'فلسفه');
    setFormLevel('سطوح عالی و خارج');
    setFormPrice('رایگان');
    setFormType('offline');
    setFormMediaType('hybrid');
    setFormThumbnail('/images/ostad_zanjirzan.jpg');
    setFormDesc('');
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course: AudioCourse) => {
    setEditingCourseId(course.id);
    setFormTitle(course.title_fa);
    setFormCategory(course.subject || 'فلسفه');
    setFormLevel(course.level_fa || 'سطوح عالی و خارج');
    setFormPrice(course.price_fa || 'رایگان');
    setFormType(course.course_type || 'offline');
    setFormMediaType(course.media_type || 'hybrid');
    setFormThumbnail(course.thumbnail || '/images/ostad_zanjirzan.jpg');
    setFormDesc(course.desc_fa || '');
    setIsCourseModalOpen(true);
  };

  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const res = await apiClient.admin.uploadMedia(file);
      setFormThumbnail(res.file_url);
    } catch (err) {
      console.error('Cover upload error:', err);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || isSubmittingCourse) return;
    setIsSubmittingCourse(true);

    try {
      if (editingCourseId && courses[editingCourseId]) {
        await updateCourse(editingCourseId, {
          title_fa: formTitle.trim(),
          title_ar: formTitle.trim(),
          title_en: formTitle.trim(),
          subject: formCategory,
          level_fa: formLevel,
          price_fa: formPrice,
          course_type: formType,
          media_type: formMediaType,
          thumbnail: formThumbnail,
          desc_fa: formDesc,
        });
      } else {
        const id = `course-${Date.now()}`;
        const baseCourse = Object.values(coursesDatabase)[0];
        const newCourse: AudioCourse = {
          ...baseCourse,
          id,
          title_fa: formTitle.trim(),
          title_ar: formTitle.trim(),
          title_en: formTitle.trim(),
          instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
          instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
          instructor_en: 'Hujjat al-Islam Dr. Zanjirzan Hosseini',
          subject: formCategory,
          level_fa: formLevel,
          level_ar: formLevel,
          level_en: 'Advanced',
          price_fa: formPrice,
          price_ar: formPrice,
          price_en: 'Free',
          course_type: formType,
          media_type: formMediaType,
          thumbnail: formThumbnail,
          desc_fa: formDesc || `درسگفتار تخصصی در شاخه ${formCategory}.`,
          duration_fa: '۲۰ ساعت',
          duration_ar: '٢٠ ساعة',
          duration_en: '20 Hours',
          episodes_count: 1,
          chapters: [
            {
              id: 1,
              title_fa: 'جلسه اول: مدخل و آشنایی با مباحث دوره',
              duration: '۴۵:۰۰',
              isFreePreview: true,
              audioUrl: '/audio/sample_lecture.wav',
              media_type: formMediaType,
            },
          ],
        };
        await addCourse(newCourse);
      }
      setIsCourseModalOpen(false);
    } catch (err) {
      console.warn('Course save error:', err);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleDeleteCourseConfirm = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCourse(courseToDelete.id);
      setCourseToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteEpisodeConfirm = async () => {
    if (!episodeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEpisode(episodeToDelete.courseId, episodeToDelete.episodeId);
      setEpisodeToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeStudioCourse = selectedCourseForStudio ? courses[selectedCourseForStudio] : null;

  return (
    <div className="space-y-6 text-start">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={dict.admin_courses_search_placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <option value="all">{dict.admin_courses_cat_all}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name_fa}>
                {c.name_fa}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateCourseModal}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.admin_courses_btn_add}</span>
        </button>
      </div>

      {/* Courses List Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50/80 dark:bg-zinc-900/50">
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_courses_th_title}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_courses_th_subject}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_courses_th_type}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_courses_th_episodes}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_courses_th_price}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_courses_th_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {coursesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    درس‌گفتاری با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                coursesList.map((course) => (
                  <tr key={course.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail || '/images/ostad_zanjirzan.jpg'}
                          alt={course.title_fa}
                          className="w-11 h-11 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                          <span className="line-clamp-1 block text-sm">{course.title_fa}</span>
                          <span className="text-[11px] text-zinc-400 font-normal mt-0.5 block">
                            مدرس: حجت الاسلام دکتر زنجیر زن حسینی
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium">
                        {course.subject || 'فلسفه'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        {course.media_type === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-[#8A532B]" />
                        ) : (
                          <Headphones className="w-3.5 h-3.5 text-[#8A532B]" />
                        )}
                        <span>
                          {course.course_type === 'online'
                            ? dict.admin_courses_type_online
                            : dict.admin_courses_type_offline}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-num text-zinc-600 dark:text-zinc-400">
                      {toLocale(course.chapters?.length || 0)} {dict.admin_courses_unit_session}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#8A532B]">
                      {course.price_fa || dict.admin_courses_price_free}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCourseForStudio(course.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#8A532B] hover:bg-[#724320] text-white text-[11px] font-bold transition active:scale-95 cursor-pointer shadow-xs"
                        >
                          {dict.admin_courses_btn_studio}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditCourseModal(course)}
                          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#8A532B] hover:text-[#8A532B] transition active:scale-95 cursor-pointer"
                          title="ویرایش مشخصات و کاور"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCourseToDelete(course)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95 cursor-pointer"
                          title={dict.admin_courses_btn_delete_tooltip}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Episode Studio Modal (Manage & Upload Video/Audio Sessions) */}
      {activeStudioCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 text-start shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {dict.admin_courses_studio_title} {activeStudioCourse.title_fa}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  آپلود و مدیریت جلسات ویدیویی (MP4) و صوتی (MP3/WAV) این درس‌گفتار
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseForStudio(null)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                {dict.admin_courses_studio_episodes_list} ({toLocale(activeStudioCourse.chapters?.length || 0)})
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChapterForHandout(null);
                    handoutFileInputRef.current?.click();
                  }}
                  disabled={isUploadingHandout}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#8A532B] text-zinc-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition disabled:opacity-50"
                  title="آپلود جزوه PDF و ایندکس خودکار در هوش مصنوعی دوره"
                >
                  <FileText className="w-3.5 h-3.5 text-[#8A532B]" />
                  <span>{isUploadingHandout ? 'درحال ایندکس...' : 'آپلود جزوه درس (PDF)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMediaUploaderOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ آپلود جلسه جدید</span>
                </button>
              </div>
            </div>
            <input
              ref={handoutFileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={handleHandoutUpload}
            />

            <div className="space-y-2.5 max-h-80 overflow-y-auto pe-1">
              {activeStudioCourse.chapters?.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  هنوز جلسه‌ای برای این دوره ثبت نشده است.
                </div>
              ) : (
                activeStudioCourse.chapters?.map((ch, idx) => {
                  const hasVideo = Boolean(ch.videoUrl || ch.media_type === 'video');
                  return (
                    <div
                      key={ch.id}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs hover:border-[#8A532B]/40 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-zinc-400 font-num">[{toLocale(idx + 1)}]</span>
                        {hasVideo ? (
                          <FileVideo className="w-4 h-4 text-[#8A532B] shrink-0" />
                        ) : (
                          <FileAudio className="w-4 h-4 text-[#8A532B] shrink-0" />
                        )}
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {ch.title_fa}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-[10px] font-bold">
                          {hasVideo ? 'ویدیو' : 'صوت'}
                        </span>
                        {ch.isFreePreview && (
                          <span className="px-2 py-0.5 rounded-md bg-[#8A532B]/15 text-[#8A532B] text-[10px] font-bold">
                            رایگان
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-num text-zinc-500">{ch.duration}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChapterForHandout({ id: ch.id, title: ch.title_fa });
                            handoutFileInputRef.current?.click();
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-[#8A532B] hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition cursor-pointer"
                          title="آپلود جزوه PDF این جلسه"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEpisodeToDelete({
                              courseId: activeStudioCourse.id,
                              episodeId: ch.id,
                              title: ch.title_fa,
                            })
                          }
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition cursor-pointer"
                          title={dict.admin_courses_studio_delete_ep_tooltip}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 text-start shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingCourseId ? 'ویرایش مشخصات و کاور درس‌گفتار' : dict.admin_courses_modal_title}
              </h3>
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              {/* Course Cover Image Uploader */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#8A532B]" />
                    <span>تصویر کاور درس‌گفتار:</span>
                  </label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="px-3 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                  >
                    {isUploadingCover ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingCover ? 'در حال آپلود...' : 'آپلود عکس کاور'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={formThumbnail}
                    alt="Course Cover Preview"
                    className="w-20 h-14 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shrink-0 shadow-xs"
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    placeholder="/images/ostad_zanjirzan.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {dict.admin_courses_modal_field_title}
                </label>
                <input
                  type="text"
                  placeholder={dict.admin_courses_modal_title_placeholder}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold outline-none focus:border-[#8A532B] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    {dict.admin_courses_modal_field_subject}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    {dict.admin_courses_modal_field_type}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'offline' | 'online')}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none"
                  >
                    <option value="offline">{dict.admin_courses_type_offline}</option>
                    <option value="online">{dict.admin_courses_type_online}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    فرمت رسانه دوره
                  </label>
                  <select
                    value={formMediaType}
                    onChange={(e) =>
                      setFormMediaType(e.target.value as 'video' | 'audio' | 'hybrid')
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none"
                  >
                    <option value="hybrid">ویدیو + صوت (ترکیبی)</option>
                    <option value="video">دوره ویدیویی</option>
                    <option value="audio">دوره صوتی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {dict.admin_courses_modal_field_price}
                </label>
                <input
                  type="text"
                  placeholder={dict.admin_courses_modal_price_placeholder}
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  {dict.admin_courses_modal_field_desc} (ویرایشگر پیشرفته CMS)
                </label>
                <RichTextCmsEditor
                  value={formDesc}
                  onChange={setFormDesc}
                  placeholder="اهداف آموزشی، مبانی استدلال، پیش‌نیازها و سرفصل‌های تفصیلی درس‌گفتار..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
                >
                  {dict.admin_courses_modal_btn_cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCourse}
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] disabled:opacity-50 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  {isSubmittingCourse
                    ? dict.admin_courses_submitting
                    : editingCourseId
                    ? 'ذخیره تغییرات دوره'
                    : dict.admin_courses_modal_btn_submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real Video + Audio Uploader Modal */}
      {isMediaUploaderOpen && activeStudioCourse && (
        <AudioUploaderModal
          isOpen={isMediaUploaderOpen}
          courseTitle={activeStudioCourse.title_fa}
          onClose={() => setIsMediaUploaderOpen(false)}
          onUploadSuccess={async (data) => {
            const nextId = (activeStudioCourse.chapters?.length || 0) + 1;
            const ch: AudioChapter = {
              id: nextId,
              title_fa: data.title_fa,
              duration: data.duration,
              isFreePreview: data.isFreePreview,
              audioUrl: data.audioUrl,
              videoUrl: data.videoUrl,
              media_type: data.media_type || (data.videoUrl ? 'video' : 'audio'),
            };
            await addEpisode(activeStudioCourse.id, ch);
            setIsMediaUploaderOpen(false);
          }}
        />
      )}

      {/* Course Deletion Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(courseToDelete)}
        title="تأیید حذف درس‌گفتار"
        description={
          courseToDelete ? (
            <span>
              آیا از حذف کامل درس‌گفتار «<strong>{courseToDelete.title_fa}</strong>» و تمام جلسات صوتی/ویدیویی آن اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </span>
          ) : null
        }
        confirmLabel="بله، حذف شود"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteCourseConfirm}
        onClose={() => setCourseToDelete(null)}
      />

      {/* Episode Deletion Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(episodeToDelete)}
        title="تأیید حذف جلسه درس‌گفتار"
        description={
          episodeToDelete ? (
            <span>
              آیا از حذف جلسه «<strong>{episodeToDelete.title}</strong>» اطمینان دارید؟
            </span>
          ) : null
        }
        confirmLabel="حذف جلسه"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteEpisodeConfirm}
        onClose={() => setEpisodeToDelete(null)}
      />
    </div>
  );
}
