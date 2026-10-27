'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  List,
  Highlighter,
  Bookmark,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  MessageSquare,
  Check,
  RotateCcw,
  Type,
  Sun,
  Moon,
  Coffee,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { booksDatabase, toLocaleDigits, SupportedLang, i18nDict } from '@/lib/data';
import { SCHOLAR_NAME } from '@/lib/constants';

interface BookReader3DProps {
  isOpen: boolean;
  bookId: string;
  currentLang: SupportedLang;
  onClose: () => void;
  onAddToBag?: (title: string, price: string) => void;
}

export const BookReader3D: React.FC<BookReader3DProps> = ({
  isOpen,
  bookId,
  currentLang,
  onClose,
  onAddToBag,
}) => {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(2.2);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [paperTheme, setPaperTheme] = useState<'sepia' | 'cream' | 'white' | 'dark'>('sepia');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  
  // Fidibo / Taaghche Reader Features
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([1]);
  const [isHighlightActive, setIsHighlightActive] = useState<boolean>(false);
  const [userMarginNotes, setUserMarginNotes] = useState<Record<number, string>>({});
  const [noteInput, setNoteInput] = useState<string>('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);

  const book = booksDatabase[bookId] || booksDatabase['book1'];
  const dict = i18nDict[currentLang] || i18nDict['fa'];
  const isRtl = currentLang !== 'en';

  const totalBookPages = 385; // Standard academic volume page count
  const maxSamplePages = 3; // 3 spreads (6 pages) available in free preview

  const audioContextRef = useRef<AudioContext | null>(null);
  const flipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Paper rustle sound synthesizer via Web Audio API (singleton AudioContext)
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch((err) => { console.debug('AudioContext resume ignored:', err); });
    }
    return audioContextRef.current;
  };

  const playRustleSound = () => {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      console.debug('playRustleSound AudioContext ignored:', e);
    }
  };

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
        flipTimerRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((err) => { console.debug('AudioContext close ignored:', err); });
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen && audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch((err) => { console.debug('AudioContext close ignored:', err); });
      audioContextRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      const savedNotes = localStorage.getItem(`zan_notes_${bookId}`);
      if (savedNotes) {
        try {
          setUserMarginNotes(JSON.parse(savedNotes));
        } catch (notesErr) {
          console.warn('Failed to parse saved user margin notes from localStorage:', notesErr);
        }
      }
    }
  }, [isOpen, bookId]);

  if (!isOpen) return null;

  const handlePrevPage = () => {
    if (currentPage > 0) {
      playRustleSound();
      setIsFlipping(true);
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      flipTimerRef.current = setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsFlipping(false);
      }, 150);
    }
  };

  const handleNextPage = () => {
    if (currentPage < maxSamplePages) {
      playRustleSound();
      setIsFlipping(true);
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      flipTimerRef.current = setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsFlipping(false);
      }, 150);
    }
  };

  const handleJumpToPage = (pageNum: number) => {
    playRustleSound();
    setCurrentPage(pageNum);
    setIsTocOpen(false);
  };

  const handleToggleBookmark = () => {
    if (bookmarkedPages.includes(currentPage)) {
      setBookmarkedPages(prev => prev.filter(p => p !== currentPage));
    } else {
      setBookmarkedPages(prev => [...prev, currentPage]);
    }
  };

  const handleSaveMarginNote = () => {
    if (!noteInput.trim()) return;
    const updated = { ...userMarginNotes, [currentPage]: noteInput };
    setUserMarginNotes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`zan_notes_${bookId}`, JSON.stringify(updated));
    }
    setNoteInput('');
    setIsNoteModalOpen(false);
  };

  const pageData = book.pages[currentPage]?.[currentLang] || book.pages[currentPage]?.['fa'] || book.pages[1]?.['fa'];
  const title = (book as any)[`title_${currentLang}`] || book.title_fa;
  const price = (book as any)[`price_${currentLang}`] || book.price_fa;
  const isCurrentBookmarked = bookmarkedPages.includes(currentPage);

  // Theme styling based on Fidibo/Taaghche palette
  const getThemeClasses = () => {
    switch (paperTheme) {
      case 'sepia':
        return 'bg-[#F4ECD8] text-[#2C2416] border-[#DECFA9]'; // Classic Chamois/Sepia
      case 'cream':
        return 'bg-[#FBF8F0] text-[#241F1A] border-[#E8DFD0]'; // Soft Book Cream
      case 'white':
        return 'bg-[#FFFFFF] text-[#1E1E1E] border-[#E2E4E9]'; // Day White
      case 'dark':
        return 'bg-[#14161A] text-[#E4E6EA] border-[#252830]'; // Night Dark AMOLED
      default:
        return 'bg-[#F4ECD8] text-[#2C2416] border-[#DECFA9]';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'serif':
        return 'font-medium';
      case 'mono':
        return 'font-bold';
      case 'sans':
      default:
        return 'font-normal';
    }
  };

  const curPageDisplay = toLocaleDigits((currentPage === 0 ? 1 : currentPage * 16).toString(), currentLang);
  const totalPagesDisplay = toLocaleDigits(totalBookPages.toString(), currentLang);
  const readPercent = Math.min(100, Math.round(((currentPage === 0 ? 1 : currentPage * 16) / totalBookPages) * 100));

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md transition duration-200 select-none ${
        isFullscreen ? 'p-0' : ''
      }`}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Main E-Reader Window */}
      <div
        className={`relative w-full max-w-5xl h-full max-h-[94vh] flex flex-col justify-between overflow-hidden shadow-2xl transition duration-200 ${
          isFullscreen ? 'max-w-none max-h-none rounded-none' : 'rounded-3xl border border-stone-800/80 bg-[#0E1013]'
        }`}
      >
        {/* TOP READER TOOLBAR */}
        <header className="h-16 px-4 sm:px-6 bg-[#181A1F]/95 backdrop-blur-xl border-b border-stone-800/80 flex items-center justify-between text-stone-200 z-30 shrink-0">
          {/* Right: Exit button + Book title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold"
              title={dict.reader_exit_title || 'خروج از کتابخوان'}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">{dict.reader_exit || 'بازگشت'}</span>
            </button>

            <div className="h-4 w-px bg-stone-700 hidden sm:block" />

            <div className="min-w-0 text-start">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {title}
              </h2>
              <span className="text-[11px] sm:text-xs text-[#8A532B] font-medium block truncate">
                {dict.scholar_name} • {dict.book_binding_spec}
              </span>
            </div>
          </div>

          {/* Center/Left: E-Reader Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2">
            {/* Table of Contents Drawer Toggle */}
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                isTocOpen ? 'bg-[#8A532B] text-white shadow-xs' : 'bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white'
              }`}
              title={dict.reader_toc_title || 'فهرست ابواب'}
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">{dict.reader_toc || 'فهرست'}</span>
            </button>

            {/* Reading Typography Settings Toggle */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                isSettingsOpen ? 'bg-[#8A532B] text-white shadow-xs' : 'bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white'
              }`}
              title={dict.reader_type_title || 'تنظیمات متن'}
            >
              <Type className="w-4 h-4" />
              <span className="hidden md:inline">{dict.reader_type || 'تنظیمات متن'}</span>
            </button>

            {/* Bookmark Page */}
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isCurrentBookmarked
                  ? 'bg-[#8A532B] text-white shadow-md'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white'
              }`}
              title={dict.reader_bookmark_title || 'نشانک‌گذاری'}
            >
              <Bookmark className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Margin Notes Tool */}
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white transition cursor-pointer relative"
              title={dict.reader_notes_title || 'یادداشت‌نویسی'}
            >
              <MessageSquare className="w-4 h-4" />
              {userMarginNotes[currentPage] && (
                <span className="w-2 h-2 rounded-full bg-[#8A532B] absolute top-1 end-1" />
              )}
            </button>

            {/* Paper Rustle Sound Synthesizer Toggle */}
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white transition cursor-pointer hidden sm:block"
              title={isSoundEnabled ? (dict.reader_sound_on || 'روشن') : (dict.reader_sound_off || 'خاموش')}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#8A532B]" />}
            </button>

            {/* Fullscreen Zen Mode */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white transition cursor-pointer"
              title={dict.reader_fullscreen || 'تمام‌صفحه'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* SETTINGS POPOVER */}
        {isSettingsOpen && (
          <div className="absolute top-18 end-6 z-40 w-80 bg-[#1A1C22]/98 backdrop-blur-2xl border border-stone-700/80 rounded-3xl p-5 shadow-2xl space-y-5 text-start animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#8A532B]" />
                {dict.reader_settings_modal_title || 'تنظیمات مطالعه'}
              </span>
              <button onClick={() => setIsSettingsOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Font Family Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 block">{dict.reader_font_family || 'قلم کتاب:'}</span>
              <div className="flex gap-2">
                {[
                  { id: 'sans', label: dict.reader_font_sans || 'دانا استاندارد' },
                  { id: 'serif', label: dict.reader_font_serif || 'دانا کشیده' },
                  { id: 'mono', label: dict.reader_font_mono || 'دانا درشت' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      fontFamily === f.id
                        ? 'bg-[#8A532B] text-white border-[#8A532B] shadow-xs'
                        : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-400">
                <span>{dict.reader_font_size_label || 'اندازه متن:'}</span>
                <span className="font-num text-[#8A532B] dark:text-[#C58B43]">{toLocaleDigits(fontSize.toString(), currentLang)} px</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-400">A-</span>
                <input
                  type="range"
                  min={14}
                  max={26}
                  value={fontSize}
                  onChange={e => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#8A532B]"
                />
                <span className="text-base font-bold text-white">A+</span>
              </div>
            </div>

            {/* Line Height Control */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 block">{dict.reader_line_height_label || 'فاصله خطوط:'}</span>
              <div className="flex gap-2">
                {[
                  { val: 1.8, label: '1.8' },
                  { val: 2.2, label: '2.2' },
                  { val: 2.6, label: '2.6' },
                ].map(lh => (
                  <button
                    key={lh.val}
                    onClick={() => setLineHeight(lh.val)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      lineHeight === lh.val
                        ? 'bg-[#8A532B] text-white border-[#8A532B] shadow-xs'
                        : 'bg-stone-800 border-stone-700 text-stone-300'
                    }`}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Theme Colors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 block">{dict.reader_paper_theme_label || 'تم رنگی صفحه:'}</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'sepia', label: dict.reader_theme_sepia || 'سپیا', bg: '#F4ECD8', text: '#2C2416' },
                  { id: 'cream', label: dict.reader_theme_cream || 'کرم', bg: '#FBF8F0', text: '#241F1A' },
                  { id: 'white', label: dict.reader_theme_white || 'سفید', bg: '#FFFFFF', text: '#1E1E1E' },
                  { id: 'dark', label: dict.reader_theme_dark || 'تاریک', bg: '#14161A', text: '#E4E6EA' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setPaperTheme(t.id as any)}
                    style={{ backgroundColor: t.bg, color: t.text }}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border-2 transition text-center ${
                      paperTheme === t.id ? 'border-[#8A532B]/30 ring-2 ring-[#8A532B]/30 shadow-md' : 'border-stone-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TABLE OF CONTENTS DRAWER */}
        {isTocOpen && (
          <div className="absolute top-18 start-6 z-40 w-80 bg-[#181A1F]/98 backdrop-blur-2xl border border-stone-700/80 rounded-3xl p-5 shadow-2xl space-y-4 text-start animate-in fade-in slide-in-from-start-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <List className="w-4 h-4 text-[#8A532B]" />
                {dict.reader_toc_title || 'فهرست ابواب و فصول'}
              </span>
              <button onClick={() => setIsTocOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pe-1">
              {[
                { page: 0, title: currentLang === 'en' ? 'Hardcover Edition' : currentLang === 'ar' ? 'الغلاف وتفاصيل الكتاب' : 'جلد نفیس و معرفی اثر', desc: currentLang === 'en' ? 'Vaziri Format' : 'قطع وزیری' },
                { page: 1, title: currentLang === 'en' ? 'Preface & Prolegomena' : currentLang === 'ar' ? 'تصدير المؤلف والمقدمة' : 'دیباچه مؤلف و مقدمه ناشر', desc: currentLang === 'en' ? 'Pages 12-15' : currentLang === 'ar' ? 'ص ١٢ - ١٥' : 'ص ۱۲ تا ۱۵' },
                { page: 2, title: currentLang === 'en' ? 'Chapter 1: Existence & Quiddity' : currentLang === 'ar' ? 'الفصل الأول: تمايز الوجود والماهية' : 'فصل اول: تمایز وجود و ماهیت', desc: currentLang === 'en' ? 'Pages 16-25' : currentLang === 'ar' ? 'ص ١٦ - ٢٥' : 'ص ۱۶ تا ۲۵' },
                { page: 3, title: currentLang === 'en' ? 'Chapter 2: Gradation of Being' : currentLang === 'ar' ? 'الفصل الثاني: تشكيك الوجود والأنوار' : 'فصل دوم: تشکیک وجود و انوار', desc: currentLang === 'en' ? 'Pages 26-38' : currentLang === 'ar' ? 'ص ٢٦ - ٣٨' : 'ص ۲۶ تا ۳۸' },
              ].map(item => (
                <button
                  key={item.page}
                  onClick={() => handleJumpToPage(item.page)}
                  className={`w-full p-3 rounded-xl transition flex items-center justify-between text-start cursor-pointer ${
                    currentPage === item.page
                      ? 'bg-[#8A532B] text-white font-bold shadow-xs'
                      : 'bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-800'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm block font-bold truncate">{item.title}</span>
                    <span className={`text-[11px] block ${currentPage === item.page ? 'text-zinc-100' : 'text-stone-400'}`}>
                      {item.desc}
                    </span>
                  </div>
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SAMPLE NOTICE FLOATING PILL */}
        <div className="px-4 py-2 bg-[#8A532B]/10 border-b border-[#8A532B]/20 text-center flex items-center justify-center gap-2 text-xs text-[#E6CA85] shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#E6CA85] shrink-0" />
          <span>
            {currentLang === 'en'
              ? 'Previewing free sample pages • To receive the complete 385-page luxury hardcover volume, please place an order.'
              : currentLang === 'ar'
              ? 'تصفح عينة مجانية (الفصل الأول) • لطلب النسخة الورقية الكاملة الفاخرة (٣٨٥ صفحة)، يُرجى تأكيد الطلب.'
              : 'در حال مشاهده نمونه صفحات رایگان کتاب (فصل اول) • برای دریافت تمام ۳۸۵ صفحه نسخه چاپی نفیس، لطفاً سفارش خود را ثبت فرمایید.'}
          </span>
          {onAddToBag && (
            <button
              onClick={() => onAddToBag(title, price)}
              className="ms-2 px-3 py-1 rounded-full bg-[#8A532B] hover:bg-[#724424] text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {dict.btn_order_book || 'سفارش کتاب'} ({price})
            </button>
          )}
        </div>

        {/* MAIN READING DISPLAY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
          <style>{`
            .reader-dynamic-content-${book.id} p,
            .reader-dynamic-content-${book.id} span:not(.font-num):not(.badge-fixed),
            .reader-dynamic-content-${book.id} li,
            .reader-dynamic-content-${book.id} div:not(.reader-fixed) {
              font-size: ${fontSize}px !important;
              line-height: ${lineHeight} !important;
            }
            .reader-dynamic-content-${book.id} h4,
            .reader-dynamic-content-${book.id} h5 {
              font-size: ${Math.round(fontSize * 1.25)}px !important;
              line-height: 1.4 !important;
              font-weight: 800 !important;
              margin-bottom: 0.5rem !important;
            }
          `}</style>

          {/* PAGE 0: COVER SPREAD (Bespoke Moroccan Leather & Gilded Binding) */}
          {currentPage === 0 && (() => {
            const leatherBg =
              book.id === 'book1' ? 'bg-[#241812]' :
              book.id === 'book2' ? 'bg-[#131B2B]' :
              book.id === 'book3' ? 'bg-[#14221A]' :
              book.id === 'book4' ? 'bg-[#25141C]' :
              'bg-[#241812]';
            const leatherBorder =
              book.id === 'book1' ? 'border-[#C58B43]' :
              book.id === 'book2' ? 'border-[#D4AF37]' :
              book.id === 'book3' ? 'border-[#B87333]' :
              book.id === 'book4' ? 'border-[#C58B43]' :
              'border-[#C58B43]';
            const foilColor =
              book.id === 'book1' ? 'text-[#E6CA85]' :
              book.id === 'book2' ? 'text-[#F5E6B3]' :
              book.id === 'book3' ? 'text-[#ECD7C0]' :
              book.id === 'book4' ? 'text-[#FAF8F5]' :
              'text-[#E6CA85]';
            return (
              <div className={`w-full max-w-sm aspect-[1/1.4] rounded-2xl p-8 flex flex-col justify-between items-center text-center shadow-[0_24px_50px_rgba(0,0,0,0.7)] relative border-4 ${leatherBorder} ${leatherBg} text-[#DECFA9]`}>
                {/* Embossed Inner Cartouche Border */}
                <div className="absolute inset-3 border border-[#E6CA85]/30 rounded-xl pointer-events-none">
                  <span className="absolute -top-1 -start-1 w-2 h-2 border-t border-s border-[#E6CA85]" />
                  <span className="absolute -top-1 -end-1 w-2 h-2 border-t border-e border-[#E6CA85]" />
                  <span className="absolute -bottom-1 -start-1 w-2 h-2 border-b border-s border-[#E6CA85]" />
                  <span className="absolute -bottom-1 -end-1 w-2 h-2 border-b border-e border-[#E6CA85]" />
                </div>

                <div className="space-y-2 z-10">
                  <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${foilColor}`}>
                    DAR AL-HIKMAH
                  </span>
                  <div className="w-12 h-0.5 bg-[#C58B43]/50 mx-auto" />
                </div>

                <div className="space-y-4 z-10 px-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#FAF8F5] leading-tight drop-shadow-md">
                    {title}
                  </h1>
                  <p className={`text-xs ${foilColor} leading-relaxed opacity-90 px-2`}>
                    {(book as any)[`desc_${currentLang}`] || book.desc_fa}
                  </p>
                </div>

                <div className="space-y-2 z-10">
                  <div className="w-16 h-0.5 bg-[#C58B43]/50 mx-auto" />
                  <span className="text-xs font-bold block text-[#FAF8F5]">
                    {dict.scholar_name || SCHOLAR_NAME}
                  </span>
                  <span className={`text-[11px] font-num block ${foilColor}`}>
                    ISBN: {book.isbn || '978-622-02-1948-1'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* PAGES 1+: TWO-PAGE BOOK SPREAD */}
          {currentPage > 0 && (
            <div
              className={`w-full max-w-4xl min-h-[520px] rounded-3xl p-6 sm:p-8 border shadow-2xl transition duration-200 flex flex-col md:flex-row gap-8 ${getThemeClasses()} ${getFontFamilyClass()} reader-dynamic-content-${book.id}`}
            >
              {/* Right Page */}
              <div className="flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-e border-current/15 pb-6 md:pb-0 md:pe-8 text-start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-current/10 pb-2 text-xs opacity-75">
                    <span className="font-bold truncate max-w-[200px]">{pageData?.r_header || title}</span>
                    <span className="font-num font-bold">{toLocaleDigits((pageData?.r_num || 1).toString(), currentLang)}</span>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: pageData?.r_body || '' }}
                    className="leading-relaxed"
                  />
                </div>
                <div className="text-center text-[11px] opacity-40 font-num pt-3">
                  — {toLocaleDigits((pageData?.r_num || 1).toString(), currentLang)} —
                </div>
              </div>

              {/* Left Page */}
              <div className="flex-1 flex flex-col justify-between text-start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-current/10 pb-2 text-xs opacity-75">
                    <span className="font-num font-bold">{toLocaleDigits((pageData?.l_num || 2).toString(), currentLang)}</span>
                    <span className="font-bold truncate max-w-[200px]">{pageData?.l_header || title}</span>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: pageData?.l_body || '' }}
                    className="leading-relaxed"
                  />
                </div>
                <div className="text-center text-[11px] opacity-40 font-num pt-3">
                  — {toLocaleDigits((pageData?.l_num || 2).toString(), currentLang)} —
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM PAGINATION BAR */}
        <footer className="h-16 px-4 sm:px-6 bg-[#181A1F]/95 backdrop-blur-xl border-t border-stone-800/80 flex items-center justify-between text-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleNextPage}
              disabled={currentPage >= maxSamplePages}
              className="p-3 rounded-xl bg-stone-800 hover:bg-stone-750 disabled:opacity-30 text-stone-300 hover:text-white transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold"
              title={dict.reader_btn_next || 'صفحه بعد'}
            >
              <ChevronRight className="w-4 h-4" />
              <span className="hidden sm:inline">{dict.reader_btn_next || 'صفحه بعد'}</span>
            </button>

            <div className="text-center text-xs sm:text-sm font-bold text-stone-300">
              <span className="text-white block font-num">
                {dict.reader_page || 'صفحه'} {curPageDisplay} {dict.reader_of || 'از'} {totalPagesDisplay}
              </span>
            </div>

            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 0}
              className="p-3 rounded-xl bg-stone-800 hover:bg-stone-750 disabled:opacity-30 text-stone-300 hover:text-white transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold"
              title={dict.reader_btn_prev || 'صفحه قبل'}
            >
              <span className="hidden sm:inline">{dict.reader_btn_prev || 'صفحه قبل'}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Page Jumpers */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(0)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentPage === 0 ? 'bg-[#8A532B] text-white shadow-xs' : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              {currentLang === 'en' ? 'Cover' : currentLang === 'ar' ? 'الغلاف' : 'جلد کتاب'}
            </button>
            {[1, 2, 3].map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-2 rounded-xl text-xs font-bold font-num transition cursor-pointer ${
                  currentPage === p ? 'bg-[#8A532B] text-white shadow-xs' : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {dict.reader_page || 'ص'} {toLocaleDigits((p * 16).toString(), currentLang)}
              </button>
            ))}
          </div>
        </footer>
      </div>

      {/* MODAL: MARGIN NOTES INPUT */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181A1F] border border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-start">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8A532B]" />
                {dict.reader_note_modal_title || 'ثبت یادداشت و حاشیه علمی'}
              </span>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              placeholder={dict.reader_note_placeholder || 'نکات تحلیلی و حواشی انتقادی خود را بنویسید...'}
              className="w-full p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs sm:text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#8A532B] resize-none leading-relaxed"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-stone-400 hover:text-white"
              >
                {currentLang === 'en' ? 'Cancel' : currentLang === 'ar' ? 'إلغاء' : 'انصراف'}
              </button>
              <button
                onClick={handleSaveMarginNote}
                className="px-5 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
              >
                {dict.reader_note_save_btn || 'ذخیره یادداشت'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
