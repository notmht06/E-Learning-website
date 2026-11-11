'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Video, VideoPlayer, VideoSkin } from '@videojs/react/video';
import '@videojs/react/video/skin.css';
import { Headphones } from 'lucide-react';
import { getCourseSubtitles, SubtitleCue } from '@/lib/subtitles';
import { SCHOLAR_NAME } from '@/lib/constants';
import { LearningAccessGuard } from './LearningAccessGuard';

export interface AudioVideoPlayerEngineProps {
  courseId?: string;
  chapterId?: number;
  courseTitle: string;
  chapterTitle: string;
  instructorName?: string;
  durationSeconds?: number;
  videoUrl?: string;
  audioUrl?: string;
  poster?: string;
  initialPositionSec?: number;
  isLocked?: boolean;
  isCompleted?: boolean;
  price?: string | number;
  isFree?: boolean;
  onToggleComplete?: () => void;
  onChapterComplete?: () => void;
  onProgressSync?: (chapterId: number, percent: number, currentSec: number) => void;
}

const QUALITY_FILTERS: Record<string, string> = {
  auto: 'none',
  '1080p': 'none',
  '720p': 'blur(0.4px) contrast(0.99)',
  '480p': 'blur(1.1px) contrast(0.96)',
  '360p': 'blur(2.2px) contrast(0.93)',
};

function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function generateWebVTT(cues: SubtitleCue[]): string {
  let vtt = 'WEBVTT - درس‌گفتار استاد\n\n';
  cues.forEach((cue) => {
    vtt += `${cue.id}\n`;
    vtt += `${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}\n`;
    vtt += `${cue.text.fa}\n\n`;
  });
  return vtt;
}

export function AudioVideoPlayerEngine({
  courseId = 'course-falsafe-asfar-1',
  chapterId = 1,
  courseTitle,
  chapterTitle,
  instructorName = SCHOLAR_NAME,
  durationSeconds = 1200,
  videoUrl,
  audioUrl,
  poster,
  initialPositionSec = 0,
  isLocked = false,
  price = 0,
  isFree = false,
  onChapterComplete,
  onProgressSync,
}: AudioVideoPlayerEngineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [qualityNotice, setQualityNotice] = useState<string | null>(null);
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(true);
  const [activeSubtitleText, setActiveSubtitleText] = useState<string>('');

  // Direct video URL resolver
  const isDirectVideo =
    Boolean(videoUrl) &&
    !videoUrl?.includes('youtube.com') &&
    !videoUrl?.includes('youtu.be') &&
    /\.(mp4|webm|m3u8|ogg|mov)(\?.*)?$/i.test(videoUrl || '');

  const baseSrc = isDirectVideo ? (videoUrl as string) : '/videos/sample_lecture.mp4';

  // Subtitle Cues
  const cues = useMemo(() => {
    try {
      return getCourseSubtitles(courseId || 'course-asfar', chapterId || 1, durationSeconds);
    } catch {
      return [];
    }
  }, [courseId, chapterId, durationSeconds]);

  // Generate WebVTT captions Data URI
  const vttDataUri = useMemo(() => {
    if (typeof window === 'undefined' || cues.length === 0) return '';
    try {
      const vtt = generateWebVTT(cues);
      return `data:text/vtt;charset=utf-8,${encodeURIComponent(vtt)}`;
    } catch {
      return '';
    }
  }, [cues]);

  // Handle Quality Switch: apply visual resolution downscaling filter directly to <video>
  // without resetting currentTime or pausing playback
  const handleQualityChange = useCallback((newQuality: string) => {
    const el = videoRef.current || containerRef.current?.querySelector('video');
    if (!el) return;

    const filter = QUALITY_FILTERS[newQuality.toLowerCase()] || 'none';
    el.style.filter = filter;

    const label = newQuality === 'auto' ? 'کیفیت خودکار (Auto 1080p)' : `کیفیت ${newQuality}`;
    setQualityNotice(label);

    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setQualityNotice(null);
    }, 2500);

    // Keep playing if it was playing
    if (!el.paused) {
      el.play().catch(() => {});
    }
  }, []);

  // Sync textTrack modes and subtitle visibility
  const syncTracks = useCallback(() => {
    const el = videoRef.current || containerRef.current?.querySelector('video');
    if (!el || !el.textTracks) return;

    let hasActiveTrack = false;
    for (let i = 0; i < el.textTracks.length; i++) {
      const track = el.textTracks[i];
      if (track.mode === 'showing') {
        // Suppress native Chromium shadow DOM rendering in favor of custom Dana overlay
        track.mode = 'hidden';
        hasActiveTrack = true;
      } else if (track.mode === 'hidden') {
        hasActiveTrack = true;
      }
    }
    setIsCaptionsEnabled(hasActiveTrack);
  }, []);

  // Attach Video.js videoRenditions and audioTracks polyfill to media element
  useEffect(() => {
    const el = videoRef.current || containerRef.current?.querySelector('video');
    if (!el) return;

    // 1. videoRenditions (Auto, 1080p, 720p, 480p, 360p)
    if (!(el as any).videoRenditions) {
      const renditions = [
        { id: '1080p', label: '1080p (Full HD)', width: 1920, height: 1080, bitrate: 4500000, selected: false },
        { id: '720p', label: '720p (HD)', width: 1280, height: 720, bitrate: 2500000, selected: false },
        { id: '480p', label: '480p (SD)', width: 854, height: 480, bitrate: 1200000, selected: false },
        { id: '360p', label: '360p (بهینه)', width: 640, height: 360, bitrate: 600000, selected: false },
      ];

      class VideoRenditionList extends EventTarget {
        renditions: any[];
        private _selectedIndex: number = -1;

        constructor(list: any[]) {
          super();
          this.renditions = list;
          list.forEach((r, i) => {
            (this as any)[i] = r;
          });
        }

        get length() {
          return this.renditions.length;
        }

        get selectedIndex() {
          return this._selectedIndex;
        }

        set selectedIndex(idx: number) {
          this._selectedIndex = idx;
          this.renditions.forEach((r, i) => {
            r.selected = i === idx;
          });
          this.dispatchEvent(new Event('change'));
        }

        [Symbol.iterator]() {
          return this.renditions[Symbol.iterator]();
        }

        findIndex(pred: any) {
          return this.renditions.findIndex(pred);
        }

        some(pred: any) {
          return this.renditions.some(pred);
        }

        filter(pred: any) {
          return this.renditions.filter(pred);
        }
      }

      const rList = new VideoRenditionList(renditions);
      (el as any).videoRenditions = rList;

      rList.addEventListener('change', () => {
        const idx = rList.selectedIndex;
        const targetQuality = idx === -1 ? 'auto' : renditions[idx]?.id || 'auto';
        handleQualityChange(targetQuality);
      });
    }

    // 2. audioTracks (Standard video+audio vs Audio Only)
    if (!(el as any).audioTracks) {
      const tracks = [
        { id: 'video-audio', label: 'ویدیو و صوت', kind: 'main', language: 'fa', enabled: true },
        { id: 'audio-only', label: 'فقط صوت', kind: 'alternative', language: 'fa', enabled: false },
      ];

      class AudioTrackList extends EventTarget {
        tracks: any[];

        constructor(list: any[]) {
          super();
          this.tracks = list;
          list.forEach((t, i) => {
            (this as any)[i] = t;
          });
        }

        get length() {
          return this.tracks.length;
        }

        [Symbol.iterator]() {
          return this.tracks[Symbol.iterator]();
        }

        findIndex(pred: any) {
          return this.tracks.findIndex(pred);
        }

        map(fn: any) {
          return this.tracks.map(fn);
        }
      }

      const aList = new AudioTrackList(tracks);
      (el as any).audioTracks = aList;

      aList.addEventListener('change', () => {
        const media = videoRef.current || containerRef.current?.querySelector('video');
        const wasPlaying = media ? !media.paused : false;
        const prevTime = media ? media.currentTime : 0;

        const audioOnlyTrack = tracks.find((t) => t.id === 'audio-only');
        const isAudio = Boolean(audioOnlyTrack?.enabled);
        setIsAudioOnly(isAudio);

        if (media) {
          media.currentTime = prevTime;
          if (wasPlaying && media.paused) {
            media.play().catch(() => {});
          }
        }
      });
    }

    // 3. textTracks change listener
    if (el.textTracks) {
      el.textTracks.addEventListener('change', syncTracks);
      syncTracks();
    }

    // Signal loadstart so @videojs/core features discover and bind to videoRenditions and audioTracks
    el.dispatchEvent(new Event('loadstart'));

    return () => {
      if (el.textTracks) {
        el.textTracks.removeEventListener('change', syncTracks);
      }
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, [handleQualityChange, syncTracks]);

  if (isLocked) {
    return (
      <LearningAccessGuard
        courseId={courseId}
        courseTitle={courseTitle}
        chapterTitle={chapterTitle}
        price={price}
        isFree={isFree}
      />
    );
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (initialPositionSec > 0 && e.currentTarget.currentTime < 1) {
      e.currentTarget.currentTime = initialPositionSec;
    }
    syncTracks();
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const current = video.currentTime;
    const dur = video.duration || durationSeconds;
    if (dur > 0 && onProgressSync) {
      const pct = Math.min(100, Math.round((current / dur) * 100));
      onProgressSync(chapterId, pct, Math.floor(current));
    }

    // Sync active subtitle text
    if (cues && cues.length > 0) {
      const activeCue = cues.find((c) => current >= c.start && current <= c.end);
      setActiveSubtitleText(activeCue ? activeCue.text.fa : '');
    }
  };

  const handleEnded = () => {
    if (onChapterComplete) {
      onChapterComplete();
    }
  };

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className="vjs-ltr-wrapper relative w-full overflow-hidden rounded-xl bg-black aspect-video select-none"
    >
      {/* 1. Sleek Top Glassmorphic Notification Pill */}
      {qualityNotice && (
        <div
          id="player-quality-notice"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2"
        >
          <div
            dir="rtl"
            className="bg-black/85 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full border border-white/15 shadow-xl font-dana flex items-center gap-2"
            style={{ fontFamily: 'var(--font-dana), Dana, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C58B43]" />
            <span>{qualityNotice}</span>
          </div>
        </div>
      )}

      {/* 2. Audio Mode Overlay: top title, empty center for big Play button, bottom waveform */}
      {isAudioOnly && (
        <div
          id="audio-mode-overlay"
          className="absolute inset-0 z-10 flex flex-col justify-between p-6 pb-20 bg-[#0C0D0E]/95 text-white pointer-events-none select-none transition-opacity duration-300"
        >
          {/* Top Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 text-start">
              <div className="text-sm sm:text-base font-bold text-white font-dana">{chapterTitle}</div>
              <div className="text-xs text-zinc-400 font-dana">{instructorName}</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/90 font-dana border border-white/15">
              <Headphones className="w-3.5 h-3.5 text-[#C58B43]" />
              <span>پخش صوتی بهینه</span>
            </div>
          </div>

          {/* Center: COMPLETELY EMPTY so large play button in center is unobstructed */}
          <div className="flex-1" />

          {/* Bottom subtle waveform */}
          <div className="flex items-center justify-center gap-1.5 opacity-60">
            {[4, 8, 14, 20, 12, 18, 24, 16, 10, 6, 12, 20, 14, 8, 4].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-[#C58B43] rounded-full"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Custom Dana-Font Subtitle Overlay Pill */}
      {isCaptionsEnabled && Boolean(activeSubtitleText) && !isAudioOnly && (
        <div
          id="custom-subtitle-overlay"
          className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none z-20 px-4 animate-in fade-in-0 duration-150"
        >
          <div
            dir="rtl"
            className="bg-black/85 backdrop-blur-md text-white px-4 py-1.5 rounded-lg text-sm md:text-base font-medium shadow-lg font-dana text-center max-w-xl transition-all duration-150 border border-white/15"
            style={{ fontFamily: 'var(--font-dana), Dana, sans-serif' }}
          >
            {activeSubtitleText}
          </div>
        </div>
      )}

      {/* 4. Official VideoSkin Video Player */}
      <VideoPlayer {...({ dir: 'ltr' } as any)} poster={poster}>
        <VideoSkin {...({ dir: 'ltr' } as any)} className="w-full aspect-video">
          <Video
            ref={videoRef}
            crossOrigin="anonymous"
            playsInline
            src={baseSrc}
            className={`w-full h-full object-contain ${isAudioOnly ? 'opacity-0' : 'opacity-100'}`}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          >
            {vttDataUri && (
              <>
                <track
                  kind="captions"
                  srcLang="fa"
                  label="فارسی"
                  default
                  src={vttDataUri}
                />
                <track
                  kind="subtitles"
                  srcLang="fa-academic"
                  label="فارسی (تقریر کامل)"
                  src={vttDataUri}
                />
              </>
            )}
          </Video>
        </VideoSkin>
      </VideoPlayer>
    </div>
  );
}

export default AudioVideoPlayerEngine;
