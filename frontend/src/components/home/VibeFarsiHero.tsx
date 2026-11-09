'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Compass,
  Headphones,
  Sparkles,
  Layers,
  CheckCircle2,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { getScholarName } from '@/lib/constants';

export function VibeFarsiHero() {
  const { currentLang, dict, toLocale, localizeHref = (p) => p } = useLanguage();
  const { siteConfig } = useData();

  // 1. Mini Audio/Video Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaySec, setCurrentPlaySec] = useState(265); // 04:25

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPlaySec((prev) => (prev >= 1120 ? 0 : prev + 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${toLocale(String(m).padStart(2, '0'))}:${toLocale(String(s).padStart(2, '0'))}`;
  };

  // 2. Interactive AI Assistant typewriter preview
  const aiAnswerFull =
    'در مرحله نخست اسفار اربعه، تبیین می‌شود که اصالت منحصراً از آنِ وجود است و ماهیتْ حدِ عدمی آن به شمار می‌رود؛ بنابراین، جعل و ایجاد ذاتاً به وجود تعلق می‌گیرد نه به ماهیات اعتباری.';
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let idx = 0;
    setDisplayedText('');
    setIsTyping(true);
    const interval = setInterval(() => {
      if (idx < aiAnswerFull.length) {
        setDisplayedText(aiAnswerFull.slice(0, idx + 1));
        idx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // 3. Segmented Control for Course Syllabus
  const [selectedDiscipline, setSelectedDiscipline] = useState<'mantiq' | 'ishraq' | 'asfar'>('asfar');

  const syllabusData = {
    asfar: {
      title: 'شرح دوره جامع اسفار اربعه',
      activeSession: 'جلسه ۰۳: اصالت وجود و اعتباریت ماهیت',
      progress: 75,
      sessions: [
        { num: '۰۱', title: 'مقدمات منهج تحقیق در حکمت متعالیه', done: true },
        { num: '۰۲', title: 'برهان بداهت مفهوم وجود و اشتراک معنوی', done: true },
        { num: '۰۳', title: 'اصالت وجود و اعتباریت ماهیت', done: false, active: true },
        { num: '۰۴', title: 'تشکیک وجود در مراتب عوالم نور', done: false },
      ],
    },
    ishraq: {
      title: 'حکمت اشراق سهروردی',
      activeSession: 'جلسه ۰۵: قاعده نور و ظلمت در حکمة الاشراق',
      progress: 60,
      sessions: [
        { num: '۰۱', title: 'روش‌شناسی شیخ اشراق در نقد مشاء', done: true },
        { num: '۰۲', title: 'اصالت نور و مراتب انوار قاهره', done: true },
        { num: '۰۳', title: 'علم حضوری و برهان شهودی نفس', done: true },
        { num: '۰۴', title: 'عالم مثال معلق و صور مثالیه', done: false, active: true },
      ],
    },
    mantiq: {
      title: 'منطق صوری و اجتهادی مظفر',
      activeSession: 'جلسه ۱۲: صناعات خمس و برهان قاطع',
      progress: 90,
      sessions: [
        { num: '۰۱', title: 'تعریف علم، تصور و تصدیق', done: true },
        { num: '۰۲', title: 'احکام قضایا و تناقض و عکس', done: true },
        { num: '۰۳', title: 'اشکال اربعه قیاس اقترانی', done: true },
        { num: '۰۴', title: 'شرایط انتاج برهان و مواد قضایا', done: false, active: true },
      ],
    },
  };

  const activeSyllabus = syllabusData[selectedDiscipline];

  return (
    <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-4 sm:pt-8 pb-4">
      {/* Folio Outer Frame with 4-Corner Traditional Accents */}
      <div className="relative rounded-3xl border border-[#E6E1D8] dark:border-[#27282D] bg-[#FAF8F5]/90 dark:bg-[#111215]/90 backdrop-blur-md p-6 sm:p-10 space-y-8 shadow-xs overflow-hidden">
        {/* 4 Corner Brackets */}
        <span className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none" aria-hidden="true" />
        <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none" aria-hidden="true" />
        <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none" aria-hidden="true" />
        <span className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none" aria-hidden="true" />

        {/* 1. Scholar Identity & Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/20 mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
            <span>پایگاه رسمی دروس و آثار علوم عقلی</span>
          </div>

          {/* Official Scholar Title H1 */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
            {getScholarName(currentLang)}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed max-w-2xl mx-auto text-balance">
            ارائه اجتهادی و برهانی متون حکمت متعالیه، اشراق، منطق و اصول با استریم صوتی و تصویری، تقریرات منقح و همراهی دستیار هوشمند علمی.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={localizeHref('/courses')}
              className="px-6 py-2.5 sm:py-3 rounded-xl bg-[#8A532B] hover:bg-[#734320] text-white text-xs sm:text-sm font-bold shadow-xs transition duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Headphones className="w-4 h-4" />
              <span>مشاهده درس‌گفتارها</span>
            </Link>
            <Link
              href={localizeHref('/roadmap')}
              className="px-5 py-2.5 sm:py-3 rounded-xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#16171B] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-bold transition duration-200 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
            >
              <Compass className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
              <span>سیر مطالعاتی و نقشه راه</span>
            </Link>
          </div>
        </div>

        {/* 2. Live Interactive Preview Grid (VibeFarsi Bespoke Showcase) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-[#E6E1D8]/80 dark:border-[#27282D]/80 text-start">
          
          {/* Card 1: Live Interactive Video/Audio Player */}
          <div className="rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#141518] p-4 flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span>پخش‌کننده زنده درس</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                ۱.۰x • صوتی
              </span>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                {activeSyllabus.activeSession}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                حجت الاسلام دکتر زنجیرزن حسینی
              </p>
            </div>

            {/* Waveform Equalizer Mock */}
            <div className="h-10 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl px-3 flex items-center justify-between gap-1 border border-zinc-100 dark:border-zinc-800/60">
              {[40, 75, 55, 90, 30, 85, 60, 45, 95, 70, 50, 80, 65, 35, 70, 85, 40].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? 'bg-[#8A532B] dark:bg-[#C58B43]'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (h + (i % 3) * 15) % 100)}%` : `${h * 0.4}%`,
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold transition cursor-pointer active:scale-95"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'توقف پخش' : 'پخش نمونه'}</span>
              </button>

              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                {formatMinSec(currentPlaySec)} / ۱۸:۴۰
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400">
              کامپوننت: AudioVideoPlayerEngine
            </div>
          </div>

          {/* Card 2: Live AI Assistant Typewriter */}
          <div className="rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#141518] p-4 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span>حکمت‌یار هوشمند (AI)</span>
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60">
                برخط و مستند
              </span>
            </div>

            {/* Prompt input preview */}
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
              <span className="text-zinc-400 text-[10px] block mb-0.5">پرسش دانشجو:</span>
              اصالت وجود در برابر ماهیت چگونه اثبات می‌شود؟
            </div>

            {/* Answer typewriter */}
            <div className="min-h-[72px] p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#111215] border border-[#E6E1D8] dark:border-zinc-800 text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
              <span>{displayedText}</span>
              {isTyping && (
                <span className="inline-block w-1.5 h-3 bg-[#8A532B] dark:bg-[#C58B43] mr-1 animate-pulse" />
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
              <span>ارجاع: اسفار اربعه، جلد اول، فصل ۳</span>
              <span>RAG Engine</span>
            </div>
          </div>

          {/* Card 3: Course Syllabus & Segmented Control */}
          <div className="rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#141518] p-4 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span>سرفصل و پیشرفت درسی</span>
              </span>
              <span className="text-[10px] font-bold text-[#8A532B] dark:text-[#C58B43]">
                {toLocale(activeSyllabus.progress)}٪ تکمیل
              </span>
            </div>

            {/* Segmented Control */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-bold text-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedDiscipline('asfar')}
                className={`py-1 rounded-lg transition cursor-pointer ${
                  selectedDiscipline === 'asfar'
                    ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                اسفار
              </button>
              <button
                type="button"
                onClick={() => setSelectedDiscipline('ishraq')}
                className={`py-1 rounded-lg transition cursor-pointer ${
                  selectedDiscipline === 'ishraq'
                    ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                اشراق
              </button>
              <button
                type="button"
                onClick={() => setSelectedDiscipline('mantiq')}
                className={`py-1 rounded-lg transition cursor-pointer ${
                  selectedDiscipline === 'mantiq'
                    ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                منطق
              </button>
            </div>

            {/* Syllabus mini list */}
            <div className="space-y-1.5 text-xs">
              {activeSyllabus.sessions.map((s, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] ${
                    s.active
                      ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/10 border-[#8A532B]/30 dark:border-[#C58B43]/30 font-bold text-[#8A532B] dark:text-[#C58B43]'
                      : 'border-transparent text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[10px] text-zinc-400">{s.num}</span>
                    <span className="truncate">{s.title}</span>
                  </div>
                  {s.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : s.active ? (
                    <Play className="w-3 h-3 fill-current shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400">
              کامپوننت: CourseOutline + SegmentedControl
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default VibeFarsiHero;
