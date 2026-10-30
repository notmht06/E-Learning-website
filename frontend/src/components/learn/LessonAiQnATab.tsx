'use client';

import React from 'react';
import { CourseScopedAITutor } from './CourseScopedAITutor';
import { usePlayer } from '@/context/PlayerContext';

export interface LessonAiQnATabProps {
  courseId: string;
  chapterId: number;
  courseTitle: string;
  chapterTitle: string;
  subject?: string;
}

export function LessonAiQnATab({
  courseId,
  chapterId,
  courseTitle,
  chapterTitle,
  subject,
}: LessonAiQnATabProps) {
  const { seek } = usePlayer();

  return (
    <CourseScopedAITutor
      courseId={courseId}
      courseTitle={courseTitle}
      chapterId={chapterId}
      chapterTitle={chapterTitle}
      subject={subject}
      onSeekToSecond={(sec) => {
        try {
          seek(sec);
        } catch (err) {
          console.warn('Seek to timestamp failed:', err);
        }
      }}
    />
  );
}
