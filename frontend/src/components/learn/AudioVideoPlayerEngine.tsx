'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { apiClient } from '@/services/apiClient';
import { triggerTactileHaptic } from '@/lib/haptics';

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
  onChapterComplete,
  onProgressSync,
}: AudioVideoPlayerEngineProps) {
  const { toLocale, dict, currentLang } = useLanguage();
  const { user } = useAuth();
  const { isPlaying: isGlobalIslandPlaying, togglePlay: toggleGlobalIsland } = usePlayer();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPositionSec || 0);
  const [duration, setDuration] = useState(durationSeconds || 180);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaMode, setMediaMode] = useState<'audio' | 'video'>('audio');
  const [drmToken, setDrmToken] = useState<string | null>(null);
  const [drmStreamUrl, setDrmStreamUrl] = useState<string | null>(null);
  const [serverWatermark, setServerWatermark] = useState<string | null>(null);
  const [syncIndicator, setSyncIndicator] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState<
    'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  >('top-end');

  const lastSyncedSecRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(initialPositionSec || 0);

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
    `${studentIdentifier} • ${dict.scholar_name || 'حجت الاسلام دکتر زنجیر زن حسینی'}`;

  const getActiveMediaElement = useCallback((): HTMLMediaElement | null => {
    if (mediaMode === 'video' && videoRef.current && videoUrl && !videoUrl.includes('youtube.com')) {
      return videoRef.current;
    }
    return audioRef.current;
  }, [mediaMode, videoUrl]);

  // 1. Issue DRM Token on course/chapter change
  useEffect(() => {
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
  }, [user?.id, courseId, chapterId]);

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
          .catch((err) => { console.debug('DRM heartbeat error ignored:', err); });
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
    if (!isPlaying) return;
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
  }, [isPlaying, speed, duration, getActiveMediaElement, onChapterComplete, pushProgressToServer]);

  const handleTogglePlay = () => {
    triggerTactileHaptic('thump');
    // Pause global floating island player if it is currently playing
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

  const toggleSpeed = () => {
    triggerTactileHaptic('tick');
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
    if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
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
          className={`absolute pointer-events-none transition-all duration-1000 z-30 select-none opacity-60 font-mono text-[10px] sm:text-xs text-[#E6CA85] bg-[#0C0D0E]/85 px-3 py-1 rounded-lg backdrop-blur-xs border border-[#8A532B]/40 ${
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
          <div className="absolute top-4 start-4 z-30 px-2.5 py-1 rounded-lg bg-[#141518]/90 border border-[#8A532B]/40 text-[#E6CA85] text-[10px] font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#C58B43]" />
            <span>
              {currentLang === 'en'
                ? 'Progress synced'
                : currentLang === 'ar'
                ? 'تم حفظ التقدم'
                : 'ذخیره خودکار پیشرفت درس'}
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
              className="w-16 h-16 rounded-full bg-[#8A532B] hover:bg-[#724424] border border-[#C58B43]/40 flex items-center justify-center text-[#FAF8F5] shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer z-20"
              aria-label={isPlaying ? dict.player_pause || 'توقف' : dict.player_play || 'پخش'}
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
            <button
              type="button"
              onClick={() => skipSeconds(-10)}
              className="p-2 rounded-xl text-zinc-400 hover:text-[#FAF8F5] hover:bg-zinc-800 transition cursor-pointer"
              title={dict.player_skip_10s || '۱۰ ثانیه به عقب'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] flex items-center justify-center transition cursor-pointer shadow-xs"
              title={isPlaying ? dict.player_pause || 'توقف' : dict.player_play || 'پخش'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ps-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => skipSeconds(30)}
              className="p-2 rounded-xl text-zinc-400 hover:text-[#FAF8F5] hover:bg-zinc-800 transition cursor-pointer"
              title={dict.player_skip_30s || '۳۰ ثانیه به جلو'}
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-xl text-zinc-400 hover:text-[#FAF8F5] hover:bg-zinc-800 transition cursor-pointer"
              title={dict.player_volume || 'صدا'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Toggle */}
            <button
              type="button"
              onClick={toggleSpeed}
              className="px-3 py-1.5 rounded-xl bg-[#0C0D0E] border border-[#22242A] text-zinc-200 hover:border-[#8A532B] text-xs font-mono font-bold transition cursor-pointer font-num"
              title={dict.player_speed || 'سرعت پخش'}
            >
              {speed}x
            </button>

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
                {dict.player_mode_audio || 'صوت ۴۸kHz'}
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
                {dict.player_mode_video || 'ویدیو'}
              </button>
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl text-zinc-400 hover:text-[#FAF8F5] hover:bg-zinc-800 transition cursor-pointer"
              title={dict.reader_fullscreen || 'تمام‌صفحه'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
