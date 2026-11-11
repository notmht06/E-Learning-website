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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  // Direct video URL resolver
  const isDirectVideo =
    Boolean(videoUrl) &&
    !videoUrl?.includes('youtube.com') &&
    !videoUrl?.includes('youtu.be') &&
    /\.(mp4|webm|m3u8|ogg|mov)(\?.*)?$/i.test(videoUrl || '');

  const baseSrc = isDirectVideo ? (videoUrl as string) : '/videos/sample_lecture.mp4';
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>(baseSrc);

  // Update baseSrc if props change
  useEffect(() => {
    setCurrentVideoSrc(baseSrc);
  }, [baseSrc]);

  // Generate WebVTT captions Data URI
  const vttBlobUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    try {
      const cues = getCourseSubtitles(courseId || 'course-asfar', chapterId || 1, durationSeconds);
      const vtt = generateWebVTT(cues);
      return `data:text/vtt;charset=utf-8,${encodeURIComponent(vtt)}`;
    } catch {
      return '';
    }
  }, [courseId, chapterId, durationSeconds]);

  // Switch video stream quality preserving currentTime and playback state
  const handleQualityChange = useCallback(
    (newQuality: string) => {
      const el = videoRef.current;
      if (!el) return;

      const prevTime = el.currentTime;
      const wasPlaying = !el.paused;

      let nextSrc = baseSrc;
      if (newQuality !== 'auto') {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
        nextSrc = `${apiBase}/stream/video-quality?src=${encodeURIComponent(baseSrc)}&quality=${newQuality}`;
      }

      setCurrentVideoSrc(nextSrc);

      const onCanPlay = () => {
        el.currentTime = prevTime;
        if (wasPlaying) {
          el.play().catch(console.debug);
        }
        el.removeEventListener('canplay', onCanPlay);
      };
      el.addEventListener('canplay', onCanPlay, { once: true });
    },
    [baseSrc]
  );

  // Attach Video.js videoRenditions and audioTracks polyfill to media element
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // 1. videoRenditions (Auto, 1080p, 720p, 480p, 360p)
    if (!(el as any).videoRenditions) {
      const renditions = [
        { id: '1080p', width: 1920, height: 1080, bitrate: 4500000, selected: false },
        { id: '720p', width: 1280, height: 720, bitrate: 2500000, selected: false },
        { id: '480p', width: 854, height: 480, bitrate: 1200000, selected: false },
        { id: '360p', width: 640, height: 360, bitrate: 600000, selected: false },
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
        { id: 'video-audio', label: 'ویدیو و صوت (استاندارد)', kind: 'main', language: 'fa', enabled: true },
        { id: 'audio-only', label: 'فقط صوت (مصرف بهینه)', kind: 'alternative', language: 'fa', enabled: false },
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
        setIsAudioOnly(Boolean(audioOnlyTrack?.enabled));
      });
    }

    // Signal loadstart so @videojs/core features discover and bind to videoRenditions and audioTracks
    el.dispatchEvent(new Event('loadstart'));
  }, [handleQualityChange]);

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
      dir="ltr"
      className="vjs-ltr-wrapper relative w-full overflow-hidden rounded-xl bg-black aspect-video select-none"
    >
      {/* Audio Mode Overlay: shown inside frame when Audio Only is selected, with pointer-events-none so controls work */}
      {isAudioOnly && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#0C0D0E]/95 text-white pointer-events-none select-none transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-lg">
              <Headphones className="w-8 h-8 text-white/90" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-white/90 font-dana">{chapterTitle}</div>
              <div className="text-xs text-white/60 font-dana">{instructorName}</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/80 font-dana border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C58B43]" />
              <span>پخش صوتی بهینه • صرفه‌جویی در مصرف اینترنت</span>
            </div>
          </div>
        </div>
      )}

      <VideoPlayer {...({ dir: 'ltr' } as any)} poster={poster}>
        <VideoSkin {...({ dir: 'ltr' } as any)} className="w-full aspect-video">
          <Video
            ref={videoRef}
            crossOrigin="anonymous"
            playsInline
            src={currentVideoSrc}
            className={`w-full h-full object-contain ${isAudioOnly ? 'opacity-0' : 'opacity-100'}`}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          >
            {vttBlobUrl && (
              <>
                <track
                  kind="captions"
                  srcLang="fa"
                  label="فارسی"
                  default
                  src={vttBlobUrl}
                />
                <track
                  kind="subtitles"
                  srcLang="fa-academic"
                  label="فارسی (تقریر کامل)"
                  src={vttBlobUrl}
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
