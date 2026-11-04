'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture,
  Check,
  Headphones,
  Film,
  Radio,
  Sliders,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { apiClient } from '@/services/apiClient';
import { triggerTactileHaptic } from '@/lib/haptics';
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

export type VideoQuality = 'auto' | '1080p' | '720p' | '480p' | '360p';
export type SettingsSubmenu = 'main' | 'quality' | 'speed' | 'mode';

export function AudioVideoPlayerEngine({
  courseId = 'course-falsafe-asfar-1',
  chapterId = 1,
  courseTitle,
  chapterTitle,
  instructorName,
  durationSeconds = 1200, // 20 minutes default
  videoUrl,
  audioUrl = '/audio/sample_lecture.wav',
  initialPositionSec = 0,
  isLocked = false,
  isCompleted = false,
  price = 0,
  isFree = false,
  onChapterComplete,
  onProgressSync,
}: AudioVideoPlayerEngineProps) {
  const { toLocale, dict, currentLang } = useLanguage();
  const { user } = useAuth();
  const { isPlaying: isGlobalIslandPlaying, togglePlay: toggleGlobalIsland } = usePlayer();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoCompletedTriggeredRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPositionSec || 0);
  const [duration, setDuration] = useState(durationSeconds || 1200);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  // Default to video mode if videoUrl exists or by default, else audio
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [quality, setQuality] = useState<VideoQuality>('1080p');

  // Hydrate preferred speed from localStorage
  const [speed, setSpeed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zanjirzan_playback_speed');
        if (saved) {
          const parsed = parseFloat(saved);
          if ([0.75, 1, 1.25, 1.5, 2].includes(parsed)) return parsed;
        }
      } catch (err) {
        console.debug('Failed to read speed from localStorage:', err);
      }
    }
    return 1;
  });

  // Settings popover state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSubmenu, setSettingsSubmenu] = useState<SettingsSubmenu>('main');

  const [drmToken, setDrmToken] = useState<string | null>(null);
  const [drmStreamUrl, setDrmStreamUrl] = useState<string | null>(null);

  const lastSyncedSecRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(initialPositionSec || 0);

  // Close settings on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isSettingsOpen && !target.closest('.player-settings-container')) {
        setIsSettingsOpen(false);
        setSettingsSubmenu('main');
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isSettingsOpen]);

  // Reset autoCompletedTriggeredRef on chapter change
  useEffect(() => {
    autoCompletedTriggeredRef.current = isCompleted;
  }, [chapterId, isCompleted]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const getActiveMediaElement = useCallback((): HTMLMediaElement | null => {
    if (mediaMode === 'video' && videoRef.current) {
      return videoRef.current;
    }
    return audioRef.current;
  }, [mediaMode]);

  // Fetch DRM stream token if needed
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
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch DRM token:', err);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id, courseId, chapterId, isLocked]);

  // Restore position when chapter changes
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

  // Auto-hide controls when playing and inactive
  const showControlsTemporarily = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !isSettingsOpen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  }, [isPlaying, isSettingsOpen]);

  useEffect(() => {
    if (!isPlaying) {
      setIsControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      showControlsTemporarily();
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showControlsTemporarily]);

  // Sync progress & check 70% automatic completion
  const checkCompletionAndSync = useCallback(
    (sec: number, totalDur: number) => {
      const safeDur = totalDur > 0 ? totalDur : durationSeconds;
      const ratio = sec / safeDur;
      const pct = Math.min(100, Math.max(0, Math.round(ratio * 100)));

      onProgressSync?.(chapterId, pct, Math.floor(sec));

      // Automatic completion when >= 70%
      if (ratio >= 0.70 && !autoCompletedTriggeredRef.current) {
        autoCompletedTriggeredRef.current = true;
        triggerTactileHaptic('thump');
        onChapterComplete?.();

        if (user) {
          apiClient.courses
            .syncProgress(courseId, chapterId, 100, Math.floor(sec))
            .catch((err) => console.warn('Failed to sync progress:', err));
        }

        toast.success(dict.player_completed_badge || 'جلسه با موفقیت تکمیل شد', {
          icon: <Check className="w-4 h-4 text-emerald-500" />,
        });
      }
    },
    [chapterId, courseId, dict.player_completed_badge, durationSeconds, onChapterComplete, onProgressSync, user]
  );

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
    } else {
      setIsBuffering(true);
      el.play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch((err) => {
          console.warn('Playback blocked:', err);
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
    checkCompletionAndSync(sec, dur);

    if (Math.abs(sec - lastSyncedSecRef.current) >= 20) {
      lastSyncedSecRef.current = sec;
      if (user) {
        const pct = Math.min(100, Math.round((sec / dur) * 100));
        apiClient.courses
          .syncProgress(courseId, chapterId, pct, Math.floor(sec))
          .catch((err) => console.warn('Periodic sync error:', err));
      }
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const mediaDur = e.currentTarget.duration;
    if (mediaDur && !isNaN(mediaDur) && isFinite(mediaDur) && mediaDur > 5) {
      setDuration(Math.round(mediaDur));
    }
    if (initialPositionSec > 0 && e.currentTarget.currentTime < 1) {
      e.currentTarget.currentTime = initialPositionSec;
    }
  };

  const handleMediaEnded = () => {
    setIsPlaying(false);
    checkCompletionAndSync(duration, duration);
    onChapterComplete?.();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextSec = Number(e.target.value);
    setCurrentTime(nextSec);
    checkCompletionAndSync(nextSec, duration);
    const el = getActiveMediaElement();
    if (el) {
      try {
        el.currentTime = nextSec;
      } catch (err) {
        console.debug('Seek error ignored:', err);
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
        console.debug('Failed to save speed:', err);
      }
    }
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
    setSettingsSubmenu('main');
  };

  const handleSelectQuality = (newQuality: VideoQuality) => {
    triggerTactileHaptic('tick');
    setQuality(newQuality);
    toast.info(`کیفیت ویدیو به ${newQuality} تغییر یافت`);
    setSettingsSubmenu('main');
  };

  const handleToggleMode = (newMode: 'video' | 'audio') => {
    triggerTactileHaptic('tick');
    setMediaMode(newMode);
    setSettingsSubmenu('main');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
    if (videoRef.current) videoRef.current.volume = v;
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
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(console.debug);
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(console.debug);
    }
  };

  const handleTogglePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.debug('PiP error:', err);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatRemaining = (total: number, current: number) => {
    const rem = Math.max(0, total - current);
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60);
    return `-${m}:${s.toString().padStart(2, '0')}`;
  };

  // If locked, render LearningAccessGuard
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

  // Active video source (fallback to sample video if none provided)
  const resolvedVideoSrc =
    videoUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <div
      ref={containerRef}
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setIsControlsVisible(true)}
      className="group/player relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-zinc-800/80 select-none flex items-center justify-center"
    >
      {/* 1. Media Elements */}
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

      {mediaMode === 'video' ? (
        <video
          ref={videoRef}
          src={resolvedVideoSrc}
          playsInline
          className="h-full w-full object-contain cursor-pointer"
          onClick={handleTogglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleMediaEnded}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
        />
      ) : (
        /* Audio Only Mode Minimalist Screen */
        <div
          onClick={handleTogglePlay}
          className="h-full w-full bg-gradient-to-br from-[#1A130E] via-[#0E0B08] to-[#070504] flex flex-col items-center justify-center p-6 text-center cursor-pointer relative"
        >
          <div className="w-20 h-20 rounded-full bg-[#8A532B]/20 border border-[#8A532B]/40 flex items-center justify-center text-[#E6CA85] mb-4 shadow-xl">
            <Headphones className="w-10 h-10" />
          </div>
          <span className="text-stone-300 font-bold text-sm sm:text-base">
            {chapterTitle}
          </span>
          <span className="text-stone-500 text-xs mt-1 font-mono">
            حالت پخش فقط صوت • ۴۸kHz Master
          </span>
        </div>
      )}

      {/* 2. Center Click-To-Play Indicator (Only shows when paused or buffering) */}
      {!isPlaying && (
        <button
          type="button"
          onClick={handleTogglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl cursor-pointer z-20 pointer-events-auto"
          aria-label="پخش ویدیو"
        >
          <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white translate-x-0.5 text-white" />
        </button>
      )}

      {/* 3. Floating Minimalist Controls Bar (Matching VideoJS Skin exactly) */}
      <div
        className={`absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 z-30 flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl bg-black/65 backdrop-blur-md border border-white/10 text-white shadow-2xl transition-all duration-300 ${
          isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Left Side: Play/Pause, Volume, Current Time */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="p-1.5 rounded-lg text-white hover:bg-white/15 transition cursor-pointer"
            title={isPlaying ? 'توقف' : 'پخش'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Volume Button & Hover Slider */}
          <div className="group/vol relative flex items-center">
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 rounded-lg text-white hover:bg-white/15 transition cursor-pointer"
              title="صدا"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-0 group-hover/vol:w-16 focus:w-16 h-1 accent-white bg-white/30 rounded-full transition-all duration-200 cursor-pointer opacity-0 group-hover/vol:opacity-100 focus:opacity-100 ms-1"
              aria-label="بلندی صدا"
            />
          </div>

          {/* Current Time (e.g. 0:00) */}
          <span className="font-mono text-xs text-white/90 font-num tabular-nums ps-1">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Center: Sleek Timeline Scrubber Bar */}
        <div className="relative flex-1 flex items-center mx-1 group/track">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 group-hover/track:h-1.5 accent-[#C58B43] bg-white/20 rounded-full cursor-pointer transition-all duration-150 appearance-none focus:outline-none"
            style={{
              background: `linear-gradient(to right, #C58B43 0%, #C58B43 ${
                (currentTime / (duration || 1)) * 100
              }%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
        </div>

        {/* Right Side: Remaining Time, Settings Menu (⚙️), PiP, Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Remaining Time (e.g. -0:35) */}
          <span className="font-mono text-xs text-white/80 font-num tabular-nums pe-1">
            {formatRemaining(duration, currentTime)}
          </span>

          {/* Settings Menu Popover (⚙️) */}
          <div className="relative player-settings-container">
            <button
              type="button"
              onClick={() => {
                triggerTactileHaptic('tick');
                setIsSettingsOpen((prev) => !prev);
                setSettingsSubmenu('main');
              }}
              className={`p-1.5 rounded-lg text-white hover:bg-white/15 transition cursor-pointer ${
                isSettingsOpen ? 'bg-white/20 text-[#E6CA85]' : ''
              }`}
              title="تنظیمات"
            >
              <Settings className={`w-4 h-4 transition-transform ${isSettingsOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Popover Panel */}
            {isSettingsOpen && (
              <div className="absolute bottom-full mb-2 end-0 z-50 w-52 bg-[#121316]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl py-2 px-1 text-xs text-start text-white animate-in fade-in zoom-in-95 duration-150">
                {settingsSubmenu === 'main' && (
                  <div className="space-y-0.5">
                    <div className="px-3 py-1 text-[11px] font-bold text-white/50 border-b border-white/10 mb-1">
                      تنظیمات پخش
                    </div>

                    {/* Submenu 1: Playback Mode (Video vs Audio) */}
                    <button
                      type="button"
                      onClick={() => setSettingsSubmenu('mode')}
                      className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-white/10 transition cursor-pointer text-start"
                    >
                      <div className="flex items-center gap-2">
                        {mediaMode === 'video' ? <Film className="w-3.5 h-3.5 text-amber-400" /> : <Headphones className="w-3.5 h-3.5 text-amber-400" />}
                        <span>حالت رسانه</span>
                      </div>
                      <span className="text-[11px] text-white/60">
                        {mediaMode === 'video' ? 'ویدیو 🎬' : 'صوت 🎧'}
                      </span>
                    </button>

                    {/* Submenu 2: Video Quality (1080p, 720p, 480p, Auto) */}
                    {mediaMode === 'video' && (
                      <button
                        type="button"
                        onClick={() => setSettingsSubmenu('quality')}
                        className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-white/10 transition cursor-pointer text-start"
                      >
                        <div className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>کیفیت ویدیو</span>
                        </div>
                        <span className="text-[11px] font-mono text-white/60">
                          {quality === 'auto' ? 'خودکار' : quality}
                        </span>
                      </button>
                    )}

                    {/* Submenu 3: Playback Speed */}
                    <button
                      type="button"
                      onClick={() => setSettingsSubmenu('speed')}
                      className="w-full px-3 py-2 flex items-center justify-between rounded-lg hover:bg-white/10 transition cursor-pointer text-start"
                    >
                      <div className="flex items-center gap-2">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        <span>سرعت پخش</span>
                      </div>
                      <span className="text-[11px] font-mono text-white/60">
                        {speed === 1 ? 'عادی (1x)' : `${speed}x`}
                      </span>
                    </button>
                  </div>
                )}

                {/* Submenu: Quality Selection */}
                {settingsSubmenu === 'quality' && (
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => setSettingsSubmenu('main')}
                      className="w-full px-3 py-1.5 text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-1 border-b border-white/10 mb-1"
                    >
                      <span>‹ بازگشت</span>
                    </button>
                    {(['auto', '1080p', '720p', '480p', '360p'] as VideoQuality[]).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSelectQuality(q)}
                        className={`w-full px-3 py-1.5 flex items-center justify-between rounded-lg hover:bg-white/10 transition cursor-pointer ${
                          quality === q ? 'text-[#E6CA85] font-bold' : 'text-white/80'
                        }`}
                      >
                        <span className="font-mono">{q === 'auto' ? 'خودکار (Auto)' : q}</span>
                        {quality === q && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Submenu: Speed Selection */}
                {settingsSubmenu === 'speed' && (
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => setSettingsSubmenu('main')}
                      className="w-full px-3 py-1.5 text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-1 border-b border-white/10 mb-1"
                    >
                      <span>‹ بازگشت</span>
                    </button>
                    {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSelectSpeed(s)}
                        className={`w-full px-3 py-1.5 flex items-center justify-between rounded-lg hover:bg-white/10 transition cursor-pointer ${
                          speed === s ? 'text-[#E6CA85] font-bold' : 'text-white/80'
                        }`}
                      >
                        <span className="font-mono">{s === 1 ? 'عادی (1x)' : `${s}x`}</span>
                        {speed === s && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Submenu: Mode Selection */}
                {settingsSubmenu === 'mode' && (
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => setSettingsSubmenu('main')}
                      className="w-full px-3 py-1.5 text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-1 border-b border-white/10 mb-1"
                    >
                      <span>‹ بازگشت</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleMode('video')}
                      className={`w-full px-3 py-1.5 flex items-center justify-between rounded-lg hover:bg-white/10 transition cursor-pointer ${
                        mediaMode === 'video' ? 'text-[#E6CA85] font-bold' : 'text-white/80'
                      }`}
                    >
                      <span>پخش ویدیویی با تصویر 🎬</span>
                      {mediaMode === 'video' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleMode('audio')}
                      className={`w-full px-3 py-1.5 flex items-center justify-between rounded-lg hover:bg-white/10 transition cursor-pointer ${
                        mediaMode === 'audio' ? 'text-[#E6CA85] font-bold' : 'text-white/80'
                      }`}
                    >
                      <span>فقط صوت / پادکست (کم‌مصرف) 🎧</span>
                      {mediaMode === 'audio' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Picture-in-Picture Button */}
          {mediaMode === 'video' && (
            <button
              type="button"
              onClick={handleTogglePiP}
              className="p-1.5 rounded-lg text-white hover:bg-white/15 transition cursor-pointer"
              title="تصویر در تصویر"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg text-white hover:bg-white/15 transition cursor-pointer"
            title={isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AudioVideoPlayerEngine;
