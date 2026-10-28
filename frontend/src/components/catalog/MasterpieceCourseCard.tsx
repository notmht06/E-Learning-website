'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Headphones,
  Play,
  Pause,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayer } from '@/context/PlayerContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { triggerTactileHaptic } from '@/lib/haptics';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from '@/components/ui';

export const EDITORIAL_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

interface MasterpieceCourseCardProps {
  course: AudioCourse;
  index: number;
}

export function MasterpieceCourseCard({ course, index }: MasterpieceCourseCardProps) {
  const { currentLang, toLocale, dict } = useLanguage();
  const { playTrack, togglePlay, currentCourse, isPlaying } = usePlayer();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const subject = loc?.subject || course.subject;
  const duration = loc?.duration || course.duration_fa;
  const level = loc?.level || course.level_fa || (currentLang === 'en' ? 'Advanced Seminary Level' : 'سطح عالی و خارج');
  const price =
    loc?.price ||
    course.price_fa ||
    (currentLang === 'en' ? 'Free Endowment' : currentLang === 'ar' ? 'وقف علمي مجاني' : 'رایگان (وقف عام)');

  const isOnline = course.course_type === 'online';
  const sessionsCount = course.episodes_count || course.chapters?.length || 12;
  const isThisCoursePlaying = currentCourse?.id === course.id && isPlaying;
  const bookmarked = isBookmarked(course.id);

  const firstChapter = course.chapters?.[0];
  const firstChapterTitle =
    loc?.chapters?.[0]?.title ||
    firstChapter?.title_fa ||
    (currentLang === 'en' ? 'Session 1: Introductory Outline' : currentLang === 'ar' ? 'الجلسة الأولى: مدخل البحث' : 'جلسه اول: مدخل بحث');

  const serialCode = `CRS-${String(index + 1).padStart(2, '0')}`;

  const handleAuditionToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('thump');
    if (currentCourse?.id === course.id) {
      togglePlay();
    } else {
      playTrack(course, 0);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('ribbon');
    toggleBookmark(course.id);
  };

  return (
    <Card
      className={`flex flex-col justify-between transition-all duration-200 hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 ${
        isThisCoursePlaying
          ? 'border-[#8A532B] dark:border-[#C58B43] ring-1 ring-[#8A532B]/20 dark:ring-[#C58B43]/20 shadow-md'
          : ''
      }`}
    >
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="accent" className="text-[11px]">
              {subject}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono text-zinc-500">
              [{serialCode}]
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmarkClick}
            aria-label={dict.action_bookmark || 'نشان‌کردن'}
            className="h-7 w-7 text-zinc-400 hover:text-[#8A532B] dark:hover:text-[#C58B43]"
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-[#8A532B] text-[#8A532B] dark:fill-[#C58B43] dark:text-[#C58B43]' : ''}`} />
          </Button>
        </div>

        <Link href={`/courses/${course.id}`} className="group/title block">
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover/title:text-[#8A532B] dark:group-hover/title:text-[#C58B43] transition-colors line-clamp-2 leading-snug">
            {title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Sample Audio Mini Player Button */}
        <button
          type="button"
          onClick={handleAuditionToggle}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 hover:border-[#8A532B]/40 text-start group/audition cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-[#8A532B] text-white flex items-center justify-center shrink-0">
              {isThisCoursePlaying ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-[#8A532B] dark:text-[#C58B43] block">
                {isThisCoursePlaying ? (dict.player_playing || 'در حال پخش') : (dict.player_play_sample || 'شنیدن درس نمونه')}
              </span>
              <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate block font-medium">
                {firstChapterTitle}
              </span>
            </div>
          </div>
        </button>

        {/* Course Metrics */}
        <div className="grid grid-cols-3 gap-2 py-1 text-center font-num text-xs border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
          <div>
            <span className="text-[10px] text-zinc-400 block">{dict.course_sessions || 'جلسات'}</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{toLocale(sessionsCount)}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block">{dict.course_duration || 'مدت زمان'}</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{duration}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block">{dict.course_tuition || 'شهریه'}</span>
            <span className="font-bold text-[#8A532B] dark:text-[#C58B43]">{price}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full text-xs font-bold hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] dark:hover:text-[#0C0D0E] transition-all group/btn"
        >
          <Link href={`/courses/${course.id}`}>
            <span>{dict.courses_enter_hall || 'ورود به کرسی درس'}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/btn:-translate-x-1 ltr:group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
