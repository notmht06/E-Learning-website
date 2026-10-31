'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { apiClient } from '@/services/apiClient';
import { triggerTactileHaptic } from '@/lib/haptics';
import { getCourseSubtitles, getActiveSubtitleText, SubtitleLang } from '@/lib/subtitles';
import { LearningAccessGuard } from './LearningAccessGuard';

export interface AudioVideoPlayerEngineProps {
  courseId?: string;
  chapterId?: number;
  courseTitle: string;
  chapterTitle: string;
  instructorName: string;
  durationSeconds?: number;
  videoUrl?: string;
  audioUrl?: string;
  initialPositionSec?: number;
  isLocked?: boolean;
  isCompleted?: boolean;
  price?: string | number;
  isFree?: boolean;
  onToggleComplete?: () => void;
  onChapterComplete?: () => void;
  onProgressSync?: (chapterId: number, percent: number, currentSec: number) => void;
}

export function AudioVideoPlayerEngine({
  courseId = 'course-falsafe-asfar-1',
  chapterId = 1,
  courseTitle,
  chapterTitle,
  instructorName,
  durationSeconds = 2700,
  videoUrl,
  audioUrl = '/audio/sample_lecture.wav',
  initialPositionSec = 0,
  isLocked = false,
  isCompleted = false,
  price = 0,
  isFree = false,
  onToggleComplete,
  onChapterComplete,
  onProgressSync,
}: AudioVideoPlayerEngineProps) {
  const { toLocale, dict, currentLang } = useLanguage();
  const { user } = useAuth();
  const {
    isPlaying: isGlobalIslandPlaying,
    togglePlay: toggleGlobalIsland,
    subtitleLang,
    setSubtitleLang,
  } = usePlayer();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPositionSec || 0);
  const [duration, setDuration] = useState(durationSeconds || 180);

  // Hydrate preferred speed from localStorage
  const [speed, setSpeed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zanjirzan_playback_speed');
        if (saved) {
          const parsed = parseFloat(saved);
          if ([0.75, 1, 1.25, 1.5, 1.75, 2].includes(parsed)) return parsed;
        }
      } catch (err) {
        console.debug('Failed to read speed from localStorage:', err);
      }
    }
    return 1;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaMode, setMediaMode] = useState<'audio' | 'video'>('audio');
  const [drmToken, setDrmToken] = useState<string | null>(null);
  const [drmStreamUrl, setDrmStreamUrl] = useState<string | null>(null);
  const [serverWatermark, setServerWatermark] = useState<string | null>(null);
  const [syncIndicator, setSyncIndicator] = useState(false);
  const [isSubtitleMenuOpen, setIsSubtitleMenuOpen] = useState(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState<
    'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  >('top-end');

  const lastSyncedSecRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(initialPositionSec || 0);

  const subtitleCues = useMemo(() => {
    return getCourseSubtitles(courseId, chapterId, duration);
  }, [courseId, chapterId, duration]);

  const activeSubtitle = getActiveSubtitleText(subtitleCues, currentTime, subtitleLang);

  // Close popover menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isSubtitleMenuOpen && !target.closest('.cc-menu-container')) {
        setIsSubtitleMenuOpen(false);
      }
      if (isSpeedMenuOpen && !target.closest('.speed-menu-container')) {
        setIsSpeedMenuOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isSubtitleMenuOpen, isSpeedMenuOpen]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const studentIdentifier = user?.phone
    ? `${user.phone.slice(0, 4)}***${user.phone.slice(-3)}`
    : user?.id
    ? `UID:${user.id.slice(0, 8)}`
    : 'DRM-VERIFIED';

  const watermarkText =
    serverWatermark ||
    `${studentIdentifier} • ${dict.scholar_name}`;

  const getActiveMediaElement = useCallback((): HTMLMediaElement | null => {
    if (mediaMode === 'video' && videoRef.current && videoUrl && !videoUrl.includes('youtube.com')) {
      return videoRef.current;
    }
    return audioRef.current;
  }, [mediaMode, videoUrl]);

  // 1. Issue DRM Token on course/chapter change (only if not locked)
  useEffect(() => {
    if (isLocked) return;
    let mounted = true;
    setDrmStreamUrl(null);
    const uid = user?.id || 'guest-scholar';
    apiClient.stream
      .getToken(uid, courseId, chapterId)
      .then((res) => {
        if (mounted && res && res.token) {
          setDrmToken(res.token);
          const secureUrl = `/api/v1/stream/audio/${courseId}/${chapterId}?token=${encodeURIComponent(res.token)}`;
          setDrmStreamUrl(secureUrl);
          if (res.forensic_watermark) {
            setServerWatermark(res.forensic_watermark);
          }
        }
      })
      .catch((err) => { console.warn('Failed to fetch DRM token:', err); });

    return () => {
      mounted = false;
    };
  }, [user?.id, courseId, chapterId, isLocked]);

  // 2. Reset or restore playback position when chapter changes
  useEffect(() => {
    setIsPlaying(false);
    const startSec = initialPositionSec > 0 ? initialPositionSec : 0;
    setCurrentTime(startSec);
    lastSyncedSecRef.current = startSec;

    if (audioRef.current) {
      audioRef.current.currentTime = startSec;
      audioRef.current.playbackRate = speed;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = startSec;
      videoRef.current.playbackRate = speed;
    }
  }, [courseId, chapterId, initialPositionSec, speed]);

  // 3. Sync progress & DRM heartbeat helper
  const pushProgressToServer = useCallback(
    (sec: number, totalDur: number, forceComplete = false) => {
      const safeDur = totalDur > 0 ? totalDur : durationSeconds;
      const pct = forceComplete
        ? 100
        : Math.min(100, Math.max(0, Math.round((sec / safeDur) * 100)));

      onProgressSync?.(chapterId, pct, Math.floor(sec));

      if (user) {
        apiClient.courses
          .syncProgress(courseId, chapterId, pct, Math.floor(sec))
          .then(() => {
            setSyncIndicator(true);
            setTimeout(() => setSyncIndicator(false), 1800);
          })
          .catch((err) => { console.warn('Failed to sync progress with server:', err); });
      }

      if (drmToken) {
        apiClient.stream
          .heartbeat(drmToken, user?.id || 'guest-scholar', courseId, chapterId, Math.floor(sec))
          .catch((err) => {
            console.warn('DRM heartbeat error:', err);
            if (err?.status === 403 || err?.message?.includes('403')) {
              const activeEl = getActiveMediaElement();
              if (activeEl) {
                activeEl.pause();
                setIsPlaying(false);
              }
            }
          });
      }
    },
    [chapterId, courseId, drmToken, durationSeconds, onProgressSync, user]
  );

  // 4. Rotate forensic watermark position every 14 seconds
  useEffect(() => {
    const positions: Array<'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'> = [
      'top-start',
      'top-end',
      'bottom-start',
      'bottom-end',
    ];
    const timer = setInterval(() => {
      setWatermarkPos((prev) => {
        const nextIdx = (positions.indexOf(prev) + 1) % positions.length;
        return positions[nextIdx];
      });
    }, 14000);
    return () => clearInterval(timer);
  }, []);

  // 5. Fallback simulation timer ONLY if browser blocks or lacks physical media stream
  useEffect(() => {
    if (!isPlaying || isLocked) return;
    const interval = setInterval(() => {
      const el = getActiveMediaElement();
      const isNativeAdvancing = el && !el.paused && !el.ended && el.readyState >= 2;

      if (!isNativeAdvancing) {
        const next = currentTimeRef.current + 1;
        if (next >= duration) {
          currentTimeRef.current = duration;
          setCurrentTime(duration);
          setIsPlaying(false);
          pushProgressToServer(duration, duration, true);
          onChapterComplete?.();
        } else {
          currentTimeRef.current = next;
          setCurrentTime(next);
          if (next - lastSyncedSecRef.current >= 30) {
            lastSyncedSecRef.current = next;
            pushProgressToServer(next, duration);
          }
        }
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, isLocked, speed, duration, getActiveMediaElement, onChapterComplete, pushProgressToServer]);

  const handleTogglePlay = () => {
    if (isLocked) return;
    triggerTactileHaptic('thump');
    if (!isPlaying && isGlobalIslandPlaying) {
      toggleGlobalIsland();
    }

    const el = getActiveMediaElement();
    if (!el) {
      setIsPlaying((prev) => !prev);
      return;
    }

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      pushProgressToServer(currentTime, duration);
    } else {
      setIsBuffering(true);
      el.play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch((playErr) => {
          console.warn('Playback failed or was blocked by autoplay policy:', playErr);
          setIsBuffering(false);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const sec = e.currentTarget.currentTime;
    const dur =
      e.currentTarget.duration && isFinite(e.currentTarget.duration)
        ? e.currentTarget.duration
        : duration;
    setCurrentTime(sec);
    if (Math.abs(sec - lastSyncedSecRef.current) >= 30) {
      lastSyncedSecRef.current = sec;
      pushProgressToServer(sec, dur);
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const mediaDur = e.currentTarget.duration;
    if (mediaDur && !isNaN(mediaDur) && isFinite(mediaDur) && mediaDur > 10) {
      setDuration(Math.round(mediaDur));
    }
    if (initialPositionSec > 0 && e.currentTarget.currentTime < 1) {
      e.currentTarget.currentTime = initialPositionSec;
    }
  };

  const handleMediaEnded = () => {
    setIsPlaying(false);
    pushProgressToServer(duration, duration, true);
    onChapterComplete?.();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextSec = Number(e.target.value);
    setCurrentTime(nextSec);
    const el = getActiveMediaElement();
    if (el) {
      try {
        el.currentTime = nextSec;
      } catch (seekErr) {
        console.debug('Media seek ignored:', seekErr);
      }
    }
  };

  const skipSeconds = (delta: number) => {
    triggerTactileHaptic('tick');
    const nextSec = Math.max(0, Math.min(duration, currentTime + delta));
    setCurrentTime(nextSec);
    const el = getActiveMediaElement();
    if (el) {
      try {
        el.currentTime = nextSec;
      } catch (skipErr) {
        console.debug('Media skip ignored:', skipErr);
      }
    }
  };

  const handleSelectSpeed = (newSpeed: number) => {
    triggerTactileHaptic('tick');
    setSpeed(newSpeed);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zanjirzan_playback_speed', String(newSpeed));
      } catch (err) {
        console.debug('Failed to save speed to localStorage:', err);
      }
    }
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
    setIsSpeedMenuOpen(false);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) audioRef.current.muted = nextMute;
    if (videoRef.current) videoRef.current.muted = nextMute;
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch((err) => { console.debug('Fullscreen request ignored:', err); });
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch((err) => { console.debug('Fullscreen exit ignored:', err); });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, Math.round((currentTime / (duration || 1)) * 100)));

  // If chapter is locked, render LearningAccessGuard in place of media player
  if (isLocked) {
    return (
      <div ref={containerRef}>
        <LearningAccessGuard
          courseId={courseId}
          courseTitle={courseTitle}
          chapterTitle={chapterTitle}
          price={price}
          isFree={isFree}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-[#0C0D0E] border border-[#22242A] rounded-2xl overflow-hidden shadow-md flex flex-col justify-between text-start relative select-none"
    >
      {/* Hidden or Active HTML5 Media Elements */}
      <audio
        ref={audioRef}
        src={drmStreamUrl || audioUrl || '/audio/sample_lecture.wav'}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleMediaEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      />

      {/* Screen / Stage Area */}
      <div
        className="relative min-h-[300px] sm:min-h-[420px] bg-[#0C0D0E] flex flex-col items-center justify-center p-6 text-center overflow-hidden group select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Dynamic Forensic Watermark Layer */}
        <div
          className={`absolute pointer-events-none transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-1000 z-30 select-none opacity-60 font-mono text-[11px] sm:text-xs text-[#E6CA85] bg-[#0C0D0E]/85 px-3 py-1 rounded-lg backdrop-blur-xs border border-[#8A532B]/40 ${
            watermarkPos === 'top-start'
              ? 'top-4 start-4'
              : watermarkPos === 'top-end'
              ? 'top-4 end-4'
              : watermarkPos === 'bottom-start'
              ? 'bottom-6 start-4'
              : 'bottom-6 end-4'
          }`}
          dir="ltr"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C58B43] shrink-0" />
            <span>{watermarkText}</span>
          </div>
        </div>

        {/* Auto-Save Progress Indicator Badge */}
        {syncIndicator && (
          <div className="absolute top-4 start-4 z-30 px-2.5 py-1 rounded-lg bg-[#141518]/90 border border-[#8A532B]/40 text-[#E6CA85] text-[11px] font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#C58B43]" />
            <span>
              {dict.ui_progress_synced}
            </span>
          </div>
        )}

        {mediaMode === 'video' && videoUrl && !videoUrl.includes('youtube.com') ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            onClick={handleTogglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleMediaEnded}
            className="w-full h-full max-h-[420px] object-contain z-10 cursor-pointer"
          />
        ) : (
          <div className="space-y-5 max-w-lg z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141518] border border-[#22242A] text-[11px] font-mono text-[#C58B43]">
              <span>48kHz STUDIO MASTER</span>
              <span>•</span>
              <span className="font-num">{toLocale(progressPercent)}%</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-[#FAF8F5] leading-snug">
                {chapterTitle}
              </h2>
              <p className="text-xs text-zinc-400">
                {courseTitle} • {instructorName}
              </p>
            </div>

            {/* Tactile Center Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-16 h-16 rounded-full bg-[#8A532B] hover:bg-[#724424] border border-[#C58B43]/40 flex items-center justify-center text-[#FAF8F5] shadow-xl active:scale-95 transition cursor-pointer z-20"
              aria-label={isPlaying ? dict.player_pause : dict.player_play}
            >
              {isBuffering ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ps-0.5" />
              )}
            </button>

            {/* Studio Soundwave Equalizer Bars */}
            <div className="flex items-end justify-center gap-2 h-8 text-[#C58B43]" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((bar) => (
                <span
                  key={bar}
                  className={`soundwave-bar ${isPlaying ? 'is-animating' : 'h-2 opacity-40'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* On-Stage Multilingual Subtitle Display */}
        {activeSubtitle && (
          <div className="absolute bottom-6 inset-x-4 sm:inset-x-12 z-25 flex justify-center pointer-events-none animate-in fade-in duration-200">
            <div
              className={`max-w-2xl px-4 py-2.5 rounded-xl bg-black/85 backdrop-blur-xs border border-[#8A532B]/50 shadow-2xl text-center select-text pointer-events-auto ${
                subtitleLang === 'en'
                  ? 'font-sans text-xs sm:text-sm text-[#FAF8F5] leading-relaxed'
                  : 'font-sans text-xs sm:text-sm text-[#FAF8F5] leading-loose'
              }`}
              dir={subtitleLang === 'en' ? 'ltr' : 'rtl'}
            >
              <span className="font-medium drop-shadow-md">{activeSubtitle}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-[#141518] border-t border-[#22242A] p-4 sm:p-5 space-y-3 z-10">
        {/* Scrubber Range (LTR Timeline) */}
        <div className="space-y-1.5" dir="ltr">
          <input
            type="range"
            min={0}
            max={duration}
            value={Math.min(currentTime, duration)}
            onChange={handleSeek}
            className="w-full accent-[#8A532B] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono font-num text-zinc-400">
            <span>{toLocale(formatTime(currentTime))}</span>
            <span>{toLocale(formatTime(duration))}</span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* 10s Rewind */}
            <button
              type="button"
              onClick={() => skipSeconds(-10)}
              className="p-2 rounded-xl text-zinc-400 hover:text-[#FAF8F5] hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1 group"
              title={
                dict.player_skip_10s
              }
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-[11px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300 font-num">10</span>
            </button>

            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] flex items-center justify-center transition cursor-pointer shadow-xs"
              title={isPlaying ? dict.player_pause : dict.player_play}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ps-0.5" />
              )}
            </button>

            {/* 10s Forward */}
            <button
              type="button"
              onClick={() => skipSeconds(10)}
              className="p-2 rounded-xl text-zinc-400 hover:text-[#FAF8F5] hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1 group"
              title={
                dict.player_skip_forward
              }
            >
              <span className="text-[11px] font-mono font-bold text-zinc-500 group-hover:text-zinc-300 font-num">10</span>
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-xl text-zinc-400 hover:text-[#FAF8F5] hover:bg-zinc-800 transition cursor-pointer"
              title={dict.player_volume}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Mark as Completed Toggle Button */}
            {onToggleComplete && (
              <button
                type="button"
                onClick={() => {
                  triggerTactileHaptic('thump');
                  onToggleComplete();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isCompleted
                    ? 'bg-[#8A532B]/15 border-[#8A532B] text-[#E6CA85]'
                    : 'bg-[#0C0D0E] border-[#22242A] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
                title={
                  isCompleted
                    ? dict.player_completed_badge
                    : dict.player_mark_completed
                }
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-[#C58B43]' : 'text-zinc-500'}`} />
                <span className="hidden sm:inline">
                  {isCompleted
                    ? dict.player_completed_badge
                    : dict.player_mark_completed}
                </span>
              </button>
            )}

            {/* Speed Selector Popover Menu */}
            <div className="relative speed-menu-container">
              <button
                type="button"
                onClick={() => setIsSpeedMenuOpen((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl bg-[#0C0D0E] border border-[#22242A] text-zinc-200 hover:border-[#8A532B] text-xs font-mono font-bold transition cursor-pointer font-num flex items-center gap-1"
                title={dict.player_speed}
              >
                <span>{speed}x</span>
                <ChevronUp className={`w-3 h-3 text-zinc-400 transition-transform ${isSpeedMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSpeedMenuOpen && (
                <div className="absolute bottom-full mb-2 end-0 z-50 w-36 bg-[#141518] border border-[#22242A] rounded-xl shadow-2xl py-1.5 text-xs text-start animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-zinc-500 border-b border-[#22242A]">
                    {dict.player_speed}
                  </div>
                  {[0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelectSpeed(s)}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-start cursor-pointer hover:bg-zinc-800 transition font-mono ${
                        speed === s ? 'text-[#C58B43] font-bold' : 'text-zinc-300'
                      }`}
                    >
                      <span>
                        {s === 1
                          ? dict.player_speed_normal
                          : `${s}x`}
                      </span>
                      {speed === s && <span className="w-1.5 h-1.5 rounded-full bg-[#C58B43]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtitle / Closed Caption (CC) Switcher */}
            <div className="relative cc-menu-container">
              <button
                type="button"
                onClick={() => setIsSubtitleMenuOpen((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  subtitleLang !== 'off'
                    ? 'bg-[#8A532B] border-[#C58B43] text-[#FAF8F5]'
                    : 'bg-[#0C0D0E] border-[#22242A] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
                title={
                  dict.player_subtitles
                }
                aria-label="Closed Captions"
              >
                <span className="text-[11px] font-bold">CC</span>
                {subtitleLang !== 'off' && (
                  <span className="text-[11px] text-[#E6CA85] font-mono">
                    {subtitleLang}
                  </span>
                )}
              </button>

              {/* CC Language Selector Popover Menu */}
              {isSubtitleMenuOpen && (
                <div className="absolute bottom-full mb-2 end-0 z-50 w-44 bg-[#141518] border border-[#22242A] rounded-xl shadow-2xl py-1.5 text-xs text-start animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-zinc-500 border-b border-[#22242A]">
                    {dict.ui_subtitles_cc}
                  </div>
                  {[
                    {
                      code: 'off',
                      label:
                        dict.ui_off,
                    },
                    { code: 'fa', label: 'فارسی (FA)' },
                    { code: 'ar', label: 'العربية (AR)' },
                    { code: 'en', label: 'English (EN)' },
                  ].map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setSubtitleLang(opt.code as SubtitleLang);
                        setIsSubtitleMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-start cursor-pointer hover:bg-zinc-800 transition ${
                        subtitleLang === opt.code
                          ? 'text-[#C58B43] font-bold'
                          : 'text-zinc-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {subtitleLang === opt.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C58B43]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio / Video Mode Switcher */}
            <div className="inline-flex p-1 bg-[#0C0D0E] border border-[#22242A] rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMediaMode('audio')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  mediaMode === 'audio'
                    ? 'bg-[#8A532B] text-[#FAF8F5]'
                    : 'text-zinc-400 hover:text-[#FAF8F5]'
                }`}
              >
                {dict.player_mode_audio}
              </button>
              <button
                type="button"
                onClick={() => setMediaMode('video')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  mediaMode === 'video'
                    ? 'bg-[#8A532B] text-[#FAF8F5]'
                    : 'text-zinc-400 hover:text-[#FAF8F5]'
                }`}
              >
                {dict.player_mode_video}
              </button>
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl text-zinc-400 hover:text-[#FAF8F5] hover:bg-zinc-800 transition cursor-pointer"
              title={dict.reader_fullscreen}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
