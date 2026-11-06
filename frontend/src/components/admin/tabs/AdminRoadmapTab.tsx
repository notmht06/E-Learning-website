'use client';

import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Save,
  Layers,
  GraduationCap,
  Sparkles,
  Link2,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { StageData } from '@/lib/roadmapData';
import { AdminConfirmDialog } from '../AdminConfirmDialog';
import { toast } from 'sonner';

export function AdminRoadmapTab() {
  const {
    siteConfig,
    updateSiteConfig,
    roadmapStages,
    roadmapFaqs,
    saveRoadmapData,
    addRoadmapStage,
    updateRoadmapStage,
    deleteRoadmapStage,
    addRoadmapFaq,
    updateRoadmapFaq,
    deleteRoadmapFaq,
    courses,
  } = useData();
  const { toLocale } = useLanguage();
  const courseList = Object.values(courses);

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'stages' | 'faqs'>('stages');

  // Header Title & Subtitle state
  const [headerTitle, setHeaderTitle] = useState(
    siteConfig?.roadmap_title_fa || 'سیر مطالعاتی و مراحل علمی'
  );
  const [headerSubtitle, setHeaderSubtitle] = useState(
    siteConfig?.roadmap_subtitle_fa ||
      'نقشه راه جامع و گام‌به‌گام فراگیری علوم عقلی، منطق و حکمت متعالیه تحت اشراف علمی حجت الاسلام دکتر زنجیر زن حسینی'
  );
  const [isSavingHeader, setIsSavingHeader] = useState(false);

  // Stage Modal State
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageToDelete, setStageToDelete] = useState<StageData | null>(null);
  const [isDeletingStage, setIsDeletingStage] = useState(false);

  // Stage Form Fields
  const [stepNumber, setStepNumber] = useState<number>(1);
  const [titleFa, setTitleFa] = useState('');
  const [subtitleFa, setSubtitleFa] = useState('');
  const [categoryFa, setCategoryFa] = useState('فلسفه');
  const [levelFa, setLevelFa] = useState('مقدماتی');
  const [sessionEstimateFa, setSessionEstimateFa] = useState('۴۰ جلسه تدریس عمیق');
  const [descriptionFa, setDescriptionFa] = useState('');
  const [keyBooksFa, setKeyBooksFa] = useState<string[]>([]);
  const [newBookInput, setNewBookInput] = useState('');
  const [outcomesFa, setOutcomesFa] = useState<string[]>([]);
  const [newOutcomeInput, setNewOutcomeInput] = useState('');
  const [stageCoursesList, setStageCoursesList] = useState<
    {
      title_fa: string;
      title_ar: string;
      title_en: string;
      sessions_fa: string;
      sessions_ar: string;
      sessions_en: string;
      slug: string;
    }[]
  >([]);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState('');

  // FAQ Modal State
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<{ id: string; q: string } | null>(null);
  const [isDeletingFaq, setIsDeletingFaq] = useState(false);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');

  // Handle Save Header Title/Subtitle
  const handleSaveHeader = async () => {
    setIsSavingHeader(true);
    try {
      await updateSiteConfig({
        roadmap_title_fa: headerTitle.trim(),
        roadmap_subtitle_fa: headerSubtitle.trim(),
      });
      toast.success('تنظیمات سربرگ سیر مطالعاتی با موفقیت ذخیره شد.');
    } catch {
      toast.error('خطا در ذخیره تنظیمات سربرگ');
    } finally {
      setIsSavingHeader(false);
    }
  };

  // Open Stage Modal for Create
  const handleOpenCreateStage = () => {
    setEditingStageId(null);
    setStepNumber((roadmapStages?.length || 0) + 1);
    setTitleFa('');
    setSubtitleFa('');
    setCategoryFa('حکمت متعالیه');
    setLevelFa('متوسط');
    setSessionEstimateFa('۴۰ جلسه');
    setDescriptionFa('');
    setKeyBooksFa([]);
    setNewBookInput('');
    setOutcomesFa([]);
    setNewOutcomeInput('');
    setStageCoursesList([]);
    setSelectedCourseSlug('');
    setIsStageModalOpen(true);
  };

  // Open Stage Modal for Edit
  const handleOpenEditStage = (stage: StageData) => {
    setEditingStageId(stage.id);
    setStepNumber(stage.stepNumber);
    setTitleFa(stage.title_fa || '');
    setSubtitleFa(stage.subtitle_fa || '');
    setCategoryFa(stage.category_fa || 'فلسفه');
    setLevelFa(stage.level_fa || 'متوسط');
    setSessionEstimateFa(stage.sessionEstimate_fa || '');
    setDescriptionFa(stage.description_fa || '');
    setKeyBooksFa(stage.keyBooks_fa ? [...stage.keyBooks_fa] : []);
    setNewBookInput('');
    setOutcomesFa(stage.outcomes_fa ? [...stage.outcomes_fa] : []);
    setNewOutcomeInput('');
    setStageCoursesList(stage.coursesList ? [...stage.coursesList] : []);
    setSelectedCourseSlug('');
    setIsStageModalOpen(true);
  };

  // Add Book Tag to Stage Form
  const handleAddKeyBook = () => {
    if (!newBookInput.trim()) return;
    if (!keyBooksFa.includes(newBookInput.trim())) {
      setKeyBooksFa([...keyBooksFa, newBookInput.trim()]);
    }
    setNewBookInput('');
  };

  // Remove Book Tag from Stage Form
  const handleRemoveKeyBook = (book: string) => {
    setKeyBooksFa(keyBooksFa.filter((b) => b !== book));
  };

  // Add Outcome to Stage Form
  const handleAddOutcome = () => {
    if (!newOutcomeInput.trim()) return;
    setOutcomesFa([...outcomesFa, newOutcomeInput.trim()]);
    setNewOutcomeInput('');
  };

  // Remove Outcome from Stage Form
  const handleRemoveOutcome = (index: number) => {
    setOutcomesFa(outcomesFa.filter((_, idx) => idx !== index));
  };

  // Add Course from dropdown to Stage Form
  const handleAddCourseToStage = () => {
    if (!selectedCourseSlug) return;
    const foundCourse = courseList.find((c) => c.id === selectedCourseSlug);
    if (!foundCourse) return;

    if (stageCoursesList.some((c) => c.slug === foundCourse.id)) {
      toast.info('این دوره قبلاً به این مرحله افزوده شده است.');
      return;
    }

    setStageCoursesList([
      ...stageCoursesList,
      {
        title_fa: foundCourse.title_fa,
        title_ar: foundCourse.title_ar || foundCourse.title_fa,
        title_en: foundCourse.title_en || foundCourse.title_fa,
        sessions_fa: `${foundCourse.episodes_count || 30} جلسه`,
        sessions_ar: `${foundCourse.episodes_count || 30} جلسة`,
        sessions_en: `${foundCourse.episodes_count || 30} Sessions`,
        slug: foundCourse.id,
      },
    ]);
    setSelectedCourseSlug('');
  };

  // Remove Course from Stage Form
  const handleRemoveCourseFromStage = (slug: string) => {
    setStageCoursesList(stageCoursesList.filter((c) => c.slug !== slug));
  };

  // Save Stage (Create or Update)
  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFa.trim()) {
      toast.error('عنوان مرحله نمی‌تواند خالی باشد.');
      return;
    }

    const stagePayload: StageData = {
      id: editingStageId || `stage-${Date.now()}`,
      stepNumber: Number(stepNumber) || 1,
      title_fa: titleFa.trim(),
      title_ar: titleFa.trim(),
      title_en: titleFa.trim(),
      category_fa: categoryFa.trim(),
      category_ar: categoryFa.trim(),
      category_en: categoryFa.trim(),
      subtitle_fa: subtitleFa.trim(),
      subtitle_ar: subtitleFa.trim(),
      subtitle_en: subtitleFa.trim(),
      description_fa: descriptionFa.trim(),
      description_ar: descriptionFa.trim(),
      description_en: descriptionFa.trim(),
      outcomes_fa: outcomesFa,
      outcomes_ar: outcomesFa,
      outcomes_en: outcomesFa,
      keyBooks_fa: keyBooksFa,
      keyBooks_ar: keyBooksFa,
      keyBooks_en: keyBooksFa,
      sessionEstimate_fa: sessionEstimateFa.trim(),
      sessionEstimate_ar: sessionEstimateFa.trim(),
      sessionEstimate_en: sessionEstimateFa.trim(),
      level_fa: levelFa.trim(),
      level_ar: levelFa.trim(),
      level_en: levelFa.trim(),
      coursesList: stageCoursesList,
    };

    try {
      if (editingStageId) {
        await updateRoadmapStage(editingStageId, stagePayload);
        toast.success('مرحله با موفقیت ویرایش شد.');
      } else {
        await addRoadmapStage(stagePayload);
        toast.success('مرحله جدید با موفقیت به سیر مطالعاتی افزوده شد.');
      }
      setIsStageModalOpen(false);
    } catch {
      toast.error('خطا در ذخیره‌سازی مرحله سیر مطالعاتی.');
    }
  };

  // Delete Stage Confirm
  const handleDeleteStageConfirm = async () => {
    if (!stageToDelete) return;
    setIsDeletingStage(true);
    try {
      await deleteRoadmapStage(stageToDelete.id);
      toast.success('مرحله از سیر مطالعاتی حذف شد.');
      setStageToDelete(null);
    } catch {
      toast.error('خطا در حذف مرحله');
    } finally {
      setIsDeletingStage(false);
    }
  };

  // Open FAQ Modal for Create
  const handleOpenCreateFaq = () => {
    setEditingFaqId(null);
    setFaqQ('');
    setFaqA('');
    setIsFaqModalOpen(true);
  };

  // Open FAQ Modal for Edit
  const handleOpenEditFaq = (faq: { id: string; q: string; a: string }) => {
    setEditingFaqId(faq.id);
    setFaqQ(faq.q);
    setFaqA(faq.a);
    setIsFaqModalOpen(true);
  };

  // Save FAQ (Create or Update)
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQ.trim() || !faqA.trim()) {
      toast.error('پرسش و پاسخ هر دو الزامی هستند.');
      return;
    }

    try {
      if (editingFaqId) {
        await updateRoadmapFaq(editingFaqId, { q: faqQ.trim(), a: faqA.trim() });
        toast.success('پرسش متداول با موفقیت ویرایش شد.');
      } else {
        await addRoadmapFaq({ q: faqQ.trim(), a: faqA.trim() });
        toast.success('پرسش متداول جدید افزوده شد.');
      }
      setIsFaqModalOpen(false);
    } catch {
      toast.error('خطا در ذخیره‌سازی پرسش و پاسخ.');
    }
  };

  // Delete FAQ Confirm
  const handleDeleteFaqConfirm = async () => {
    if (!faqToDelete) return;
    setIsDeletingFaq(true);
    try {
      await deleteRoadmapFaq(faqToDelete.id);
      toast.success('پرسش با موفقیت حذف شد.');
      setFaqToDelete(null);
    } catch {
      toast.error('خطا در حذف پرسش');
    } finally {
      setIsDeletingFaq(false);
    }
  };

  const totalConnectedCourses = (roadmapStages || []).reduce(
    (acc, st) => acc + (st.coursesList?.length || 0),
    0
  );

  return (
    <div className="space-y-6 text-start">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>مدیریت سیر مطالعاتی و مراحل علمی</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            استودیو مدیریت سیر مطالعاتی و مراحل علمی
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            مدیریت کامل و پویای نقشه راه مطالعاتی، مراحل ترتیبی، متون و دستاوردها، اتصال دوره‌ها و پرسش‌های متداول برای صفحه عمومی سیر مطالعاتی.
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="block text-[11px] text-zinc-500 font-mono">مراحل تدوین‌شده</span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-num">
              {toLocale(roadmapStages?.length || 0)}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="block text-[11px] text-zinc-500 font-mono">دوره‌های متصل</span>
            <span className="text-base font-bold text-[#8A532B] dark:text-[#C58B43] font-num">
              {toLocale(totalConnectedCourses)}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="block text-[11px] text-zinc-500 font-mono">پرسش‌های متداول</span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-num">
              {toLocale(roadmapFaqs?.length || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Header Title & Subtitle Config Card */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-[#8A532B]" />
            <span>تنظیمات سربرگ و عنوان صفحه عمومی سیر مطالعاتی</span>
          </h3>
          <button
            onClick={handleSaveHeader}
            disabled={isSavingHeader}
            className="px-3.5 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingHeader ? 'در حال ذخیره...' : 'ذخیره سربرگ'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              عنوان صفحه سیر مطالعاتی
            </label>
            <input
              type="text"
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#8A532B]"
              placeholder="مثال: سیر مطالعاتی و مراحل علمی"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              توضیحات و زیرعنوان سربرگ
            </label>
            <input
              type="text"
              value={headerSubtitle}
              onChange={(e) => setHeaderSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#8A532B]"
              placeholder="توضیح کوتاه درباره ماهیت و روش سیر مطالعاتی..."
            />
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveSubTab('stages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'stages'
              ? 'bg-[#8A532B] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>مراحل سیر مطالعاتی ({toLocale(roadmapStages?.length || 0)})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faqs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'faqs'
              ? 'bg-[#8A532B] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>پرسش‌های متداول ({toLocale(roadmapFaqs?.length || 0)})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Stages Management */}
      {activeSubTab === 'stages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              لیست مراحل سیر مطالعاتی ترتیبی
            </h3>
            <button
              onClick={handleOpenCreateStage}
              className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن مرحله جدید</span>
            </button>
          </div>

          <div className="space-y-4">
            {roadmapStages?.map((stage) => (
              <div
                key={stage.id}
                className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 transition hover:border-[#8A532B]/40"
              >
                {/* Stage Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="w-8 h-8 rounded-full bg-[#8A532B] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {toLocale(stage.stepNumber)}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {stage.title_fa}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {stage.category_fa}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
                      سطح: {stage.level_fa}
                    </span>
                    {stage.sessionEstimate_fa && (
                      <span className="text-[11px] text-zinc-500 font-num flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{stage.sessionEstimate_fa}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditStage(stage)}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#8A532B]" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      onClick={() => setStageToDelete(stage)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                {/* Subtitle & Description */}
                <div className="space-y-1.5">
                  {stage.subtitle_fa && (
                    <p className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
                      {stage.subtitle_fa}
                    </p>
                  )}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
                    {stage.description_fa}
                  </p>
                </div>

                {/* Key Books & Outcomes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Key Books */}
                  <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#8A532B]" />
                      <span>کتب و متون محوری تدریس:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {stage.keyBooks_fa?.map((book, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        >
                          {book}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Outcomes */}
                  <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>دستاوردهای علمی دانش‌پژوه:</span>
                    </span>
                    <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
                      {stage.outcomes_fa?.map((outc, oIdx) => (
                        <li key={oIdx} className="flex items-start gap-1.5">
                          <span className="text-[#8A532B] font-bold">•</span>
                          <span>{outc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Connected Courses */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#8A532B]" />
                      <span>دوره‌های متصل به این مرحله ({toLocale(stage.coursesList?.length || 0)} دوره):</span>
                    </span>
                  </div>

                  {stage.coursesList && stage.coursesList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {stage.coursesList.map((crs, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                        >
                          <div className="truncate pe-2">
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                              {crs.title_fa}
                            </span>
                            <span className="text-[11px] text-zinc-500 font-num">
                              {crs.sessions_fa}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {crs.slug}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">
                      هیچ دوره‌ای به این مرحله متصل نشده است. با ویرایش مرحله دوره‌ها را اضافه کنید.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FAQs Management */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              پرسش‌ها و پاسخ‌های متداول سیر مطالعاتی
            </h3>
            <button
              onClick={handleOpenCreateFaq}
              className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن پرسش جدید</span>
            </button>
          </div>

          <div className="space-y-3">
            {roadmapFaqs?.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5 transition hover:border-[#8A532B]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[#8A532B] text-xs font-bold mt-0.5">
                      [{toLocale(idx + 1)}]
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {faq.q}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditFaq(faq)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      title="ویرایش"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#8A532B]" />
                    </button>
                    <button
                      onClick={() => setFaqToDelete(faq)}
                      className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed ps-7 text-justify">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE CREATE/EDIT MODAL */}
      {isStageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5 text-start shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#8A532B]" />
                <span>{editingStageId ? 'ویرایش مرحله سیر مطالعاتی' : 'افزودن مرحله جدید به سیر مطالعاتی'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsStageModalOpen(false)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    شماره گام (ترتیب)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stepNumber}
                    onChange={(e) => setStepNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-num text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    عنوان مرحله *
                  </label>
                  <input
                    type="text"
                    value={titleFa}
                    onChange={(e) => setTitleFa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                    placeholder="مثال: حکمت متعالیه و اسفار اربعه"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    شاخه / رشته علمی
                  </label>
                  <input
                    type="text"
                    value={categoryFa}
                    onChange={(e) => setCategoryFa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                    placeholder="مثال: منطق، فلسفه مشاء، حکمت اشراق"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    سطح علمی
                  </label>
                  <select
                    value={levelFa}
                    onChange={(e) => setLevelFa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="مقدماتی">مقدماتی</option>
                    <option value="متوسط">متوسط</option>
                    <option value="پیشرفته">پیشرفته</option>
                    <option value="درس خارج و اجتهادی">درس خارج و اجتهادی</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    تخمین جلسات تدریس
                  </label>
                  <input
                    type="text"
                    value={sessionEstimateFa}
                    onChange={(e) => setSessionEstimateFa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                    placeholder="مثال: ۴۰ جلسه تدریس عمیق"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  زیرعنوان مرحله
                </label>
                <input
                  type="text"
                  value={subtitleFa}
                  onChange={(e) => setSubtitleFa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                  placeholder="مثال: پی‌ریزی شاکله استدلالی و سنجش براهین"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  شرح تفصیلی و ضرورت مرحله
                </label>
                <textarea
                  rows={3}
                  value={descriptionFa}
                  onChange={(e) => setDescriptionFa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed"
                  placeholder="شرح اهداف، روش و جایگاه این مرحله در منظومه عقلی..."
                />
              </div>

              {/* Key Books Section */}
              <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#8A532B]" />
                  <span>کتب محوری این مرحله</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBookInput}
                    onChange={(e) => setNewBookInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyBook();
                      }
                    }}
                    placeholder="نام کتاب یا متن درسی (مثال: المنطق مظفر) و فشردن افزودن..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyBook}
                    className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition"
                  >
                    افزودن کتاب
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {keyBooksFa.map((book) => (
                    <span
                      key={book}
                      className="px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5"
                    >
                      <span>{book}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyBook(book)}
                        className="text-zinc-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Outcomes Section */}
              <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>دستاوردهای علمی دانش‌پژوه</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOutcomeInput}
                    onChange={(e) => setNewOutcomeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOutcome();
                      }
                    }}
                    placeholder="یک دستاورد علمی (مثال: تسلط کامل بر صناعات خمس) و فشردن افزودن..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddOutcome}
                    className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition"
                  >
                    افزودن دستاورد
                  </button>
                </div>
                <div className="space-y-1.5 pt-1">
                  {outcomesFa.map((outc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <span>• {outc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOutcome(idx)}
                        className="text-zinc-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Courses Management */}
              <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#8A532B]" />
                  <span>اتصال دوره‌های آموزشی سامانه به این مرحله</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCourseSlug}
                    onChange={(e) => setSelectedCourseSlug(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">انتخاب دوره از دوره‌های منتشرشده...</option>
                    {courseList.map((crs) => (
                      <option key={crs.id} value={crs.id}>
                        {crs.title_fa} ({crs.episodes_count || 30} جلسه)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCourseToStage}
                    disabled={!selectedCourseSlug}
                    className="px-3 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    افزودن دوره
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {stageCoursesList.map((crs) => (
                    <div
                      key={crs.slug}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
                    >
                      <div className="truncate pe-2">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                          {crs.title_fa}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-num">
                          {crs.sessions_fa}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCourseFromStage(crs.slug)}
                        className="text-zinc-400 hover:text-rose-500 p-1 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStageId ? 'ذخیره تغییرات مرحله' : 'ثبت مرحله جدید'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ CREATE/EDIT MODAL */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-4 text-start shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#8A532B]" />
                <span>{editingFaqId ? 'ویرایش پرسش متداول' : 'افزودن پرسش متداول جدید'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  متن پرسش *
                </label>
                <input
                  type="text"
                  value={faqQ}
                  onChange={(e) => setFaqQ(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                  placeholder="مثال: آیا مطالعه انفرادی کتب فلسفی توصیه می‌شود؟"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  پاسخ تفصیلی *
                </label>
                <textarea
                  rows={4}
                  value={faqA}
                  onChange={(e) => setFaqA(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed"
                  placeholder="پاسخ کامل و برهانی به پرسش دانش‌پژوهان..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingFaqId ? 'ذخیره تغییرات' : 'افزودن پرسش'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE STAGE CONFIRMATION */}
      <AdminConfirmDialog
        isOpen={Boolean(stageToDelete)}
        title="حذف مرحله از سیر مطالعاتی"
        description={
          <div>
            آیا از حذف مرحله «{stageToDelete?.title_fa}» با گام شماره {stageToDelete?.stepNumber} اطمینان دارید؟ تمام اتصالات دوره‌ها و محتوای این مرحله از سیر مطالعاتی حذف خواهد شد.
          </div>
        }
        confirmLabel="حذف مرحله"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={isDeletingStage}
        onConfirm={handleDeleteStageConfirm}
        onClose={() => setStageToDelete(null)}
      />

      {/* DELETE FAQ CONFIRMATION */}
      <AdminConfirmDialog
        isOpen={Boolean(faqToDelete)}
        title="حذف پرسش متداول"
        description={
          <div>
            آیا از حذف پرسش «{faqToDelete?.q}» اطمینان دارید؟
          </div>
        }
        confirmLabel="حذف پرسش"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={isDeletingFaq}
        onConfirm={handleDeleteFaqConfirm}
        onClose={() => setFaqToDelete(null)}
      />
    </div>
  );
}
