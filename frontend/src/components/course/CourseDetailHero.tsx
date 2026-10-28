'use client';

import React from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Clock,
  BookOpen,
  Headphones,
  CheckCircle2,
  Share2,
  Star,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { AudioCourse } from '@/lib/data';
import { usePlayer } from '@/context/PlayerContext';
import { triggerTactileHaptic } from '@/lib/haptics';

interface CourseDetailHeroProps {
  course: AudioCourse;
  title: string;
  level: string;
  duration: string;
  sessionsCount: number;
  description?: string;
  price: string;
  isEnrolled: boolean;
  isLoading: boolean;
  onEnroll: () => void;
  dict: Record<string, string>;
  currentLang: string;
  toLocale: (val: number | string) => string;
}

function getDisciplineBanner(subject: string = '', lang: string = 'fa') {
  const s = subject.trim().toLowerCase();
  if (s.includes('منطق') || s.includes('logic')) {
    return {
      gradient: 'bg-gradient-to-br from-[#1E2D4A] via-[#152035] to-[#0D1422]',
      accent: '#7EB0EA',
      label: lang === 'en' ? 'Logic & Epistemology' : lang === 'ar' ? 'المنطق والمناهج' : 'منطق و روش‌شناسی',
    };
  }
  if (s.includes('کلام') || s.includes('theology')) {
    return {
      gradient: 'bg-gradient-to-br from-[#163326] via-[#0F231A] to-[#08140E]',
      accent: '#5EEAD4',
      label: lang === 'en' ? 'Rational Theology' : lang === 'ar' ? 'علم الكلام والعقائد' : 'کلام و عقاید عقلی',
    };
  }
  if (s.includes('عرفان') || s.includes('mysticism')) {
    return {
      gradient: 'bg-gradient-to-br from-[#3B1824] via-[#281018] to-[#14080C]',
      accent: '#F472B6',
      label: lang === 'en' ? 'Theoretical Mysticism' : lang === 'ar' ? 'العرفان النظري' : 'عرفان نظری و سلوک',
    };
  }
  if (s.includes('اصول') || s.includes('فقه') || s.includes('jurisprudence')) {
    return {
      gradient: 'bg-gradient-to-br from-[#382818] via-[#251A10] to-[#150F09]',
      accent: '#E0A96D',
      label: lang === 'en' ? 'Jurisprudence & Usul' : lang === 'ar' ? 'أصول الفقه والاجتهاد' : 'اصول فقه و اجتهاد',
    };
  }
  if (s.includes('تفسیر') || s.includes('tafsir') || s.includes('quran')) {
    return {
      gradient: 'bg-gradient-to-br from-[#143038] via-[#0D2026] to-[#071317]',
      accent: '#2DD4BF',
      label: lang === 'en' ? 'Rational Exegesis' : lang === 'ar' ? 'التفسير العقلي' : 'تفسیر عقلی قرآن',
    };
  }
  return {
    gradient: 'bg-gradient-to-br from-[#3D2314] via-[#2A180E] to-[#170C06]',
    accent: '#C58B43',
    label: lang === 'en' ? 'Transcendent Philosophy' : lang === 'ar' ? 'الحكمة المتعالية والفلسفة' : 'فلسفه و حکمت متعالیه',
  };
}

export function CourseDetailHero({
  course,
  title,
  level,
  duration,
  sessionsCount,
  description,
  price,
  isEnrolled,
  isLoading,
  onEnroll,
  dict,
  currentLang,
  toLocale,
}: CourseDetailHeroProps) {
  const { playTrack, togglePlay, currentCourse, isPlaying } = usePlayer();
  const disciplineBanner = getDisciplineBanner(course.subject, currentLang);
  const isCurrentPlaying = isPlaying && currentCourse?.id === course.id;

  const scholarName =
    currentLang === 'en'
      ? 'Hojjat al-Islam Dr. Zanjirzan Hosseini'
      : currentLang === 'ar'
      ? 'حجة الإسلام الدكتور زنجير زن حسيني'
      : 'حجت الاسلام دکتر زنجیر زن حسینی';

  const scholarRole =
    dict.course_scholar_title_desc ||
    (currentLang === 'en'
      ? 'Professor of Advanced Seminary Studies & Rational Sciences'
      : currentLang === 'ar'
      ? 'أستاذ السطوح العليا والبحث الخارج • باحث في العلوم العقلية والنقلية'
      : 'استاد سطوح عالی و خارج حوزه علمیه • پژوهشگر علوم عقلی و نقلی');

  const t = {
    home: dict.nav_home || 'صفحه اصلی',
    courses: dict.nav_courses || 'دوره‌ها',
    status_label: dict.course_status_label || 'وضعیت دوره',
    status_completed: dict.course_status_completed || 'تکمیل‌شده',
    status_in_progress: dict.course_status_in_progress || 'در حال ضبط و تکمیل',
    duration_label: dict.catalog_duration_label || 'مدت زمان',
    sessions_label: dict.catalog_lessons_count_label || 'تعداد جلسات',
    sessions_unit: dict.course_unit_sessions || 'جلسه',
    delivery_label: dict.course_delivery_method_label || 'روش دریافت',
    delivery_val: dict.course_delivery_method_val || 'استریم آنلاین + دانلود جلسات',
    preview_btn: dict.course_preview_sample_btn || 'پیش‌نمایش و صوت نمونه جلسه اول',
    preview_playing: dict.course_preview_playing || 'در حال پخش نمونه صوتی...',
    enroll_btn: dict.course_sticky_enroll_btn || 'ثبت‌نام در این کرسی درس',
    enter_btn: dict.course_sticky_enter_btn || 'ورود به تئاتر یادگیری',
    lifetime_support: dict.course_support_lifetime || 'دسترسی مادام‌العمر به محتوا و تقریرات',
    tuition_label: dict.course_tuition_label || 'شهریه کرسی درس:',
    strikethrough_tuition: currentLang === 'en' ? '$45.00' : '۴۵۰,۰۰۰ تومان',
    satisfaction: currentLang === 'en' ? '5.0 (100% Scholarly Satisfaction)' : currentLang === 'ar' ? '٥.٠ (رضا تام من الباحثين)' : '۵.۰ (رضایت کامل پژوهشگران)',
  };

  const handleTogglePlaySample = () => {
    triggerTactileHaptic('tick');
    if (isCurrentPlaying) {
      togglePlay();
    } else {
      playTrack(course, 0);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(currentLang === 'en' ? 'Course link copied.' : currentLang === 'ar' ? 'تم نسخ الرابط.' : 'پیوند دوره کپی شد.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="نشانی مسیر" className="flex items-center gap-2 text-xs font-mono text-zinc-400">
        <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          {t.home}
        </Link>
        <span>/</span>
        <Link href="/courses" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          {t.courses}
        </Link>
        <span>/</span>
        <Link
          href={`/courses?subject=${encodeURIComponent(course.subject)}`}
          className="hover:text-zinc-700 dark:hover:text-zinc-200 text-[#8A532B] dark:text-[#C58B43]"
        >
          {disciplineBanner.label}
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 line-clamp-1">{title}</span>
      </nav>

      {/* 2-Column Responsive Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right Column: Title, Description, Scholar Card & 4 Key Bento Boxes */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 text-start">
          {/* Top Badges Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/30 text-xs font-bold">
                {level}
              </span>
              <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: disciplineBanner.accent }}
                />
                <span>{disciplineBanner.label}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="اشتراک‌گذاری دوره"
              aria-label="اشتراک‌گذاری دوره"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Course Main Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
            {title}
          </h1>

          {/* Academic Abstract / Description */}
          {description && (
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
              {description}
            </p>
          )}

          {/* Official Scholar Bio & Rating Strip */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src="/images/ostad_zanjirzan.jpg"
                alt={scholarName}
                className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#8A532B]/40 dark:border-[#C58B43]/50 shadow-xs"
              />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {scholarName}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {scholarRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-700 dark:text-amber-300 shrink-0 self-start sm:self-auto">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{t.satisfaction}</span>
            </div>
          </div>

          {/* 4-Item Key Info Bento Grid (Sabzlearn-style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Box 1: Status */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span className="text-[11px] font-mono">{t.status_label}</span>
              </div>
              <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {course.status === 'in_progress' ? t.status_in_progress : t.status_completed}
              </span>
            </div>

            {/* Box 2: Duration */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span className="text-[11px] font-mono">{t.duration_label}</span>
              </div>
              <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 font-num truncate">
                {duration}
              </span>
            </div>

            {/* Box 3: Sessions */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <BookOpen className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span className="text-[11px] font-mono">{t.sessions_label}</span>
              </div>
              <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 font-num truncate">
                {toLocale(sessionsCount)} {t.sessions_unit}
              </span>
            </div>

            {/* Box 4: Delivery */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Headphones className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span className="text-[11px] font-mono">{t.delivery_label}</span>
              </div>
              <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {t.delivery_val}
              </span>
            </div>
          </div>
        </div>

        {/* Left Column: Interactive Media Preview Frame & Tuition CTA Box */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          {/* 16:9 Media Preview Player Frame */}
          <div
            className={`w-full aspect-video rounded-3xl ${disciplineBanner.gradient} border border-white/10 relative overflow-hidden shadow-xl flex flex-col justify-between p-5 text-white select-none`}
          >
            {/* Top Frame Accents */}
            <div className="flex items-center justify-between z-10">
              <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-mono flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: disciplineBanner.accent }}
                />
                <span>{disciplineBanner.label}</span>
              </span>

              <span className="text-[10px] font-mono text-zinc-400 bg-black/30 px-2 py-0.5 rounded-md">
                [{course.id.slice(-6).toUpperCase()}]
              </span>
            </div>

            {/* Center Play Button & Animated Waves */}
            <div className="flex flex-col items-center justify-center my-auto z-10 text-center space-y-3">
              <button
                type="button"
                onClick={handleTogglePlaySample}
                className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition shadow-2xl cursor-pointer group"
                aria-label={isCurrentPlaying ? 'توقف صوت' : 'پخش صوت نمونه'}
              >
                {isCurrentPlaying ? (
                  <Pause className="w-7 h-7 fill-white" />
                ) : (
                  <Play className="w-7 h-7 fill-white translate-x-0.5 rtl:-translate-x-0.5 group-hover:scale-110 transition-transform" />
                )}
              </button>

              <span className="text-xs font-medium text-white/90 drop-shadow-xs">
                {isCurrentPlaying ? t.preview_playing : t.preview_btn}
              </span>

              {/* Waveform Bars Animation when playing */}
              {isCurrentPlaying && (
                <div className="flex items-center gap-1 h-3 pt-1">
                  <span className="w-1 h-3 bg-[#E0A96D] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-2 bg-[#E0A96D] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-3.5 bg-[#E0A96D] rounded-full animate-bounce" />
                  <span className="w-1 h-2 bg-[#E0A96D] rounded-full animate-bounce [animation-delay:-0.2s]" />
                </div>
              )}
            </div>

            {/* Bottom Scholar Subtle Motif */}
            <div className="flex items-center justify-between text-[11px] font-mono text-white/60 z-10">
              <span>{scholarName}</span>
              <span>{duration}</span>
            </div>

            {/* Background subtle radial glow (Anti-Slop compliant: contained strictly in player frame) */}
            <div className="absolute inset-0 bg-radial from-white/5 to-transparent pointer-events-none" />
          </div>

          {/* Quick Tuition & Primary Action Box */}
          <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] rounded-3xl p-5 space-y-4 shadow-xs text-start">
            <div className="flex items-baseline justify-between gap-2 border-b border-[#E6E1D8] dark:border-[#24262D] pb-3">
              <span className="text-xs text-zinc-500 font-bold">{t.tuition_label}</span>
              <div className="text-end">
                <span className="line-through text-xs text-zinc-400 block font-num">
                  {t.strikethrough_tuition}
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#8A532B] dark:text-[#C58B43] font-num">
                  {price}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            {isEnrolled ? (
              <Link
                href={`/courses/${course.id}/learn`}
                onClick={() => triggerTactileHaptic('tick')}
                className="w-full py-3 px-5 rounded-2xl bg-[#8A532B] hover:bg-[#724423] dark:bg-[#C58B43] dark:hover:bg-[#B37932] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t.enter_btn}</span>
                {currentLang === 'en' ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerTactileHaptic('tick');
                  onEnroll();
                }}
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-2xl bg-[#8A532B] hover:bg-[#724423] dark:bg-[#C58B43] dark:hover:bg-[#B37932] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.enroll_btn}</span>
              </button>
            )}

            {/* Guarantee Footnote */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
              <span>{t.lifetime_support}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
