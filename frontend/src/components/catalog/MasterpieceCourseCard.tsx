'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Clock,
  BookOpen,
  Users,
  Star,
  Play,
  Pause,
  Radio,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayer } from '@/context/PlayerContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { triggerTactileHaptic } from '@/lib/haptics';
import { Badge, Button } from '@/components/ui';

export const EDITORIAL_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

interface MasterpieceCourseCardProps {
  course: AudioCourse;
  index?: number;
  isPlaying?: boolean;
  onPlaySample?: () => void;
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

export function MasterpieceCourseCard({
  course,
  index = 0,
  isPlaying: externalIsPlaying,
  onPlaySample,
}: MasterpieceCourseCardProps) {
  const { currentLang, toLocale, dict } = useLanguage();
  const { playTrack, togglePlay, currentCourse, isPlaying: playerIsPlaying } = usePlayer();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const subject = loc?.subject || course.subject;
  const duration = loc?.duration || course.duration_fa;
  const level = loc?.level || course.level_fa || (currentLang === 'en' ? 'Advanced Seminary Level' : 'سطح عالی و خارج');
  const price =
    loc?.price ||
    course.price_fa ||
    (currentLang === 'en' ? 'Free (Endowment)' : currentLang === 'ar' ? 'وقف علمي مجاني' : 'رایگان (وقف عام)');

  const descText =
    loc?.desc ||
    course.desc_fa ||
    (currentLang === 'en'
      ? 'Rigorous philosophical discourse and analytical investigations under classical rational sciences.'
      : currentLang === 'ar'
      ? 'دروس استدلالية رصينة ومباحث معمقة في العلوم العقلية وحكمة أهل البيت عليهم السلام.'
      : 'تدریس برهانی و متن‌محور متون اصیل فلسفه و حکمت اسلامی همراه با پاسخ به شبهات معاصر.');

  const isOnline = course.course_type === 'online';
  const sessionsCount = course.episodes_count || course.chapters?.length || 12;
  const isThisCoursePlaying =
    externalIsPlaying !== undefined
      ? externalIsPlaying
      : currentCourse?.id === course.id && playerIsPlaying;
  const bookmarked = isBookmarked(course.id);

  // Stable scholar count computation
  const rawScholars =
    course.enrolledCount ||
    (Math.abs(course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 120)) % 150) + 85;

  const studentsCount = currentLang === 'en' ? String(rawScholars) : toLocale(rawScholars);

  const isFree =
    price.toLowerCase().includes('رایگان') ||
    price.toLowerCase().includes('free') ||
    price.toLowerCase().includes('مجاني') ||
    price.toLowerCase().includes('وقف');

  // Strict serial code formatting per language
  const paddedIndex = String(index + 1).padStart(2, '0');
  const serialCode =
    currentLang === 'en'
      ? `CRS-${paddedIndex}`
      : `CRS-${toLocale(paddedIndex)}`;

  const discipline = getDisciplineBanner(course.subject, currentLang);

  const sessionsSuffix =
    currentLang === 'en'
      ? (dict.catalog_sessions_suffix || 'Sessions')
      : currentLang === 'ar'
      ? (dict.catalog_sessions_suffix || 'جلسة')
      : (dict.catalog_sessions_suffix || 'جلسه');

  const modeLabel = isOnline
    ? dict.skyroom_badge || (currentLang === 'en' ? 'Online Course' : currentLang === 'ar' ? 'دورة مباشرة' : 'دوره آنلاین')
    : dict.courses_offline_badge || (currentLang === 'en' ? 'Recorded Course' : currentLang === 'ar' ? 'دورة مسجلة' : 'دوره استودیویی');

  const bookmarkLabel = bookmarked
    ? dict.catalog_bookmark_remove || 'حذف نشانک'
    : dict.catalog_bookmark_add || 'افزودن نشانک';

  const enterButtonText =
    currentLang === 'en'
      ? 'Enter Course'
      : currentLang === 'ar'
      ? 'الدخول إلى قاعة الدرس'
      : (dict.catalog_enter_course || 'ورود به دوره');

  const handleAuditionToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('thump');
    if (onPlaySample) {
      onPlaySample();
    } else if (currentCourse?.id === course.id) {
      togglePlay();
    } else {
      playTrack(course, 0);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('ribbon');
    toggleBookmark(course.id);
  };

  return (
    <article
      className={`group h-full flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white dark:border-zinc-800/80 dark:bg-[#141518] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 hover:border-[#8A532B]/60 dark:hover:border-[#C58B43]/60 cursor-pointer ${
        isThisCoursePlaying
          ? 'border-[#8A532B] dark:border-[#C58B43] ring-1 ring-[#8A532B]/30 dark:ring-[#C58B43]/30 shadow-md'
          : ''
      }`}
    >
      {/* 16:9 Sabzlearn-Inspired Media Banner */}
      <div className="group/media relative aspect-video w-full overflow-hidden bg-[#0C0D0E] select-none shrink-0">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:[@media(hover:hover)]:group-hover/media:scale-105 motion-safe:[@media(hover:hover)]:group-hover/media:brightness-105"
          />
        ) : (
          <div
            className={`relative h-full w-full ${discipline.gradient} flex flex-col justify-between p-3 select-none transition-transform duration-500 ease-out motion-safe:[@media(hover:hover)]:group-hover/media:scale-105`}
          >
            {/* Classical Manuscript Filigree Borders */}
            <div className="absolute inset-1.5 rounded-lg border border-white/10 pointer-events-none" />
            <div className="absolute inset-2 rounded-md border border-dashed border-white/5 pointer-events-none" />

            {/* Header: Imprint & Discipline Badge */}
            <div className="relative z-1 flex items-center justify-between text-[10px] tracking-wider font-mono text-white/70 h-5">
              <span className="font-bold uppercase tracking-widest text-amber-200/80 text-[9px]">
                DAR AL-HIKMAH
              </span>
              <span className="px-1.5 py-0.5 rounded border border-white/15 bg-black/40 backdrop-blur-xs text-stone-200 text-[9px] font-medium font-sans truncate max-w-[130px]">
                {discipline.label}
              </span>
            </div>

            {/* Center Calligraphic Title */}
            <div className="relative z-1 my-auto text-center px-2 space-y-1">
              <span className="block text-xs sm:text-[13px] font-bold text-white/95 line-clamp-2 leading-relaxed font-sans">
                {title}
              </span>
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-amber-200/70 font-mono">
                <span>•</span>
                <span className="tracking-widest">
                  {currentLang === 'en' ? 'Official Lecture' : currentLang === 'ar' ? 'درس استدلالي رسمي' : 'درس‌گفتار رسمی خارج'}
                </span>
                <span>•</span>
              </div>
            </div>

            {/* Bottom spacer for clean aesthetic */}
            <div className="h-1" />
          </div>
        )}

        {/* Top-Start: Course Status Capsule */}
        <div className="absolute top-2.5 start-2.5 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-stone-100 border border-white/15 shadow-xs">
            <Radio className={`w-2.5 h-2.5 ${isOnline ? 'text-amber-400' : 'text-stone-300'}`} />
            <span>{modeLabel}</span>
          </span>
        </div>

        {/* Top-End: Glassmorphic Bookmark Button */}
        <button
          type="button"
          onClick={handleBookmarkClick}
          className="absolute top-2.5 end-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white backdrop-blur-md border border-white/15 transition-transform duration-150 active:scale-90 [@media(hover:hover)]:hover:bg-black/80"
          title={bookmarkLabel}
          aria-label={bookmarkLabel}
          aria-pressed={bookmarked}
        >
          <Bookmark
            className={`h-3.5 w-3.5 ${
              bookmarked ? 'fill-[#C58B43] text-[#C58B43]' : 'text-white/90'
            }`}
          />
        </button>

        {/* Bottom-Start: Discount / Pricing Pill */}
        <div className="absolute bottom-2.5 start-2.5 z-10">
          {isFree ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-num bg-[#8A532B]/90 text-[#FAF8F5] border border-[#8A532B] shadow-xs backdrop-blur-xs">
              {currentLang === 'en' ? '100% OFF • Free' : currentLang === 'ar' ? '١٠٠٪ خصم • مجاني' : '۱۰۰٪ تخفیف • رایگان'}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-num bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 shadow-xs backdrop-blur-xs">
              {currentLang === 'en' ? '20% OFF' : currentLang === 'ar' ? '٢٠٪ خصم' : '۲۰٪ تخفیف'}
            </span>
          )}
        </div>

        {/* Bottom-End: Serial Code Pill */}
        <div className="absolute bottom-2.5 end-2.5 z-10">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0C0D0E]/80 text-stone-300 border border-white/10 backdrop-blur-xs">
            [{serialCode}]
          </span>
        </div>

        {/* Center Audition Audio Button */}
        <button
          type="button"
          onClick={handleAuditionToggle}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 opacity-0 transition-all duration-300 ease-out focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
          aria-label={isThisCoursePlaying ? 'توقف پخش نمونه' : 'پخش نمونه صوت'}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#8A532B] dark:bg-[#141518]/95 dark:text-[#C58B43] dark:border dark:border-[#C58B43]/50 transition-transform duration-200 active:scale-95 shadow-xl hover:scale-105">
            {isThisCoursePlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ps-0.5" />
            )}
          </span>
        </button>
      </div>

      {/* Body Content Stack (Strict Equal Height Alignment) */}
      <div className="flex flex-col flex-1 p-3.5 pt-3 justify-between space-y-2">
        {/* Subject & Academic Level */}
        <div className="flex items-center justify-between gap-2 text-xs h-6">
          <Badge variant="accent" className="text-[11px] font-medium px-2 py-0.5 shrink-0">
            {subject}
          </Badge>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[140px] text-end">
            {level}
          </span>
        </div>

        {/* Course Title (Exact fixed height container) */}
        <div className="h-12 flex items-start overflow-hidden">
          <Link href={`/courses/${course.id}`} className="group/title block w-full">
            <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover/title:text-[#8A532B] dark:group-hover/title:text-[#C58B43] transition-colors">
              {title}
            </h3>
          </Link>
        </div>

        {/* Brief Excerpt (Exact fixed height container) */}
        <div className="h-9 flex items-start overflow-hidden">
          <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
            {descText}
          </p>
        </div>

        {/* Scholar Instructor & 5.0 Rating Row (Fixed height container) */}
        <div className="h-7 flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ostad_zanjirzan.jpg"
              alt={dict.scholar_full_title || 'حجت الاسلام دکتر زنجیر زن حسینی'}
              className="h-5 w-5 rounded-full object-cover ring-1 ring-[#8A532B]/30 shrink-0"
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
              {dict.scholar_full_title || 'حجت الاسلام دکتر زنجیر زن حسینی'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 font-num shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{currentLang === 'en' ? '5.0' : toLocale('5.0')}</span>
          </div>
        </div>

        {/* 3-Column Metrics Bar (Fixed height container) */}
        <div className="h-9 grid grid-cols-3 gap-1 py-1 text-center font-num text-xs border-t border-zinc-100 dark:border-zinc-800/60 items-center">
          <div className="flex items-center justify-center gap-1 text-zinc-600 dark:text-zinc-400 min-w-0">
            <Clock className="h-3.5 w-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
            <span className="truncate">{duration}</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-zinc-600 dark:text-zinc-400 min-w-0">
            <BookOpen className="h-3.5 w-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
            <span className="truncate">
              {currentLang === 'en' ? sessionsCount : toLocale(sessionsCount)} {sessionsSuffix}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 text-zinc-600 dark:text-zinc-400 min-w-0">
            <Users className="h-3.5 w-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
            <span className="truncate">
              {studentsCount} {currentLang === 'en' ? 'Scholars' : currentLang === 'ar' ? 'باحث' : 'پژوهشگر'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Pricing & Entrance Button (Strict Equal Height) */}
      <div className="h-14 border-t border-zinc-100 p-3.5 py-2.5 dark:border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          {isFree ? (
            <div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-through block font-mono leading-tight">
                {currentLang === 'en'
                  ? '$45.00'
                  : currentLang === 'ar'
                  ? '٤٥٠,٠٠٠ تومان'
                  : `${toLocale('۴۵۰,۰۰۰')} تومان`}
              </span>
              <span className="text-sm font-bold text-[#8A532B] dark:text-[#C58B43] block">
                {currentLang === 'en' ? 'Free (Endowment)' : currentLang === 'ar' ? 'وقف علمي مجاني' : 'رایگان (وقف عام)'}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-through block font-mono leading-tight">
                {currentLang === 'en' ? '$65.00' : `${toLocale('۶۵۰,۰۰۰')}`}
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-num block">
                {price}
              </span>
            </div>
          )}
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs font-bold hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] dark:hover:text-[#0C0D0E] transition-all group/btn shrink-0"
        >
          <Link href={`/courses/${course.id}`}>
            <span>{enterButtonText}</span>
            {currentLang === 'en' ? (
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-1 transition-transform" />
            )}
          </Link>
        </Button>
      </div>
    </article>
  );
}
