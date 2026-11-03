'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  BookOpen,
  Headphones,
  FileText,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import {
  getLocalizedCourse,
  getLocalizedBook,
  getLocalizedArticle,
} from '@/lib/localization';

interface HeroInstantSearchProps {
  onSelectCategory?: (category: string) => void;
}

export function HeroInstantSearch({ onSelectCategory }: HeroInstantSearchProps) {
  const router = useRouter();
  const { currentLang, dict, isRtl, localizeHref = (p) => p } = useLanguage();
  const { courses, books, articles } = useData();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered search results
  const q = query.trim().toLowerCase();

  const matchedCourses = useMemo(() => {
    if (!q) return [];
    return Object.values(courses)
      .filter((c) => {
        const titleFa = (c.title_fa || '').toLowerCase();
        const titleAr = (c.title_ar || '').toLowerCase();
        const titleEn = (c.title_en || '').toLowerCase();
        const descFa = (c.desc_fa || '').toLowerCase();
        const subject = (c.subject || '').toLowerCase();
        return (
          titleFa.includes(q) ||
          titleAr.includes(q) ||
          titleEn.includes(q) ||
          descFa.includes(q) ||
          subject.includes(q)
        );
      })
      .slice(0, 4);
  }, [courses, q]);

  const matchedBooks = useMemo(() => {
    if (!q) return [];
    return Object.values(books)
      .filter((b) => {
        const titleFa = (b.title_fa || '').toLowerCase();
        const titleAr = (b.title_ar || '').toLowerCase();
        const titleEn = (b.title_en || '').toLowerCase();
        const authorFa = (b.author_fa || '').toLowerCase();
        const descFa = (b.desc_fa || '').toLowerCase();
        return (
          titleFa.includes(q) ||
          titleAr.includes(q) ||
          titleEn.includes(q) ||
          authorFa.includes(q) ||
          descFa.includes(q)
        );
      })
      .slice(0, 3);
  }, [books, q]);

  const matchedArticles = useMemo(() => {
    if (!q) return [];
    return articles
      .filter((a) => {
        const title = (a.title_fa || a.title || '').toLowerCase();
        const titleEn = (a.title_en || '').toLowerCase();
        const titleAr = (a.title_ar || '').toLowerCase();
        const abs = (a.abstract_fa || a.abstract || '').toLowerCase();
        return (
          title.includes(q) ||
          titleEn.includes(q) ||
          titleAr.includes(q) ||
          abs.includes(q)
        );
      })
      .slice(0, 3);
  }, [articles, q]);

  // Flattened items for keyboard navigation
  const flatItems = useMemo(() => {
    const items: Array<{
      type: 'course' | 'book' | 'article';
      id: string;
      title: string;
      url: string;
      meta: string;
    }> = [];

    matchedCourses.forEach((c) => {
      const loc = getLocalizedCourse(c, currentLang);
      const isFree = c.price_fa?.includes('رایگان') || c.price_fa === '۰';
      items.push({
        type: 'course',
        id: c.id,
        title: loc?.title || c.title_fa,
        url: `/courses/${c.id}`,
        meta: isFree ? (dict.course_free_badge) : (loc?.price || c.price_fa || ''),
      });
    });

    matchedArticles.forEach((a) => {
      const loc = getLocalizedArticle(a, currentLang);
      items.push({
        type: 'article',
        id: a.id,
        title: loc?.title || a.title_fa || a.title,
        url: `/articles`,
        meta: loc?.readTime || a.readTime || '',
      });
    });

    return items;
  }, [matchedCourses, matchedArticles, currentLang, dict]);

  const hasResults = flatItems.length > 0;

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(localizeHref(url));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
        handleSelect(flatItems[selectedIndex].url);
      } else if (query.trim()) {
        handleSelect(`/courses?search=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleChipClick = (topicName: string) => {
    setQuery(topicName);
    setIsOpen(true);
    inputRef.current?.focus();
    if (onSelectCategory) {
      onSelectCategory(topicName);
    }
  };

  // Localized popular quick topics
  const popularTopics = useMemo(() => {
    if (currentLang === 'en') {
      return [
        { label: "Asfar Arba'ah", query: 'asfar' },
        { label: 'Bidayat al-Hikmah', query: 'bidayah' },
        { label: 'Nihayat al-Hikmah', query: 'nihayah' },
        { label: 'Sharh al-Isharat', query: 'isharat' },
        { label: 'Formal Logic', query: 'logic' },
        { label: 'Illumination', query: 'ishraq' },
      ];
    }
    if (currentLang === 'ar') {
      return [
        { label: 'الأسفار الأربعة', query: 'الأسفار' },
        { label: 'بداية الحكمة', query: 'بداية' },
        { label: 'نهاية الحكمة', query: 'نهاية' },
        { label: 'شرح الإشارات', query: 'الإشارات' },
        { label: 'منطق المظفر', query: 'المنطق' },
        { label: 'حكمة الإشراق', query: 'الإشراق' },
      ];
    }
    return [
      { label: 'اسفار اربعه', query: 'اسفار' },
      { label: 'بدایة الحکمة', query: 'بدایه' },
      { label: 'نهایة الحکمة', query: 'نهایه' },
      { label: 'شرح اشارات', query: 'اشارات' },
      { label: 'منطق مظفر', query: 'منطق' },
      { label: 'حکمت اشراق', query: 'اشراق' },
    ];
  }, [currentLang]);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative z-30">
      {/* 1. Main Search Console Input */}
      <div className="relative flex items-center w-full rounded-2xl bg-white dark:bg-[#121316] border border-[#E6E1D8] dark:border-[#27282D] focus-within:border-[#8A532B] dark:focus-within:border-[#C58B43] shadow-xs focus-within:shadow-xl focus-within:shadow-black/5 dark:focus-within:shadow-black/30 focus-within:scale-[1.008] transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {/* Search Icon */}
        <div className="ps-4 pe-2 text-[#8A532B] dark:text-[#C58B43] shrink-0 pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
          <Search className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={dict.hero_search_input_placeholder}
          className="w-full py-3.5 sm:py-4 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 ring-0 text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          dir={dict.dir}
        />

        {/* Right side controls: Clear / Submit */}
        <div className="flex items-center gap-1.5 sm:gap-2 pe-2 sm:pe-3 shrink-0">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 cursor-pointer"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit Search Button */}
          <button
            type="button"
            onClick={() => {
              if (query.trim()) {
                handleSelect(`/courses?search=${encodeURIComponent(query.trim())}`);
              } else {
                handleSelect('/courses');
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#734320] text-white text-xs sm:text-sm font-medium transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 ease-out cursor-pointer shadow-xs hover:shadow-md active:scale-95"
          >
            <span>{dict.hero_search_btn}</span>
            <ArrowIcon className="w-3.5 h-3.5 hidden sm:inline-block transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* 2. Live Dropdown Results Panel with Spring Fade/Slide Animation */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full start-0 end-0 mt-2 bg-[#FAF8F5] dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#27282D] rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/70 overflow-hidden z-50 divide-y divide-[#E6E1D8]/60 dark:divide-[#27282D]/60 animate-dropdown-spring">
          {hasResults ? (
            <div className="max-h-[380px] overflow-y-auto p-2 sm:p-3 space-y-3">
              {/* Courses Group */}
              {matchedCourses.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                    <span>{dict.nav_courses}</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedCourses.map((c) => {
                      const loc = getLocalizedCourse(c, currentLang);
                      const isFree = c.price_fa?.includes('رایگان') || c.price_fa === '۰';
                      const itemIndex = flatItems.findIndex((it) => it.id === c.id);
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelect(`/courses/${c.id}`)}
                          className={`w-full text-start px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 ease-out cursor-pointer ${
                            isSelected
                              ? 'bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] translate-x-1 rtl:-translate-x-1'
                              : 'hover:bg-[#8A532B]/10 hover:text-[#8A532B] dark:hover:text-[#C58B43] text-zinc-800 dark:text-zinc-200 hover:translate-x-1 rtl:hover:-translate-x-1'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43] shrink-0" />
                            <span className="font-medium truncate">{loc?.title || c.title_fa}</span>
                          </div>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0 font-medium">
                            {isFree ? (dict.course_free_badge) : (loc?.price || c.price_fa)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Articles Group */}
              {matchedArticles.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                    <span>{dict.nav_articles}</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedArticles.map((a) => {
                      const loc = getLocalizedArticle(a, currentLang);
                      const itemIndex = flatItems.findIndex((it) => it.id === a.id);
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleSelect('/articles')}
                          className={`w-full text-start px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 ease-out cursor-pointer ${
                            isSelected
                              ? 'bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] translate-x-1 rtl:-translate-x-1'
                              : 'hover:bg-[#8A532B]/10 hover:text-[#8A532B] dark:hover:text-[#C58B43] text-zinc-800 dark:text-zinc-200 hover:translate-x-1 rtl:hover:-translate-x-1'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43] shrink-0" />
                            <span className="font-medium truncate">{loc?.title || a.title_fa || a.title}</span>
                          </div>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0 font-medium">
                            {loc?.readTime || a.readTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-2">
              <p>{dict.hero_search_no_results}</p>
            </div>
          )}

          {/* Bottom All Results Link */}
          <div className="p-2 sm:p-2.5 bg-zinc-50 dark:bg-[#101114] text-center">
            <button
              type="button"
              onClick={() => handleSelect(`/courses?search=${encodeURIComponent(query.trim())}`)}
              className="text-xs text-[#8A532B] dark:text-[#C58B43] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{dict.hero_search_view_all_results}</span>
              <ArrowIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Popular Topic Chips */}
      <div className="pt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium me-1">
          {dict.hero_popular_topics_label}
        </span>
        {popularTopics.map((topic) => (
          <button
            key={topic.label}
            type="button"
            onClick={() => handleChipClick(topic.query)}
            className="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium bg-white/80 dark:bg-zinc-900/80 hover:bg-[#8A532B]/10 hover:text-[#8A532B] dark:hover:text-[#C58B43] text-zinc-700 dark:text-zinc-300 border border-[#E6E1D8] dark:border-[#27282D] hover:border-[#8A532B]/30 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs active:scale-95 cursor-pointer shadow-2xs"
          >
            {topic.label}
          </button>
        ))}
      </div>
    </div>
  );
}
