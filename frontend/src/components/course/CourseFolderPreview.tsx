'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderArchive,
  FolderOpen,
  FileText,
  ExternalLink,
  X,
  Send,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioCourse } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedCourse } from '@/lib/localization';

interface CourseFolderPreviewProps {
  course: AudioCourse;
  className?: string;
}

const FOLDER_SPRING = {
  type: 'spring' as const,
  stiffness: 440,
  damping: 32,
  mass: 0.65,
};

export function CourseFolderPreview({ course, className = '' }: CourseFolderPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentLang, dict, toLocale, localizeHref } = useLanguage();

  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const sessionsCount = course.episodes_count || course.chapters?.length || 12;

  const driveUrl =
    course.cloudStreamUrl ||
    (course.driveFolderId
      ? `https://drive.google.com/drive/folders/${course.driveFolderId}`
      : 'https://drive.google.com/drive/folders/1sUP_2GUpJsDLK1dRkXw4Vu065y9bza30?usp=sharing');

  const telegramUrl = course.telegramUrl || 'https://t.me/AlNajmosageb313';

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const tooltipText = dict.course_folder_tooltip;
  const folderTitle = dict.course_folder_title;
  const handoutsTitle = dict.course_folder_handouts;
  const handoutsDesc = dict.course_folder_handouts_desc;
  const driveArchiveTitle = dict.course_folder_drive_archive;
  const driveArchiveDesc = dict.course_folder_drive_desc;
  const telegramArchiveTitle = dict.course_folder_telegram_archive;
  const closeText = dict.course_folder_close;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Folder Trigger Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title={tooltipText}
        aria-label={tooltipText}
        aria-expanded={isOpen}
        className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
          isOpen
            ? 'border-[#8A532B] bg-[#8A532B]/15 text-[#8A532B] dark:border-[#C58B43] dark:text-[#C58B43]'
            : 'border-[#E6E1D8] bg-white text-zinc-600 hover:border-[#8A532B] hover:text-[#8A532B] dark:border-[#262830] dark:bg-[#18191D] dark:text-zinc-300 dark:hover:border-[#C58B43] dark:hover:text-[#C58B43]'
        }`}
      >
        {isOpen ? (
          <FolderOpen className="h-4 w-4" />
        ) : (
          <FolderArchive className="h-4 w-4" />
        )}
      </motion.button>

      {/* Popover Preview Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="folder-popover"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={FOLDER_SPRING}
            className="absolute bottom-full mb-2 start-0 z-50 w-72 sm:w-80 rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] p-4 text-start shadow-[0_16px_36px_-12px_rgba(0,0,0,0.22)] dark:border-[#262830] dark:bg-[#121316]"
          >
            {/* Top Folder Tab Aesthetic */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E6E1D8] dark:border-[#22242A]">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
                  <FolderArchive className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="block text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43]">
                    [ ARCHIVE & HANDOUTS ]
                  </span>
                  <h4 className="text-xs font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
                    {folderTitle}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:bg-black/5 hover:text-zinc-800 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                aria-label={closeText}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Course Title Preview */}
            <p className="line-clamp-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
              {title}
            </p>

            {/* Items List */}
            <div className="space-y-2">
              {/* 1. PDF Handouts & Syllabus */}
              <Link
                href={localizeHref(`/courses/${course.id}#syllabus`)}
                onClick={() => setIsOpen(false)}
                className="group flex items-start gap-2.5 rounded-xl border border-[#ECE8E0] bg-white/80 p-2.5 transition-colors hover:border-[#8A532B]/60 dark:border-[#202228] dark:bg-[#18191D] dark:hover:border-[#C58B43]/60"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-zinc-900 group-hover:text-[#8A532B] dark:text-zinc-100 dark:group-hover:text-[#C58B43]">
                      {handoutsTitle}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-num">
                      <BookOpen className="h-3 w-3" />
                      {toLocale(sessionsCount)} {dict.course_unit_sessions}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {handoutsDesc}
                  </p>
                </div>
              </Link>

              {/* 2. Google Drive Audio Archive Link */}
              <a
                href={driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="group flex items-start gap-2.5 rounded-xl border border-[#ECE8E0] bg-white/80 p-2.5 transition-colors hover:border-[#8A532B]/60 dark:border-[#202228] dark:bg-[#18191D] dark:hover:border-[#C58B43]/60"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-zinc-900 group-hover:text-[#8A532B] dark:text-zinc-100 dark:group-hover:text-[#C58B43]">
                      {driveArchiveTitle}
                    </span>
                    <CheckCircle2 className="h-3 w-3 text-[#8A532B] dark:text-[#C58B43]" />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {driveArchiveDesc}
                  </p>
                </div>
              </a>

              {/* 3. Telegram Lesson Posts Archive */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="group flex items-start gap-2.5 rounded-xl border border-[#ECE8E0] bg-white/80 p-2.5 transition-colors hover:border-[#8A532B]/60 dark:border-[#202228] dark:bg-[#18191D] dark:hover:border-[#C58B43]/60"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
                  <Send className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-zinc-900 group-hover:text-[#8A532B] dark:text-zinc-100 dark:group-hover:text-[#C58B43]">
                    {telegramArchiveTitle}
                  </span>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    @AlNajmosageb313
                  </p>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
