'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileAudio,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  X,
  Play,
  RotateCw,
  Gift,
} from 'lucide-react';
import { toLocaleDigits } from '@/lib/data';

interface AudioUploaderModalProps {
  isOpen: boolean;
  courseTitle: string;
  onClose: () => void;
  onUploadSuccess: (chapterData: {
    title_fa: string;
    duration: string;
    isFreePreview: boolean;
    audioUrl: string;
  }) => void;
}

export const AudioUploaderModal: React.FC<AudioUploaderModalProps> = ({
  isOpen,
  courseTitle,
  onClose,
  onUploadSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('۴۲:۱۵');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mbSize = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({
        name: file.name,
        size: `${mbSize} MB`,
      });
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleStartProcessing = () => {
    if (!title) return;
    setIsProcessing(true);
    setUploadProgress(10);
    setPipelineStep(1);

    // Simulate upload & DRM pipeline stages
    const timer1 = setTimeout(() => {
      setUploadProgress(45);
      setPipelineStep(2);
    }, 700);

    const timer2 = setTimeout(() => {
      setUploadProgress(78);
      setPipelineStep(3);
    }, 1400);

    const timer3 = setTimeout(() => {
      setUploadProgress(100);
      setPipelineStep(4);
    }, 2100);

    const timer4 = setTimeout(() => {
      onUploadSuccess({
        title_fa: title,
        duration: duration || '۴۰:۰۰',
        isFreePreview,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      });
      setIsProcessing(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18191D] border border-book-border dark:border-book-darkBorder rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-book-border dark:border-book-darkBorder pb-4">
          <div className="space-y-1 text-start">
            <span className="text-[11px] font-bold text-book-accent block">
              استودیو بارگذاری و تنظیم جلسات صوتی
            </span>
            <h3 className="text-base font-bold text-book-text dark:text-white">
              افزودن جلسه صوتی جدید به دوره: {courseTitle}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-book-subtext transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-start">
          <div>
            <label className="text-xs font-bold text-book-text dark:text-white block mb-1.5">
              عنوان تفصیلی جلسه یا سرفصل تدریس:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: جلسه ۵: بررسی تشکیک در مرتبه علیت و معلولیت"
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/80 border border-book-border dark:border-book-darkBorder text-xs font-bold focus:outline-none focus:ring-2 focus:ring-book-accent text-book-text dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-book-text dark:text-white block mb-1.5">
                مدت زمان تقریبی جلسه:
              </label>
              <div className="relative flex items-center">
                <Clock className="w-4 h-4 text-book-subtext absolute end-3 pointer-events-none" />
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="۴۲:۱۵"
                  className="w-full pe-8 ps-4 py-3 rounded-2xl bg-stone-50 dark:bg-zinc-800/80 border border-book-border dark:border-book-darkBorder text-xs font-bold focus:outline-none focus:ring-2 focus:ring-book-accent text-book-text dark:text-white font-num"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-book-text dark:text-white block mb-1.5">
                سطح دسترسی جلسه آموزشی:
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsFreePreview(false)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                    !isFreePreview
                      ? 'bg-[#8A532B]/10 border-[#8A532B]/30 text-[#8A532B] dark:text-[#C58B43]'
                      : 'border-book-border text-book-subtext'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>جلسه ویژه دوره</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFreePreview(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                    isFreePreview
                      ? 'bg-[#8A532B]/10 border-[#8A532B]/30 text-[#8A532B] dark:text-[#C58B43]'
                      : 'border-book-border text-book-subtext'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>نمونه رایگان</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drag & Drop Audio Upload Zone */}
          <div className="pt-2">
            <label className="text-xs font-bold text-book-text dark:text-white block mb-1.5">
              فایل ضبط استودیویی صوتی (MP3 / WAV / M4A):
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-book-border dark:border-book-darkBorder hover:border-book-accent rounded-3xl p-6 text-center cursor-pointer transition bg-stone-50/50 dark:bg-zinc-800/40 space-y-3"
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileAudio className="w-8 h-8 text-book-accent" />
                  <div className="text-start">
                    <span className="text-xs font-bold text-book-text dark:text-white block">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-book-subtext font-num">
                      حجم فایل: {selectedFile.size} • کیفیت استودیویی
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-book-accent mx-auto" />
                  <div>
                    <span className="text-xs font-bold text-book-text dark:text-white block">
                      فایل صوتی را به این بخش بکشید یا برای انتخاب کلیک کنید
                    </span>
                    <span className="text-[11px] text-book-subtext">
                      پشتیبانی تا حجم ۵۰۰ مگابایت با استاندارد صوتی استودیویی شفاف
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Audio Pipeline Stages */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800 border border-book-border dark:border-book-darkBorder space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-book-accent">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>بارگذاری جلسه و آماده‌سازی پخش آنلاین...</span>
                </span>
                <span className="font-num text-book-subtext">{toLocaleDigits(uploadProgress, 'fa')}٪</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-book-accent transition duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              {/* Steps List */}
              <div className="space-y-2 text-[11px] font-bold text-stone-500 dark:text-stone-400">
                <div className={`flex items-center gap-2 ${pipelineStep >= 1 ? 'text-[#8A532B]' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>۱. استخراج فراداده و تایید کیفیت آکوستیک استودیو</span>
                </div>
                <div className={`flex items-center gap-2 ${pipelineStep >= 2 ? 'text-[#8A532B]' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>۲. تنظیم پخش آنلاین روان بر بستر اینترنت</span>
                </div>
                <div className={`flex items-center gap-2 ${pipelineStep >= 3 ? 'text-[#8A532B]' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>۳. تنظیم کد اختصاصی نشست و مجوز پخش</span>
                </div>
                <div className={`flex items-center gap-2 ${pipelineStep >= 4 ? 'text-[#8A532B]' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>۴. ثبت نشست دانشجو جهت حفظ حریم دروس</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-book-border dark:border-book-darkBorder">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-3 rounded-full border border-book-border dark:border-book-darkBorder text-xs font-bold text-book-subtext hover:text-book-text transition"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleStartProcessing}
            disabled={!title || isProcessing}
            className="px-6 py-3 rounded-full bg-book-accent hover:bg-book-accentHover text-white text-xs font-bold shadow-md active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isProcessing ? 'در حال آماده‌سازی و بارگذاری...' : 'بارگذاری و افزودن جلسه به دوره'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
