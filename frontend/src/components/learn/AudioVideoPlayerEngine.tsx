'use client';

import React from 'react';
import CourseVideoPlayer from '@/components/CourseVideoPlayer';
import { LearningAccessGuard } from './LearningAccessGuard';
import { SCHOLAR_NAME } from '@/lib/constants';

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
  instructorName = SCHOLAR_NAME,
  durationSeconds = 1200,
  videoUrl,
  audioUrl,
  poster = '/images/ostad_zanjirzan.jpg',
  initialPositionSec = 0,
  isLocked = false,
  isCompleted = false,
  price = 0,
  isFree = false,
  onToggleComplete,
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

  const activeSrc = videoUrl || audioUrl || '/videos/sample_lecture.mp4';

  return (
    <CourseVideoPlayer
      src={activeSrc}
      poster={poster}
      title={chapterTitle}
      instructor={instructorName}
      vttUrl="/videos/captions-fa.vtt"
      watermarkText={instructorName}
      onTimeUpdate={(currentTime) => {
        if (onProgressSync && durationSeconds > 0) {
          const pct = Math.min(100, Math.round((currentTime / durationSeconds) * 100));
          onProgressSync(chapterId, pct, Math.floor(currentTime));
        }
      }}
      onEnded={onChapterComplete}
    />
  );
}

export default AudioVideoPlayerEngine;
