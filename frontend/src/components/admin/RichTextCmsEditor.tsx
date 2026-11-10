'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  RemoveFormatting,
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

  // Caret & Focus Management (Bug 1 & 2 Fixes)
  const isFocusedRef = useRef(false);
  const lastHtmlRef = useRef(value || '');
  const savedRangeRef = useRef<Range | null>(null);

  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // Active Formatting State (Bug 4 Fix)
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    ul: boolean;
    ol: boolean;
    block: string;
    alignRight: boolean;
    alignCenter: boolean;
    alignJustify: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    ul: false,
    ol: false,
    block: 'p',
    alignRight: false,
    alignCenter: false,
    alignJustify: false,
  });

  // Link Dialog Modal State
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');

  const updateMetrics = useCallback((htmlContent: string) => {
    const textOnly = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textOnly ? textOnly.split(' ').length : 0;
    setWordCount(words);
    if (onAutoReadTime && words > 0) {
      const mins = Math.max(1, Math.ceil(words / 180));
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const minsFa = String(mins).replace(/[0-9]/g, (d) => persianDigits[parseInt(d, 10)]);
      onAutoReadTime(`${minsFa} دقیقه مطالعه`);
    }
  }, [onAutoReadTime]);

  // Sync external `value` changes WITHOUT resetting cursor position while user is actively typing! (Bug 1 Fix)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const incoming = value || '';
    if (!isFocusedRef.current && el.innerHTML !== incoming) {
      el.innerHTML = incoming;
      lastHtmlRef.current = incoming;
      updateMetrics(incoming);
    } else if (incoming === '' && lastHtmlRef.current !== '') {
      el.innerHTML = '';
      lastHtmlRef.current = '';
      updateMetrics('');
    }
  }, [value, updateMetrics]);

  const updateActiveFormats = useCallback(() => {
    if (typeof document === 'undefined') return;
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        ul: document.queryCommandState('insertUnorderedList'),
        ol: document.queryCommandState('insertOrderedList'),
        block: (document.queryCommandValue('formatBlock') || 'p').toLowerCase(),
        alignRight: document.queryCommandState('justifyRight'),
        alignCenter: document.queryCommandState('justifyCenter'),
        alignJustify: document.queryCommandState('justifyFull'),
      });
    } catch {
      // Ignore queryCommandState errors in unsupported contexts
    }
  }, []);

  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const syncContent = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML === '<br>' ? '' : el.innerHTML;
    if (html !== lastHtmlRef.current) {
      lastHtmlRef.current = html;
      onChange(html);
      updateMetrics(html);
    }
    updateActiveFormats();
  };

  const exec = (command: string, arg: string = '') => {
    if (isPreview) return;
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, arg);
    syncContent();
  };

  const handleFormatBlock = (tag: string) => {
    const currentBlock = activeFormats.block.replace(/[<>]/g, '');
    const nextTag = currentBlock === tag.toLowerCase() ? 'p' : tag;
    exec('formatBlock', `<${nextTag}>`);
  };

  const insertHtmlAtCursor = (htmlSnippet: string) => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = htmlSnippet;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = div.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        const newRange = range.cloneRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      }
    } else {
      el.innerHTML += htmlSnippet;
    }
    syncContent();
  };

  const resolveMediaUrl = (fileUrl: string) => {
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '');
    return fileUrl.startsWith('/static/') ? `${apiOrigin}${fileUrl}` : fileUrl;
  };

  // Clean paste handler to prevent styles corruption (Bug 4 Fix)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در بارگذاری تصویر';
      toast.error(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در بارگذاری فایل';
      toast.error(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در بارگذاری رسانه';
      toast.error(message);
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

  const handleOpenLinkDialog = () => {
    updateActiveFormats();
    setIsLinkDialogOpen(true);
  };

  const handleConfirmLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      restoreSelection();
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'خطا در بارگذاری تصویر';
        toast.error(message);
      } finally {
        setIsUploading(false);
        setUploadLabel('');
      }
    }
  };

  const btnBase =
    'p-1.5 rounded-lg transition-colors flex items-center justify-center select-none cursor-pointer';
  const btnInactive =
    'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-95';
  const btnActive =
    'bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/30 font-bold';

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

      {/* Top Rich Toolbar: EVERY button uses onMouseDown={(e) => e.preventDefault()} so editor retains focus (Bug 2 Fix) */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleFormatBlock('h2');
            }}
            title="تیتر اصلی (H2)"
            className={`${btnBase} ${activeFormats.block.includes('h2') ? btnActive : btnInactive}`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleFormatBlock('h3');
            }}
            title="تیتر فرعی (H3)"
            className={`${btnBase} ${activeFormats.block.includes('h3') ? btnActive : btnInactive}`}
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-200 dark:border-zinc-800 mx-0.5" />

          {/* Text Formatting */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('bold');
            }}
            title="ضخیم (Bold)"
            className={`${btnBase} ${activeFormats.bold ? btnActive : btnInactive}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('italic');
            }}
            title="مورب (Italic)"
            className={`${btnBase} ${activeFormats.italic ? btnActive : btnInactive}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('underline');
            }}
            title="زیرخط‌دار"
            className={`${btnBase} ${activeFormats.underline ? btnActive : btnInactive}`}
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('hiliteColor', '#FEF08A');
            }}
            title="هایلایت"
            className={`${btnBase} ${btnInactive}`}
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-200 dark:border-zinc-800 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('justifyRight');
            }}
            title="راست‌چین"
            className={`${btnBase} ${activeFormats.alignRight ? btnActive : btnInactive}`}
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('justifyCenter');
            }}
            title="وسط‌چین"
            className={`${btnBase} ${activeFormats.alignCenter ? btnActive : btnInactive}`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('justifyFull');
            }}
            title="تراز دوطرفه (Justify)"
            className={`${btnBase} ${activeFormats.alignJustify ? btnActive : btnInactive}`}
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-200 dark:border-zinc-800 mx-0.5" />

          {/* Lists & Blocks */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('insertUnorderedList');
            }}
            title="فهرست نقطه‌ای"
            className={`${btnBase} ${activeFormats.ul ? btnActive : btnInactive}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('insertOrderedList');
            }}
            title="فهرست شماره‌دار"
            className={`${btnBase} ${activeFormats.ol ? btnActive : btnInactive}`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertPhilosophicalQuote();
            }}
            title="درج کادر نقل‌قول برهانی / روایی"
            className={`${btnBase} ${activeFormats.block.includes('blockquote') ? btnActive : btnInactive}`}
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertComparisonTable();
            }}
            title="درج جدول مقایسه‌ای"
            className={`${btnBase} ${btnInactive}`}
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleOpenLinkDialog();
            }}
            title="درج پیوند (Link)"
            className={`${btnBase} ${btnInactive}`}
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('insertHorizontalRule');
            }}
            title="خط جداکننده"
            className={`${btnBase} ${btnInactive}`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('removeFormat');
              exec('formatBlock', '<p>');
            }}
            title="پاک کردن فرمت"
            className={`${btnBase} ${btnInactive}`}
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-zinc-200 dark:border-zinc-800 mx-0.5" />

          {/* Multimedia Inline Upload Buttons */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              updateActiveFormats();
              imageInputRef.current?.click();
            }}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer transition disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>درج عکس در متن</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              updateActiveFormats();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer transition disabled:opacity-50"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>درج فایل/PDF</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              updateActiveFormats();
              mediaInputRef.current?.click();
            }}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-600 hover:bg-zinc-700 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer transition disabled:opacity-50"
          >
            <Music className="w-3.5 h-3.5" />
            <span>درج صوت/ویدیو</span>
          </button>
        </div>

        {/* Right Controls: Undo/Redo, Preview & Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('undo');
            }}
            title="بازگشت (Undo)"
            className={`${btnBase} ${btnInactive}`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec('redo');
            }}
            title="تکرار (Redo)"
            className={`${btnBase} ${btnInactive}`}
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
            className={`${btnBase} ${btnInactive}`}
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

      {/* Editable Content Area with Explicit RTL Typography Tailwind overrides (Bug 3 Fix) */}
      <div className={`relative ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
        {isPreview ? (
          <div
            className="p-6 min-h-[360px] prose dark:prose-invert max-w-none leading-[2.2] text-sm cms-rich-content
              [&_h1]:text-2xl [&_h1]:font-black [&_h1]:my-3
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2.5
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-2
              [&_p]:my-1.5
              [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:my-2
              [&_ol]:list-decimal [&_ol]:pr-6 [&_ol]:my-2
              [&_li]:my-1
              [&_blockquote]:border-r-4 [&_blockquote]:border-[#8A532B] dark:[&_blockquote]:border-[#C58B43] [&_blockquote]:bg-[#8A532B]/5 dark:[&_blockquote]:bg-[#C58B43]/10 [&_blockquote]:pr-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:rounded-l-xl [&_blockquote]:font-semibold
              [&_a]:text-[#8A532B] dark:[&_a]:text-[#C58B43] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-zinc-400">متنی وارد نشده است.</p>' }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dir="rtl"
            onFocus={() => {
              isFocusedRef.current = true;
              updateActiveFormats();
            }}
            onBlur={() => {
              isFocusedRef.current = false;
              syncContent();
            }}
            onInput={syncContent}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onPaste={handlePaste}
            onDrop={handleDrop}
            data-placeholder={placeholder}
            className="p-6 min-h-[360px] max-h-[600px] overflow-y-auto focus:outline-none text-zinc-900 dark:text-zinc-100 leading-[2.2] text-sm cms-rich-content empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400
              [&_h1]:text-2xl [&_h1]:font-black [&_h1]:my-3
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2.5
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-2
              [&_p]:my-1.5
              [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:my-2
              [&_ol]:list-decimal [&_ol]:pr-6 [&_ol]:my-2
              [&_li]:my-1
              [&_blockquote]:border-r-4 [&_blockquote]:border-[#8A532B] dark:[&_blockquote]:border-[#C58B43] [&_blockquote]:bg-[#8A532B]/5 dark:[&_blockquote]:bg-[#C58B43]/10 [&_blockquote]:pr-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:rounded-l-xl [&_blockquote]:font-semibold
              [&_a]:text-[#8A532B] dark:[&_a]:text-[#C58B43] [&_a]:underline"
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
