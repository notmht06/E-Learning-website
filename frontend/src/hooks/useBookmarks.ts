'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'zan_bookmarks';
const BOOKMARK_EVENT = 'zan_bookmark_change';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const readBookmarks = useCallback((): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (readErr) {
      console.warn('Failed to parse bookmarks from localStorage:', readErr);
      return [];
    }
  }, []);

  useEffect(() => {
    setBookmarks(readBookmarks());
    setIsLoaded(true);

    const handleSync = () => {
      setBookmarks(readBookmarks());
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener(BOOKMARK_EVENT, handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(BOOKMARK_EVENT, handleSync);
    };
  }, [readBookmarks]);

  const persist = useCallback((nextList: string[]) => {
    setBookmarks(nextList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
        window.dispatchEvent(new Event(BOOKMARK_EVENT));
      } catch (err) {
        console.error('Failed to save bookmarks to localStorage', err);
      }
    }
  }, []);

  const isBookmarked = useCallback(
    (id: string): boolean => {
      return bookmarks.includes(id);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            window.dispatchEvent(new Event(BOOKMARK_EVENT));
          } catch (err) {
            console.error('Failed to save bookmarks to localStorage', err);
          }
        }
        return next;
      });
    },
    []
  );

  const addBookmark = useCallback(
    (id: string) => {
      if (!bookmarks.includes(id)) {
        persist([...bookmarks, id]);
      }
    },
    [bookmarks, persist]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      if (bookmarks.includes(id)) {
        persist(bookmarks.filter((item) => item !== id));
      }
    },
    [bookmarks, persist]
  );

  return {
    bookmarks,
    isLoaded,
    isBookmarked,
    toggleBookmark,
    addBookmark,
    removeBookmark,
  };
}
