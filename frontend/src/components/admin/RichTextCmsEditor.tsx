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
  X,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { toast } from 'sonner';

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

  // Link Dialog Modal State
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');

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
    const caption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setIsUploading(true);
    setUploadLabel('در حال آپلود و درج تصویر...');
    try {
      const res = await apiClient.admin.uploadMedia(file);
      const url = resolveMediaUrl(res.file_url);
      const figureHtml = `
        <figure class="my-6 text-center">
          <img src="${url}" alt="${caption}" class="max-w-full h-auto mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md" />
          <figcaption class="mt-2 text-xs text-zinc-500 dark:text-zinc-400 font-sans">${caption}</figcaption>
        </figure>
        <p><br/></p>
      `;
      insertHtmlAtCursor(figureHtml);
      toast.success('تصویر با موفقیت در متن درج شد.');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در بارگذاری تصویر');
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
    const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setIsUploading(true);
    setUploadLabel('در حال آپلود فایل ضمیمه...');
    try {
      const res = await apiClient.admin.uploadMedia(file);
      const url = resolveMediaUrl(res.file_url);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      const fileCardHtml = `
        <div contenteditable="false" class="my-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-4 select-none">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-[#8A532B] text-white flex items-center justify-center font-bold text-xs font-mono">${ext}</span>
            <div>
              <strong class="block text-sm text-zinc-900 dark:text-white">${title}</strong>
              <span class="text-xs text-zinc-500 dark:text-zinc-400">فایل پیوست مقاله • آماده دریافت</span>
            </div>
          </div>
          <a href="${url}" target="_blank" rel="noopener noreferrer" download class="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold transition">
            دانلود فایل
          </a>
        </div>
        <p><br/></p>
      `;
      insertHtmlAtCursor(fileCardHtml);
      toast.success('فایل ضمیمه در متن درج شد.');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در بارگذاری فایل');
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
        ? `<div contenteditable="false" class="my-6"><video controls src="${url}" class="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-md"></video></div><p><br/></p>`
        : `<div contenteditable="false" class="my-5 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"><p class="text-xs font-bold mb-2 text-zinc-700 dark:text-zinc-300">فایل صوتی ضمیمه در متن:</p><audio controls src="${url}" class="w-full"></audio></div><p><br/></p>`;
      insertHtmlAtCursor(mediaHtml);
      toast.success('رسانه با موفقیت در متن درج شد.');
    } catch (err: any) {
      toast.error(err?.message || 'خطا در بارگذاری رسانه');
    } finally {
      setIsUploading(false);
      setUploadLabel('');
      if (mediaInputRef.current) mediaInputRef.current.value = '';
    }
  };

  const insertPhilosophicalQuote = () => {
    const quoteHtml = `
      <blockquote class="my-5 pe-4 py-3 border-s-4 border-[#8A532B] dark:border-[#C58B43] bg-[#8A532B]/5 dark:bg-[#C58B43]/10 rounded-e-xl text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">
        «عبارت برهانی، آیه، روایت یا نقل‌قول فلسفی را اینجا درج فرمایید...»
      </blockquote>
      <p><br/></p>
    `;
    insertHtmlAtCursor(quoteHtml);
  };

  const insertComparisonTable = () => {
    const tableHtml = `
      <div class="my-5 overflow-x-auto">
        <table class="w-full border-collapse border border-zinc-300 dark:border-zinc-700 text-sm">
          <thead>
            <tr class="bg-zinc-100 dark:bg-zinc-800">
              <th class="border border-zinc-300 dark:border-zinc-700 p-2.5 text-start font-bold">محور مقایسه</th>
              <th class="border border-zinc-300 dark:border-zinc-700 p-2.5 text-start font-bold">دیدگاه نخست</th>
              <th class="border border-zinc-300 dark:border-zinc-700 p-2.5 text-start font-bold">دیدگاه دوم</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-zinc-300 dark:border-zinc-700 p-2.5">مبنای وجودشناختی</td>
              <td class="border border-zinc-300 dark:border-zinc-700 p-2.5">اصالت وجود</td>
              <td class="border border-zinc-300 dark:border-zinc-700 p-2.5">اصالت ماهیت</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br/></p>
    `;
    insertHtmlAtCursor(tableHtml);
  };

  const handleConfirmLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      exec('createLink', linkUrl.trim());
      setIsLinkDialogOpen(false);
      setLinkUrl('https://');
    }
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
          `<figure class="my-6 text-center"><img src="${url}" alt="${file.name}" class="max-w-full h-auto mx-auto rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-700" /></figure><p><br/></p>`
        );
        toast.success('تصویر رهاشده در متن درج شد.');
      } catch (err: any) {
        toast.error(err?.message || 'خطا در بارگذاری تصویر');
      } finally {
        setIsUploading(false);
        setUploadLabel('');
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#141518] overflow-hidden shadow-xs transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col shadow-2xl' : ''
      }`}
      dir="rtl"
    >
      {/* Hidden File Inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.zip,.pptx" onChange={handleAttachmentUpload} className="hidden" />
      <input ref={mediaInputRef} type="file" accept="audio/*,video/*" onChange={handleMediaUpload} className="hidden" />

      {/* Top Rich Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => exec('formatBlock', 'H2')}
            title="تیتر اصلی (H2)"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', 'H3')}
            title="تیتر فرعی (H3)"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-200 dark:border-zinc-800 mx-0.5" />

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => exec('bold')}
            title="ضخیم (Bold)"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            title="مورب (Italic)"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            title="زیرخط‌دار"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('hiliteColor', '#FEF08A')}
            title="هایلایت"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[#8A532B] dark:text-[#C58B43] active:scale-95 transition cursor-pointer"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-200 dark:border-zinc-800 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            title="راست‌چین"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            title="وسط‌چین"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyFull')}
            title="تراز دوطرفه (Justify)"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-200 dark:border-zinc-800 mx-0.5" />

          {/* Lists & Blocks */}
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="فهرست نقطه‌ای"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="فهرست شماره‌دار"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertPhilosophicalQuote}
            title="درج کادر نقل‌قول برهانی / روایی"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[#8A532B] dark:text-[#C58B43] active:scale-95 transition cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertComparisonTable}
            title="درج جدول مقایسه‌ای"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsLinkDialogOpen(true)}
            title="درج پیوند (Link)"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertHorizontalRule')}
            title="خط جداکننده"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 active:scale-95 transition cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-200 dark:border-zinc-800 mx-0.5" />

          {/* Multimedia Inline Upload Buttons */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer transition"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>درج عکس در متن</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer transition"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>درج فایل/PDF</span>
          </button>

          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-600 hover:bg-zinc-700 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer transition"
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
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-95 cursor-pointer transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            title="تکرار (Redo)"
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-95 cursor-pointer transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold active:scale-95 cursor-pointer transition ${
              isPreview
                ? 'bg-[#8A532B] text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'ویرایش متن' : 'پیش‌نمایش زنده'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 active:scale-95 cursor-pointer transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Upload Progress Banner */}
      {isUploading && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] text-xs font-bold border-b border-[#8A532B]/20">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{uploadLabel}</span>
        </div>
      )}

      {/* Editable Content Area */}
      <div className={`relative ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
        {isPreview ? (
          <div
            className="p-6 min-h-[360px] prose dark:prose-invert max-w-none leading-[2.2] text-sm cms-rich-content"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-zinc-400">متنی وارد نشده است.</p>' }}
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
            className="p-6 min-h-[360px] max-h-[600px] overflow-y-auto focus:outline-none text-zinc-900 dark:text-zinc-100 leading-[2.2] text-sm cms-rich-content empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400"
          />
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 select-none">
        <span>
          راهنما: می‌توانید تصاویر را با Drag & Drop داخل متن رها کنید.
        </span>
        <span className="font-num font-bold">
          تعداد کلمات: {wordCount.toLocaleString('fa-IR')} کلمه
        </span>
      </div>

      {/* Link Input Dialog Modal */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-start shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#8A532B]" />
                <span>درج پیوند در متن</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkDialogOpen(false)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmLink} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  نشانی اینترنتی (URL)
                </label>
                <input
                  type="url"
                  dir="ltr"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono outline-none focus:border-[#8A532B] transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsLinkDialogOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  درج پیوند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
