'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Book,
  AudioCourse,
  booksDatabase,
  coursesDatabase,
  CourseCategory,
  initialCategories,
  ScholarlyArticle,
  scholarlyArticlesDatabase,
  COURSE_ID_ALIASES,
} from '@/lib/data';

export interface AudioChapter {
  id: number;
  title_fa: string;
  title_ar?: string;
  title_en?: string;
  duration: string;
  isFreePreview?: boolean;
  audioUrl?: string;
  videoUrl?: string;
  media_type?: 'audio' | 'video' | 'hybrid';
}

export interface ExtendedBook extends Book {
  stock?: number;
  isbn?: string;
  category_fa?: string;
  pageCount?: number;
  pages_count?: number;
  print_edition?: string;
}

export interface OrderRecord {
  id: string;
  customer: string;
  phone: string;
  address?: string;
  postalCode?: string;
  item: string;
  itemType: 'book' | 'course';
  total: string;
  date: string;
  status: 'در حال پردازش' | 'ارسال‌شده' | 'تحویل مشتری';
  trackingCode: string;
}

export interface DrmSessionRecord {
  id: string;
  phone: string;
  courseTitle: string;
  chapterTitle: string;
  ip: string;
  device: string;
  watermarkUid: string;
  startedAt: string;
  status: 'فعال' | 'مسدود‌شده';
}

export interface CouponRecord {
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
  type: 'sale' | 'course' | 'book' | 'security' | 'order';
}

interface DataContextType {
  courses: Record<string, AudioCourse>;
  books: Record<string, ExtendedBook>;
  orders: OrderRecord[];
  drmSessions: DrmSessionRecord[];
  coupons: CouponRecord[];
  auditLogs: AuditLogRecord[];
  categories: CourseCategory[];
  articles: ScholarlyArticle[];
  enrolledOnlineIds: string[];
  
  // Category actions
  addCategory: (category: CourseCategory) => void;
  updateCategory: (id: string, partial: Partial<CourseCategory>) => void;
  deleteCategory: (id: string) => void;
  
  // Online enrollment action
  enrollOnlineCourse: (courseId: string) => boolean;
  
  // Course actions
  addCourse: (course: AudioCourse) => Promise<void>;
  updateCourse: (id: string, partial: Partial<AudioCourse>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addEpisode: (courseId: string, chapter: AudioChapter) => Promise<void>;
  updateEpisode: (courseId: string, chapterId: number, partial: Partial<AudioChapter>) => Promise<void>;
  deleteEpisode: (courseId: string, chapterId: number) => Promise<void>;

  // Book actions
  addBook: (book: ExtendedBook) => void;
  updateBook: (id: string, partial: Partial<ExtendedBook>) => void;
  deleteBook: (id: string) => void;

  // Order actions
  createOrder: (order: OrderRecord) => void;
  updateOrderTracking: (orderId: string, trackingCode: string, status: 'در حال پردازش' | 'ارسال‌شده' | 'تحویل مشتری') => void;
  
  // DRM actions
  revokeDrmSession: (sessionId: string) => void;

  // Coupon actions
  addCoupon: (coupon: CouponRecord) => void;
  toggleCoupon: (code: string) => void;
}

const initialOrders: OrderRecord[] = [];
const initialDrmSessions: DrmSessionRecord[] = [];
const initialCoupons: CouponRecord[] = [];
const initialAuditLogs: AuditLogRecord[] = [];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Record<string, AudioCourse>>(coursesDatabase);
  const [categories, setCategories] = useState<CourseCategory[]>(initialCategories);
  const [articles] = useState<ScholarlyArticle[]>(scholarlyArticlesDatabase);
  const [enrolledOnlineIds, setEnrolledOnlineIds] = useState<string[]>([]);
  const [books, setBooks] = useState<Record<string, ExtendedBook>>(() => {
    const initial: Record<string, ExtendedBook> = {};
    for (const [key, b] of Object.entries(booksDatabase)) {
      initial[key] = {
        ...b,
        stock: key === 'book1' ? 34 : key === 'book2' ? 12 : key === 'book3' ? 8 : 45,
        isbn: key === 'book1' ? '978-600-1234-56-7' : key === 'book2' ? '978-600-2345-67-8' : key === 'book3' ? '978-600-3456-78-9' : '978-600-4567-89-0',
        category_fa: key === 'book1' ? 'حکمت متعالیه' : key === 'book2' ? 'حکمت اشراق' : key === 'book3' ? 'هستی‌شناسی' : 'فلسفه تطبیقی',
        pageCount: key === 'book1' ? 480 : key === 'book2' ? 560 : key === 'book3' ? 340 : 420,
      };
    }
    return initial;
  });

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [drmSessions, setDrmSessions] = useState<DrmSessionRecord[]>([]);
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  // Hydrate from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCourses = localStorage.getItem('zan_courses');
        if (savedCourses) setCourses({ ...coursesDatabase, ...JSON.parse(savedCourses) });

        const savedBooks = localStorage.getItem('zan_books');
        if (savedBooks) setBooks(JSON.parse(savedBooks));

        const savedOrders = localStorage.getItem('zan_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));

        const savedCoupons = localStorage.getItem('zan_coupons');
        if (savedCoupons) setCoupons(JSON.parse(savedCoupons));

        const savedCategories = localStorage.getItem('zan_categories');
        if (savedCategories) setCategories(JSON.parse(savedCategories));

        const savedOnlineEnrolls = localStorage.getItem('zan_enrolled_online');
        if (savedOnlineEnrolls) setEnrolledOnlineIds(JSON.parse(savedOnlineEnrolls));

        // دریافت همگام فهرست دروس از API بک‌اند بدون خفه‌سازی خاموش
        import('@/services/apiClient').then(({ apiClient }) => {
          apiClient.courses.getAll()
            .then((backendCourses: any) => {
              if (Array.isArray(backendCourses) && backendCourses.length > 0) {
                setCourses(prev => {
                  const merged = { ...prev };
                  for (const bc of backendCourses) {
                    const canonicalId = COURSE_ID_ALIASES[bc.id] || bc.id;
                    const existingKey = merged[canonicalId] ? canonicalId : (merged[bc.id] ? bc.id : null);
                    if (existingKey) {
                      merged[existingKey] = {
                        ...merged[existingKey],
                        title_fa: bc.title || merged[existingKey].title_fa,
                        episodes_count: bc.sessions_count || merged[existingKey].episodes_count,
                        duration_fa: bc.hours || merged[existingKey].duration_fa,
                        level_fa: bc.level || merged[existingKey].level_fa,
                        price_fa: bc.price || merged[existingKey].price_fa,
                      };

                    } else if (bc.id && bc.title) {
                      merged[bc.id] = {
                        id: bc.id,
                        title_fa: bc.title,
                        title_ar: bc.title_ar || bc.title,
                        title_en: bc.title_en || bc.title,
                        desc_fa: bc.description || '',
                        desc_ar: bc.description_ar || bc.description || '',
                        desc_en: bc.description_en || bc.description || '',
                        instructor_fa: bc.instructor || 'حجت الاسلام دکتر زنجیر زن حسینی',
                        instructor_ar: bc.instructor_ar || 'حجة الإسلام الدكتور زنجير زن حسيني',
                        instructor_en: bc.instructor_en || 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
                        episodes_count: bc.sessions_count || (bc.syllabus ? bc.syllabus.length : 1),
                        duration_fa: bc.hours || '۲۰ ساعت',
                        duration_ar: bc.hours_ar || '٢٠ ساعة',
                        duration_en: bc.hours_en || '20 Hours',
                        level_fa: bc.level || 'سطح عالی',
                        level_ar: bc.level_ar || 'مستوى عالٍ',
                        level_en: bc.level_en || 'Advanced',
                        price_fa: bc.price || 'رایگان',
                        price_ar: bc.price_ar || 'مجاني',
                        price_en: bc.price_en || 'Free',
                        sampleAudioUrl: '/audio/sample_lecture.wav',
                        course_type: bc.course_type || 'offline',
                        subject: (bc.tags && bc.tags[0]) || 'فلسفه',
                        chapters: Array.isArray(bc.syllabus)
                          ? bc.syllabus.map((s: any, idx: number) => ({
                              id: s.id || idx + 1,
                              title_fa: s.title || `جلسه ${idx + 1}`,
                              title_ar: s.title_ar,
                              title_en: s.title_en,
                              duration: s.duration || '۴۵:۰۰',
                              isFreePreview: Boolean(s.is_preview),
                              audioUrl: s.audio_stream_url || '/audio/sample_lecture.wav',
                            }))
                          : [],
                      };
                    }
                  }
                  return merged;
                });
              }
            })
            .catch((err) => { console.warn('Failed to fetch courses during hydration:', err); });

          // دریافت همگام کوپن‌های فعال سامانه از API بک‌اند
          apiClient.coupons.getAll()
            .then((couponsList: any) => {
              if (Array.isArray(couponsList) && couponsList.length > 0) {
                setCoupons(couponsList.map((c: any) => ({
                  code: c.code,
                  discountPercent: c.discount_percent,
                  maxUses: 100,
                  usedCount: 0,
                  expiresAt: c.expires_at ? c.expires_at.split('T')[0] : '۱۴۰۴/۱۲/۲۹',
                  isActive: c.active !== false,
                })));
              }
            })
            .catch((err) => { console.warn('Failed to fetch coupons during hydration:', err); });
        });
      } catch (err) {
        console.error('Error hydrating DataContext:', err);
      }
    }
  }, []);

  // Sync mutations to localStorage
  const saveCoursesToStorage = (updated: Record<string, AudioCourse>) => {
    setCourses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zan_courses', JSON.stringify(updated));
    }
  };

  const saveBooksToStorage = (updated: Record<string, ExtendedBook>) => {
    setBooks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zan_books', JSON.stringify(updated));
    }
  };

  const saveOrdersToStorage = (updated: OrderRecord[]) => {
    setOrders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zan_orders', JSON.stringify(updated));
    }
  };

  const logAction = (action: string, details: string, type: AuditLogRecord['type']) => {
    const newLog: AuditLogRecord = {
      id: `log-${Date.now()}`,
      timestamp: 'هم‌اکنون',
      action,
      details,
      user: 'مدیر سامانه',
      type,
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 15)]);
  };

  // Course Actions
  const addCourse = async (course: AudioCourse) => {
    const prevCourses = { ...courses };
    const updated = { ...courses, [course.id]: course };
    saveCoursesToStorage(updated);
    logAction('ایجاد دوره جدید', `دوره «${course.title_fa}» با موفقیت افزوده شد.`, 'course');

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.createCourse({
        title: course.title_fa,
        instructor: course.instructor_fa || 'حجت الاسلام دکتر زنجیر زن حسینی',
        level: course.level_fa || 'عمومی',
        hours: course.duration_fa || '۲۰ ساعت',
        price: course.price_fa || 'رایگان',
        description: course.desc_fa || '',
      });
      const { toast } = await import('sonner');
      toast.success(`دوره «${course.title_fa}» با موفقیت در پایگاه داده ثبت شد.`);
    } catch (err: any) {
      console.error('Backend course create failed:', err);
      saveCoursesToStorage(prevCourses);
      const { toast } = await import('sonner');
      toast.error('خطا در ثبت دوره در سرور. تغییرات بازگردانی شد.');
      throw err;
    }
  };

  const updateCourse = async (id: string, partial: Partial<AudioCourse>) => {
    if (!courses[id]) return;
    const prevCourses = { ...courses };
    const updated = {
      ...courses,
      [id]: { ...courses[id], ...partial },
    };
    saveCoursesToStorage(updated);
    logAction('ویرایش دوره', `اطلاعات دوره «${courses[id].title_fa}» به‌روزرسانی شد.`, 'course');

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.updateCourse(id, partial);
      const { toast } = await import('sonner');
      toast.success('مشخصات دوره با موفقیت به‌روزرسانی شد.');
    } catch (err: any) {
      console.error('Backend course update failed:', err);
      saveCoursesToStorage(prevCourses);
      const { toast } = await import('sonner');
      toast.error('خطا در به‌روزرسانی مشخصات دوره در سرور.');
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    const title = courses[id]?.title_fa || id;
    const prevCourses = { ...courses };
    const updated = { ...courses };
    delete updated[id];
    saveCoursesToStorage(updated);
    logAction('حذف دوره', `دوره «${title}» از سیستم حذف شد.`, 'course');

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.deleteCourse(id);
      const { toast } = await import('sonner');
      toast.success(`دوره «${title}» با موفقیت از پایگاه داده حذف شد.`);
    } catch (err: any) {
      console.error('Backend course delete failed:', err);
      saveCoursesToStorage(prevCourses);
      const { toast } = await import('sonner');
      toast.error('خطا در حذف دوره از سرور.');
      throw err;
    }
  };

  const addEpisode = async (courseId: string, chapter: AudioChapter) => {
    const course = courses[courseId];
    if (!course) return;

    const prevCourses = { ...courses };
    const newChapters = [...course.chapters, chapter];
    const updatedCourse: AudioCourse = {
      ...course,
      episodes_count: newChapters.length,
      chapters: newChapters,
    };
    const updated = { ...courses, [courseId]: updatedCourse };
    saveCoursesToStorage(updated);
    logAction('افزودن جلسه صوتی', `جلسه «${chapter.title_fa}» به دوره «${course.title_fa}» اضافه شد.`, 'course');

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.addChapter(courseId, chapter);
      const { toast } = await import('sonner');
      toast.success(`جلسه «${chapter.title_fa}» به استودیو افزوده شد.`);
    } catch (err: any) {
      console.error('Backend addChapter failed:', err);
      saveCoursesToStorage(prevCourses);
      const { toast } = await import('sonner');
      toast.error('خطا در ثبت جلسه در سرور.');
      throw err;
    }
  };

  const updateEpisode = async (courseId: string, chapterId: number, partial: Partial<AudioChapter>) => {
    const course = courses[courseId];
    if (!course) return;

    const prevCourses = { ...courses };
    const newChapters = course.chapters.map(ch => (ch.id === chapterId ? { ...ch, ...partial } : ch));
    const updatedCourse: AudioCourse = { ...course, chapters: newChapters };
    const updated = { ...courses, [courseId]: updatedCourse };
    saveCoursesToStorage(updated);

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.updateChapter(courseId, chapterId, partial);
      const { toast } = await import('sonner');
      toast.success('اطلاعات جلسه به‌روزرسانی شد.');
    } catch (err: any) {
      console.error('Backend updateChapter failed:', err);
      saveCoursesToStorage(prevCourses);
      const { toast } = await import('sonner');
      toast.error('خطا در به‌روزرسانی جلسه در سرور.');
      throw err;
    }
  };

  const deleteEpisode = async (courseId: string, chapterId: number) => {
    const course = courses[courseId];
    if (!course) return;

    const prevCourses = { ...courses };
    const newChapters = course.chapters.filter(ch => ch.id !== chapterId);
    const updatedCourse: AudioCourse = {
      ...course,
      episodes_count: newChapters.length,
      chapters: newChapters,
    };
    const updated = { ...courses, [courseId]: updatedCourse };
    saveCoursesToStorage(updated);
    logAction('حذف جلسه صوتی', `یک جلسه صوتی از دوره «${course.title_fa}» حذف شد.`, 'course');

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.deleteChapter(courseId, chapterId);
      const { toast } = await import('sonner');
      toast.success('جلسه صوتی با موفقیت حذف شد.');
    } catch (err: any) {
      console.error('Backend deleteChapter failed:', err);
      saveCoursesToStorage(prevCourses);
      const { toast } = await import('sonner');
      toast.error('خطا در حذف جلسه از سرور.');
      throw err;
    }
  };

  // Book Actions
  const addBook = (book: ExtendedBook) => {
    const updated = { ...books, [book.id]: book };
    saveBooksToStorage(updated);
    logAction('افزودن کتاب جدید', `کتاب «${book.title_fa}» به فهرست آثار انتشارات افزوده شد.`, 'book');

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.updateBook(book.id, book)
        .catch(err => console.debug('Backend addBook sync skipped or failed:', err));
    });
  };

  const updateBook = (id: string, partial: Partial<ExtendedBook>) => {
    if (!books[id]) return;
    const updated = { ...books, [id]: { ...books[id], ...partial } };
    saveBooksToStorage(updated);
    logAction('ویرایش کتاب', `مشخصات کتاب «${books[id].title_fa}» به‌روز شد.`, 'book');

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.updateBook(id, partial)
        .catch(err => console.debug('Backend updateBook sync skipped or failed:', err));
    });
  };

  const deleteBook = (id: string) => {
    const title = books[id]?.title_fa || id;
    const updated = { ...books };
    delete updated[id];
    saveBooksToStorage(updated);
    logAction('حذف کتاب', `کتاب «${title}» از فهرست آثار انتشارات حذف شد.`, 'book');
  };

  // Order Actions
  const createOrder = (order: OrderRecord) => {
    const updated = [order, ...orders];
    saveOrdersToStorage(updated);
    logAction('ثبت سفارش جدید', `سفارش جدید ${order.id} برای «${order.customer}» به ارزش ${order.total} با موفقیت ثبت شد.`, 'order');
  };

  const updateOrderTracking = (orderId: string, trackingCode: string, status: 'در حال پردازش' | 'ارسال‌شده' | 'تحویل مشتری') => {
    const updated = orders.map(o => (o.id === orderId ? { ...o, trackingCode, status } : o));
    saveOrdersToStorage(updated);
    logAction('به‌روزرسانی سفارش پستی', `کد رهگیری پستی سفارش ${orderId} به «${trackingCode}» تغییر یافت.`, 'order');

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.updateOrderStatus(orderId, status, trackingCode)
        .catch(err => console.debug('Backend updateOrderStatus skipped or failed:', err));
    });
  };

  // DRM Actions
  const revokeDrmSession = (sessionId: string) => {
    setDrmSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, status: 'مسدود‌شده' } : s))
    );
    logAction('قطع اتصال نشست', `اتصال پخش آنلاین نشست ${sessionId} متوقف شد.`, 'security');
  };

  // Coupon Actions
  const addCoupon = (coupon: CouponRecord) => {
    const updated = [coupon, ...coupons];
    setCoupons(updated);
    if (typeof window !== 'undefined') localStorage.setItem('zan_coupons', JSON.stringify(updated));
    logAction('ایجاد کوپن تخفیف', `کد تخفیف ${coupon.code} با ${coupon.discountPercent}٪ تخفیف فعال شد.`, 'sale');
  };

  const toggleCoupon = (code: string) => {
    const updated = coupons.map(c => (c.code === code ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    if (typeof window !== 'undefined') localStorage.setItem('zan_coupons', JSON.stringify(updated));
  };

  // Category Actions
  const saveCategoriesToStorage = (updated: CourseCategory[]) => {
    setCategories(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zan_categories', JSON.stringify(updated));
    }
  };

  const addCategory = (category: CourseCategory) => {
    const updated = [...categories, category];
    saveCategoriesToStorage(updated);
    logAction('افزودن موضوع جدید', `موضوع «${category.name}» با موفقیت افزوده شد.`, 'course');
  };

  const updateCategory = (id: string, partial: Partial<CourseCategory>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...partial } : c);
    saveCategoriesToStorage(updated);
    logAction('ویرایش موضوع', `موضوع با شناسه «${id}» به‌روزرسانی شد.`, 'course');
  };

  const deleteCategory = (id: string) => {
    const target = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    saveCategoriesToStorage(updated);
    logAction('حذف موضوع', `موضوع «${target?.name || id}» از سامانه حذف شد.`, 'course');
  };

  // Online Course Enrollment Action
  const enrollOnlineCourse = (courseId: string): boolean => {
    const course = courses[courseId];
    if (!course || course.course_type !== 'online') return false;
    const capacity = course.capacity || 30;
    const currentEnrolled = course.enrolledCount || 0;
    if (currentEnrolled >= capacity) return false;

    if (!enrolledOnlineIds.includes(courseId)) {
      const newEnrolled = currentEnrolled + 1;
      const updatedCourse: AudioCourse = {
        ...course,
        enrolledCount: newEnrolled,
        status: newEnrolled >= capacity ? 'capacity_full' : 'registration_open'
      };
      const updatedCourses = { ...courses, [courseId]: updatedCourse };
      saveCoursesToStorage(updatedCourses);

      const newEnrolledIds = [...enrolledOnlineIds, courseId];
      setEnrolledOnlineIds(newEnrolledIds);
      if (typeof window !== 'undefined') {
        localStorage.setItem('zan_enrolled_online', JSON.stringify(newEnrolledIds));
      }
      logAction('ثبت‌نام دوره آنلاین', `یک صندلی در کلاس آنلاین «${course.title_fa}» با موفقیت رزرو شد.`, 'course');
    }
    return true;
  };

  return (
    <DataContext.Provider
      value={{
        courses,
        books,
        orders,
        drmSessions,
        coupons,
        auditLogs,
        addCourse,
        updateCourse,
        deleteCourse,
        addEpisode,
        updateEpisode,
        deleteEpisode,
        addBook,
        updateBook,
        deleteBook,
        createOrder,
        updateOrderTracking,
        revokeDrmSession,
        addCoupon,
        toggleCoupon,
        categories,
        articles,
        enrolledOnlineIds,
        addCategory,
        updateCategory,
        deleteCategory,
        enrollOnlineCourse,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
