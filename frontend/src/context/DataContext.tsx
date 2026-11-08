'use client';

import { StageData, roadmapStagesData } from '@/lib/roadmapData';

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


export interface RoadmapFaqItem {
  id: string;
  q: string;
  a: string;
}

export const defaultRoadmapFaqs: RoadmapFaqItem[] = [
  {
    id: 'faq-1',
    q: 'آیا یادگیری منطق برای ورود به فلسفه الزامی است؟',
    a: 'بله، منطق صوری و مادی، ترازوی سنجش تفکر و تشخیص برهان صحیح از مغالطه است. فهم دقیق مفاهیمی چون جنس، فصل، نوع، شرایط انتاج قیاس و برهان لِم و إن در فهم فلسفه اسلامی بنیادین است.',
  },
  {
    id: 'faq-2',
    q: 'چه زمانی می‌توان ورود به اسفار اربعه را آغاز کرد؟',
    a: 'پیش‌نیاز ضروری اسفار اربعه، تسلط بر بدایة الحکمة یا نهایة الحکمة، آشنایی با آراء مشائی ابن‌سینا در نجات و شفا، و منظومه حکمی ملاهادی سبزواری است.',
  },
  {
    id: 'faq-3',
    q: 'نقش علم اصول فقه در منظومه علوم عقلی چیست؟',
    a: 'اصول فقه، آزمایشگاهی توانمند در حوزه معرفت‌شناسی، تحلیل الفاظ و گزاره‌ها، و روش استنباط عقلی است که ذهن را برای تدقیق در غوامض فلسفی به بالاترین آمادگی می‌رساند.',
  },
  {
    id: 'faq-4',
    q: 'آیا مطالعه انفرادی کتب فلسفی بدون استاد راهنما توصیه می‌شود؟',
    a: 'متون فلسفه اسلامی دارای دقایق اصطلاحی و ابعاد برهانی ژرفی هستند که خوانش خودسرانه آن‌ها غالباً به بدفهمی یا مغالطات پیچیده می‌انجامد. تلمذ نزد استاد خبیر برای درک عمق مبانی ضروری است.',
  },
];

export interface AudioChapter {
  id: number;
  title_fa: string;
  title_ar?: string;
  title_en?: string;
  duration: string;
  isFreePreview?: boolean;
  audioUrl?: string;
  videoUrl?: string;
  media_type?: 'audio' | 'video';
}

export interface ExtendedBook extends Book {
  subtitle?: string;
  stock?: number;
  isbn?: string;
  category_fa?: string;
  pageCount?: number;
  pages_count?: number;
  print_edition?: string;
  pdfSampleUrl?: string;
  pdf_sample_url?: string;
  is_coming_soon?: boolean;
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
  siteConfig: Record<string, any>;
  updateSiteConfig: (config: any) => Promise<void>;
  
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

  // Article actions
  addArticle: (article: ScholarlyArticle) => Promise<void>;
  updateArticle: (id: string, partial: Partial<ScholarlyArticle>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;

  // Book actions
  addBook: (book: ExtendedBook) => Promise<void>;
  updateBook: (id: string, partial: Partial<ExtendedBook>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;

  // Order actions
  createOrder: (order: OrderRecord) => void;
  updateOrderTracking: (orderId: string, trackingCode: string, status: 'در حال پردازش' | 'ارسال‌شده' | 'تحویل مشتری') => void;
  
  // DRM actions
  revokeDrmSession: (sessionId: string) => void;

  // Coupon actions
  addCoupon: (coupon: CouponRecord) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;
  // Dynamic Roadmap CMS actions
  roadmapStages: StageData[];
  roadmapFaqs: RoadmapFaqItem[];
  saveRoadmapData: (stages: StageData[], faqs: RoadmapFaqItem[], meta?: { title_fa?: string; subtitle_fa?: string }) => Promise<void>;
  addRoadmapStage: (stage: StageData) => Promise<void>;
  updateRoadmapStage: (id: string, partial: Partial<StageData>) => Promise<void>;
  deleteRoadmapStage: (id: string) => Promise<void>;
  addRoadmapFaq: (faq: Omit<RoadmapFaqItem, 'id'>) => Promise<void>;
  updateRoadmapFaq: (id: string, partial: Partial<RoadmapFaqItem>) => Promise<void>;
  deleteRoadmapFaq: (id: string) => Promise<void>;

}

const initialOrders: OrderRecord[] = [];
const initialDrmSessions: DrmSessionRecord[] = [];
const initialCoupons: CouponRecord[] = [];
const initialAuditLogs: AuditLogRecord[] = [];

const defaultSiteConfig = {
  scholar_name_fa: 'حجت الاسلام دکتر زنجیرزن حسینی',
  scholar_name_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
  scholar_name_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
  hero_title_fa: 'پایگاه تخصصی حکمت اسلامی و علوم عقلی',
  hero_subtitle_fa: 'تحت اشراف و تدریس حجت الاسلام دکتر زنجیرزن حسینی',
  announcement_bar_text: 'آغاز ثبت‌نام دوره جامع حکمت اشراق و اسفار اربعه — سال تحصیلی جدید',
  announcement_bar_active: true,
  bio_fa: 'حجت الاسلام دکتر زنجیرزن حسینی، استاد خارج فقه، اصول، فلسفه و کلام اسلامی، با بیش از دو دهه تدریس در حوزه‌های علمیه و دانشگاه‌های برجسته، به تبیین برهانی معارف الهی اهتمام دارند.',
  stat_years: '+۱۵ سال',
  stat_sessions: '+۴۵۰ جلسه',
  stat_books: '۲۱ دوره',
  stat_students: '+۱,۴۰۰',
  telegram_support: 'https://t.me/Hekkmat7',
  telegram_channel: 'https://t.me/AlNajmosageb313',
  eitaa_channel: 'https://eitaa.com/Hekkmat7',
  skyroom_default_url: 'https://www.skyroom.online/ch/zanjirzan/live',
  roadmap_title_fa: 'سیر مطالعاتی و مراحل علمی',
  roadmap_subtitle_fa: 'نقشه راه جامع و گام‌به‌گام فراگیری علوم عقلی، منطق و حکمت متعالیه تحت اشراف علمی حجت الاسلام دکتر زنجیرزن حسینی',
  footer_copyright_fa: 'تمامی حقوق مادی و معنوی متعلق به پایگاه رسمی حجت الاسلام دکتر زنجیرزن حسینی است.',
  ai_welcome_message: 'سلام! من دستیار هوشمند علمی پایگاه حجت الاسلام دکتر زنجیرزن حسینی هستم. می‌توانید هر پرسشی درباره دروس، کتب و مباحث فلسفی و کلامی بپرسید.',
  suggested_questions: [
    'اصالت وجود در حکمت متعالیه چیست؟',
    'سلسله مراتب انوار در حکمت اشراق',
    'برهان صدیقین در اثبات واجب تعالی',
  ],
  strict_corpus_only: true,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Record<string, AudioCourse>>(coursesDatabase);
  const [categories, setCategories] = useState<CourseCategory[]>(initialCategories);
  const [articles, setArticles] = useState<ScholarlyArticle[]>(scholarlyArticlesDatabase);
  const [siteConfig, setSiteConfig] = useState<Record<string, any>>(defaultSiteConfig);
  const [roadmapStages, setRoadmapStages] = useState<StageData[]>(roadmapStagesData);
  const [roadmapFaqs, setRoadmapFaqs] = useState<RoadmapFaqItem[]>(defaultRoadmapFaqs);
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

        const savedRoadmapStages = localStorage.getItem('zan_roadmap_stages');
        if (savedRoadmapStages) {
          try { setRoadmapStages(JSON.parse(savedRoadmapStages)); } catch(e) {}
        }
        const savedRoadmapFaqs = localStorage.getItem('zan_roadmap_faqs');
        if (savedRoadmapFaqs) {
          try { setRoadmapFaqs(JSON.parse(savedRoadmapFaqs)); } catch(e) {}
        }

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
                        instructor_fa: bc.instructor || 'حجت الاسلام دکتر زنجیرزن حسینی',
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
          // دریافت همگام تنظیمات کلان سایت از API بک‌اند
          apiClient.admin.getConfig()
            .then((cfg: any) => {
              if (cfg && typeof cfg === 'object') {
                setSiteConfig(prev => ({ ...prev, ...cfg }));
              }
            })
            .catch((err) => { console.warn('Failed to fetch site config during hydration:', err); });

          // دریافت همگام مقالات از API بک‌اند
          apiClient.admin.getArticles()
            .then((backendArticles: any) => {
              if (Array.isArray(backendArticles) && backendArticles.length > 0) {
                setArticles(backendArticles);
              }
            })
            .catch((err) => { console.warn('Failed to fetch articles during hydration:', err); });

          // دریافت همگام شاخه‌های علمی از API بک‌اند
          apiClient.admin.getCategories()
            .then((backendCats: any) => {
              if (Array.isArray(backendCats) && backendCats.length > 0) {
                setCategories(backendCats.map((c: any) => ({
                  id: c.id,
                  name: c.name || c.name_fa,
                  name_fa: c.name_fa || c.name,
                  name_ar: c.name_ar || c.name,
                  name_en: c.name_en || c.slug,
                  slug: c.slug,
                  description: c.description || '',
                  description_fa: c.description_fa || c.description || '',
                  description_ar: c.description_ar || '',
                  description_en: c.description_en || '',
                  iconName: c.icon_name || c.iconName || 'Compass',
                  courseCount: c.count || 0,
                })));
              }
            })
            .catch((err) => { console.warn('Failed to fetch categories during hydration:', err); });

          // دریافت همگام کتب از API بک‌اند
          apiClient.books.getAll()
            .then((backendBooks: any) => {
              if (Array.isArray(backendBooks) && backendBooks.length > 0) {
                setBooks(prev => {
                  const merged = { ...prev };
                  for (const b of backendBooks) {
                    if (merged[b.id]) {
                      merged[b.id] = {
                        ...merged[b.id],
                        title_fa: b.title || merged[b.id].title_fa,
                        price_fa: b.price ? `${b.price} تومان` : merged[b.id].price_fa,
                        stock: b.stock !== undefined ? b.stock : merged[b.id].stock,
                        isbn: b.isbn || merged[b.id].isbn,
                        pdfSampleUrl: b.pdf_sample_url || b.sample_pdf_url || merged[b.id].pdfSampleUrl,
                        is_coming_soon: b.is_coming_soon !== undefined ? b.is_coming_soon : merged[b.id].is_coming_soon,
                      };
                    } else if (b.id && b.title) {
                      const base = booksDatabase['book1'] || Object.values(booksDatabase)[0];
                      merged[b.id] = {
                        ...base,
                        id: b.id,
                        title_fa: b.title,
                        title_ar: b.title_ar || b.title,
                        title_en: b.title_en || b.title,
                        subtitle: b.subtitle,
                        author_fa: b.author || 'حجت الاسلام دکتر زنجیرزن حسینی',
                        author_ar: b.author_ar || 'حجة الإسلام الدكتور زنجير زن حسيني',
                        author_en: b.author_en || 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
                        formatCategory: 'کتاب چاپی (گالینگور طلاکوب)',
                        subjectCategory: b.category || 'حکمت متعالیه',
                        desc_fa: b.synopsis || b.description || `کتاب تالیف ${b.author || 'حجت الاسلام دکتر زنجیرزن حسینی'} چاپ‌شده بر روی کاغذ بالکی.`,
                        price_fa: b.price ? `${b.price} تومان` : '۳۵۰,۰۰۰ تومان',
                        price_ar: b.price ? `${b.price} تومان` : '۳۵۰,۰۰۰ تومان',
                        price_en: '$25.00',
                        stock: b.stock || 50,
                        isbn: b.isbn || '978-600-1234-56-7',
                        category_fa: b.category || 'حکمت متعالیه',
                        pageCount: b.pages_count || 320,
                        pdfSampleUrl: b.pdf_sample_url || b.sample_pdf_url,
                        is_coming_soon: Boolean(b.is_coming_soon),
                      };
                    }
                  }
                  return merged;
                });
              }
            })
            .catch((err) => { console.warn('Failed to fetch books during hydration:', err); });
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
        instructor: course.instructor_fa || 'حجت الاسلام دکتر زنجیرزن حسینی',
        level: course.level_fa || 'عمومی',
        hours: course.duration_fa || '۲۰ ساعت',
        price: course.price_fa || 'رایگان',
        description: course.desc_fa || '',
        schedule: course.schedule,
        skyroom_url: course.skyroom_url || course.skyroomUrl,
        course_type: course.course_type,
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

  // Site Config Actions
  const updateSiteConfig = async (newConfig: any) => {
    setSiteConfig(prev => ({ ...prev, ...newConfig }));
    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.updateConfig(newConfig);
      const { toast } = await import('sonner');
      toast.success('تنظیمات پایگاه با موفقیت در سرور ذخیره شد.');
    } catch (err) {
      console.error('Failed to save site config:', err);
      const { toast } = await import('sonner');
      toast.error('خطا در ذخیره تنظیمات در سرور.');
      throw err;
    }
  };
  // Dynamic Roadmap Actions
  const saveRoadmapData = async (
    newStages: StageData[],
    newFaqs: RoadmapFaqItem[],
    meta?: { title_fa?: string; subtitle_fa?: string }
  ) => {
    setRoadmapStages(newStages);
    setRoadmapFaqs(newFaqs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zan_roadmap_stages', JSON.stringify(newStages));
      localStorage.setItem('zan_roadmap_faqs', JSON.stringify(newFaqs));
    }
    const payload: Record<string, any> = {
      roadmap_stages: newStages,
      roadmap_faqs: newFaqs,
    };
    if (meta?.title_fa) payload.roadmap_title_fa = meta.title_fa;
    if (meta?.subtitle_fa) payload.roadmap_subtitle_fa = meta.subtitle_fa;
    await updateSiteConfig(payload);
  };

  const addRoadmapStage = async (stage: StageData) => {
    const updated = [...roadmapStages, stage].sort((a, b) => a.stepNumber - b.stepNumber);
    await saveRoadmapData(updated, roadmapFaqs);
  };

  const updateRoadmapStage = async (id: string, partial: Partial<StageData>) => {
    const updated = roadmapStages
      .map((st) => (st.id === id ? { ...st, ...partial } : st))
      .sort((a, b) => a.stepNumber - b.stepNumber);
    await saveRoadmapData(updated, roadmapFaqs);
  };

  const deleteRoadmapStage = async (id: string) => {
    const updated = roadmapStages.filter((st) => st.id !== id);
    await saveRoadmapData(updated, roadmapFaqs);
  };

  const addRoadmapFaq = async (faq: Omit<RoadmapFaqItem, 'id'>) => {
    const newFaq: RoadmapFaqItem = { id: `faq-${Date.now()}`, ...faq };
    const updated = [...roadmapFaqs, newFaq];
    await saveRoadmapData(roadmapStages, updated);
  };

  const updateRoadmapFaq = async (id: string, partial: Partial<RoadmapFaqItem>) => {
    const updated = roadmapFaqs.map((f) => (f.id === id ? { ...f, ...partial } : f));
    await saveRoadmapData(roadmapStages, updated);
  };

  const deleteRoadmapFaq = async (id: string) => {
    const updated = roadmapFaqs.filter((f) => f.id !== id);
    await saveRoadmapData(roadmapStages, updated);
  };


  // Article Actions
  const addArticle = async (article: ScholarlyArticle) => {
    const updated = [article, ...articles];
    setArticles(updated);
    logAction('افزودن مقاله', `مقاله «${article.title_fa}» افزوده شد.`, 'course');
    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.createArticle({
        title_fa: article.title_fa,
        title_ar: article.title_ar,
        title_en: article.title_en,
        abstract_fa: article.abstract_fa,
        abstract_ar: article.abstract_ar,
        abstract_en: article.abstract_en,
        content_fa: article.content_fa || '',
        category: article.category,
        author: article.author || 'حجت الاسلام دکتر زنجیرزن حسینی',
        pdf_url: article.pdf_url,
        published_at: article.published_at || article.publishDate || new Date().toISOString(),
      });
      const { toast } = await import('sonner');
      toast.success('مقاله پژوهشی با موفقیت در پایگاه داده ثبت شد.');
    } catch (err) {
      console.error('Backend article create failed:', err);
      setArticles(articles);
      const { toast } = await import('sonner');
      toast.error('خطا در ثبت مقاله در سرور.');
      throw err;
    }
  };

  const updateArticle = async (id: string, partial: Partial<ScholarlyArticle>) => {
    const prevArticles = [...articles];
    const updated = articles.map(a => (a.id === id ? { ...a, ...partial } : a));
    setArticles(updated);
    logAction('ویرایش مقاله', `مقاله با شناسه «${id}» ویرایش شد.`, 'course');
    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.updateArticle(id, partial);
      const { toast } = await import('sonner');
      toast.success('مقاله با موفقیت به‌روزرسانی شد.');
    } catch (err) {
      console.error('Backend article update failed:', err);
      setArticles(prevArticles);
      const { toast } = await import('sonner');
      toast.error('خطا در به‌روزرسانی مقاله در سرور.');
      throw err;
    }
  };

  const deleteArticle = async (id: string) => {
    const prevArticles = [...articles];
    const target = articles.find(a => a.id === id);
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    logAction('حذف مقاله', `مقاله «${target?.title_fa || id}» حذف شد.`, 'course');
    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.deleteArticle(id);
      const { toast } = await import('sonner');
      toast.success('مقاله از پایگاه داده حذف شد.');
    } catch (err) {
      console.error('Backend article delete failed:', err);
      setArticles(prevArticles);
      const { toast } = await import('sonner');
      toast.error('خطا در حذف مقاله در سرور.');
      throw err;
    }
  };

  // Book Actions
  const addBook = async (book: ExtendedBook) => {
    const prevBooks = { ...books };
    const updated = { ...books, [book.id]: book };
    saveBooksToStorage(updated);
    logAction('افزودن کتاب جدید', `کتاب «${book.title_fa}» به فهرست آثار انتشارات افزوده شد.`, 'book');

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.createBook({
        id: book.id,
        title: book.title_fa,
        subtitle: book.subtitle,
        author: book.author_fa || 'حجت الاسلام دکتر زنجیرزن حسینی',
        publisher: 'انتشارات حیات',
        print_edition: book.print_edition || 'چاپ اول',
        pages_count: book.pageCount || book.pages_count || 350,
        isbn: book.isbn,
        price: book.price_fa || '۳۵۰,۰۰۰',
        physical_price: book.price_fa || '۳۹۰,۰۰۰',
        stock: book.stock || 50,
        synopsis: book.desc_fa,
        sample_pdf_url: book.pdfSampleUrl || book.pdf_sample_url,
        is_coming_soon: Boolean(book.is_coming_soon),
      });
      const { toast } = await import('sonner');
      toast.success(`کتاب «${book.title_fa}» با موفقیت در پایگاه داده ثبت شد.`);
    } catch (err: any) {
      console.error('Backend createBook failed:', err);
      saveBooksToStorage(prevBooks);
      const { toast } = await import('sonner');
      toast.error('خطا در ثبت کتاب در پایگاه داده.');
      throw err;
    }
  };

  const updateBook = async (id: string, partial: Partial<ExtendedBook>) => {
    if (!books[id]) return;
    const prevBooks = { ...books };
    const updated = { ...books, [id]: { ...books[id], ...partial } };
    saveBooksToStorage(updated);
    logAction('ویرایش کتاب', `مشخصات کتاب «${books[id].title_fa}» به‌روز شد.`, 'book');

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.updateBook(id, {
        title: partial.title_fa,
        subtitle: partial.subtitle,
        author: partial.author_fa,
        price: partial.price_fa,
        stock: partial.stock,
        isbn: partial.isbn,
        pages_count: partial.pageCount || partial.pages_count,
        sample_pdf_url: partial.pdfSampleUrl || partial.pdf_sample_url,
        synopsis: partial.desc_fa,
        is_coming_soon: partial.is_coming_soon,
      });
      const { toast } = await import('sonner');
      toast.success('مشخصات کتاب با موفقیت به‌روزرسانی شد.');
    } catch (err: any) {
      console.error('Backend updateBook failed:', err);
      saveBooksToStorage(prevBooks);
      const { toast } = await import('sonner');
      toast.error('خطا در به‌روزرسانی کتاب در پایگاه داده.');
      throw err;
    }
  };

  const deleteBook = async (id: string) => {
    const prevBooks = { ...books };
    const title = books[id]?.title_fa || id;
    const updated = { ...books };
    delete updated[id];
    saveBooksToStorage(updated);
    logAction('حذف کتاب', `کتاب «${title}» از فهرست آثار انتشارات حذف شد.`, 'book');

    try {
      const { apiClient } = await import('@/services/apiClient');
      await apiClient.admin.deleteBook(id);
      const { toast } = await import('sonner');
      toast.success('کتاب از پایگاه داده حذف شد.');
    } catch (err: any) {
      console.error('Backend deleteBook failed:', err);
      saveBooksToStorage(prevBooks);
      const { toast } = await import('sonner');
      toast.error('خطا در حذف کتاب از پایگاه داده.');
      throw err;
    }
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

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.createCoupon({
        code: coupon.code,
        discount_percent: coupon.discountPercent,
        max_uses: coupon.maxUses,
        active: coupon.isActive,
      }).catch(err => console.debug('Backend createCoupon skipped:', err));
    });
  };

  const toggleCoupon = (code: string) => {
    const updated = coupons.map(c => (c.code === code ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    if (typeof window !== 'undefined') localStorage.setItem('zan_coupons', JSON.stringify(updated));

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.toggleCoupon(code)
        .catch(err => console.debug('Backend toggleCoupon skipped:', err));
    });
  };

  const deleteCoupon = (code: string) => {
    const updated = coupons.filter(c => c.code !== code);
    setCoupons(updated);
    if (typeof window !== 'undefined') localStorage.setItem('zan_coupons', JSON.stringify(updated));
    logAction('حذف کوپن تخفیف', `کوپن ${code} حذف شد.`, 'sale');

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.deleteCoupon(code)
        .catch(err => console.debug('Backend deleteCoupon skipped:', err));
    });
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

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.createCategory({
        id: category.id,
        name: category.name,
        name_fa: category.name_fa,
        name_ar: category.name_ar,
        name_en: category.name_en,
        slug: category.slug,
        description: category.description,
        description_fa: category.description_fa,
        icon_name: category.iconName,
      }).catch(err => console.debug('Backend createCategory skipped:', err));
    });
  };

  const updateCategory = (id: string, partial: Partial<CourseCategory>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...partial } : c);
    saveCategoriesToStorage(updated);
    logAction('ویرایش موضوع', `موضوع با شناسه «${id}» به‌روزرسانی شد.`, 'course');

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.updateCategory(id, partial)
        .catch(err => console.debug('Backend updateCategory skipped:', err));
    });
  };

  const deleteCategory = (id: string) => {
    const target = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    saveCategoriesToStorage(updated);
    logAction('حذف موضوع', `موضوع «${target?.name || id}» از سامانه حذف شد.`, 'course');

    import('@/services/apiClient').then(({ apiClient }) => {
      apiClient.admin.deleteCategory(id)
        .catch(err => console.debug('Backend deleteCategory skipped:', err));
    });
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
        deleteCoupon,
        categories,
        articles,
        siteConfig,
        updateSiteConfig,
        roadmapStages,
        roadmapFaqs,
        saveRoadmapData,
        addRoadmapStage,
        updateRoadmapStage,
        deleteRoadmapStage,
        addRoadmapFaq,
        updateRoadmapFaq,
        deleteRoadmapFaq,

        addArticle,
        updateArticle,
        deleteArticle,
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
