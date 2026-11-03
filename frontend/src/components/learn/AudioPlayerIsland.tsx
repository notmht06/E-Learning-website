'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Disc,
  ListMusic,
  ChevronDown,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';
import { SupportedLang } from '@/lib/data';
import { getLocalizedChapterTitle } from '@/lib/localization';

interface AudioPlayerIslandProps {
  currentLang?: SupportedLang;
}

export const AudioPlayerIsland: React.FC<AudioPlayerIslandProps> = ({ currentLang: propLang }) => {
  const {
    currentCourse,
    currentChapterIndex,
    isPlaying,
    hasStartedPlaying,
    currentTime,
    duration,
    playbackRate,
    isMuted,
    isPlaylistOpen,
    togglePlay,
    seek,
    skip,
    cycleSpeed,
    toggleMute,
    togglePlaylist,
    setChapterIndex,
  } = usePlayer();

  const { currentLang: ctxLang, dict, toLocale } = useLanguage();
  const currentLang = propLang || ctxLang;
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const playerIslandRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcuts for studio lecture listening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDismissed) return;

      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);
      if (isInputActive) return;

      const isPlayerFocused = playerIslandRef.current?.contains(activeEl);

      if (e.code === 'Space') {
        if (isPlaying || isPlayerFocused) {
          e.preventDefault();
          togglePlay();
        }
      } else if (e.code === 'ArrowRight') {
        if (isPlaying || isPlayerFocused) {
          e.preventDefault();
          skip(30);
        }
      } else if (e.code === 'ArrowLeft') {
        if (isPlaying || isPlayerFocused) {
          e.preventDefault();
          skip(-10);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        if (isPlaying || isPlayerFocused) {
          e.preventDefault();
          toggleMute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, toggleMute, isPlaying, isDismissed]);

  // If a new track begins playing, restore view if dismissed
  useEffect(() => {
    if (isPlaying) {
      setIsDismissed(false);
    }
  }, [isPlaying, currentCourse, currentChapterIndex]);

  // Suppress completely on the dedicated in-page studio player route (/courses/[id]/learn)
  const pathname = usePathname();
  if (pathname && pathname.includes('/learn')) {
    return null;
  }

  // Do NOT render floating island if user hasn't started playing anything (only render when isPlaying && currentCourse)
  if (!hasStartedPlaying || !currentCourse || !currentCourse.chapters || currentCourse.chapters.length === 0 || isDismissed) {
    return null;
  }

  const currentChapter = currentCourse.chapters[currentChapterIndex] || currentCourse.chapters[0];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return toLocale(formatted);
  };

  const chapterTitle = getLocalizedChapterTitle(currentChapter, currentLang);

  const courseTitle =
    (currentCourse as any)[`title_${currentLang}`] ||
    (currentLang === 'fa'
      ? currentCourse.title_fa
      : currentLang === 'ar'
      ? currentCourse.title_ar
      : currentCourse.title_en) ||
    currentCourse.title_fa;

  // Waveform bars simulation
  const waveformHeights = [
    25, 45, 70, 35, 60, 90, 40, 75, 50, 85, 30, 65, 80, 45, 95, 55, 70, 30, 60, 85,
    40, 65, 90, 50, 75, 35, 60, 80, 45, 70, 30, 85, 60, 40, 95, 50, 75, 35, 65, 50,
  ];

  const progressPercent = Math.min(100, Math.max(0, (currentTime / (duration || 180)) * 100));

  return (
    <aside
      className="fixed bottom-4 inset-x-0 z-30 flex flex-col items-center px-2 sm:px-4 pointer-events-none space-y-2 select-none"
      aria-label="Studio Audio Player Island"
    >
      {/* Expandable Playlist Drawer */}
      {isPlaylistOpen && !isMinimized && (
        <div className="pointer-events-auto w-full max-w-xl bg-white dark:bg-[#141518] border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150 text-start">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
              <ListMusic className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
              <span className="truncate">
                {dict.player_playlist}: {courseTitle}
              </span>
            </div>
            <button
              onClick={togglePlaylist}
              className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-[#1E2024] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-52 overflow-y-auto pe-1">
            {currentCourse.chapters.map((ch, idx) => {
              const active = idx === currentChapterIndex;
              const chTitle = getLocalizedChapterTitle(ch, currentLang);
              return (
                <div
                  key={ch.id}
                  onClick={() => setChapterIndex(idx)}
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition ${
                    active
                      ? 'bg-stone-900 text-white dark:bg-[#1E2024] dark:border dark:border-[#C58B43]/30 dark:text-[#FAF8F5]'
                      : 'hover:bg-stone-50 dark:hover:bg-neutral-800/60 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span className="text-[11px] font-num w-5 text-center shrink-0">
                      {toLocale(idx + 1)}.
                    </span>
                    <span className="truncate">{chTitle}</span>
                  </div>
                  <span className="text-[11px] font-num shrink-0 text-stone-400">
                    {toLocale(ch.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Docked Player Bar */}
      <div
        ref={playerIslandRef}
        className="pointer-events-auto w-full max-w-[calc(100vw-1.5rem)] sm:max-w-3xl bg-white dark:bg-[#121316] border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xl p-3 sm:px-5 sm:py-3 text-stone-900 dark:text-stone-100 transition relative space-y-2 overflow-hidden"
      >
        {/* Top Row: Track Meta + Main Controls + Utility */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Disc & Track Titles */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 text-start">
            <div className="hidden sm:flex w-10 h-10 rounded-lg bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-stone-700 dark:text-stone-200 items-center justify-center shrink-0">
              <Disc
                className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`}
                style={{ animationDuration: '6s' }}
              />
            </div>
            <div className="min-w-0">
              <h5 className="text-xs sm:text-sm font-bold truncate text-stone-900 dark:text-stone-100">
                {chapterTitle}
              </h5>
              <span className="text-[11px] sm:text-[11px] text-stone-400 truncate block">
                {courseTitle}
              </span>
            </div>
          </div>

          {/* Center: Controls (-10s, Play/Pause, +30s) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* -10s skip */}
            <button
              onClick={() => skip(-10)}
              className="hidden sm:flex relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1E2024] text-stone-500 hover:text-stone-900 dark:hover:text-[#FAF8F5] transition items-center justify-center cursor-pointer group active:scale-95"
              title={
                dict.player_skip_10s
              }
            >
              <RotateCcw className="w-4 h-4" />
              <span className="absolute -bottom-0.5 text-[11px] font-bold font-num opacity-70 group-hover:opacity-100">
                {toLocale(10)}
              </span>
            </button>

            {/* Play/Pause Button - Anti-Glare dark metallic bronze/obsidian */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#1E2024] border border-transparent dark:border-[#C58B43]/30 text-white dark:text-[#FAF8F5] hover:border-[#C58B43] dark:hover:bg-[#25282E] flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
              title={isPlaying ? (dict.player_pause) : (dict.player_play)}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            {/* +30s skip */}
            <button
              onClick={() => skip(30)}
              className="hidden sm:flex relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1E2024] text-stone-500 hover:text-stone-900 dark:hover:text-[#FAF8F5] transition items-center justify-center cursor-pointer group active:scale-95"
              title={
                dict.player_skip_30s
              }
            >
              <RotateCw className="w-4 h-4" />
              <span className="absolute -bottom-0.5 text-[11px] font-bold font-num opacity-70 group-hover:opacity-100">
                {toLocale(30)}
              </span>
            </button>
          </div>

          {/* Right: Speed + Playlist Toggle + Mute + Minimize/Close */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={cycleSpeed}
              className="hidden sm:block px-2 py-1 rounded-md bg-stone-100 dark:bg-[#1E2024] border border-transparent dark:border-[#C58B43]/20 hover:bg-stone-200 dark:hover:bg-[#25282E] text-stone-700 dark:text-[#FAF8F5] font-bold text-xs transition cursor-pointer font-num"
              title={dict.player_speed}
            >
              {playbackRate.toFixed(2).replace(/\.00$/, '')}x
            </button>

            <button
              onClick={togglePlaylist}
              className={`p-2 rounded-md transition cursor-pointer ${
                isPlaylistOpen
                  ? 'bg-stone-900 text-white dark:bg-[#1E2024] dark:border dark:border-[#C58B43]/30 dark:text-[#FAF8F5]'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1E2024]'
              }`}
              title={dict.player_playlist}
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-[#FAF8F5] hover:bg-stone-100 dark:hover:bg-[#1E2024] transition hidden sm:block cursor-pointer"
              title={dict.player_volume}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-[#FAF8F5] hover:bg-stone-100 dark:hover:bg-[#1E2024] transition cursor-pointer"
              title={dict.player_close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Waveform Scrubber (Enforced LTR Timeline) */}
        {!isMinimized && (
          <div className="flex items-center gap-2 pt-1 text-[11px] font-num text-stone-400" dir="ltr">
            <span className="min-w-[36px] text-start select-none text-stone-700 dark:text-stone-300 font-bold">
              {formatTime(currentTime)}
            </span>

            {/* Waveform Visualization Bars Bar */}
            <div
              className="flex-1 relative h-6 flex items-center justify-between gap-[2px] cursor-pointer group px-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                seek(ratio * (duration || 180));
              }}
            >
              {waveformHeights.map((h, i) => {
                const barPercent = (i / waveformHeights.length) * 100;
                const isPast = barPercent <= progressPercent;

                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition duration-100 ${
                      isPast
                        ? 'bg-[#8A532B] dark:bg-[#C58B43]'
                        : 'bg-stone-200 dark:bg-neutral-800'
                    }`}
                    style={{
                      height: `${h}%`,
                    }}
                  />
                );
              })}

              {/* Native Slider Input */}
              <input
                type="range"
                dir="ltr"
                min={0}
                max={duration || 180}
                step="1"
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="min-w-[36px] text-end select-none text-stone-400">
              {formatTime(duration)}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
