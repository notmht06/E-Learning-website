'use client';

import React, { useState } from 'react';
import { Download, FileText, Music, Network, ShieldCheck, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

export interface LessonAttachmentsTabProps {
  courseId: string;
  chapterId: number;
  courseTitle: string;
  chapterTitle: string;
}

export function LessonAttachmentsTab({
  courseId,
  chapterId,
  courseTitle,
  chapterTitle,
}: LessonAttachmentsTabProps) {
  const { toLocale, dict, currentLang } = useLanguage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const attachments = [
    {
      id: 'audio-master',
      title: dict.learn_attachment_audio_master,
      desc:
        dict.ui_high_fidelity_audio_stream_remastered_,
      meta: dict.ui_45_mb_mp3_320kbps,
      icon: Music,
      url: '/audio/sample_lecture.wav',
    },
    {
      id: 'pdf-handout',
      title: dict.learn_attachment_pdf_handout,
      desc:
        dict.ui_comprehensive_textual_monograph_includ,
      meta: dict.ui_18_pages_pdf_3_4_mb,
      icon: FileText,
      url: '#',
    },
    {
      id: 'concept-map',
      title: dict.learn_attachment_concept_map,
      desc:
        dict.ui_dialectical_ast_concept_graph_detailin,
      meta: dict.ui_a3_sheet_vector_svg,
      icon: Network,
      url: '#',
    },
  ];

  const handleDownload = (item: typeof attachments[0]) => {
    triggerTactileHaptic('thump');
    setDownloadingId(item.id);
    setTimeout(() => {
      setDownloadingId(null);
      if (item.url && item.url !== '#') {
        const link = document.createElement('a');
        link.href = item.url;
        link.download = `${item.id}-${chapterId}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, 900);
  };

  return (
    <div className="space-y-4 text-start">
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] space-y-4 shadow-xs">
        <header className="border-b border-[#E6E1D8] dark:border-[#22242A] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
            <Download className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <span>{dict.learn_tab_attachments}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C58B43]" />
            <span>DRM-VERIFIED</span>
          </div>
        </header>

        <div className="space-y-3">
          {attachments.map((item) => {
            const Icon = item.icon;
            const isDownloading = downloadingId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] flex items-center justify-center text-[#8A532B] dark:text-[#C58B43] shrink-0">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-zinc-500 max-w-xl leading-relaxed">
                      {item.desc}
                    </p>
                    <span className="text-[11px] font-mono text-[#C58B43] block pt-0.5">
                      {item.meta}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  disabled={isDownloading}
                  className="px-4 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-center shadow-xs"
                >
                  {isDownloading ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{dict.ui_downloaded}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>{dict.learn_attachment_dl_btn}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
