'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookOpen, Bookmark, ExternalLink, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Book } from '@/lib/data';
import { getLocalizedBook, getLocalizedSubject } from '@/lib/localization';
import { triggerTactileHaptic } from '@/lib/haptics';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from '@/components/ui';

interface MasterpieceBookCardProps {
  book: Book;
  onOpenBookReader?: (bookId: string) => void;
  onAddToCart?: (book: Book) => void;
}

export function MasterpieceBookCard({
  book,
  onOpenBookReader,
  onAddToCart,
}: MasterpieceBookCardProps) {
  const { currentLang, toLocale, dict } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const locBook = getLocalizedBook(book, currentLang);
  const title = locBook?.title || book.title_fa;
  const desc = locBook?.desc || book.desc_fa;
  const price = locBook?.price || book.price_fa;
  const bookmarked = isBookmarked(book.id);

  const getFormatBadge = () => {
    switch (book.id) {
      case 'book1':
        return dict.book_format_hardcover || (currentLang === 'en' ? 'Hardcover' : currentLang === 'ar' ? 'غلاف مجلد' : 'جلد سخت (گالینگور)');
      case 'book2':
        return dict.book_format_leather || (currentLang === 'en' ? 'Leather Bound' : currentLang === 'ar' ? 'غلاف جلد' : 'جلد چرم');
      case 'book3':
        return dict.book_format_paperback || (currentLang === 'en' ? 'Paperback' : currentLang === 'ar' ? 'غلاف ورقي' : 'شومیز');
      case 'book4':
      default:
        return dict.book_format_vaziri || (currentLang === 'en' ? 'Gilded Hardcover' : currentLang === 'ar' ? 'طبعة مذهبة' : 'گالینگور طلاکوب');
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('ribbon');
    toggleBookmark(book.id);
  };

  return (
    <Card className="flex flex-col justify-between hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 transition-all duration-200">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="accent" className="text-[11px]">
            {getLocalizedSubject(book.subjectCategory || 'فلسفه', currentLang)}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmarkClick}
            aria-label={dict.action_bookmark || 'نشان‌کردن'}
            className="h-7 w-7 text-zinc-400 hover:text-[#8A532B] dark:hover:text-[#C58B43]"
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-[#8A532B] text-[#8A532B] dark:fill-[#C58B43] dark:text-[#C58B43]' : ''}`} />
          </Button>
        </div>

        <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {desc}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 pb-4 text-xs font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
            {getFormatBadge()}
          </span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{price}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span>{dict.catalog_pages_count || '۳۸۵ صفحه • کاغذ شاموا'}</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onOpenBookReader?.(book.id)}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>{dict.catalog_read_sample || 'نمونه کتاب'}</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onAddToCart?.(book)}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{dict.catalog_buy_now || 'تهیه اثر'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
