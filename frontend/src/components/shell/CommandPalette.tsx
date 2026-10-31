'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  BookOpen,
  Headphones,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  FileText,
  CornerDownLeft,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { booksDatabase, scholarlyArticlesDatabase } from '@/lib/data';
import { getLocalizedCourse, getLocalizedBook, getLocalizedArticle, getLocalizedCategory } from '@/lib/localization';

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface PaletteItem {
  id: string;
  type: 'course' | 'book' | 'article';
  title: string;
  subtitle: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { courses, categories } = useData();
  const { currentLang, toLocale, dict, isRtl, localizeHref } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Mount and smooth fade/scale transition controller
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      timer = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setQuery('');
    setSelectedIndex(0);
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isControlled && controlledOnClose) {
          // If controlled externally
        } else {
          setInternalIsOpen((prev) => !prev);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    const handleCustomOpen = () => {
      setInternalIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen, isControlled, controlledOnClose]);

  // Focus input when opened and visible
  useEffect(() => {
    if (visible) {
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Aggregate search results
  const q = query.trim().toLowerCase();

  const matchedCourses = useMemo(() => {
    if (!q) return [];
    return Object.values(courses).filter((c) => {
      const loc = getLocalizedCourse(c, currentLang);
      return (
        (loc?.title && loc.title.toLowerCase().includes(q)) ||
        (loc?.desc && loc.desc.toLowerCase().includes(q)) ||
        c.title_fa.toLowerCase().includes(q) ||
        (c.desc_fa && c.desc_fa.toLowerCase().includes(q)) ||
        (c.subject && c.subject.toLowerCase().includes(q))
      );
    });
  }, [courses, q, currentLang]);

  const matchedBooks = useMemo(() => {
    if (!q) return [];
    return Object.values(booksDatabase).filter((b) => {
      const loc = getLocalizedBook(b, currentLang);
      return (
        (loc?.title && loc.title.toLowerCase().includes(q)) ||
        (loc?.desc && loc.desc.toLowerCase().includes(q)) ||
        b.title_fa.toLowerCase().includes(q) ||
        (b.desc_fa && b.desc_fa.toLowerCase().includes(q))
      );
    });
  }, [q, currentLang]);

  const matchedArticles = useMemo(() => {
    if (!q) return [];
    return scholarlyArticlesDatabase.filter((a) => {
      const loc = getLocalizedArticle(a, currentLang);
      return (
        (loc?.title && loc.title.toLowerCase().includes(q)) ||
        (loc?.abstract && loc.abstract.toLowerCase().includes(q)) ||
        a.title.toLowerCase().includes(q) ||
        a.abstract.toLowerCase().includes(q)
      );
    });
  }, [q, currentLang]);

  // Unified list of items for arrow navigation & Enter selection
  const flatItems: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];

    if (!q) {
      categories.forEach((cat) => {
        const locCat = getLocalizedCategory(cat, currentLang);
        list.push({
          id: `cat-${cat.id}`,
          type: 'course',
          title: locCat?.name || cat.name,
          subtitle: `${dict.cmd_subject_label} ${locCat?.description || cat.description}`,
          url: localizeHref(`/courses?subject=${encodeURIComponent(cat.name)}`),
          icon: Compass,
        });
      });
      return list;
    }

    matchedCourses.slice(0, 5).forEach((c) => {
      const loc = getLocalizedCourse(c, currentLang);
      list.push({
        id: `course-${c.id}`,
        type: 'course',
        title: loc?.title || c.title_fa,
        subtitle: `${dict.cmd_subject_label} ${loc?.subject || c.subject} • ${loc?.duration || c.duration_fa}`,
        url: localizeHref(`/courses/${c.id}`),
        icon: Headphones,
      });
    });

    matchedBooks.slice(0, 4).forEach((b) => {
      const loc = getLocalizedBook(b, currentLang);
      list.push({
        id: `book-${b.id}`,
        type: 'book',
        title: loc?.title || b.title_fa,
        subtitle: `${dict.cmd_author_label} ${dict.scholar_name}`,
        url: localizeHref(`/books/${b.id}`),
        icon: BookOpen,
      });
    });

    matchedArticles.slice(0, 3).forEach((a) => {
      const loc = getLocalizedArticle(a, currentLang);
      list.push({
        id: `art-${a.id}`,
        type: 'article',
        title: loc?.title || a.title,
        subtitle: `${dict.cmd_subject_label} ${loc?.category || a.category} • ${loc?.readTime || a.readTime}`,
        url: localizeHref(`/articles/${a.slug}`),
        icon: FileText,
      });
    });

    return list;
  }, [q, categories, matchedCourses, matchedBooks, matchedArticles, currentLang, dict, localizeHref]);

  // Arrow key navigation & Enter trigger
  useEffect(() => {
    if (!isOpen || flatItems.length === 0) return;

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatItems[selectedIndex];
        if (selected) {
          router.push(selected.url);
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleArrowKeys);
    return () => window.removeEventListener('keydown', handleArrowKeys);
  }, [isOpen, flatItems, selectedIndex, router]);

  const totalResults = matchedCourses.length + matchedBooks.length + matchedArticles.length;

  // Dynamic counts for footer
  const totalCoursesCount = Object.keys(courses).length;
  const totalChaptersCount = useMemo(() => {
    return Object.values(courses).reduce(
      (acc, c) => acc + (c.chapters?.length || c.episodes_count || 0),
      0
    );
  }, [courses]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4 bg-black/60 backdrop-blur-xs transition-opacity duration-240 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-2xl bg-white dark:bg-[#121316] border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-start flex flex-col max-h-[80vh] transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-240 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-3'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-900/50">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={dict.cmd_search_placeholder}
            className="flex-1 bg-transparent text-sm font-semibold text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono font-semibold bg-stone-200 dark:bg-neutral-800 text-stone-600 dark:text-stone-400 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {q === '' ? (
            /* Quick Suggestions */
            <div className="space-y-3 p-2">
              <span className="text-[11px] font-bold text-stone-400 block">
                {dict.cmd_quick_categories}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat, idx) => {
                  const locCat = getLocalizedCategory(cat, currentLang);
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        router.push(localizeHref(`/courses?subject=${encodeURIComponent(cat.name)}`));
                        handleClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-lg border text-xs font-semibold text-center transition cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-[#8A532B] text-white dark:bg-[#C58B43] dark:text-stone-900 border-[#8A532B] dark:border-[#C58B43] shadow-xs'
                          : 'bg-stone-50 dark:bg-neutral-900 border-stone-200 dark:border-neutral-800 hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {locCat?.name || cat.name}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-neutral-800 text-xs text-stone-500 space-y-1">
                <span className="font-semibold block text-stone-700 dark:text-stone-300">
                  {dict.cmd_search_guide_title}
                </span>
                <p className="leading-relaxed">
                  {dict.cmd_search_guide_text}
                </p>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Search className="w-8 h-8 text-stone-300 dark:text-neutral-700 mx-auto" />
              <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
                {dict.cmd_no_results}
              </p>
              <span className="text-xs text-stone-400">
                {dict.cmd_no_results_sub}
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Courses Results */}
              {matchedCourses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] px-2 block">
                    {dict.cmd_courses_section} ({toLocale(matchedCourses.length)})
                  </span>
                  {matchedCourses.slice(0, 5).map((c) => {
                    const loc = getLocalizedCourse(c, currentLang);
                    const itemIndex = flatItems.findIndex((it) => it.id === `course-${c.id}`);
                    const isSelected = itemIndex === selectedIndex;

                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          router.push(localizeHref(`/courses/${c.id}`));
                          handleClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`p-3 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer group border ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-neutral-800/90 border-[#8A532B]/40 dark:border-[#C58B43]/40'
                            : 'border-transparent hover:bg-stone-50 dark:hover:bg-neutral-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-[#8A532B] text-white dark:bg-[#C58B43] dark:text-stone-900'
                                : 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-stone-200'
                            }`}
                          >
                            <Headphones className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition">
                              {loc?.title || c.title_fa}
                            </h4>
                            <span className="text-[11px] text-stone-400 font-num">
                              {dict.cmd_subject_label} {loc?.subject || c.subject} • {loc?.duration || c.duration_fa}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-stone-200 dark:bg-neutral-700 text-stone-600 dark:text-stone-300">
                              <span>Enter</span>
                              <CornerDownLeft className="w-2.5 h-2.5" />
                            </kbd>
                          )}
                          <ArrowRight className="w-4 h-4 text-stone-400 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition rtl:rotate-180" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Books Results */}
              {matchedBooks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-500 px-2 block">
                    {dict.cmd_books_section} ({toLocale(matchedBooks.length)})
                  </span>
                  {matchedBooks.map((b) => {
                    const loc = getLocalizedBook(b, currentLang);
                    const itemIndex = flatItems.findIndex((it) => it.id === `book-${b.id}`);
                    const isSelected = itemIndex === selectedIndex;

                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          router.push(localizeHref(`/books/${b.id}`));
                          handleClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`p-3 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer group border ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-neutral-800/90 border-[#8A532B]/40 dark:border-[#C58B43]/40'
                            : 'border-transparent hover:bg-stone-50 dark:hover:bg-neutral-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-[#8A532B] text-white dark:bg-[#C58B43] dark:text-stone-900'
                                : 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-stone-200'
                            }`}
                          >
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition">
                              {loc?.title || b.title_fa}
                            </h4>
                            <span className="text-[11px] text-stone-400">
                              {dict.cmd_author_label} {dict.scholar_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-stone-200 dark:bg-neutral-700 text-stone-600 dark:text-stone-300">
                              <span>Enter</span>
                              <CornerDownLeft className="w-2.5 h-2.5" />
                            </kbd>
                          )}
                          <ArrowRight className="w-4 h-4 text-stone-400 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition rtl:rotate-180" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Articles Results */}
              {matchedArticles.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-500 px-2 block">
                    {dict.cmd_articles_section} ({toLocale(matchedArticles.length)})
                  </span>
                  {matchedArticles.map((a) => {
                    const loc = getLocalizedArticle(a, currentLang);
                    const itemIndex = flatItems.findIndex((it) => it.id === `art-${a.id}`);
                    const isSelected = itemIndex === selectedIndex;

                    return (
                      <div
                        key={a.id}
                        onClick={() => {
                          router.push(localizeHref(`/articles/${a.slug}`));
                          handleClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`p-3 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer group border ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-neutral-800/90 border-[#8A532B]/40 dark:border-[#C58B43]/40'
                            : 'border-transparent hover:bg-stone-50 dark:hover:bg-neutral-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-[#8A532B] text-white dark:bg-[#C58B43] dark:text-stone-900'
                                : 'bg-stone-100 dark:bg-neutral-800 text-stone-700 dark:text-stone-200'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition">
                              {loc?.title || a.title}
                            </h4>
                            <span className="text-[11px] text-stone-400 font-num">
                              {dict.cmd_subject_label} {loc?.category || a.category} • {loc?.readTime || a.readTime}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && (
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-stone-200 dark:bg-neutral-700 text-stone-600 dark:text-stone-300">
                              <span>Enter</span>
                              <CornerDownLeft className="w-2.5 h-2.5" />
                            </kbd>
                          )}
                          <ArrowRight className="w-4 h-4 text-stone-400 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition rtl:rotate-180" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* High-Density Editorial Footer info bar */}
        <div className="px-4 py-3 bg-stone-50 dark:bg-neutral-900 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-stone-400 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-neutral-800 font-mono text-[11px] text-stone-600 dark:text-stone-300">↑↓</kbd>
              <span>{dict.cmd_key_nav}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-neutral-800 font-mono text-[11px] text-stone-600 dark:text-stone-300">↵</kbd>
              <span>{dict.cmd_key_enter}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 rounded bg-stone-200 dark:bg-neutral-800 font-mono text-[11px] text-stone-600 dark:text-stone-300">ESC</kbd>
              <span>{dict.cmd_key_esc}</span>
            </span>
          </div>
          <span className="font-num">
            {toLocale(totalCoursesCount)} {dict.courses_count_suffix} • {toLocale(totalChaptersCount)}+ {dict.learn_session_label}
          </span>
        </div>
      </div>
    </div>
  );
};
