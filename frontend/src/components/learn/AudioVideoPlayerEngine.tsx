'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Video, VideoPlayer, VideoSkin } from '@videojs/react/video';
import { HlsVideo } from '@videojs/react/media/hls-video';
import { I18nProvider } from '@videojs/react/i18n';
import faLocale from '@videojs/core/i18n/locales/fa';
import '@videojs/react/video/skin.css';
import { Headphones, Video as VideoIcon } from 'lucide-react';
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

// Resolution map for real multi-quality files without CSS blur
const REAL_QUALITY_SOURCES: Record<string, string> = {
  auto: '/videos/sample_lecture.mp4',
  '1080p': '/videos/sample_lecture_1080p.mp4',
  '720p': '/videos/sample_lecture_720p.mp4',
  '480p': '/videos/sample_lecture_480p.mp4',
  '360p': '/videos/sample_lecture_360p.mp4',
};

// Official Video.js Persian Translations
const FA_TRANSLATIONS = {
  ...faLocale,
  menu: {
    ...faLocale.menu,
    quality: 'کیفیت',
    speed: 'سرعت پخش',
    captions: 'زیرنویس',
    audio: 'حالت پخش',
    off: 'خاموش',
    auto: 'خودکار',
  },
};

function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

// Generate WebVTT with explicit RTL markers to prevent reversed punctuation in Chromium
function generateWebVTT(cues: SubtitleCue[]): string {
  let vtt = 'WEBVTT - درس‌گفتار استاد\n\n';
  vtt += 'STYLE\n';
  vtt += '::cue {\n';
  vtt += '  direction: rtl;\n';
  vtt += '  unicode-bidi: plaintext;\n';
  vtt += '  font-family: Dana, Tahoma, sans-serif;\n';
  vtt += '  background-color: rgba(15, 23, 42, 0.85);\n';
  vtt += '  color: #ffffff;\n';
  vtt += '  font-size: 1rem;\n';
  vtt += '  line-height: 1.6;\n';
  vtt += '  border-radius: 8px;\n';
  vtt += '}\n\n';

  cues.forEach((cue) => {
    vtt += `${cue.id}\n`;
    vtt += `${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}\n`;
    // Wrap with RLE (\u202B) and PDF (\u202C) for flawless bidirectional punctuation
    vtt += `\u202B${cue.text.fa}\u202C\n\n`;
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
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [qualityNotice, setQualityNotice] = useState<string | null>(null);

  // Check if source is an HLS multi-rendition stream (.m3u8)
  const isHls = useMemo(() => {
    return Boolean(videoUrl && videoUrl.toLowerCase().includes('.m3u8'));
  }, [videoUrl]);

  // Determine active video source based on quality or fallback
  const isDirectVideo =
    Boolean(videoUrl) &&
    !videoUrl?.includes('youtube.com') &&
    !videoUrl?.includes('youtu.be') &&
    /\.(mp4|webm|m3u8|ogg|mov)(\?.*)?$/i.test(videoUrl || '');

  const activeSrc = useMemo(() => {
    if (isHls) return videoUrl as string;
    if (isDirectVideo && videoUrl) return videoUrl;
    return REAL_QUALITY_SOURCES[selectedQuality.toLowerCase()] || REAL_QUALITY_SOURCES.auto;
  }, [isHls, isDirectVideo, videoUrl, selectedQuality]);

  // Subtitle Cues
  const cues = useMemo(() => {
    try {
      return getCourseSubtitles(courseId || 'course-asfar', chapterId || 1, durationSeconds);
    } catch {
      return [];
    }
  }, [courseId, chapterId, durationSeconds]);

  // Generate WebVTT Data URI
  const vttDataUri = useMemo(() => {
    if (typeof window === 'undefined' || cues.length === 0) return '';
    try {
      const vtt = generateWebVTT(cues);
      return `data:text/vtt;charset=utf-8,${encodeURIComponent(vtt)}`;
    } catch {
      return '';
    }
  }, [cues]);

  // Quality switch handler: switches real video source without resetting currentTime or pausing
  const handleQualityChange = useCallback((newQuality: string) => {
    const el = videoRef.current || containerRef.current?.querySelector('video');
    const prevTime = el ? el.currentTime : 0;
    const wasPlaying = el ? !el.paused : false;

    setSelectedQuality(newQuality);

    const label = newQuality === 'auto' ? 'کیفیت خودکار (Auto 1080p)' : `کیفیت ${newQuality}`;
    setQualityNotice(label);

    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setQualityNotice(null);
    }, 2500);

    // If changing source element, restore position
    if (el) {
      const handleRestored = () => {
        if (prevTime > 0) {
          el.currentTime = prevTime;
        }
        if (wasPlaying && el.paused) {
          el.play().catch(() => {});
        }
        el.removeEventListener('loadedmetadata', handleRestored);
      };
      el.addEventListener('loadedmetadata', handleRestored, { once: true });
    }
  }, []);

  // Audio mode toggle handler
  const handleToggleAudioOnly = useCallback((audioOnlyState: boolean) => {
    const el = videoRef.current || containerRef.current?.querySelector('video');
    const prevTime = el ? el.currentTime : 0;
    const wasPlaying = el ? !el.paused : false;

    setIsAudioOnly(audioOnlyState);

    // Sync polyfilled audioTracks if present
    if (el && (el as any).audioTracks) {
      Array.from((el as any).audioTracks).forEach((t: any) => {
        t.enabled = audioOnlyState ? t.id === 'audio-only' : t.id === 'video-audio';
      });
    }

    if (el) {
      el.currentTime = prevTime;
      if (wasPlaying && el.paused) {
        el.play().catch(() => {});
      }
    }
  }, []);

  // Polyfill videoRenditions and audioTracks so native Video.js menus populate seamlessly
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
        { id: 'video-audio', label: 'ویدیو و صوت', kind: 'main', language: 'fa', enabled: !isAudioOnly },
        { id: 'audio-only', label: 'فقط صوت', kind: 'alternative', language: 'fa', enabled: isAudioOnly },
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
        const audioOnlyTrack = tracks.find((t) => t.id === 'audio-only');
        const isAudio = Boolean(audioOnlyTrack?.enabled);
        handleToggleAudioOnly(isAudio);
      });
    }

    // Signal loadstart so @videojs/core features discover and bind to videoRenditions and audioTracks
    el.dispatchEvent(new Event('loadstart'));

    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, [handleQualityChange, handleToggleAudioOnly, isAudioOnly]);

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
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const current = video.currentTime;
    const dur = video.duration || durationSeconds;
    if (dur > 0 && onProgressSync) {
      const pct = Math.min(100, Math.round((current / dur) * 100));
      onProgressSync(chapterId, pct, Math.floor(current));
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
      className="vjs-ltr-player vjs-ltr-wrapper relative w-full overflow-hidden rounded-xl bg-black aspect-video select-none"
    >
      {/* 1. Mode Switch Segmented Pill (Video + Audio vs Audio Only) */}
      <div className="absolute top-4 left-4 z-20 flex items-center bg-black/60 backdrop-blur-md rounded-full border border-white/15 p-0.5 text-xs font-dana">
        <button
          type="button"
          onClick={() => handleToggleAudioOnly(false)}
          className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
            !isAudioOnly
              ? 'bg-[#C58B43] text-white font-bold'
              : 'text-zinc-300 hover:text-white'
          }`}
        >
          <VideoIcon className="w-3.5 h-3.5" />
          <span>ویدیو و صوت</span>
        </button>
        <button
          type="button"
          onClick={() => handleToggleAudioOnly(true)}
          className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
            isAudioOnly
              ? 'bg-[#C58B43] text-white font-bold'
              : 'text-zinc-300 hover:text-white'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>فقط صوت</span>
        </button>
      </div>

      {/* 2. Sleek Top Glassmorphic Quality Notification Pill */}
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

      {/* 3. Audio Mode Cover Overlay (z-10 pointer-events-none, never overlaps center play button) */}
      {isAudioOnly && (
        <div
          id="audio-mode-overlay"
          className="absolute inset-0 z-10 flex flex-col justify-between p-6 pb-20 bg-[#0C0D0E]/95 text-white pointer-events-none select-none transition-opacity duration-300"
        >
          {/* Top Header */}
          <div className="flex items-start justify-between gap-4 mt-8">
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

      {/* 4. Official Video.js Video Player with I18nProvider */}
      <I18nProvider locale="fa" translations={FA_TRANSLATIONS as any}>
        <VideoPlayer {...({ dir: 'ltr' } as any)} poster={poster}>
          <VideoSkin {...({ dir: 'ltr' } as any)} className="w-full aspect-video">
            {isHls ? (
              <HlsVideo
                ref={videoRef}
                crossOrigin="anonymous"
                playsInline
                src={activeSrc}
                className={`w-full h-full object-contain ${isAudioOnly ? 'opacity-0' : 'opacity-100'}`}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
              >
                {vttDataUri && (
                  <track
                    kind="captions"
                    srcLang="fa"
                    label="فارسی"
                    default
                    src={vttDataUri}
                  />
                )}
              </HlsVideo>
            ) : (
              <Video
                ref={videoRef}
                crossOrigin="anonymous"
                playsInline
                src={activeSrc}
                className={`w-full h-full object-contain ${isAudioOnly ? 'opacity-0' : 'opacity-100'}`}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
              >
                {vttDataUri && (
                  <track
                    kind="captions"
                    srcLang="fa"
                    label="فارسی"
                    default
                    src={vttDataUri}
                  />
                )}
              </Video>
            )}
          </VideoSkin>
        </VideoPlayer>
      </I18nProvider>
    </div>
  );
}

export default AudioVideoPlayerEngine;
