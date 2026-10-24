'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Sparkles,
  CheckCircle2,
  FileAudio,
  Database,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';

export function AdminMediaTab() {
  const { toLocale } = useLanguage();
  const [tokenResult, setTokenResult] = useState<string | null>(null);

  // RAG Audio/Video Transcript Ingestion State
  const [ragStats, setRagStats] = useState<{
    total_chunks: number;
    audio_chunks: number;
    video_chunks: number;
  } | null>(null);
  const [courseTitle, setCourseTitle] = useState('دوره خارج شرح اسفار اربعه');
  const [sessionName, setSessionName] = useState('جلسه ۱۵: برهان صدیقین');
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [transcriptText, setTranscriptText] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccessMsg, setIngestSuccessMsg] = useState<string | null>(null);

  const sampleQueue = [
    { id: 'ENC-01', title: 'جلسه اول شرح اسفار اربعه', status: 'تکمیل‌شده', rate: '48 kHz / FLAC', duration: '۵۵:۲۰' },
    { id: 'ENC-02', title: 'جلسه دوم حکمت اشراق', status: 'تکمیل‌شده', rate: '48 kHz / Opus', duration: '۵۲:۱۰' },
    { id: 'ENC-03', title: 'جلسه سوم مبادی منطق', status: 'تکمیل‌شده', rate: '48 kHz / PCM', duration: '۴۱:۲۰' },
  ];

  useEffect(() => {
    apiClient.ai
      .getIndexStats()
      .then((res) => setRagStats(res))
      .catch((err) => { console.warn('Failed to load RAG index stats:', err); });
  }, []);

  const handleTestToken = () => {
    const dummy = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.drm_${Date.now()}_zan_48k`;
    setTokenResult(dummy);
  };

  const handleIngestTranscript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcriptText.trim() || isIngesting) return;
    setIsIngesting(true);
    setIngestSuccessMsg(null);
    try {
      const res = await apiClient.ai.ingestMediaTranscript({
        course_title: courseTitle,
        session_name: sessionName,
        media_type: mediaType,
        transcript_text: transcriptText.trim(),
        chunk_duration_sec: 120,
      });
      setIngestSuccessMsg(res.message || 'متن جلسه با موفقیت زمان‌بندی و در موتور RAG ایندکس شد.');
      setTranscriptText('');
      const updatedStats = await apiClient.ai.getIndexStats();
      setRagStats(updatedStats);
    } catch (err: any) {
      setIngestSuccessMsg(err?.message || 'خطا در ایندکس کردن متن جلسه.');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#8A532B]" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              استودیو پردازش صوت 48kHz، قفل DRM و ایندکس هوش مصنوعی (RAG)
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            مدیریت رمزنگاری استریم‌های صوتی و تغذیه دستیار هوشمند با متن زمان‌دار جلسات استاد
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestToken}
          className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
        >
          تولید توکن آزمایشی DRM
        </button>
      </div>

      {tokenResult && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
          <span className="font-mono text-zinc-400 block">[ DUMMY DRM SIGNED TOKEN ]</span>
          <p className="font-mono text-[#8A532B] break-all">{tokenResult}</p>
        </div>
      )}

      {/* RAG Audio/Video Transcript Ingestion Studio */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              افزودن متن پیاده‌شده صوت و ویدیوی جلسات به حافظه هوش مصنوعی (Vector RAG)
            </h3>
          </div>
          {ragStats && (
            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 font-num">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-[#8A532B]" />
                کل قطعات: {toLocale(ragStats.total_chunks)}
              </span>
              <span>•</span>
              <span>صوتی/ویدیویی: {toLocale(ragStats.audio_chunks + ragStats.video_chunks)}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleIngestTranscript} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                نام دوره
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                عنوان و شماره جلسه
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                نوع رسانه
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'audio' | 'video')}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
              >
                <option value="audio">فایل صوتی درس (Audio)</option>
                <option value="video">ویدیوی جلسه (Video)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              متن کامل پیاده‌شده جلسه (به صورت خودکار به قطعات ۲ دقیقه‌ای زمان‌دار تقسیم می‌شود)
            </label>
            <textarea
              rows={4}
              placeholder="متن تقریر یا پیاده‌سازی صوت جلسه درس استاد را اینجا وارد کنید..."
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
              required
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {ingestSuccessMsg ? (
              <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{ingestSuccessMsg}</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-400">
                دستیار هوشمند منحصراً از روی این متون و با ذکر دقیقه دقیق به دانشجویان پاسخ می‌دهد.
              </span>
            )}

            <button
              type="submit"
              disabled={isIngesting}
              className="px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] disabled:opacity-60 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              {isIngesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>ایندکس زمان‌دار در موتور RAG</span>
            </button>
          </div>
        </form>
      </div>

      {/* Queue List */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-xs font-mono text-zinc-400">صف پردازش استودیویی</h3>
          <span className="text-xs font-mono text-zinc-500">ENGINE: FFMPEG / 48000Hz</span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {sampleQueue.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition"
            >
              <div className="flex items-center gap-3">
                <FileAudio className="w-5 h-5 text-[#8A532B]" />
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                  <span className="font-mono text-[11px] text-zinc-400">
                    {item.id} • {item.rate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-num text-zinc-500">{item.duration}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8A532B]/10 text-[#8A532B]">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
