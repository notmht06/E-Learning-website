'use client';

import React from 'react';
import { Video, VideoPlayer, VideoSkin } from '@videojs/react/video';
import '@videojs/react/video/skin.css';
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

export function AudioVideoPlayerEngine({
  courseId = 'course-falsafe-asfar-1',
  chapterId = 1,
  courseTitle,
  chapterTitle,
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

  const isDirectVideo =
    Boolean(videoUrl) &&
    !videoUrl?.includes('youtube.com') &&
    !videoUrl?.includes('youtu.be') &&
    /\.(mp4|webm|m3u8|ogg|mov)(\?.*)?$/i.test(videoUrl || '');

  const resolvedSrc = isDirectVideo
    ? (videoUrl as string)
    : '/videos/sample_lecture.mp4';

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
    <div dir="ltr" className="w-full overflow-hidden rounded-xl bg-black">
      <VideoPlayer poster={poster}>
        <VideoSkin className="w-full aspect-video">
          <Video
            crossOrigin="anonymous"
            playsInline
            src={resolvedSrc}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        </VideoSkin>
      </VideoPlayer>
    </div>
  );
}

export default AudioVideoPlayerEngine;
