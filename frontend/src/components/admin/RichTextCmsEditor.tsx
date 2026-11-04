'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  AlignRight,
  AlignCenter,
  AlignJustify,
  Image as ImageIcon,
  FileUp,
  Music,
  Video,
  Table,
  Minus,
  Highlighter,
  Link2,
  Eye,
  Edit3,
  Loader2,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface RichTextCmsEditorProps {
  value: string;
  onChange: (html: string) => void;
  onAutoReadTime?: (readTimeFa: string) => void;
  placeholder?: string;
}

export default function RichTextCmsEditor({
  value,
  onChange,
  onAutoReadTime,
  placeholder = 'متن مقاله را اینجا بنویسید یا تصاویر، نقل‌قول‌ها و فایل‌های خود را در میانه متن درج کنید...',
}: RichTextCmsEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // Initialize editor HTML when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
      updateMetrics(value || '');
    }
  }, [value]);

  const resolveMediaUrl = (fileUrl: string) => {
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');
    return fileUrl.startsWith('/static/') ? `${apiOrigin}${fileUrl}` : fileUrl;
  };

  const updateMetrics = (htmlContent: string) => {
    const textOnly = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textOnly ? textOnly.split(' ').length : 0;
    setWordCount(words);
    if (onAutoReadTime && words > 0) {
      const mins = Math.max(1, Math.ceil(words / 180));
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const minsFa = String(mins).replace(/[0-9]/g, (d) => persianDigits[parseInt(d, 10)]);
      onAutoReadTime(`${minsFa} دقیقه مطالعه`);
    }
  };

  const syncContent = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateMetrics(html);
  };

  const exec = (command: string, arg: string = '') => {
    if (isPreview) return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    syncContent();
  };

  const insertHtmlAtCursor = (htmlSnippet: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement('div');
      el.innerHTML = htmlSnippet;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        const newRange = range.cloneRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    } else {
      editorRef.current.innerHTML += htmlSnippet;
    }
    syncContent();
  };

  // 1. Upload & Insert Inline Image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const caption = window.prompt('توضیح زیر تصویر (اختیاری):', file.name.replace(/\.[^/.]+$/, '')) || '';
    setIsUploading(true);
    setUploadLabel('در حال آپلود و درج تصویر...');
    try {
      const res = await apiClient.admin.uploadMedia(file);
      const url = resolveMediaUrl(res.file_url);
      const figureHtml = `
        <figure class="my-6 text-center">
          <img src="${url}" alt="${caption || 'تصویر مقاله'}" class="max-w-full h-auto mx-auto rounded-2xl border border-stone-200 dark:border-zinc-700 shadow-md" />
          ${caption ? `<figcaption class="mt-2 text-xs text-stone-500 dark:text-zinc-400 font-sans">${caption}</figcaption>` : ''}
        </figure>
        <p><br/></p>
      `;
      insertHtmlAtCursor(figureHtml);
    } catch (err: any) {
      alert(err?.message || 'خطا در بارگذاری تصویر');
    } finally {
      setIsUploading(false);
      setUploadLabel('');
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // 2. Upload & Insert Inline Downloadable File (PDF / Doc / Handout)
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const title = window.prompt('عنوان فایل ضمیمه برای نمایش در متن:', file.name) || file.name;
    setIsUploading(true);
    setUploadLabel('در حال آپلود فایل ضمیمه...');
    try {
      const res = await apiClient.admin.uploadMedia(file);
      const url = resolveMediaUrl(res.file_url);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      const fileCardHtml = `
        <div contenteditable="false" class="my-5 p-4 rounded-2xl bg-amber-50/70 dark:bg-zinc-800/80 border border-amber-300/60 dark:border-zinc-700 flex items-center justify-between gap-4 select-none">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-[#8A532B] text-white flex items-center justify-center font-bold text-xs font-mono">${ext}</span>
            <div>
              <strong class="block text-sm text-stone-900 dark:text-white">${title}</strong>
              <span class="text-xs text-stone-500 dark:text-zinc-400">فایل پیوست مقاله • آماده دریافت</span>
            </div>
          </div>
          <a href="${url}" target="_blank" rel="noopener noreferrer" download class="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold transition">
            دانلود فایل
          </a>
        </div>
        <p><br/></p>
      `;
      insertHtmlAtCursor(fileCardHtml);
    } catch (err: any) {
      alert(err?.message || 'خطا در بارگذاری فایل');
    } finally {
      setIsUploading(false);
      setUploadLabel('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 3. Upload & Insert Inline Audio or Video Player
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setIsUploading(true);
    setUploadLabel(isVideo ? 'در حال آپلود ویدیو در متن...' : 'در حال آپلود صوت در متن...');
    try {
      const res = await apiClient.admin.uploadMedia(file);
      const url = resolveMediaUrl(res.file_url);
      const mediaHtml = isVideo
        ? `<div contenteditable="false" class="my-6"><video controls src="${url}" class="w-full rounded-2xl border border-stone-200 dark:border-zinc-700 shadow-md"></video></div><p><br/></p>`
        : `<div contenteditable="false" class="my-5 p-4 rounded-2xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700"><p class="text-xs font-bold mb-2 text-stone-700 dark:text-zinc-300">فایل صوتی ضمیمه در متن:</p><audio controls src="${url}" class="w-full"></audio></div><p><br/></p>`;
      insertHtmlAtCursor(mediaHtml);
    } catch (err: any) {
      alert(err?.message || 'خطا در بارگذاری رسانه');
    } finally {
      setIsUploading(false);
      setUploadLabel('');
      if (mediaInputRef.current) mediaInputRef.current.value = '';
    }
  };

  const insertPhilosophicalQuote = () => {
    const quoteHtml = `
      <blockquote class="my-5 pe-4 py-3 border-s-4 border-[#C58B43] bg-amber-50/60 dark:bg-amber-950/20 rounded-e-xl text-stone-800 dark:text-stone-200 font-semibold leading-relaxed">
        «عبارت برهانی، آیه، روایت یا نقل‌قول فلسفی را اینجا درج فرمایید...»
      </blockquote>
      <p><br/></p>
    `;
    insertHtmlAtCursor(quoteHtml);
  };

  const insertComparisonTable = () => {
    const tableHtml = `
      <div class="my-5 overflow-x-auto">
        <table class="w-full border-collapse border border-stone-300 dark:border-zinc-700 text-sm">
          <thead>
            <tr class="bg-stone-100 dark:bg-zinc-800">
              <th class="border border-stone-300 dark:border-zinc-700 p-2.5 text-start font-bold">محور مقایسه</th>
              <th class="border border-stone-300 dark:border-zinc-700 p-2.5 text-start font-bold">دیدگاه نخست</th>
              <th class="border border-stone-300 dark:border-zinc-700 p-2.5 text-start font-bold">دیدگاه دوم</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-stone-300 dark:border-zinc-700 p-2.5">مبنای وجودشناختی</td>
              <td class="border border-stone-300 dark:border-zinc-700 p-2.5">اصالت وجود</td>
              <td class="border border-stone-300 dark:border-zinc-700 p-2.5">اصالت ماهیت</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br/></p>
    `;
    insertHtmlAtCursor(tableHtml);
  };

  const insertLink = () => {
    const url = window.prompt('نشانی پیوند (URL) را وارد کنید:', 'https://');
    if (url) exec('createLink', url);
  };

  // Drag & Drop image support directly inside editor
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      e.preventDefault();
      setIsUploading(true);
      setUploadLabel('در حال آپلود تصویر رهاشده...');
      try {
        const res = await apiClient.admin.uploadMedia(file);
        const url = resolveMediaUrl(res.file_url);
        insertHtmlAtCursor(
          `<figure class="my-6 text-center"><img src="${url}" alt="${file.name}" class="max-w-full h-auto mx-auto rounded-2xl shadow-md border border-stone-200 dark:border-zinc-700" /></figure><p><br/></p>`
        );
      } catch (err) {
        console.error('Drop upload error:', err);
      } finally {
        setIsUploading(false);
        setUploadLabel('');
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col shadow-2xl' : ''
      }`}
      dir="rtl"
    >
      {/* Hidden File Inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.zip,.pptx" onChange={handleAttachmentUpload} className="hidden" />
      <input ref={mediaInputRef} type="file" accept="audio/*,video/*" onChange={handleMediaUpload} className="hidden" />

      {/* Top Rich Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-stone-100/90 dark:bg-zinc-800/90 border-b border-stone-200 dark:border-zinc-700 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => exec('formatBlock', 'H2')}
            title="تیتر اصلی (H2)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', 'H3')}
            title="تیتر فرعی (H3)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-stone-300 dark:bg-zinc-700 mx-0.5" />

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => exec('bold')}
            title="ضخیم (Bold)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            title="مورب (Italic)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            title="زیرخط‌دار"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('hiliteColor', '#FEF08A')}
            title="هایلایت طلایی"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-amber-700 dark:text-amber-400 cursor-pointer transition"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-stone-300 dark:bg-zinc-700 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            title="راست‌چین"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            title="وسط‌چین"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyFull')}
            title="تراز دوطرفه (Justify)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-stone-300 dark:bg-zinc-700 mx-0.5" />

          {/* Lists & Blocks */}
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="فهرست نقطه‌ای"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="فهرست شماره‌دار"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertPhilosophicalQuote}
            title="درج کادر نقل‌قول برهانی / عربی"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-amber-800 dark:text-amber-400 cursor-pointer transition"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertComparisonTable}
            title="درج جدول مقایسه‌ای"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertLink}
            title="درج پیوند (Link)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertHorizontalRule')}
            title="خط جداکننده"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 cursor-pointer transition"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-stone-300 dark:bg-zinc-700 mx-0.5" />

          {/* Multimedia Inline Upload Buttons */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs cursor-pointer transition"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>درج عکس در متن</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#2D3139] hover:bg-[#1E2127] text-white text-xs font-bold shadow-xs cursor-pointer transition"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>درج فایل/PDF</span>
          </button>

          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-700 hover:bg-stone-800 text-white text-xs font-bold shadow-xs cursor-pointer transition"
          >
            <Music className="w-3.5 h-3.5" />
            <span>درج صوت/ویدیو</span>
          </button>
        </div>

        {/* Right Controls: Undo/Redo, Preview & Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => exec('undo')}
            title="بازگشت (Undo)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-600 dark:text-zinc-300 cursor-pointer transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            title="تکرار (Redo)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-600 dark:text-zinc-300 cursor-pointer transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
              isPreview
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-zinc-700 text-stone-700 dark:text-zinc-200'
            }`}
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'ویرایش متن' : 'پیش‌نمایش زنده'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-stone-600 dark:text-zinc-300 cursor-pointer transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Upload Progress Banner */}
      {isUploading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold border-b border-amber-200 dark:border-amber-900/50">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{uploadLabel}</span>
        </div>
      )}

      {/* Editable Content Area */}
      <div className={`relative ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
        {isPreview ? (
          <div
            className="p-6 min-h-[360px] prose dark:prose-invert max-w-none leading-[2.2] text-sm cms-rich-content"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-stone-400">متنی وارد نشده است.</p>' }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncContent}
            onBlur={syncContent}
            onDrop={handleDrop}
            data-placeholder={placeholder}
            className="p-6 min-h-[360px] max-h-[600px] overflow-y-auto focus:outline-none text-stone-900 dark:text-stone-100 leading-[2.2] text-sm cms-rich-content empty:before:content-[attr(data-placeholder)] empty:before:text-stone-400"
          />
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-stone-50 dark:bg-zinc-800/60 border-t border-stone-200 dark:border-zinc-700 text-[11px] text-stone-500 dark:text-zinc-400 select-none">
        <span>
          راهنما: می‌توانید تصاویر را مستقیماً با ماوس کشیده و در میانهٔ متن رها کنید (Drag & Drop) یا از دکمه‌های بالا استفاده فرمایید.
        </span>
        <span className="font-num font-bold">
          تعداد کلمات: {wordCount.toLocaleString('fa-IR')} کلمه
        </span>
      </div>
    </div>
  );
}
