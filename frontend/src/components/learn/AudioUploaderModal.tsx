'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileAudio,
  FileVideo,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  X,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface AudioUploaderModalProps {
  isOpen: boolean;
  courseTitle: string;
  onClose: () => void;
  onUploadSuccess: (chapterData: {
    title_fa: string;
    duration: string;
    isFreePreview: boolean;
    audioUrl: string;
    videoUrl?: string;
    media_type?: 'audio' | 'video';
  }) => void;
}

export const AudioUploaderModal: React.FC<AudioUploaderModalProps> = ({
  isOpen,
  courseTitle,
  onClose,
  onUploadSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('۴۵:۰۰');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [mediaKind, setMediaKind] = useState<'video' | 'audio'>('video');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [directUrl, setDirectUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formatDurationSeconds = (secs: number): string => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '۴۵:۰۰';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setSelectedFile(file);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isVideo = ['mp4', 'webm', 'mkv', 'mov'].includes(ext) || file.type.startsWith('video/');
    setMediaKind(isVideo ? 'video' : 'audio');

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    // Automatically read real duration of the selected video/audio file
    try {
      const objectUrl = URL.createObjectURL(file);
      const mediaEl = document.createElement(isVideo ? 'video' : 'audio');
      mediaEl.preload = 'metadata';
      mediaEl.onloadedmetadata = () => {
        if (mediaEl.duration && isFinite(mediaEl.duration)) {
          setDuration(formatDurationSeconds(mediaEl.duration));
        }
        URL.revokeObjectURL(objectUrl);
      };
      mediaEl.src = objectUrl;
    } catch {}
  };

  const handleUploadAndSave = async () => {
    if (!title.trim()) {
      setErrorMsg('لطفاً عنوان جلسه را وارد فرمایید.');
      return;
    }
    setErrorMsg(null);
    setIsUploading(true);

    try {
      let uploadedUrl = directUrl.trim();

      if (selectedFile) {
        const res = await apiClient.admin.uploadMedia(selectedFile);
        uploadedUrl = res.file_url;
      }

      if (!uploadedUrl) {
        uploadedUrl = '/audio/sample_lecture.wav';
      }

      const isVideoUrl =
        mediaKind === 'video' ||
        uploadedUrl.endsWith('.mp4') ||
        uploadedUrl.endsWith('.webm') ||
        uploadedUrl.endsWith('.mkv');

      onUploadSuccess({
        title_fa: title.trim(),
        duration: duration || '۴۵:۰۰',
        isFreePreview,
        audioUrl: isVideoUrl ? '/audio/sample_lecture.wav' : uploadedUrl,
        videoUrl: isVideoUrl ? uploadedUrl : undefined,
        media_type: isVideoUrl ? 'video' : 'audio',
      });

      setSelectedFile(null);
      setTitle('');
      setDirectUrl('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطا در آپلود فایل در سرور. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto text-start">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] block">
              استودیو آپلود واقعی ویدیو و صوت جلسات
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
              افزودن جلسه به: {courseTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Media Type Selector: Video vs Audio */}
          <div>
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1.5">
              نوع فایل جلسه (ویدیو یا صوت):
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMediaKind('video')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition ${
                  mediaKind === 'video'
                    ? 'bg-[#8A532B] text-white border-[#8A532B]'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <FileVideo className="w-4 h-4" />
                <span>ویدیوی جلسه (MP4 / WebM)</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaKind('audio')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition ${
                  mediaKind === 'audio'
                    ? 'bg-[#8A532B] text-white border-[#8A532B]'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <FileAudio className="w-4 h-4" />
                <span>فایل صوتی (MP3 / WAV)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1.5">
              عنوان جلسه درسی:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: جلسه اول - تعریف موضوع فلسفه و اصالت وجود"
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold focus:outline-none focus:border-[#8A532B] text-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1.5">
                مدت زمان جلسه (تشخیص خودکار):
              </label>
              <div className="relative flex items-center">
                <Clock className="w-4 h-4 text-zinc-400 absolute end-3 pointer-events-none" />
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full pe-9 ps-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold font-num text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1.5">
                سطح دسترسی جلسه:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFreePreview(false)}
                  className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    !isFreePreview
                      ? 'bg-[#8A532B]/15 border-[#8A532B] text-[#8A532B] dark:text-[#C58B43]'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>مخصوص ثبتنامکنندگان</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFreePreview(true)}
                  className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    isFreePreview
                      ? 'bg-[#8A532B]/15 border-[#8A532B] text-[#8A532B] dark:text-[#C58B43]'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>پیشنمایش رایگان</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real File Picker for Video & Audio */}
          <div>
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1.5">
              انتخاب فایل ویدیویی (MP4/WebM) یا صوتی (MP3/WAV) از کامپیوتر:
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="video/mp4,video/webm,video/x-matroska,audio/mpeg,audio/wav,audio/mp4,audio/ogg,.mp4,.webm,.mkv,.mp3,.wav,.m4a"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#8A532B] rounded-3xl p-6 text-center cursor-pointer transition bg-zinc-50/70 dark:bg-zinc-900/50 space-y-2"
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  {mediaKind === 'video' ? (
                    <FileVideo className="w-8 h-8 text-[#8A532B]" />
                  ) : (
                    <FileAudio className="w-8 h-8 text-[#8A532B]" />
                  )}
                  <div className="text-start">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-num">
                      حجم فایل: {(selectedFile.size / (1024 * 1024)).toFixed(2)} مگابایت • آماده آپلود واقعی در سرور
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-[#8A532B] mx-auto" />
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      کلیک کنید و فایل ویدیو (.mp4) یا صوت (.mp3/.wav) را انتخاب نمایید
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      فایل مستقیماً در سرور آپلود و به جلسه متصل میشود
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Optional Direct Stream Link */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 block mb-1">
              یا وارد کردن لینک مستقیم ویدیو/صوت (اختیاری - در صورت میزبانی روی CDN یا کلود):
            </label>
            <input
              type="text"
              dir="ltr"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://example.com/lectures/session1.mp4"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleUploadAndSave}
            disabled={!title.trim() || isUploading}
            className="px-6 py-2.5 rounded-full bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>در حال آپلود فایل در سرور...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>آپلود و ذخیره جلسه در دیتابیس</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
