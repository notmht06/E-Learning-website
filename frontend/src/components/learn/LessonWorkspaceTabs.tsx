'use client';

import React, { useState } from 'react';
import { FileText, Download, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';
import { LessonNotesTab } from './LessonNotesTab';
import { LessonAttachmentsTab } from './LessonAttachmentsTab';
import { LessonAiQnATab } from './LessonAiQnATab';

export interface LessonWorkspaceTabsProps {
  courseId: string;
  chapterId: number;
  courseTitle: string;
  chapterTitle: string;
}

export type WorkspaceTabKey = 'notes' | 'attachments' | 'ai';

export function LessonWorkspaceTabs({
  courseId,
  chapterId,
  courseTitle,
  chapterTitle,
}: LessonWorkspaceTabsProps) {
  const { dict, currentLang } = useLanguage();
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>('notes');

  const tabs: Array<{ key: WorkspaceTabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    {
      key: 'notes',
      label: dict.learn_tab_transcripts || 'تقریرات و یادداشت‌ها',
      icon: FileText,
    },
    {
      key: 'attachments',
      label: dict.learn_tab_attachments || 'فایل‌های پیوست و دانلود',
      icon: Download,
    },
    {
      key: 'ai',
      label:
        currentLang === 'en'
          ? 'AI Course Tutor'
          : currentLang === 'ar'
          ? 'المساعد الذكي للدورة'
          : (dict.learn_tab_ai_discourse || 'حکمتیار این دوره (AI)'),
      icon: Sparkles,
    },
  ];

  const handleSelectTab = (key: WorkspaceTabKey) => {
    triggerTactileHaptic('tick');
    setActiveTab(key);
  };

  return (
    <div className="space-y-4">
      {/* Segmented Tab Navigation Bar */}
      <nav
        aria-label="منوی بخش‌های آموزشی جلسه"
        className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] shadow-xs overflow-x-auto select-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleSelectTab(tab.key)}
              className={`flex-1 min-w-[120px] sm:min-w-0 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#8A532B] text-[#FAF8F5] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E6CA85]' : 'text-zinc-400'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Panels with Smooth Hardware-Accelerated Fade */}
      <div className="min-h-[300px]">
        {activeTab === 'notes' && (
          <div key="tab-panel-notes" className="animate-tab-fade">
            <LessonNotesTab
              courseId={courseId}
              chapterId={chapterId}
              courseTitle={courseTitle}
              chapterTitle={chapterTitle}
            />
          </div>
        )}

        {activeTab === 'attachments' && (
          <div key="tab-panel-attachments" className="animate-tab-fade">
            <LessonAttachmentsTab
              courseId={courseId}
              chapterId={chapterId}
              courseTitle={courseTitle}
              chapterTitle={chapterTitle}
            />
          </div>
        )}

        {activeTab === 'ai' && (
          <div key="tab-panel-ai" className="animate-tab-fade">
            <LessonAiQnATab
              courseId={courseId}
              chapterId={chapterId}
              courseTitle={courseTitle}
              chapterTitle={chapterTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
