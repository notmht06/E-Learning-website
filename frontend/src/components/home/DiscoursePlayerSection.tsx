'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Headphones,
  Bookmark,
  Volume2,
  VolumeX,
  Gauge,
  ExternalLink,
  Lock,
  Radio,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { coursesDatabase, AudioCourse } from '@/lib/data';
import { apiClient } from '@/services/apiClient';
import { SCHOLAR_NAME, getScholarName } from '@/lib/constants';
import { getLocalizedChapterTitle } from '@/lib/localization';
import {
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  ScrollArea,
} from '@/components/ui';

interface DiscoursePlayerSectionProps {
  initialCourseId?: string;
}

export const DiscoursePlayerSection: React.FC<DiscoursePlayerSectionProps> = ({
  initialCourseId = 'course-falsafe-asfar-1',
}) => {
  const { dict, toLocale, isRtl, currentLang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const {
    currentCourse,
    currentChapterIndex,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    isMuted,
    playTrack,
    togglePlay,
    seek,
    skip,
    cycleSpeed,
    toggleMute,
    setChapterIndex,
  } = usePlayer();

  const [activeCourseId, setActiveCourseId] = useState<string>(initialCourseId);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [drmWatermark, setDrmWatermark] = useState<string>('');
  const [drmVerified, setDrmVerified] = useState<boolean>(false);
  const [isRequestingToken, setIsRequestingToken] = useState<boolean>(false);

  const featuredCourse: AudioCourse = useMemo(() => {
    return coursesDatabase[activeCourseId] || coursesDatabase['course-falsafe-asfar-1'] || Object.values(coursesDatabase)[0];
  }, [activeCourseId]);

  const isCurrentCourseActive = currentCourse?.id === featuredCourse.id;
  const isPlayingActive = isCurrentCourseActive && isPlaying;

  // Clamped active chapter index to prevent out-of-bounds access
  const activeChapterIndex = useMemo(() => {
    const rawIdx = isCurrentCourseActive ? currentChapterIndex : selectedChapterIdx;
    const maxIdx = Math.max(0, (featuredCourse.chapters?.length || 1) - 1);
    return Math.min(Math.max(0, rawIdx), maxIdx);
  }, [isCurrentCourseActive, currentChapterIndex, selectedChapterIdx, featuredCourse.chapters?.length]);

  const activeChapter = featuredCourse.chapters?.[activeChapterIndex] || featuredCourse.chapters?.[0];

  // Request DRM signed streaming token for the active chapter
  useEffect(() => {
    let isCancelled = false;

    async function fetchDrmToken() {
      setIsRequestingToken(true);
      try {
        const chapterId = activeChapter?.id || 1;
        const userId = user?.id || 'usr-preview';
        const res = await apiClient.stream.getToken(userId, featuredCourse.id, chapterId);
        if (!isCancelled && res?.token) {
          setDrmVerified(true);
          setDrmWatermark(res.forensic_watermark || `DRM-48KHZ-${userId.slice(-6).toUpperCase()}`);
        }
      } catch (err) {
        // If unauthenticated or token request not fulfilled, gracefully set standard watermark
        if (!isCancelled) {
          setDrmVerified(false);
          setDrmWatermark('STUDIO-48KHZ-PROTECTED');
        }
      } finally {
        if (!isCancelled) {
          setIsRequestingToken(false);
        }
      }
    }

    fetchDrmToken();

    return () => {
      isCancelled = true;
    };
  }, [featuredCourse.id, activeChapter?.id, user?.id]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return toLocale('00:00');
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const paddedM = m < 10 ? `0${m}` : `${m}`;
    const paddedS = s < 10 ? `0${s}` : `${s}`;
    return toLocale(`${paddedM}:${paddedS}`);
  };

  // Parse chapter duration in seconds when inactive
  const chapterDurationSec = useMemo(() => {
    if (!activeChapter?.duration) return 180;
    const parts = activeChapter.duration.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    return 180;
  }, [activeChapter?.duration]);

  const displayTime = isCurrentCourseActive ? currentTime : 0;
  const displayDuration = isCurrentCourseActive && duration > 0 ? duration : chapterDurationSec;

  // 48-bar scholastic soundwave pattern
  const waveBars = useMemo(() => {
    // Deterministic pseudo-random heights to create natural speech audio waveform
    const baseCurve = [
      24, 38, 55, 72, 85, 60, 42, 65, 88, 95, 78, 50,
      35, 68, 82, 100, 75, 48, 62, 80, 90, 70, 45, 30,
      40, 60, 75, 88, 92, 68, 52, 74, 85, 96, 72, 54,
      38, 64, 80, 92, 85, 62, 48, 70, 84, 65, 44, 28,
    ];
    return baseCurve;
  }, []);

  const progressPercent = displayDuration > 0 ? Math.min(100, Math.max(0, (displayTime / displayDuration) * 100)) : 0;
  const activeBarIndex = isCurrentCourseActive ? Math.floor((progressPercent / 100) * waveBars.length) : -1;

  const handleWaveSeek = (ratio: number) => {
    const targetDuration = displayDuration;
    const targetTime = Math.max(0, Math.min(targetDuration, ratio * targetDuration));
    if (isCurrentCourseActive) {
      seek(targetTime);
    } else {
      playTrack(featuredCourse, activeChapterIndex);
      setTimeout(() => seek(targetTime), 100);
    }
  };

  const handleWaveKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (isCurrentCourseActive) skip(isRtl ? -5 : 5);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (isCurrentCourseActive) skip(isRtl ? 5 : -5);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggleOrPlay();
    }
  };

  const handleChapterClick = (idx: number) => {
    setSelectedChapterIdx(idx);
    if (currentCourse?.id === featuredCourse.id) {
      setChapterIndex(idx);
    } else {
      playTrack(featuredCourse, idx);
    }
  };

  const handleToggleOrPlay = () => {
    if (currentCourse?.id === featuredCourse.id) {
      togglePlay();
    } else {
      playTrack(featuredCourse, activeChapterIndex);
    }
  };

  return (
    <section
      id="discourse"
      aria-label={dict.discourse_title || 'گفتار صوتی و استودیو'}
      className="relative z-10 w-full py-12 sm:py-16 bg-[#FAF8F5] dark:bg-[#0C0D0E] transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E1D8] dark:border-[#22242A] pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20">
              <Headphones className="w-3.5 h-3.5" />
              <span>{dict.discourse_badge || 'استودیو درس‌گفتار و نشر صوتی'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] tracking-tight">
              {dict.discourse_title || `گفتار صوتی و تبیین برهانی ${dict.scholar_name || getScholarName(currentLang)}`}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              {dict.discourse_subtitle ||
                'استماع صوت استودیویی با تفکیک موضوعی فصول، فرکانس صوتی ۴۸kHz و حفاظت دیجیتال استریم'}
            </p>
          </div>

          {/* Course Switcher with shadcn Tabs */}
          <Tabs
            value={activeCourseId}
            onValueChange={(val) => {
              setActiveCourseId(val);
              setSelectedChapterIdx(0);
            }}
          >
            <TabsList>
              {[
                { id: 'course-falsafe-asfar-1', labelKey: 'discourse_course_tab_asfar' as const, fallback: 'اسفار اربعه' },
                { id: 'course-falsafe-ishraq', labelKey: 'discourse_course_tab_ishraq' as const, fallback: 'حکمت اشراق' },
                { id: 'course-falsafe-isharat', labelKey: 'discourse_course_tab_isharat' as const, fallback: 'شرح اشارات' },
              ].map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="text-xs">
                  {dict[c.labelKey] || c.fallback}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Main Editorial Discourse Studio Container */}
        <div className="rounded-3xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:rtl:divide-x-reverse divide-[#E6E1D8] dark:divide-[#22242A]">
          {/* Left Column: Player, Waveform & Playback Controls (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            {/* Top Chapter Meta & DRM Badge */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#8A532B]/10 dark:bg-[#8A532B]/20 text-[#8A532B] dark:text-[#C58B43]">
                  [STUDIO-48KHZ]
                </span>

                <div
                  className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono"
                  title="DRM Protected Stream"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                  <span>
                    {drmVerified
                      ? dict.discourse_token_verified || 'توکن امنیتی معتبر'
                      : dict.discourse_drm_label || 'رمزنگاری DRM اختصاصی'}
                  </span>
                  {drmWatermark && (
                    <span className="opacity-60 text-[10px]">
                      • {drmWatermark}
                    </span>
                  )}
                </div>
              </div>

              {/* Lecture Title */}
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] leading-snug">
                  {currentLang === 'en' && featuredCourse.title_en
                    ? featuredCourse.title_en
                    : currentLang === 'ar' && featuredCourse.title_ar
                    ? featuredCourse.title_ar
                    : featuredCourse.title_fa}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[#8A532B] dark:text-[#C58B43]">
                  {getLocalizedChapterTitle(activeChapter, currentLang) || dict.discourse_chapter_fallback || 'جلسه درس'} • {dict.scholar_name || getScholarName(currentLang)}
                </p>
              </div>
            </div>

            {/* Interactive Audio Waveform */}
            <div className="space-y-2 py-2">
              <div
                className="h-20 sm:h-24 flex items-end justify-between gap-1 sm:gap-1.5 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-zinc-200/80 dark:border-zinc-800 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A532B]"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = isRtl
                    ? rect.right - e.clientX
                    : e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  handleWaveSeek(ratio);
                }}
                onKeyDown={handleWaveKeyDown}
                role="slider"
                aria-label={dict.discourse_progress_aria || 'کنترل پیشرفت پخش صوت'}
                aria-valuemin={0}
                aria-valuemax={displayDuration}
                aria-valuenow={displayTime}
                tabIndex={0}
              >
                {waveBars.map((heightPercent, idx) => {
                  const isPassed = idx <= activeBarIndex;
                  return (
                    <div
                      key={idx}
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-full transition-all duration-100 ${
                        isPassed
                          ? 'bg-[#8A532B] dark:bg-[#C58B43]'
                          : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-[#8A532B]/40'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Timestamp Markers */}
              <div className="flex items-center justify-between text-xs font-num text-zinc-500 dark:text-zinc-400 px-1">
                <span>{formatTime(displayTime)}</span>
                <span className="text-[11px] opacity-70">
                  {dict.discourse_waveform_hint || 'جهش زمانی با کلیک روی موج'}
                </span>
                <span>{formatTime(displayDuration)}</span>
              </div>
            </div>

            {/* Playback Transport Controls */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Skip Backward 10s */}
                <button
                  type="button"
                  onClick={() => skip(-10)}
                  className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title={dict.discourse_btn_skip_backward || '۱۰ ثانیه عقب'}
                  aria-label={dict.discourse_btn_skip_backward || '۱۰ ثانیه عقب'}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Primary Play / Pause Button */}
                <button
                  type="button"
                  onClick={handleToggleOrPlay}
                  className="w-12 h-12 rounded-full bg-[#8A532B] hover:bg-[#724424] text-white flex items-center justify-center shadow-md shadow-black/10 transition-transform active:scale-95 cursor-pointer"
                  aria-label={
                    isPlayingActive
                      ? dict.discourse_btn_pause || 'توقف'
                      : dict.discourse_btn_play || 'پخش'
                  }
                >
                  {isPlayingActive ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ms-0.5" />
                  )}
                </button>

                {/* Skip Forward 30s */}
                <button
                  type="button"
                  onClick={() => skip(30)}
                  className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title={dict.discourse_btn_skip_forward || '۳۰ ثانیه جلو'}
                  aria-label={dict.discourse_btn_skip_forward || '۳۰ ثانیه جلو'}
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed & Audio Volume Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#FAF8F5] dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B]/40 transition-colors cursor-pointer"
                  title={dict.discourse_speed_label || 'سرعت پخش'}
                >
                  {toLocale(playbackRate)}x
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Mute toggle"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-red-500" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Chapter Bookmarks & Syllabus Timeline (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-7 bg-[#FAF8F5]/60 dark:bg-[#101114]/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <Bookmark className="w-3.5 h-3.5 text-[#8A532B]" />
                  <span>{dict.discourse_chapters_heading || 'فصول و نشانه‌های درس‌گفتار'}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {toLocale(featuredCourse.chapters.length)} {dict.stations_metrics_sessions || 'جلسه'}
                </span>
              </div>

              {/* Chapter Timeline with shadcn ScrollArea */}
              <ScrollArea className="h-[280px] pe-2">
                <div className="space-y-2">
                  {featuredCourse.chapters.map((ch, idx) => {
                    const isActive = isCurrentCourseActive
                      ? currentChapterIndex === idx
                      : activeChapterIndex === idx;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => handleChapterClick(idx)}
                        className={`w-full text-start p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isActive
                            ? 'bg-[#8A532B] text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-[#141518] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                              isActive
                                ? 'bg-white text-[#8A532B] font-bold'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {toLocale(ch.id)}
                          </span>
                          <span className="truncate">{getLocalizedChapterTitle(ch, currentLang)}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {ch.isFreePreview && (
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-2 py-0.2 font-medium ${
                                isActive
                                  ? 'bg-white/20 text-white border-transparent'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-transparent'
                              }`}
                            >
                              {dict.discourse_chapter_preview || 'پیش‌نمایش'}
                            </Badge>
                          )}
                          <span className="font-num text-[11px] opacity-80">
                            {toLocale(ch.duration)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Course Link Footer */}
            <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
              <Link
                href={`/courses/${featuredCourse.id}`}
                className="w-full py-2.5 px-4 rounded-2xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{dict.discourse_view_course_full || 'مشاهده کامل دوره و ثبت‌نام'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
