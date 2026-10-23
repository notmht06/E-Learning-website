import { SupportedLang, toLocaleDigits, initialCategories } from './data';

/**
 * Universal localized field getter for any entity with _fa, _ar, _en suffixes.
 */
export function getLocalized<T extends Record<string, any>>(
  item: T | null | undefined,
  field: string,
  lang: SupportedLang,
  fallbackLang: SupportedLang = 'fa'
): string {
  if (!item) return '';
  const val = item[`${field}_${lang}`];
  if (val !== undefined && val !== null && val !== '') {
    return String(val);
  }
  const fallbackVal = item[`${field}_${fallbackLang}`];
  if (fallbackVal !== undefined && fallbackVal !== null && fallbackVal !== '') {
    return String(fallbackVal);
  }
  const standardVal = item[field];
  if (standardVal !== undefined && standardVal !== null && standardVal !== '') {
    return String(standardVal);
  }
  return '';
}

/**
 * Convert numbers to localized digits based on the current language.
 * Persian and Arabic use Eastern Arabic numerals; English uses standard Western numerals.
 */
export function formatLocalizedNumber(num: number | string, lang: SupportedLang): string {
  return toLocaleDigits(num, lang);
}

/**
 * Translates subject based on initialCategories definition.
 */
export function getLocalizedSubject(subject: string, lang: SupportedLang): string {
  if (!subject) return '';
  const match = initialCategories.find(
    (c) => c.name === subject || c.name_fa === subject || c.slug === subject || c.id === subject
  );
  if (match) {
    if (lang === 'en' && match.name_en) return match.name_en;
    if (lang === 'ar' && match.name_ar) return match.name_ar;
    return match.name_fa || match.name;
  }
  const subjectMap: Record<string, { en: string; ar: string }> = {
    'منطق': { en: 'Logic', ar: 'المنطق' },
    'فلسفه': { en: 'Philosophy', ar: 'الفلسفة' },
    'فلسفه اسلامی': { en: 'Islamic Philosophy', ar: 'الفلسفة الإسلامية' },
    'کلام': { en: 'Theology', ar: 'علم الكلام' },
    'فقه': { en: 'Jurisprudence', ar: 'الفقه' },
    'اصول': { en: 'Legal Theory', ar: 'أصول الفقه' },
    'اصول فقه': { en: 'Legal Theory', ar: 'أصول الفقه' },
    'تفسیر': { en: 'Quranic Exegesis', ar: 'التفسير' },
    'عرفان': { en: 'Mysticism', ar: 'العرفان' },
    'عرفان نظری': { en: 'Theoretical Mysticism', ar: 'العرفان النظري' },
    'حکمت متعالیه': { en: 'Transcendent Philosophy', ar: 'الحكمة المتعالية' },
    'فلسفه اشراق': { en: 'Illuminationist Philosophy', ar: 'حكمة الإشراق' },
  };
  if (subjectMap[subject]) {
    return lang === 'en' ? subjectMap[subject].en : lang === 'ar' ? subjectMap[subject].ar : subject;
  }
  return subject;
}

/**
 * Translates recurring schedules into English or Arabic.
 */
export function getLocalizedSchedule(schedule: string, lang: SupportedLang): string {
  if (!schedule || lang === 'fa') return schedule || '';
  if (lang === 'en') {
    return schedule
      .replace(/شنبه‌ها و دوشنبه‌ها/g, 'Saturdays & Mondays')
      .replace(/دوشنبه‌ها/g, 'Mondays')
      .replace(/سه‌شنبه‌ها/g, 'Tuesdays')
      .replace(/چهارشنبه‌ها/g, 'Wednesdays')
      .replace(/پنجشنبه‌ها/g, 'Thursdays')
      .replace(/جمعه‌ها/g, 'Fridays')
      .replace(/یکشنبه‌ها/g, 'Sundays')
      .replace(/شنبه/g, 'Saturday')
      .replace(/ساعت/g, 'at')
      .replace(/الی/g, '-')
      .replace(/تا/g, '-')
      .replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
  }
  if (lang === 'ar') {
    return schedule
      .replace(/شنبه‌ها و دوشنبه‌ها/g, 'السبت والإثنين')
      .replace(/دوشنبه‌ها/g, 'أيام الإثنين')
      .replace(/سه‌شنبه‌ها/g, 'أيام الثلاثاء')
      .replace(/چهارشنبه‌ها/g, 'أيام الأربعاء')
      .replace(/پنجشنبه‌ها/g, 'أيام الخميس')
      .replace(/جمعه‌ها/g, 'أيام الجمعة')
      .replace(/یکشنبه‌ها/g, 'أيام الأحد')
      .replace(/شنبه/g, 'السبت')
      .replace(/ساعت/g, 'الساعة')
      .replace(/الی/g, 'إلى')
      .replace(/تا/g, 'إلى')
      .replace(/[۰-۹]/g, (d) => '٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
  }
  return schedule;
}

/**
 * Translates chapter titles when ch.title_en or ch.title_ar is absent.
 */
export function getLocalizedChapterTitle(ch: any, lang: SupportedLang): string {
  const direct = ch?.[`title_${lang}`];
  if (direct && typeof direct === 'string' && direct.trim()) {
    return direct;
  }
  const titleFa: string = ch.title_fa || ch.title || '';
  if (lang === 'fa' || !titleFa) return titleFa;

  if (lang === 'en') {
    return titleFa
      .replace(/^جلسه\s*([۰-۹\d]+)\s*[:：\-]/i, (_, num) => {
        const westernNum = num.replace(/[۰-۹]/g, (d: string) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
        return `Session ${parseInt(westernNum, 10)}:`;
      })
      .replace(/جلسه افتتاحیه[:：]/g, 'Inaugural Session:')
      .replace(/جلسه نخست[:：]/g, 'Session 1:')
      .replace(/جلسه اول[:：]/g, 'Session 1:')
      .replace(/جلسه دوم[:：]/g, 'Session 2:')
      .replace(/جلسه سوم[:：]/g, 'Session 3:');
  }

  if (lang === 'ar') {
    return titleFa
      .replace(/^جلسه\s*([۰-۹\d]+)\s*[:：\-]/i, (_, num) => {
        const arabicNum = num.replace(/[۰-۹]/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
        return `الجلسة ${arabicNum}:`;
      })
      .replace(/جلسه افتتاحیه[:：]/g, 'الجلسة الافتتاحية:')
      .replace(/جلسه نخست[:：]/g, 'الجلسة الأولى:')
      .replace(/جلسه اول[:：]/g, 'الجلسة الأولى:')
      .replace(/جلسه دوم[:：]/g, 'الجلسة الثانية:')
      .replace(/جلسه سوم[:：]/g, 'الجلسة الثالثة:');
  }

  return titleFa;
}

/**
 * Localized representation of a course for clean component rendering.
 */
export function getLocalizedCourse(course: any, lang: SupportedLang) {
  if (!course) return null;
  return {
    id: course.id,
    title: getLocalized(course, 'title', lang),
    desc: getLocalized(course, 'desc', lang),
    instructor: getLocalized(course, 'instructor', lang),
    duration: getLocalized(course, 'duration', lang),
    level: getLocalized(course, 'level', lang),
    price: getLocalized(course, 'price', lang),
    subject: getLocalizedSubject(course.subject, lang),
    course_type: course.course_type,
    episodes_count: course.episodes_count,
    sampleAudioUrl: course.sampleAudioUrl,
    capacity: course.capacity,
    enrolledCount: course.enrolledCount,
    schedule: getLocalizedSchedule(course.schedule, lang),
    chapters: (course.chapters || []).map((ch: any) => ({
      ...ch,
      title: getLocalizedChapterTitle(ch, lang),
      duration: formatLocalizedNumber(ch.duration || '', lang),
    })),
  };
}

/**
 * Localized representation of a category.
 */
export function getLocalizedCategory(category: any, lang: SupportedLang) {
  if (!category) return null;
  return {
    id: category.id,
    slug: category.slug,
    iconName: category.iconName,
    name: getLocalized(category, 'name', lang),
    description: getLocalized(category, 'description', lang),
  };
}

/**
 * Localized representation of a scholarly article.
 */
export function getLocalizedArticle(article: any, lang: SupportedLang) {
  if (!article) return null;
  return {
    id: article.id,
    slug: article.slug,
    title: getLocalized(article, 'title', lang),
    category: getLocalized(article, 'category', lang),
    readTime: getLocalized(article, 'readTime', lang),
    publishDate: getLocalized(article, 'publishDate', lang),
    abstract: getLocalized(article, 'abstract', lang),
    author: getLocalized(article, 'author', lang),
  };
}

/**
 * Localized representation of a book.
 */
export function getLocalizedBook(book: any, lang: SupportedLang) {
  if (!book) return null;
  return {
    id: book.id,
    title: getLocalized(book, 'title', lang),
    author: getLocalized(book, 'author', lang),
    desc: getLocalized(book, 'desc', lang),
    price: getLocalized(book, 'price', lang),
    badge: getLocalized(book, 'badge', lang),
    cover_image: book.cover_image,
    isbn: book.isbn,
    isComingSoon: book.isComingSoon,
    pages: book.pages,
  };
}
