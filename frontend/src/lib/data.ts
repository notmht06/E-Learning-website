// Data Store & Multilingual Content for Hojjat al-Islam Dr. Zanjirzan Hosseini Platform

import type { SupportedLang } from '@/locales';

export interface PageData {
  r_header: string;
  r_num: number;
  r_body: string;
  l_header: string;
  l_num: number;
  l_body: string;
}

export interface Book {
  id: string;
  title_fa: string;
  title_ar: string;
  title_en: string;
  author_fa?: string;
  author_ar?: string;
  author_en?: string;
  formatCategory?: string;
  subjectCategory?: string;
  desc_fa: string;
  desc_ar: string;
  desc_en: string;
  price_fa: string;
  price_ar: string;
  price_en: string;
  badge_fa: string;
  badge_ar: string;
  badge_en: string;
  coverGradient: string;
  coverBorder: string;
  ribbonClass: string;
  leatherTexture: string;
  motif: string;
  cover_image?: string;
  isbn?: string;
  isComingSoon?: boolean;
  pages: {
    [pageNum: number]: {
      fa: PageData;
      ar: PageData;
      en: PageData;
    };
  };
}

export interface CourseCategory {
  id: string;
  name: string;
  name_fa?: string;
  name_ar?: string;
  name_en?: string;
  slug: string;
  description: string;
  description_fa?: string;
  description_ar?: string;
  description_en?: string;
  iconName: string;
  courseCount?: number;
}

export const initialCategories: CourseCategory[] = [
  {
    id: 'cat-mantiq',
    name: 'منطق',
    name_fa: 'منطق',
    name_ar: 'المنطق',
    name_en: 'Logic',
    slug: 'mantiq',
    description: 'مبادی تفکر عقلانی، منطق صوری و مادی، نقد مغالطات و صناعات خمس',
    description_fa: 'مبادی تفکر عقلانی، منطق صوری و مادی، نقد مغالطات و صناعات خمس',
    description_ar: 'مبادئ التفكير العقلاني، المنطق الصوري والمادي، ونقد المغالطات',
    description_en: 'Foundations of rational thought, formal & material logic, fallacies & the Five Arts',
    iconName: 'Brain',
  },
  {
    id: 'cat-falsafe',
    name: 'فلسفه',
    name_fa: 'فلسفه',
    name_ar: 'الفلسفة',
    name_en: 'Philosophy',
    slug: 'falsafe',
    description: 'حکمت مشاء، اشراق، حکمت متعالیه، بدایه، نهایه، اسفار اربعه و فلسفه غرب',
    description_fa: 'حکمت مشاء، اشراق، حکمت متعالیه، بدایه، نهایه، اسفار اربعه و فلسفه غرب',
    description_ar: 'الحكمة المشائية والإشراقية والمتعالية، الأسفار الأربعة ونقد الفلسفة الغربية',
    description_en: 'Peripatetic, Illuminationist, & Transcendent Philosophy, Asfar & Western thought',
    iconName: 'Compass',
  },
  {
    id: 'cat-fiqh',
    name: 'فقه',
    name_fa: 'فقه',
    name_ar: 'الفقه الاستدلالي',
    name_en: 'Jurisprudence',
    slug: 'fiqh',
    description: 'فقه استدلالی، مکاسب محرمه، شروط المتعاقدین و احکام معاملات',
    description_fa: 'فقه استدلالی، مکاسب محرمه، شروط المتعاقدین و احکام معاملات',
    description_ar: 'الفقه الاستدلالي المقارن، المكاسب المحرمة، وأحكام المعاملات',
    description_en: 'Analytical Islamic jurisprudence, commercial law, & contractual principles',
    iconName: 'Scale',
  },
  {
    id: 'cat-osul',
    name: 'اصول',
    name_fa: 'اصول',
    name_ar: 'أصول الفقه',
    name_en: 'Legal Theory (Usul)',
    slug: 'osul',
    description: 'اصول فقه تراز اجتهادی، فرائد الاصول (رسائل)، کفایة الاصول و حلقات شهید صدر',
    description_fa: 'اصول فقه تراز اجتهادی، فرائد الاصول (رسائل)، کفایة الاصول و حلقات شهید صدر',
    description_ar: 'أصول الفقه الاجتهادي، فرائد الأصول، كفاية الأصول وحلقات الشهيد الصدر',
    description_en: 'Analytical methodology of deduction, Faraed, Kifayah, & Sadrian discourses',
    iconName: 'Scroll',
  },
  {
    id: 'cat-tafsir',
    name: 'تفسیر',
    name_fa: 'تفسیر',
    name_ar: 'التفسير العقلي',
    name_en: 'Exegesis (Tafsir)',
    slug: 'tafsir',
    description: 'تفسیر عقلی و انفسی قرآن کریم، تفسیر ملاصدرا بر سوره حمد و سوره بقره',
    description_fa: 'تفسیر عقلی و انفسی قرآن کریم، تفسیر ملاصدرا بر سوره حمد و سوره بقره',
    description_ar: 'التفسير العقلي والأنفسي للقرآن الكريم وتفسير صدر المتألهين',
    description_en: 'Rational and spiritual Quranic exegesis, Mulla Sadra’s philosophical commentaries',
    iconName: 'BookOpen',
  },
  {
    id: 'cat-kalam',
    name: 'کلام',
    name_fa: 'کلام',
    name_ar: 'علم الكلام',
    name_en: 'Theology (Kalam)',
    slug: 'kalam',
    description: 'کلام استدلالی، تجرید الاعتقاد نصیرالدین طوسی، کشف المراد علامه حلی',
    description_fa: 'کلام استدلالی، تجرید الاعتقاد نصیرالدین طوسی، کشف المراد علامه حلی',
    description_ar: 'الكلام الاستدلالي، تجريد الاعتقاد وكشف المراد في أصول العقائد',
    description_en: 'Rational Islamic theology, Tajrid al-Itiqad & foundational dogmatics',
    iconName: 'ShieldCheck',
  },
  {
    id: 'cat-erfan-nazari',
    name: 'عرفان نظری',
    name_fa: 'عرفان نظری',
    name_ar: 'العرفان النظري',
    name_en: 'Theoretical Mysticism',
    slug: 'erfan-nazari',
    description: 'مبانی عرفان، تمهید القواعد ابن‌ترکه، فصوص الحکم ابن‌عربی و مقدمه قیصری',
    description_fa: 'مبانی عرفان، تمهید القواعد ابن‌ترکه، فصوص الحکم ابن‌عربی و مقدمه قیصری',
    description_ar: 'أصول العرفان النظري، تمهيد القواعد، فصوص الحكم وشرح القيصري',
    description_en: 'Foundations of theoretical mysticism, Fusus al-Hikam, & ontological unity',
    iconName: 'Sparkles',
  },
  {
    id: 'cat-erfan-amali',
    name: 'عرفان عملی',
    name_fa: 'عرفان عملی',
    name_ar: 'العرفان العملي والسلوك',
    name_en: 'Practical Spiritual Wayfaring',
    slug: 'erfan-amali',
    description: 'سلوک الی الله، منازل السائرین خواجه عبدالله انصاری و اوصاف الاشراف',
    description_fa: 'سلوک الی الله، منازل السائرین خواجه عبدالله انصاری و اوصاف الاشراف',
    description_ar: 'السير والسلوك إلى الله، منازل السائرين وأوصاف الأشراف',
    description_en: 'Spiritual wayfaring, Manazil al-Sairin, & internal moral purification',
    iconName: 'HeartHandshake',
  },
];

export interface ScholarlyArticle {
  id: string;
  title: string;
  title_fa?: string;
  title_ar?: string;
  title_en?: string;
  category: string;
  category_fa?: string;
  category_ar?: string;
  category_en?: string;
  readTime: string;
  readTime_fa?: string;
  readTime_ar?: string;
  readTime_en?: string;
  publishDate: string;
  publishDate_fa?: string;
  publishDate_ar?: string;
  publishDate_en?: string;
  abstract: string;
  abstract_fa?: string;
  abstract_ar?: string;
  abstract_en?: string;
  author: string;
  slug: string;
}

export const scholarlyArticlesDatabase: ScholarlyArticle[] = [
  {
    id: 'art-1',
    title: 'اصالت وجود و برهان صدیقین: بازخوانی استدلال ملاصدرا در تراز معرفت‌شناسی تطبیقی',
    title_fa: 'اصالت وجود و برهان صدیقین: بازخوانی استدلال ملاصدرا در تراز معرفت‌شناسی تطبیقی',
    title_ar: 'أصالة الوجود وبرهان الصديقين: قراءة استدلال الملا صدرا في ميزان المعرفة المقارنة',
    title_en: 'Primacy of Existence & the Proof of the Sincere: Sadrian Argument in Comparative Epistemology',
    category: 'فلسفه',
    category_fa: 'فلسفه',
    category_ar: 'الفلسفة',
    category_en: 'Philosophy',
    readTime: '۱۵ دقیقه مطالعه',
    readTime_fa: '۱۵ دقیقه مطالعه',
    readTime_ar: '١٥ دقيقة قراءة',
    readTime_en: '15 min read',
    publishDate: 'شهریور ۱۴۰۳',
    publishDate_fa: 'شهریور ۱۴۰۳',
    publishDate_ar: 'صفر ١٤٤٦',
    publishDate_en: 'September 2024',
    abstract: 'این مقاله به بررسی برهان صدیقین بر اصالت و وحدت وجود پرداخته و تمایزات بنیادین تلقی صدرایی از مفهوم و حقیقت هستی را در مقایسه با تلقی‌های مشائی و کلامی تحلیل می‌کند.',
    abstract_fa: 'این مقاله به بررسی برهان صدیقین بر اصالت و وحدت وجود پرداخته و تمایزات بنیادین تلقی صدرایی از مفهوم و حقیقت هستی را در مقایسه با تلقی‌های مشائی و کلامی تحلیل می‌کند.',
    abstract_ar: 'يبحث هذا المقال في برهان الصديقين على أصالة الوجود ووحدته، محللاً الفوارق الجوهرية بين الرؤية الصدرائية والاتجاهات المشائية والكلامية.',
    abstract_en: 'An analytical re-examination of the Burhan al-Siddiqin regarding the fundamentality of existence, contrasting Sadrian ontology with Peripatetic and Theological views.',
    author: 'حجت الاسلام دکتر زنجیر زن حسینی',
    slug: 'aslat-vojood-seddiqin',
  },
  {
    id: 'art-2',
    title: 'نورالانوار و مراتب اشراق: تحلیل هندسه وجودی شیخ شهاب‌الدین سهروردی',
    title_fa: 'نورالانوار و مراتب اشراق: تحلیل هندسه وجودی شیخ شهاب‌الدین سهروردی',
    title_ar: 'نور الأنوار ومراتب الإشراق: تحليل الهندسة الوجودية للشيخ شهاب الدين السهروردي',
    title_en: 'The Light of Lights & Illuminationist Gradiation: Ontological Geometry of Suhrawardi',
    category: 'فلسفه',
    category_fa: 'فلسفه',
    category_ar: 'الفلسفة',
    category_en: 'Philosophy',
    readTime: '۱۲ دقیقه مطالعه',
    readTime_fa: '۱۲ دقیقه مطالعه',
    readTime_ar: '١٢ دقيقة قراءة',
    readTime_en: '12 min read',
    publishDate: 'مرداد ۱۴۰۳',
    publishDate_fa: 'مرداد ۱۴۰۳',
    publishDate_ar: 'محرم ١٤٤٦',
    publishDate_en: 'August 2024',
    abstract: 'پژوهشی در ساختار نظام اشراقی، انوار قاهره و اسفهبدیه و نسبت آنها با نورالانوار و مقایسه آن با نظریه عقول ده‌گانه سینوی.',
    abstract_fa: 'پژوهشی در ساختار نظام اشراقی، انوار قاهره و اسفهبدیه و نسبت آنها با نورالانوار و مقایسه آن با نظریه عقول ده‌گانه سینوی.',
    abstract_ar: 'دراسة في بنية النظام الإشراقي، الأنوار القاهرة والإسفهبدية ونسبتها إلى نور الأنوار ومقارنتها بنظرية العقول العشرة السينوية.',
    abstract_en: 'A treatise on the Illuminationist hierarchy, Dominant and Regent Lights in relation to the Nur al-Anwar compared to Avicennian intellects.',
    author: 'حجت الاسلام دکتر زنجیر زن حسینی',
    slug: 'noor-al-anwar-ishraq',
  },
  {
    id: 'art-3',
    title: 'روش‌شناسی صناعت برهان در منطق صوری و تفکیک آن از مغالطات رایج معاصر',
    title_fa: 'روش‌شناسی صناعت برهان در منطق صوری و تفکیک آن از مغالطات رایج معاصر',
    title_ar: 'منهجية صناعة البرهان في المنطق الصوري وتمييزه عن المغالطات المعاصرة',
    title_en: 'Methodology of Demonstration in Formal Logic & Demarcation from Modern Fallacies',
    category: 'منطق',
    category_fa: 'منطق',
    category_ar: 'المنطق',
    category_en: 'Logic',
    readTime: '۱۰ دقیقه مطالعه',
    readTime_fa: '۱۰ دقیقه مطالعه',
    readTime_ar: '١٠ دقائق قراءة',
    readTime_en: '10 min read',
    publishDate: 'تیر ۱۴۰۳',
    publishDate_fa: 'تیر ۱۴۰۳',
    publishDate_ar: 'ذو الحجة ١٤٤٥',
    publishDate_en: 'July 2024',
    abstract: 'بررسی شروط مواد قیاس برهانی، بدیهیات اولی، و راهکارهای شناسایی مغالطات زبانی و ساختاری در استدلال‌های فلسفی معاصر.',
    abstract_fa: 'بررسی شروط مواد قیاس برهانی، بدیهیات اولی، و راهکارهای شناسایی مغالطات زبانی و ساختاری در استدلال‌های فلسفی معاصر.',
    abstract_ar: 'استقصاء شروط مواد القياس البرهاني والأوليات البديهية، وآليات كشف المغالطات اللفظية والهيكلية في الحوارات الفلسفية المعاصرة.',
    abstract_en: 'An investigation into the premises of apodictic syllogisms, primary axioms, and diagnostic methods for detecting contemporary logical fallacies.',
    author: 'حجت الاسلام دکتر زنجیر زن حسینی',
    slug: 'mantiq-borhan-maghaleteh',
  },
  {
    id: 'art-4',
    title: 'حقیقت سلوک در منازل السائرین: مراتب توبه، انابت و تفکر در عرفان عملی',
    title_fa: 'حقیقت سلوک در منازل السائرین: مراتب توبه، انابت و تفکر در عرفان عملی',
    title_ar: 'حقيقة السلوك في منازل السائرين: مراتب التوبة والإنابة والتفكر في العرفان العملي',
    title_en: 'The Reality of Wayfaring in Manazil al-Sairin: Repentance, Inabah, & Contemplation',
    category: 'عرفان عملی',
    category_fa: 'عرفان عملی',
    category_ar: 'العرفان العملي والسلوك',
    category_en: 'Practical Spiritual Wayfaring',
    readTime: '۱۸ دقیقه مطالعه',
    readTime_fa: '۱۸ دقیقه مطالعه',
    readTime_ar: '١٨ دقيقة قراءة',
    readTime_en: '18 min read',
    publishDate: 'خرداد ۱۴۰۳',
    publishDate_fa: 'خرداد ۱۴۰۳',
    publishDate_ar: 'ذو القعدة ١٤٤٥',
    publishDate_en: 'June 2024',
    abstract: 'شرح تحلیلی بر ده باب اول منازل السائرین خواجه عبدالله انصاری و تبیین سلوک روحی سالک در گذار از بدایت‌ها به نهایات.',
    abstract_fa: 'شرح تحلیلی بر ده باب اول منازل السائرین خواجه عبدالله انصاری و تبیین سلوک روحی سالک در گذار از بدایت‌ها به نهایات.',
    abstract_ar: 'شرح تحليلي على الأبواب العشرة الأولى من منازل السائرين لخواجة عبد الله الأنصاري، مبيناً السفر الروحي للسالك من البدايات إلى النهايات.',
    abstract_en: 'Analytical exposition of the first ten gateways of Ansari’s Manazil al-Sairin, elaborating the spiritual transition from beginnings to ends.',
    author: 'حجت الاسلام دکتر زنجیر زن حسینی',
    slug: 'manazil-al-saereen-solouk',
  },
];

export interface AudioCourse {
  id: string;
  title_fa: string;
  title_ar: string;
  title_en: string;
  desc_fa?: string;
  desc_ar?: string;
  desc_en?: string;
  instructor_fa: string;
  instructor_ar: string;
  instructor_en: string;
  episodes_count: number;
  duration_fa: string;
  duration_ar: string;
  duration_en: string;
  level_fa: string;
  level_ar: string;
  level_en: string;
  price_fa: string;
  price_ar: string;
  price_en: string;
  sampleAudioUrl: string;
  media_type?: 'audio' | 'video' | 'hybrid';
  thumbnail?: string;
  course_type: 'offline' | 'online';
  subject: string;
  formatCategory?: string;
  subjectCategory?: string;
  // Online course properties
  capacity?: number;
  enrolledCount?: number;
  platform?: 'online' | 'skyroom';
  skyroomUrl?: string;
  schedule?: string;
  status?: 'registration_open' | 'capacity_full' | 'in_progress';
  // Offline course properties
  telegramUrl?: string;
  cloudStreamUrl?: string;
  driveFolderId?: string;
  chapters: {
    id: number;
    title_fa: string;
    title_ar?: string;
    title_en?: string;
    duration: string;
    isFreePreview?: boolean;
    audioUrl?: string;
    videoUrl?: string;
    cloudUrl?: string;
    media_type?: 'audio' | 'video' | 'hybrid';
  }[];
}

export const COURSE_ID_ALIASES: Record<string, string> = {
  'course-asfar': 'course-falsafe-asfar-1',
  'course-asfar-1': 'course-falsafe-asfar-1',
  'course-bidayat': 'course-falsafe-bidayah',
  'course-mabadi-mantiq': 'course-mantiq-mabadi',
  'course-ishraq': 'course-falsafe-ishraq',
  'course1': 'course-mantiq-mabadi',
  'course2': 'course-falsafe-bidayah',
  'course3': 'course-falsafe-asfar-1',
  'c1': 'course-falsafe-asfar-1',
  'c2': 'course-falsafe-bidayah',
  'c3': 'course-mantiq-mabadi',
};

export function toLocaleDigits(num: number | string, lang: SupportedLang = 'fa'): string {
  if (num === null || num === undefined) return '';
  const str = String(num);
  if (lang === 'en') {
    return str
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  }
  if (lang === 'ar') {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str
      .replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)])
      .replace(/[۰-۹]/g, (d) => arabicDigits['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
  }
  // Default: Persian (fa)
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str
    .replace(/[0-9]/g, (d) => farsiDigits[parseInt(d, 10)])
    .replace(/[٠-٩]/g, (d) => farsiDigits['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
}

export const booksDatabase: Record<string, Book> = {
  book1: {
    id: 'book1',
    isComingSoon: true,
    title_fa: 'مبادی حکمت صدرایی',
    title_ar: 'مبادئ الحكمة الصدرائية',
    title_en: 'Mabadi al-Hikmah al-Sadraiyyah',
    author_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    author_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    author_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    formatCategory: 'کتاب چاپی (گالینگور)',
    subjectCategory: 'حکمت متعالیه',
    desc_fa: 'تحریر آموزشی نظام‌مند اصول فلسفه اسلامی، برهان بداهت هستی و تمایز اعتبارات ماهوی در قالب ساختاری نوین برای طلاب و دانشجویان.',
    desc_ar: 'تحرير تعليمي منهجي لأصول الحكمة الإسلامية وبراهين أصالة الوجود والتمايز المفهومي بين الوجود والماهية للباحثين وطلاب العلوم العقلية.',
    desc_en: 'A systematic foundational textbook on Islamic metaphysics, proving the primacy of Being (Asalat al-Wujud) and conceptual taxonomy.',
    price_fa: '۳۸۵,۰۰۰ تومان',
    price_ar: '٣٨٥,٠٠٠ تومان',
    price_en: '$38.00',
    badge_fa: 'به‌زودی • در دست آماده‌سازی و نشر',
    badge_ar: 'قريباً • قيد التحضير والنشر',
    badge_en: 'Coming Soon • In Preparation',
    coverGradient: 'bg-[#241812]',
    coverBorder: '#C58B43',
    ribbonClass: 'bg-[#B91C1C]',
    leatherTexture: 'leather-pattern-cordovan',
    motif: 'geometric-frame',
    cover_image: '/images/book_cover_real.jpg',
    pages: {
      1: {
        fa: {
          r_header: 'مبادی حکمت • معرفی و تقریظ',
          r_num: 12,
          r_body: `
            <div class="p-3 bg-[#8A532B]/10 rounded-xl border border-[#8A532B]/30 text-center mb-3">
              <span class="font-bold text-book-accent block text-xs">نشر قائم آل علی (ع) — قم المقدسة</span>
              <span class="text-[10px] text-book-subtext block font-num">شابک: ۹۷۸-۶۲۲-۰۲-۱۹۴۸-۱ • نوبت چاپ: دوم ۱۴۰۳</span>
            </div>
            <h5 class="font-bold text-book-accent text-sm">مقدمه و دیباچه مولف:</h5>
            <p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1]">
              «بسم الله الرحمن الرحیم. الحمد لله رب العالمین. کتاب حاضر، ثمره سال‌ها تدریس و تامل در متون اصیل فلسفی و پاسخ به نیاز مبرم طلابی است که در بدو ورود به مباحث عقلی، با انبوهی از اصطلاحات نامتقارن و تعاریف پریشان روبرو می‌شدند. هدف این اثر، پی‌ریزی یک منظومه فکری مهندسی‌شده و تفکیک قاطع احکام وجود از اعتبارات ماهوی است...»
            </p>
          `,
          l_header: 'فصل اول: تمایز وجود و ماهیت',
          l_num: 13,
          l_body: `
            <div class="space-y-3">
              <div class="border-s-2 border-book-accent ps-3">
                <span class="font-bold text-book-accent text-xs block">قاعده نخستین در باب بداهت مفهوم هستی:</span>
                <p class="text-xs text-justify text-book-text dark:text-stone-200 leading-[2.1] mt-1">
                  «مفهوم وجود، اعرف الاشیاء و بدیهی‌ترین مفاهیم ذهنی است؛ مفهومی که هر تصوری در پرتو آن شکل می‌گیرد و خود محتاج تعریف به حد و رسم نیست...»
                </p>
              </div>
              <div class="p-3 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 text-[11px] space-y-1">
                <span class="font-bold text-book-text dark:text-white block">نمودار ساختار تمایز ذهنی:</span>
                <span class="block text-book-subtext dark:text-stone-400">• هستی (Existence) ⬅ حقیقت بسیط و دارای اصالت عینی خارج</span>
                <span class="block text-book-subtext dark:text-stone-400">• چیستی (Quiddity) ⬅ قالب مفهومی، حد عدمی و انتزاع عقل</span>
              </div>
            </div>
          `
        },
        ar: {
          r_header: 'مبادئ الحكمة • التعريف والتقديم',
          r_num: 12,
          r_body: `
            <div class="p-3 bg-[#8A532B]/10 rounded-xl border border-[#8A532B]/30 text-center mb-3">
              <span class="font-bold text-book-accent block text-xs">دار قائم آل محمد (ع) — قم المقدسة</span>
              <span class="text-[10px] text-book-subtext block font-num">الترقيم الدولي: 978-622-02-1948-1 • الطبعة: الثانية</span>
            </div>
            <h5 class="font-bold text-book-accent text-sm">مقدمة المؤلف:</h5>
            <p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1]">
              «بسم الله الرحمن الرحيم. هذا الكتاب هو ثمرة سنوات ممتدة من التدريس والتحقيق في المتون الفلسفية الأصيلة، وجاء استجابة لحاجة ملحة لدى الباحثين الراغبين في ضبط الاصطلاحات العقلية وتجنب الخلط بين أحكام الوجود واعتبارات الماهية...»
            </p>
          `,
          l_header: 'الباب الأول: التمايز بين الوجود والماهية',
          l_num: 13,
          l_body: `
            <div class="space-y-3">
              <div class="border-s-2 border-book-accent ps-3">
                <span class="font-bold text-book-accent text-xs block">القاعدة الأولى في بداهة مفهوم الوجود:</span>
                <p class="text-xs text-justify text-book-text dark:text-stone-200 leading-[2.1] mt-1">
                  «إن مفهوم الوجود أعرف الأشياء وأجلاها في الذهن البشري، فلا يفتقر إلى تعریف بحد ولا رسم...»
                </p>
              </div>
              <div class="p-3 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 text-[11px] space-y-1">
                <span class="font-bold text-book-text dark:text-white block">مخطط التمايز المفهومي:</span>
                <span class="block text-book-subtext dark:text-stone-400">• الوجود ⬅ الحقيقة الأصيلة الحاكية عن الواقع الخارجي</span>
                <span class="block text-book-subtext dark:text-stone-400">• الماهية ⬅ الحد العدمي والاعتبار الذهني المجرد</span>
              </div>
            </div>
          `
        },
        en: {
          r_header: 'Mabadi al-Hikmah • Colophon & Preface',
          r_num: 12,
          r_body: `
            <div class="p-3 bg-[#8A532B]/10 rounded-xl border border-[#8A532B]/30 text-center mb-3">
              <span class="font-bold text-book-accent block text-xs">Ghaem Publishing — Academic Series</span>
              <span class="text-[10px] text-book-subtext block font-num">ISBN: 978-622-02-1948-1 • 2nd Edition 2024</span>
            </div>
            <h5 class="font-bold text-book-accent text-sm">Author’s Preface:</h5>
            <p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1]">
              “In the name of God, the Merciful. This treatise crystallizes decades of seminar lecturing, responding to the urgent need of researchers seeking unambiguous rational terminology in Islamic epistemology without conceptual conflation...”
            </p>
          `,
          l_header: 'Chapter I: The Distinction of Being and Quiddity',
          l_num: 13,
          l_body: `
            <div class="space-y-3">
              <div class="border-s-2 border-book-accent ps-3">
                <span class="font-bold text-book-accent text-xs block">Axiom 1: Self-Evidence of Being:</span>
                <p class="text-xs text-justify text-book-text dark:text-stone-200 leading-[2.1] mt-1">
                  “The concept of Being (Wujud) is the most self-evident cognition of the rational intellect, antecedent to any definition by genus or species...”
                </p>
              </div>
              <div class="p-3 rounded-xl bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 text-[11px] space-y-1">
                <span class="font-bold text-book-text dark:text-white block">Taxonomic Diagram:</span>
                <span class="block text-book-subtext dark:text-stone-400">• Being (Wujud) ⬅ Simple reality possessing primary external reality</span>
                <span class="block text-book-subtext dark:text-stone-400">• Quiddity (Mahiyyah) ⬅ Conceptual boundaries and mental abstractions</span>
              </div>
            </div>
          `
        }
      },
      2: {
        fa: {
          r_header: 'مبادی حکمت • فهرست تفصیلی ابواب',
          r_num: 14,
          r_body: `
            <h5 class="font-bold text-book-accent text-sm pb-1 border-b border-black/10">فهرست مجلد اول:</h5>
            <ul class="text-xs space-y-2 text-book-text dark:text-stone-200 pt-2">
              <li class="flex justify-between font-semibold"><span>مدخل: ضرورت تفکر عقلی و معرفت‌شناسی</span><span class="font-num">ص ۱۷</span></li>
              <li class="flex justify-between"><span>باب اول: احکام عامه مفهوم وجود</span><span class="font-num">ص ۴۵</span></li>
              <li class="flex justify-between"><span>باب دوم: تمایز حقیقت عینی از قالب ذهنی</span><span class="font-num">ص ۹۱</span></li>
              <li class="flex justify-between"><span>باب سوم: براهین اصالت وجود و اعتباریت ماهیت</span><span class="font-num">ص ۱۴۰</span></li>
            </ul>
          `,
          l_header: 'مبادی حکمت • فهرست ابواب تحلیلی',
          l_num: 15,
          l_body: `
            <h5 class="font-bold text-book-accent text-sm pb-1 border-b border-black/10">ادامه مباحث تحلیلی:</h5>
            <ul class="text-xs space-y-2 text-book-text dark:text-stone-200 pt-2">
              <li class="flex justify-between"><span>باب چهارم: مواد ثلاث (وجوب، امکان، امتناع)</span><span class="font-num">ص ۱۹۵</span></li>
              <li class="flex justify-between"><span>باب پنجم: مراتب تشکیک و نفی تباین</span><span class="font-num">ص ۲۶۰</span></li>
              <li class="flex justify-between"><span>باب ششم: مقولات عشر و جوهر و اعراض</span><span class="font-num">ص ۳۳۰</span></li>
              <li class="flex justify-between font-semibold text-book-accent"><span>خاتمه: جدول نموداری اصطلاحات حکمت اشراق</span><span class="font-num">ص ۴۲۰</span></li>
            </ul>
          `
        },
        ar: {
          r_header: 'مبادئ الحكمة • فهرس الأبواب',
          r_num: 14,
          r_body: `
            <h5 class="font-bold text-book-accent text-sm pb-1 border-b border-black/10">فهرس الجزء الأول:</h5>
            <ul class="text-xs space-y-2 text-book-text dark:text-stone-200 pt-2">
              <li class="flex justify-between font-semibold"><span>المدخل: ضرورة التفكير العقلي ونظرية المعرفة</span><span class="font-num">ص ١٧</span></li>
              <li class="flex justify-between"><span>الباب الأول: الأحكام العامة لمفهوم الوجود</span><span class="font-num">ص ٤٥</span></li>
              <li class="flex justify-between"><span>الباب الثاني: أصالة الوجود واعتبارية الماهية</span><span class="font-num">ص ١٤٠</span></li>
            </ul>
          `,
          l_header: 'مبادئ الحكمة • تتمة الفهرس',
          l_num: 15,
          l_body: `
            <h5 class="font-bold text-book-accent text-sm pb-1 border-b border-black/10">أبواب التحقيق التخصصي:</h5>
            <ul class="text-xs space-y-2 text-book-text dark:text-stone-200 pt-2">
              <li class="flex justify-between"><span>الباب الثالث: المواد الثلاث (الوجوب والإمكان)</span><span class="font-num">ص ١٩٥</span></li>
              <li class="flex justify-between"><span>الباب الرابع: تشكيك الوجود وتدرج المراتب</span><span class="font-num">ص ٢٦٠</span></li>
              <li class="flex justify-between"><span>الخاتمة: جداول مقارنة بين المشاء والإشراق</span><span class="font-num">ص ٤٢٠</span></li>
            </ul>
          `
        },
        en: {
          r_header: 'Mabadi al-Hikmah • Table of Contents',
          r_num: 14,
          r_body: `
            <h5 class="font-bold text-book-accent text-sm pb-1 border-b border-black/10">Volume I Contents:</h5>
            <ul class="text-xs space-y-2 text-book-text dark:text-stone-200 pt-2">
              <li class="flex justify-between font-semibold"><span>Prolegomena: Rational Epistemology</span><span class="font-num">p. 17</span></li>
              <li class="flex justify-between"><span>Book I: General Properties of Being</span><span class="font-num">p. 45</span></li>
              <li class="flex justify-between"><span>Book II: Primacy of Existence (Asalat al-Wujud)</span><span class="font-num">p. 140</span></li>
            </ul>
          `,
          l_header: 'Mabadi al-Hikmah • Contents Continued',
          l_num: 15,
          l_body: `
            <h5 class="font-bold text-book-accent text-sm pb-1 border-b border-black/10">Specialized Chapters:</h5>
            <ul class="text-xs space-y-2 text-book-text dark:text-stone-200 pt-2">
              <li class="flex justify-between"><span>Book III: The Triad (Necessity, Contingency)</span><span class="font-num">p. 195</span></li>
              <li class="flex justify-between"><span>Book IV: Gradation of Being (Tashkik)</span><span class="font-num">p. 260</span></li>
              <li class="flex justify-between"><span>Epilogue: Comparative Synoptic Charts</span><span class="font-num">p. 420</span></li>
            </ul>
          `
        }
      },
      3: {
        fa: {
          r_header: 'مبادی حکمت • گزیده متن فصل سوم',
          r_num: 16,
          r_body: `
            <div class="border-b border-black/10 pb-2">
              <span class="text-[11px] font-bold text-book-accent">اصل سوم: وحدت تشکیکی و نفی کثرت تباینی</span>
            </div>
            <p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1] pt-2">
              «بدان که حقیقت وجود، اگرچه بسیط است، اما دارای مراتب شدت و ضعف، تقدم و تاخر، و کمال و نقص است. آنچه مایه تمایز مراتب نور از یکدیگر است، عین همان چیزی است که مایه اشتراک آنهاست؛ درست همانند نور ضعیف و نور قوی که در اصل "نور بودن" متفق‌اند، اما تفاوتشان ناشی از شدت و ضعف در همان حقیقت نور است...»
            </p>
          `,
          l_header: 'مبادی حکمت • حاشیه تحلیلی مولف',
          l_num: 17,
          l_body: `
            <div class="p-3 bg-book-accent/10 rounded-xl border border-book-accent/20">
              <span class="font-bold text-book-accent text-xs block">حاشیه انتقادی حجت الاسلام دکتر زنجیر زن حسینی:</span>
              <p class="text-[11px] text-justify text-book-subtext dark:text-stone-300 leading-[1.9] mt-1">
                «شیخ اشراق اگرچه در ظاهر واژه نور را به کار برده است، اما ماهیت نظام نوری او با تشکیک وجودی صدرالمتالهین در پیوند عمیق شهودی قرار دارد. در فصل ششم این کتاب، با نمودار هندسی نشان داده‌ایم که چگونه تعارض میان مشاء و اشراق در ساحت تشکیک برطرف می‌شود.»
              </p>
            </div>
            <div class="text-center pt-2">
              <span class="text-[10px] text-[#8A532B] font-bold block">برای مطالعه ادامه متن، می‌توانید نسخه چاپی را سفارش دهید.</span>
            </div>
          `
        },
        ar: {
          r_header: 'مبادئ الحكمة • مقتطف من الباب الثالث',
          r_num: 16,
          r_body: `
            <div class="border-b border-black/10 pb-2">
              <span class="text-[11px] font-bold text-book-accent">الأصل الثالث: التشكيك في حقيقة الوجود</span>
            </div>
            <p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1] pt-2">
              «اعلم أن حقيقة الوجود مع بساطتها ذات مراتب متفاضلة في الشدة والضعف، والكمال والنقص. فما به الامتياز عين ما به الاشتراك، كما هو الحال في النور الشديد والنور الضعيف...»
            </p>
          `,
          l_header: 'مبادئ الحكمة • تعليقة المؤلف',
          l_num: 17,
          l_body: `
            <div class="p-3 bg-book-accent/10 rounded-xl border border-book-accent/20">
              <span class="font-bold text-book-accent text-xs block">تعليقة الدكتور زنجيرزن حسيني:</span>
              <p class="text-[11px] text-justify text-book-subtext dark:text-stone-300 leading-[1.9] mt-1">
                «إن نظام الأنوار السهروردي يلتقي في عمقه الشهودي مع تشكيك صدر المتألهين، كما أثبتنا ذلك بالرسوم البيانية في الفصل السادس.»
              </p>
            </div>
          `
        },
        en: {
          r_header: 'Mabadi al-Hikmah • Sample Excerpt Ch. III',
          r_num: 16,
          r_body: `
            <div class="border-b border-black/10 pb-2">
              <span class="text-[11px] font-bold text-book-accent">Principle III: Analogical Gradation of Reality</span>
            </div>
            <p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1] pt-2">
              “Know that the reality of Being, despite its simplicity, manifests degrees of intensity and deficiency. That by which the degrees differ is identically that by which they are unified—just as intense light and faint light share the essence of luminosity...”
            </p>
          `,
          l_header: 'Mabadi al-Hikmah • Critical Scholarly Note',
          l_num: 17,
          l_body: `
            <div class="p-3 bg-book-accent/10 rounded-xl border border-book-accent/20">
              <span class="font-bold text-book-accent text-xs block">Annotation by Hojjat al-Islam Dr. Zanjirzan Hosseini:</span>
              <p class="text-[11px] text-justify text-book-subtext dark:text-stone-300 leading-[1.9] mt-1">
                “Suhrawardi’s luminous taxonomy converges intuitive vision with Sadrian analogical gradation. Chapter VI provides detailed geometric models mapping this synthesis.”
              </p>
            </div>
          `
        }
      }
    }
  },
  book2: {
    id: 'book2',
    isComingSoon: true,
    title_fa: 'شرح حکمت اشراق سهروردی',
    title_ar: 'شرح حكمة الإشراق',
    title_en: 'Commentary on Hikmat al-Ishraq',
    author_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    author_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    author_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    formatCategory: 'کتاب چاپی (جلد چرمی)',
    subjectCategory: 'حکمت اشراق',
    desc_fa: 'تقریر نوینی از منظومه نوری شیخ شهاب‌الدین سهروردی با تطبیق انتقادی بر فلسفه مشاء سینوی و حکمت متعالیه ملاصدرا.',
    desc_ar: 'شرح تحليلي موسع لمنظومة الأنوار السهروردية مع المقارنة النقدية الشاملة مع الحكمة المشائية والحكمة المتعالية.',
    desc_en: 'In-depth commentary and philosophical reconstruction of Suhrawardi’s Philosophy of Illumination.',
    price_fa: '۴۹۰,۰۰۰ تومان',
    price_ar: '٤٩٠,٠٠٠ تومان',
    price_en: '$48.00',
    badge_fa: 'به‌زودی • در دست آماده‌سازی و نشر',
    badge_ar: 'قريباً • قيد التحضير والنشر',
    badge_en: 'Coming Soon • In Preparation',
    coverGradient: 'bg-[#131B2B]',
    coverBorder: '#D4AF37',
    ribbonClass: 'bg-[#D97706]',
    leatherTexture: 'leather-pattern-lapis',
    motif: 'cartouche',
    cover_image: '/images/book_cover_real.jpg',
    pages: {
      1: {
        fa: {
          r_header: 'حکمت اشراق • مدخل و تعریف نور',
          r_num: 1,
          r_body: `<h5 class="font-bold text-book-accent text-sm">مقدمه شیخ شهاب‌الدین سهروردی:</h5><p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1] pt-2">«ما فی الوجود شیء اظهر من النور؛ فلا شیء اغنی منه عن التعریف. چیزی در عالم آشکارتر از نور نیست، پس چیزی از تعریف بی‌نیازتر از آن نخواهد بود. هر آنچه در عالم ادراک می‌شود، به واسطه نور است و خود نور به ذات خود هویداست...»</p>`,
          l_header: 'حکمت اشراق • شرح انوار قاهره',
          l_num: 2,
          l_body: `<div class="border-s-2 border-book-accent ps-3"><span class="font-bold text-book-accent text-xs block">تحلیل حجت الاسلام دکتر زنجیر زن حسینی:</span><p class="text-xs text-justify text-book-text dark:text-stone-200 leading-[2.1] mt-1">شیخ اشراق نظام عقول ده‌گانه سینوی را گسترش داده و عوالم نوری را به انوار قاهره اعلا، انوار اسفهبدیه (مدبره نفوس) و برازخ مادی تفکیک می‌کند.</p></div>`
        },
        ar: {
          r_header: 'حكمة الإشراق • حقيقة النور',
          r_num: 1,
          r_body: `<h5 class="font-bold text-book-accent text-sm">كلام الشيخ السهروردي:</h5><p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1] pt-2">«ما في الوجود شيء أظهر من النور؛ فلا شيء أغنى منه عن التعريف...»</p>`,
          l_header: 'حكمة الإشراق • تقسيم الأنوار',
          l_num: 2,
          l_body: `<div class="border-s-2 border-book-accent ps-3"><span class="font-bold text-book-accent text-xs block">تحقيق الدكتور ميثم زنجيرزن:</span><p class="text-xs text-justify text-book-text dark:text-stone-200 leading-[2.1] mt-1">يبين هذا الشرح منظومة الأنوار القاهرة العالية والأنوار الإسفهبذية المدبرة للأبدان بأسلوب منهجي يستند إلى برهان الصديقين.</p></div>`
        },
        en: {
          r_header: 'Hikmat al-Ishraq • Definition of Light',
          r_num: 1,
          r_body: `<h5 class="font-bold text-book-accent text-sm">Suhrawardi’s Principle:</h5><p class="text-justify text-xs text-book-text dark:text-stone-200 leading-[2.1] pt-2">“There is nothing in existence more manifest than Light; thus nothing stands in less need of definition...”</p>`,
          l_header: 'Hikmat al-Ishraq • Luminous Hierarchies',
          l_num: 2,
          l_body: `<div class="border-s-2 border-book-accent ps-3"><span class="font-bold text-book-accent text-xs block">Analysis by Hojjat al-Islam Dr. Zanjirzan Hosseini:</span><p class="text-xs text-justify text-book-text dark:text-stone-200 leading-[2.1] mt-1">Suhrawardi expands the Peripatetic ten-intellect cosmology into an infinite network of Victorious (Qahirah) and Regent (Isfahbad) Lights.</p></div>`
        }
      },
      2: {
        fa: {
          r_header: 'حکمت اشراق • فهرست مقالات',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">بررسی ساختار کتاب حکمة الإشراق در دو بخش: قواعد منطقی نوین و الهیات بالمعنی الاخص.</p>`,
          l_header: 'حکمت اشراق • براهین نوری',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">بررسی برهان شیخ اشراق در ابطال انحصار عقول در ده مرتبه و اثبات مراتب نامتناهی انوار عقلیه.</p>`
        },
        ar: {
          r_header: 'حكمة الإشراق • مباحث المقالات',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">فهرس شروح حكمة الإشراق في القواعد الفكرية والأنوار الإلهية.</p>`,
          l_header: 'حكمة الإشراق • براهين النور',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">إثبات سعة عوالم الأنوار العقلية وبطلان حصر العقول في عشرة.</p>`
        },
        en: {
          r_header: 'Hikmat al-Ishraq • Treatises Index',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Outline of the Two Books: First on Logic, Second on Divine Celestial Lights.</p>`,
          l_header: 'Hikmat al-Ishraq • Demonstrations',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Critique of the ten-intellect model and defense of the innumerable celestial intellects.</p>`
        }
      },
      3: {
        fa: {
          r_header: 'حکمت اشراق • فصل نور الانوار',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">تبیین حقیقت نور الانوار که مبدأ کل و فیض‌بخش جمیع موجودات است و ذات مقدس او غنی مطلق است.</p>`,
          l_header: 'حکمت اشراق • تطبیق با حکمت صدرا',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">بررسی پیوند نور الانوار سهروردی با واجب الوجود بالذات در حکمت متعالیه ملاصدرا.</p>`
        },
        ar: {
          r_header: 'حكمة الإشراق • نور الأنوار',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">بيان حقيقة نور الأنوار المفيض على سائر الموجودات والغني بذاته عن كل نقص.</p>`,
          l_header: 'حكمة الإشراق • المقارنة مع الصدراوية',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">تطابق مفهوم نور الأنوار مع واجب الوجود بالذات في الحكمة المتعالية.</p>`
        },
        en: {
          r_header: 'Hikmat al-Ishraq • The Light of Lights',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Exposition on Nur al-Anwar, the transcendent fountainhead of all being and infinite luminescence.</p>`,
          l_header: 'Hikmat al-Ishraq • Sadrian Synthesis',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Mapping the Light of Lights to the Necessary Being in Mulla Sadra’s metaphysics.</p>`
        }
      }
    }
  },
  book3: {
    id: 'book3',
    isComingSoon: true,
    title_fa: 'رساله در تشکیک وجود',
    title_ar: 'رسالة في تشكيك الوجود',
    title_en: 'Treatise on Gradation of Being',
    author_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    author_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    author_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    formatCategory: 'کتاب چاپی (رقعی نفیس)',
    subjectCategory: 'حکمت متعالیه',
    desc_fa: 'بررسی دقیق براهین تشکیک وجود در حکمت متعالیه و پاسخ به شبهات فخر رازی و متکلمان با رویکرد منطق فلسفی.',
    desc_ar: 'تحقيق تخصصي برهاني في مسألة التشكيك الوجودي والرد على الإشكالات الكلامية برؤية عقلية دقيقة.',
    desc_en: 'A rigorous treatise investigating the analogical gradation of Being and responses to theological objections.',
    price_fa: '۲۹۰,۰۰۰ تومان',
    price_ar: '٢٩٠,٠٠٠ تومان',
    price_en: '$28.00',
    badge_fa: 'به‌زودی • در دست آماده‌سازی و نشر',
    badge_ar: 'قريباً • قيد التحضير والنشر',
    badge_en: 'Coming Soon • In Preparation',
    coverGradient: 'bg-[#14221A]',
    coverBorder: '#B87333',
    ribbonClass: 'bg-[#8A532B]',
    leatherTexture: 'cloth-pattern-jade',
    motif: 'copper-filigree',
    pages: {
      1: {
        fa: {
          r_header: 'تشکیک وجود • طرح مسئله',
          r_num: 1,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">بررسی تاریخی مسئله اشتراک معنوی وجود و چگونگی تکثر آن در مراتب عالم عین.</p>`,
          l_header: 'تشکیک وجود • ادله صدرایی',
          l_num: 2,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">اثبات برهان تشکیک وجود بر مبنای اصالت و بساطت حقیقت خارج و رد نظریه تباین وجودات مشاء.</p>`
        },
        ar: {
          r_header: 'تشكيك الوجود • تحرير المسألة',
          r_num: 1,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">دراسة تاريخية للاشتراك المعنوي لمفهوم الوجود وتكثره في مراتب الأعيان.</p>`,
          l_header: 'تشكيك الوجود • الأدلة الصدراوية',
          l_num: 2,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">إثبات برهان التشكيك ارتكازاً على أصالة الوجود وبساطته الخارجية ونفي التباين المشائي.</p>`
        },
        en: {
          r_header: 'Gradation of Being • The Problematic',
          r_num: 1,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">Historical analysis of the univocity of being (ishtirak ma'nawi) and its differentiation.</p>`,
          l_header: 'Gradation of Being • Sadrian Proofs',
          l_num: 2,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">Rigorous deduction of Tashkik al-Wujud through the fundamental simplicity of Being.</p>`
        }
      },
      2: {
        fa: {
          r_header: 'تشکیک وجود • پاسخ به اشکالات',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">پاسخ به اشکال فخر رازی در باب ترکیب ماهوی وجود و اثبات صرافت حق تعالی.</p>`,
          l_header: 'تشکیک وجود • تطبیق عینی',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">بررسی سیر نزولی و صعودی مراتب وجود از ماده اولی تا عقل اول و واجب بالذات.</p>`
        },
        ar: {
          r_header: 'تشكيك الوجود • رد الشبهات',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">دفع إشكالات الفخر الرازي في شبهة تركيب الوجود وإثبات الصرافة الإلهية.</p>`,
          l_header: 'تشكيك الوجود • التحليل العيني',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">بيان تدرج مراتب الوجود صعوداً وهبوطاً من الهيولى إلى المبدأ الأول.</p>`
        },
        en: {
          r_header: 'Gradation of Being • Objections',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Rebuttal of Fakhr al-Din Razi’s dilemmas regarding the composition of existence.</p>`,
          l_header: 'Gradation of Being • Ontological Scale',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Mapping the cosmic hierarchy from prime matter (hayula) to the Necessary Existent.</p>`
        }
      },
      3: {
        fa: {
          r_header: 'تشکیک وجود • خاتمه و نتایج',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">جمع‌بندی آثار معرفتی تشکیک وجود در حل معضلات جبر و اختیار و ربط حادث به قدیم.</p>`,
          l_header: 'تشکیک وجود • منابع و مراجع',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">فهرست نسخ خطی و ارجاعات اسفار، شفا، حکمة الاشراق و قبسات میرداماد.</p>`
        },
        ar: {
          r_header: 'تشكيك الوجود • الخاتمة',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">النتائج المعرفية المترتبة على التشكيك في مسألة ربط الحادث بالقديم ونظرية المعرفة.</p>`,
          l_header: 'تشكيك الوجود • المصادر والمراجع',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">فهرس المخطوطات والكتب المعتمدة في الشفاء والأسفار وقبسات ميرداماد.</p>`
        },
        en: {
          r_header: 'Gradation of Being • Epilogue',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Epistemological implications of Tashkik in resolving free will and contingency.</p>`,
          l_header: 'Gradation of Being • References',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Manuscript sources across Ibn Sina’s Shifa, Suhrawardi, and Mulla Sadra’s Asfar.</p>`
        }
      }
    }
  },
  book4: {
    id: 'book4',
    isComingSoon: true,
    title_fa: 'فلسفه تطبیقی و پدیدارشناسی',
    title_ar: 'الفلسفة المقارنة والظاهراتية',
    title_en: 'Comparative Philosophy & Phenomenology',
    author_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    author_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    author_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    formatCategory: 'کتاب چاپی (وزیری)',
    subjectCategory: 'فلسفه تطبیقی',
    desc_fa: 'کاوشی عمیق در گفتگوی انتقادی میان مکتب صدرایی با پدیدارشناسی هوسرل و هایدگر پیرامون مسئله زیست‌جهان و حقیقت هستی.',
    desc_ar: 'حوار فلسفي مقارن بين الحكمة الصدراوية والظاهراتية المعاصرة (هوسرل وهايدغر) في مسألة الوجود والوعي.',
    desc_en: 'A critical comparative dialogue between Sadrian metaphysics and continental phenomenology (Husserl and Heidegger).',
    price_fa: '۴۴۰,۰۰۰ تومان',
    price_ar: '٤٤٠,٠٠٠ تومان',
    price_en: '$44.00',
    badge_fa: 'به‌زودی • در دست آماده‌سازی و نشر',
    badge_ar: 'قريباً • قيد التحضير والنشر',
    badge_en: 'Coming Soon • In Preparation',
    coverGradient: 'bg-[#25141C]',
    coverBorder: '#C58B43',
    ribbonClass: 'bg-[#8A532B]',
    leatherTexture: 'leather-pattern-burgundy',
    motif: 'gilded-frame',
    pages: {
      1: {
        fa: {
          r_header: 'فلسفه تطبیقی • دیباچه روش‌شناختی',
          r_num: 1,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">روش‌شناسی مقایسه‌ای: اجتناب از تطبیق‌های شتاب‌زده و کاوش در خاستگاه‌های اصیل شهود فلسفی.</p>`,
          l_header: 'فلسفه تطبیقی • هوسرل و علم حضوری',
          l_num: 2,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">مقایسه مفهوم اپوخه (Epoche) و تعلیق حکم با بازگشت به ادراک بی‌واسطه و علم حضوری سهروردی.</p>`
        },
        ar: {
          r_header: 'الفلسفة المقارنة • المنهجية',
          r_num: 1,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">منهج المقارنة النقدية وتجنب الإسقاطات الفكرية في دراسة الحكمة الإسلامية والفلسفة الغربية.</p>`,
          l_header: 'الفلسفة المقارنة • هوسرل والعلم الحضوري',
          l_num: 2,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">مقارنة الإيبوخية والوعي الظاهراتي مع نظرية العلم الحضوري والشهود العقلي عند المسلمين.</p>`
        },
        en: {
          r_header: 'Comparative Philosophy • Method',
          r_num: 1,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">Methodological rigor in cross-tradition philosophy, guarding against superficial parallels.</p>`,
          l_header: 'Comparative Philosophy • Knowledge by Presence',
          l_num: 2,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2.1]">Husserlian epoche compared with Suhrawardi’s seminal doctrine of Knowledge by Presence.</p>`
        }
      },
      2: {
        fa: {
          r_header: 'فلسفه تطبیقی • هایدگر و پرسش از وجود',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">بررسی تقارب تحلیلی تفکیک هایدگر میان هستی (Sein) و موجود (Seiendes) با تمایز وجود و ماهیت صدرایی.</p>`,
          l_header: 'فلسفه تطبیقی • نقدهای ملاصدرا',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">آیا غفلت از وجود در غرب با اصالت ماهیت ارسطویی پیوند دارد؟ تحلیل پاسخ‌های حکمت متعالیه.</p>`
        },
        ar: {
          r_header: 'الفلسفة المقارنة • هايدغر وسؤال الوجود',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">الفرق الوجودي عند هايدغر بين الوجود والموجود ومقارنته بأصالة الوجود الصدراوية.</p>`,
          l_header: 'الفلسفة المقارنة • نقد النسيان الوجودي',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">أثر القول بأصالة الماهية في الغفلة عن الوجود ورؤية صدر المتألهين في تجاوزه.</p>`
        },
        en: {
          r_header: 'Comparative Philosophy • Heidegger',
          r_num: 3,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">The ontological difference between Being (Sein) and beings (Seiendes) juxtaposed with Sadra.</p>`,
          l_header: 'Comparative Philosophy • The Oblivion of Being',
          l_num: 4,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Tracing the forgetfulness of Being (Seinsvergessenheit) back to quidditative primacy.</p>`
        }
      },
      3: {
        fa: {
          r_header: 'فلسفه تطبیقی • جمع‌بندی نهایی',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">ترسیم چشم‌انداز نوینی برای گفتگوی فلسفی شرق و غرب در عصر هوش مصنوعی و بحران معنا.</p>`,
          l_header: 'فلسفه تطبیقی • واژه‌نامه تخصصی',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">واژه‌نامه تطبیقی اصطلاحات آلمانی، فرانسوی، عربی و فارسی به همراه معادل‌های استاندارد.</p>`
        },
        ar: {
          r_header: 'الفلسفة المقارنة • الخاتمة',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">آفاق جديدة للحوار الفلسفي المعاصر في ظل التحديات المعرفية والأخلاقية الراهنة.</p>`,
          l_header: 'الفلسفة المقارنة • معجم المصطلحات',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">مسرد متعدد اللغات للمصطلحات الفلسفية بالألمانية والفرنسية والعربية.</p>`
        },
        en: {
          r_header: 'Comparative Philosophy • Conclusion',
          r_num: 5,
          r_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Synthesizing critical rationality with intuitive metaphysics for contemporary discourse.</p>`,
          l_header: 'Comparative Philosophy • Bibliography',
          l_num: 6,
          l_body: `<p class="text-xs text-book-text dark:text-stone-200 leading-[2]">Comprehensive multilingual index of German, Arabic, and Latin philosophical terms.</p>`
        }
      }
    }
  }
};

export const coursesDatabase: Record<string, AudioCourse> = {
  // ==========================================
  // ۱. منطق (Logic)
  // ==========================================
  'course-mantiq-mabadi': {
    id: 'course-mantiq-mabadi',
    driveFolderId: '1KXknozCOubUNk6nH9dYl1Ch7EJw9Siau',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1KXknozCOubUNk6nH9dYl1Ch7EJw9Siau',
    title_fa: 'سلسله جلسات مبادی منطق و تفکر عقلانی (اصول استدلال و نقد مغالطات)',
    title_ar: 'سلسلة دروس مبادئ المنطق والتفكير العقلاني (أصول الاستدلال ونقد المغالطات)',
    title_en: 'Foundations of Logic & Rational Metaphysics (Principles of Argumentation)',
    desc_fa: 'تدریس تفصیلی و مهندسی‌شده اصول علم منطق، از تعریف علم و تصور و تصدیق تا کلیات خمس و ساختار برهان و نقد مغالطات توسط استاد حجت الاسلام دکتر زنجیر زن حسینی.',
    desc_ar: 'دروس منهجية في أصول المنطق الأرسطي والإسلامي من التصور والتصديق إلى صناعة البرهان للأستاذ حجة الإسلام الدكتور زنجير زن حسيني.',
    desc_en: 'A comprehensive curriculum on classical and formal logic, epistemology, and argumentation theory by Hojjat al-Islam Dr. Zanjirzan Hosseini.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 24,
    duration_fa: '۱۸ ساعت',
    duration_ar: '١٨ ساعة',
    duration_en: '18 Hours',
    level_fa: 'پایه تا متوسط (دسترسی آزاد)',
    level_ar: 'مستوى تأسيسي ومتوسط',
    level_en: 'Foundational to Intermediate',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'hybrid',
    course_type: 'offline',
    subject: 'منطق',
    telegramUrl: 'https://t.me/AlNajmosageb313/979',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: تعریف علم و تقسیم به تصور و تصدیق', duration: '38:40', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', videoUrl: 'https://www.youtube.com/watch?v=V2QMmbJEBLc', media_type: 'hybrid' },
      { id: 2, title_fa: 'جلسه ۰۲: مباحث الفاظ، دلالت و اقسام سه‌گانه آن', duration: '44:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', videoUrl: 'https://www.youtube.com/watch?v=KoOiRI_gt-k', media_type: 'hybrid' },
      { id: 3, title_fa: 'جلسه ۰۳: نسبت‌های چهارگانه میان مفاهیم کلی', duration: '41:20', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 4, title_fa: 'جلسه ۰۴: کلیات خمس (جنس، فصل، نوع، عرض عام و خاص)', duration: '49:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 5, title_fa: 'جلسه ۰۵: معرف و شروط تعریف، حد تام و رسم تام', duration: '46:35', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 6, title_fa: 'جلسه ۰۶: قضایا و ساختار تصدیقات (حملیه و شرطیه)', duration: '52:00', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 7, title_fa: 'جلسه ۰۷: احکام قضایا، تناقض و عکس مستوی', duration: '47:20', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 8, title_fa: 'جلسه ۰۸: حجت و قیاس اقترانی، اشکال اربعه', duration: '50:45', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 9, title_fa: 'جلسه ۰۹: صناعات خمس، تحلیل برهان و دفع مغالطات', duration: '55:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', videoUrl: 'https://www.youtube.com/watch?v=dpwVDaY_yT8', media_type: 'hybrid' },
    ]
  },
  'course-mantiq-muzaffar-suri': {
    id: 'course-mantiq-muzaffar-suri',
    driveFolderId: '192BuzR83zgG3Ss6Rh9-H3_u9XXzymzCT',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/192BuzR83zgG3Ss6Rh9-H3_u9XXzymzCT',
    title_fa: 'دوره جامع شرح منطق مظفر (منطق صوری و قواعد اندیشه)',
    title_ar: 'الدورة الكاملة لشرح منطق المظفر (المنطق الصوري)',
    title_en: 'Comprehensive Commentary on Al-Mantiq by Muzaffar (Formal Logic)',
    desc_fa: 'شرح تحلیلی و متن‌محور کتاب درسی المنطق علامه محمدرضا مظفر با تبیین دقیق مباحث تصورات، تعریف و تصدیقات و قضایا برای حوزه‌های علمیه و دانشگاه.',
    desc_ar: 'شرح تفصيلي ودقيق لكتاب المنطق للعلامة المظفر مع ربطه بمباحث الفلسفة والكلام الإسلامي.',
    desc_en: 'Rigorous commentary on the pedagogical masterpiece Al-Mantiq by Sheikh Muhammad Rida al-Muzaffar.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 62,
    duration_fa: '۴۸ ساعت',
    duration_ar: '٤٨ ساعة',
    duration_en: '48 Hours',
    level_fa: 'سطح حوزوی و دانشگاهی',
    level_ar: 'مستوى حوزوي وأكاديمي',
    level_en: 'Seminary & University Level',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free Access',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'منطق',
    telegramUrl: 'https://t.me/AlNajmosageb313/2608',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: دیباچه کتاب، تعریف منطق و نیاز اندیشه به قانون تفکر', duration: '46:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 2, title_fa: 'جلسه ۰۲: حقیقت علم و تمایز ادراک حصولی از حضوری', duration: '49:25', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 3, title_fa: 'جلسه ۰۳: مفاهیم کلی و جزئی و مراتب تجرید عقلانی', duration: '43:50', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 4, title_fa: 'جلسه ۰۴: قواعد تعریف، حد و رسم و مغالطه دَور', duration: '51:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 5, title_fa: 'جلسه ۰۵: قضایای شرطیه، اقسام اتصال و انفصال', duration: '48:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-mantiq-muzaffar-madi': {
    id: 'course-mantiq-muzaffar-madi',
    driveFolderId: '1VbgwV7foc1IoXVpiCNODxTQQvGPbVU6j',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1VbgwV7foc1IoXVpiCNODxTQQvGPbVU6j',
    title_fa: 'منطق مظفر - بخش دوم: منطق مادی و صناعات خمس',
    title_ar: 'منطق المظفر - الجزء الثاني: المنطق المادي والصناعات الخمس',
    title_en: 'Al-Mantiq: Material Logic & The Five Arts',
    desc_fa: 'تدریس عمیق بخش صناعات خمس کتاب المنطق مظفر شامل مباحث مواد قضایا، برهان انّی و لمّی، جدل، خطابه، شعر و نقد دقیق مغالطات سوفسطائی.',
    desc_ar: 'شرح مباحث الصناعات الخمس والبرهان والجدل والسفسطة من كتاب المنطق للعلامة المظفر.',
    desc_en: 'Analytical lecture series on the epistemology of demonstration and fallacies.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 45,
    duration_fa: '۳۵ ساعت',
    duration_ar: '٣٥ ساعة',
    duration_en: '35 Hours',
    level_fa: 'سطح تخصصی',
    level_ar: 'مستوى تخصصي',
    level_en: 'Advanced Level',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'منطق',
    telegramUrl: 'https://t.me/AlNajmosageb313/1156',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: مدخل بر منطق مادی و اصول مقدمات برهانی', duration: '42:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 2, title_fa: 'جلسه ۰۲: شرایط یقین و اصول اولیات و وجدانیات', duration: '45:00', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },

  // ==========================================
  // ۲. فلسفه (Philosophy)
  // ==========================================
  'course-falsafe-mabani': {
    id: 'course-falsafe-mabani',
    driveFolderId: '1W9PPLDAqo9vuXj3QwAsZ6BZp8LT6eXwi',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1W9PPLDAqo9vuXj3QwAsZ6BZp8LT6eXwi',
    title_fa: 'مبانی حکمت (درآمدی تحلیلی بر بدایة الحکمة)',
    title_ar: 'مبادئ الحكمة (مدخل تحليلي لبداية الحكمة)',
    title_en: 'Foundations of Islamic Wisdom (Introduction to Bidayah)',
    desc_fa: 'مقدمات ورود به فلسفه صدرایی، بازشناسی مسائل بنیادین وجود و ماهیت، اشتراک معنوی وجود و تمایزات تفکر برهانی.',
    desc_ar: 'مدخل تعليمي تأسيسي إلى الفلسفة الإسلامية ومباحث الوجود والماهية.',
    desc_en: 'Introduction to foundational Sadrian metaphysics.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 38,
    duration_fa: '۳۰ ساعت',
    duration_ar: '٣٠ ساعة',
    duration_en: '30 Hours',
    level_fa: 'مقدماتی تا متوسط',
    level_ar: 'مستوى تأسيسي',
    level_en: 'Foundational',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'hybrid',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/134',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: ضرورت فلسفه و ماهیت تفکر عقلی', duration: '48:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
    ]
  },
  'course-falsafe-bidayah': {
    id: 'course-falsafe-bidayah',
    driveFolderId: '1Vp7WXqet3c6ooZ7DIzH29Ls3eBfjDESv',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1Vp7WXqet3c6ooZ7DIzH29Ls3eBfjDESv',
    title_fa: 'دوره شرح بدایة الحکمة علامه طباطبایی (مباحث هستی‌شناسی صدرایی)',
    title_ar: 'شرح بداية الحكمة للعلامة الطباطبائي',
    title_en: 'Commentary on Bidayat al-Hikmah by Allamah Tabatabai',
    desc_fa: 'تدریس عمیق و برهانی مراحل دوازده‌گانه کتاب بدایة الحکمة شامل امور عامه، اصالت وجود، مواد ثلاث، علت و معلول، قوه و فعل و الهیات بالمعنی الاخص.',
    desc_ar: 'شرح تحليلي شامل لمباحث الوجود والماهية والعلية والوحدة والكثرة في مدرسة الحكمة المتعالية.',
    desc_en: 'A premier course in Sadrian metaphysics covering essence, existence, causality, and ontology.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 120,
    duration_fa: '۹۲ ساعت',
    duration_ar: '٩٢ ساعة',
    duration_en: '92 Hours',
    level_fa: 'سطح حوزوی و دانشگاهی',
    level_ar: 'مستوى حوزوي وأكاديمي',
    level_en: 'Seminary & University Level',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free Access',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/2102',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: مدخل بدایة الحکمة، تعریف موضوع فلسفه اولی', duration: '50:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 2, title_fa: 'جلسه ۰۲: بداهت مفهوم وجود و ادله اثبات اصالت وجود', duration: '52:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 3, title_fa: 'جلسه ۰۳: تشکیک وجود و دفع شبهات فخر رازی و متکلمان', duration: '47:45', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 4, title_fa: 'جلسه ۰۴: عدم و احکام عدمیه، بطلان شیئیت معدوم', duration: '54:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 5, title_fa: 'جلسه ۰۵: وجود ذهنی و حل معضل مطابقت ذهن و عین', duration: '56:00', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-falsafe-bidayah-azad': {
    id: 'course-falsafe-bidayah-azad',
    driveFolderId: '1-5WAkBawl4BOOAfyQtoOCHmQkan4Tu8X',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1-5WAkBawl4BOOAfyQtoOCHmQkan4Tu8X',
    title_fa: 'بدایة الحکمة با رویکرد تفکر آزاد و بررسی انتقادی آراء',
    title_ar: 'بداية الحكمة مع منهج التفكير الحر والنقد الفلسفي',
    title_en: 'Bidayat al-Hikmah: Critical Thinking and Comparative Reflections',
    desc_fa: 'بازخوانی آزاد و انتقادی مباحث بدایة الحکمة به همراه سنجش مدعیات آن با فلسفه غرب و مکاتب رقیب در علوم عقلی اسلامی.',
    desc_ar: 'قراءة نقدية حرة لكتاب بداية الحكمة ومقارنتها بالمدارس الفلسفية المعاصرة.',
    desc_en: 'Free inquiry and analytical critiques of classical metaphysical theses.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 54,
    duration_fa: '۴۲ ساعت',
    duration_ar: '٤٢ ساعة',
    duration_en: '42 Hours',
    level_fa: 'پژوهشی و تحلیلی',
    level_ar: 'مستوى بحثي وتحليلي',
    level_en: 'Analytical & Scholarly',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/4921',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: رویکرد متدولوژیک به تفکر آزاد در فلسفه صدرایی', duration: '46:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-falsafe-nihayah-1': {
    id: 'course-falsafe-nihayah-1',
    driveFolderId: '132qCGGDcM8mko1cEHmJxh1l3NU1K8FXE',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/132qCGGDcM8mko1cEHmJxh1l3NU1K8FXE',
    title_fa: 'شرح نهایة الحکمة علامه طباطبایی (جلد اول: احکام کلی وجود و ماهیت)',
    title_ar: 'شرح نهاية الحكمة للعلامة الطباطبائي (المجلد الأول)',
    title_en: 'Commentary on Nihayat al-Hikmah (Volume 1)',
    desc_fa: 'تدریس تخصصی مباحث عالی هستی‌شناسی صدرایی، براهین تشکیک، وحدت شخصی وجود، جعل، ماهیت و علل اربعه.',
    desc_ar: 'شرح تخصصي معمق لنهاية الحكمة في مباحث الوجود والماهية والعلية.',
    desc_en: 'Advanced seminar on Nihayat al-Hikmah volume 1 by Allamah Tabatabai.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 110,
    duration_fa: '۸۵ ساعت',
    duration_ar: '٨٥ ساعة',
    duration_en: '85 Hours',
    level_fa: 'سطح عالی حوزه و دکتری',
    level_ar: 'مستوى عالٍ ودكتوراه',
    level_en: 'Doctoral & Advanced Seminary',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/2218',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: مقدمه نهایه و مراتب عقلانیت فلسفی', duration: '49:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-falsafe-nihayah-2': {
    id: 'course-falsafe-nihayah-2',
    driveFolderId: '1LViXWRFLKq0ONqjiiqsj48RzMOPTDVjv',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1LViXWRFLKq0ONqjiiqsj48RzMOPTDVjv',
    title_fa: 'شرح نهایة الحکمة علامه طباطبایی (جلد دوم: مقولات، علیت، علم و عوالم کلی)',
    title_ar: 'شرح نهاية الحكمة للعلامة الطباطبائي (المجلد الثاني)',
    title_en: 'Commentary on Nihayat al-Hikmah (Volume 2)',
    desc_fa: 'شرح تحلیلی مراحل واپسین نهایة الحکمة شامل مقولات ده‌گانه، حرکت جوهری، زمان و الهیات بالمعنی الاخص.',
    desc_ar: 'شرح المجلد الثاني من نهاية الحكمة في المقولات والحركة الجوهرية وعلم النفس.',
    desc_en: 'Substantial motion, time, intellect, and divine theology in Nihayat al-Hikmah.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 95,
    duration_fa: '۷۵ ساعت',
    duration_ar: '٧٥ ساعة',
    duration_en: '75 Hours',
    level_fa: 'سطح عالی',
    level_ar: 'مستوى عالٍ',
    level_en: 'Advanced Level',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/2346',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: مبحث مقولات عشره و نقد اعتباری بودن کم و کیف', duration: '51:00', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-falsafe-ishraq': {
    id: 'course-falsafe-ishraq',
    driveFolderId: '15kZQ4jbH6XLap9_PqPTAAblTyqISHUPU',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/15kZQ4jbH6XLap9_PqPTAAblTyqISHUPU',
    title_fa: 'دوره تفصیلی شرح حکمت اشراق شیخ شهاب‌الدین سهروردی',
    title_ar: 'الدورة التفصيلية لشرح حكمة الإشراق للسهروردي',
    title_en: 'Comprehensive Commentary on Hikmat al-Ishraq by Suhrawardi',
    desc_fa: 'شرح اجتهادی متن اصیل حکمت اشراق، بازخوانی منطق اشراقی، قاعده امکان اشرف، نورالانوار، انوار قاهره و اسفهبدیه و جهان‌شناسی نوری سهروردی.',
    desc_ar: 'شرح تحقيقي معمق لكتاب حكمة الإشراق للشهيد السهروردي ونظام النور والظلمة والأنوار القاهرة والإسفهبذية.',
    desc_en: 'An in-depth seminar on Suhrawardi’s Illuminationist Philosophy, metaphysical light, and angelic ontologies.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 84,
    duration_fa: '۶۲ ساعت',
    duration_ar: '٦٢ ساعة',
    duration_en: '62 Hours',
    level_fa: 'سطح عالی و خارج حوزه',
    level_ar: 'مستوى الخارج والحوزة العليا',
    level_en: 'Advanced Kharij Level',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free Access',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'hybrid',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/4098',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: دیباچه حکمت اشراق، سلوک نوری و روش‌شناسی سهروردی', duration: '48:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 2, title_fa: 'جلسه ۰۲: نقد منطق ارسطویی در بخش اول حکمت اشراق', duration: '52:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 3, title_fa: 'جلسه ۰۳: حقیقت نور مجرد و بداهت نورانیت نفس', duration: '49:40', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 4, title_fa: 'جلسه ۰۴: قاعده امکان اشرف و مراتب صدور انوار قاهره', duration: '53:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 5, title_fa: 'جلسه ۰۵: برهان نورالانوار و توحید اشراقی در عالم اعلی', duration: '55:00', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
    ]
  },
  'course-falsafe-asfar-1': {
    id: 'course-falsafe-asfar-1',
    driveFolderId: '1bluEXqgLQex-E8D2gMtRxxT0vwLB6aEo',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1bluEXqgLQex-E8D2gMtRxxT0vwLB6aEo',
    title_fa: 'دوره خارج شرح اسفار اربعه ملاصدرا (سفر اول: فی الامور العامة - جلد ۱ سال ۱ و ۲)',
    title_ar: 'شرح الأسفار الأربعة لملا صدرا الشيرازي (السفر الأول في الأمور العامة)',
    title_en: 'Kharij Seminar on Asfar al-Arba’ah by Mulla Sadra (First Journey)',
    desc_fa: 'تدریس در سطح خارج حکمت متعالیه بر اساس متن شریف الحکمة المتعالیة فی الاسفار العقلیة الاربعة؛ بررسی برهان صدیقین، اصالت و تشکیک وجود، ربط حادث به قدیم و اعتبارات ماهیت.',
    desc_ar: 'دروس بحث الخارج في الحكمة المتعالية وشرح الأسفار الأربعة لملا صدرا الشيرازي مع تدقيق الآراء المقارنة.',
    desc_en: 'The definitive Kharij-level curriculum in Sadrian Transcendent Philosophy covering the complete metaphysical architecture.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 160,
    duration_fa: '۱۲۵ ساعت',
    duration_ar: '١٢٥ ساعة',
    duration_en: '125 Hours',
    level_fa: 'درس خارج علوم عقلی (اجتهادی)',
    level_ar: 'بحث خارج في العلوم العقلية',
    level_en: 'Advanced Kharij (Post-Doctoral)',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free Access',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'hybrid',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/4266',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: خطبه کتاب اسفار، سلوک فی الحق و مقاصد اربعه سفر عقلانی', duration: '55:20', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', videoUrl: 'https://www.youtube.com/watch?v=GKjiMYw7g_s', media_type: 'hybrid' },
      { id: 2, title_fa: 'جلسه ۰۲: اصالت وجود در برابر اصالت ماهیت و نقد شبهات محقق دوانی', duration: '58:40', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 3, title_fa: 'جلسه ۰۳: حقیقت وجود و نفی ترکب در هویت صرف الوجود', duration: '51:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 4, title_fa: 'جلسه ۰۴: قاعده الواحد لا یصدر عنه الا الواحد و تبیین فیض اول', duration: '53:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 5, title_fa: 'جلسه ۰۵: برهان صدیقین صدرایی بر وجوب و وحدت حقیقت هستی', duration: '59:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
    ]
  },
  'course-falsafe-shifa': {
    id: 'course-falsafe-shifa',
    driveFolderId: '1Q0S6FZ-LxF23e3oGm7IK1wakIjiY-pNn',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1Q0S6FZ-LxF23e3oGm7IK1wakIjiY-pNn',
    title_fa: 'شرح الهیات بالمعنی الاخص کتاب الشفاء شیخ الرئیس بوعلی سینا',
    title_ar: 'شرح إلهيات الشفاء للشيخ الرئيس ابن سينا',
    title_en: 'Commentary on Ilahiyyat al-Shifa by Ibn Sina (Avicenna)',
    desc_fa: 'شرح تحلیلی شاهکار فلسفه مشاء اسلامی؛ اثبات واجب‌الوجود، توحید، علم باری، صفات الهی و عنایت ربوبی در نظام فلسفی سینوی.',
    desc_ar: 'شرح مفصل لكتاب الإلهيات من كتاب الشفاء للشيخ الرئيس ابن سينا.',
    desc_en: 'Rigorous commentary on Avicenna’s magnum opus in Peripatetic theology.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 52,
    duration_fa: '۴۰ ساعت',
    duration_ar: '٤٠ ساعة',
    duration_en: '40 Hours',
    level_fa: 'سطح تخصصی مشاء',
    level_ar: 'مستوى تخصصي مشائي',
    level_en: 'Advanced Peripatetic',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/6046',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: مدخل بر الهیات شفا و اثبات وجود واجب بذاته', duration: '47:50', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-falsafe-manzumeh': {
    id: 'course-falsafe-manzumeh',
    driveFolderId: '10X6bsA_q1EuCxBMq07cCRSK7SXR8JB2D',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/10X6bsA_q1EuCxBMq07cCRSK7SXR8JB2D',
    title_fa: 'شرح غرر الفرائد (شرح منظومه حکمت ملاهادی سبزواری)',
    title_ar: 'شرح منظومة الحكمة للمولى هادي السبزواري',
    title_en: 'Sharh al-Manzumah by Hakim Sabzawari',
    desc_fa: 'شرح منظومه حکیم سبزواری که از متون اصیل درسی حوزه‌های علمیه در تبیین موجز و فنی مسائل امور عامه و جواهر و اعراض است.',
    desc_ar: 'شرح منظومة الحكمة للسبزواري في مباحث الأمور العامة والجواهر والأعراض.',
    desc_en: 'Commentary on Hakim Sabzawari’s poetic formulation of Transcendent Wisdom.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 130,
    duration_fa: '۱۰۰ ساعت',
    duration_ar: '١٠٠ ساعة',
    duration_en: '100 Hours',
    level_fa: 'سطح عالی حوزه',
    level_ar: 'مستوى حوزوي عالٍ',
    level_en: 'Advanced Seminary',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/2044',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: شرح بیت «فیه تجلی باهر لمن درى» و تعریف فلسفه', duration: '49:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-falsafe-isharat': {
    id: 'course-falsafe-isharat',
    driveFolderId: '1xKL9kXnXCHq2bnDggvUbK_GHkmHBtdN5',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1xKL9kXnXCHq2bnDggvUbK_GHkmHBtdN5',
    title_fa: 'شرح الاشارات و التنبیهات ابن سینا (دوره کامل ۱۰ نمط)',
    title_ar: 'شرح الإشارات والتنبيهات للشيخ الرئيس ابن سينا',
    title_en: 'Commentary on Al-Isharat wa al-Tanbihat (10 Namats)',
    desc_fa: 'تدریس عمیق ده نمط کتاب شریف الاشارات و التنبیهات ابن سینا به همراه مقایسه شروح خواجه نصیرالدین طوسی و فخرالدین رازی.',
    desc_ar: 'شرح الأنماط العشرة من الإشارات والتنبيهات لابن سينا مع شروح الطوسي والرازي.',
    desc_en: 'Avicenna’s final philosophical and mystical treatise analyzed comprehensively.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 85,
    duration_fa: '۶۸ ساعت',
    duration_ar: '٦٨ ساعة',
    duration_en: '68 Hours',
    level_fa: 'سطح تخصصی مشاء و عرفان',
    level_ar: 'مستوى تخصصي',
    level_en: 'Advanced Specialist',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/755',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: نمط اول در تجوهر اجسام و ترکیب ماده و صورت', duration: '51:40', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-falsafe-shawahed': {
    id: 'course-falsafe-shawahed',
    driveFolderId: '1UfnD5YyAtj4uRp4vXvcyRjh27N8AEQ8t',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1UfnD5YyAtj4uRp4vXvcyRjh27N8AEQ8t',
    title_fa: 'الشواهد الربوبیة فی المناهج السلوکیة صدرالمتألهین (سال اول و دوم)',
    title_ar: 'الشواهد الربوبية في المناهج السلوكية لملا صدرا',
    title_en: 'Al-Shawahid al-Rububiyyah by Mulla Sadra',
    desc_fa: 'شاهکار موجز و جامع ملاصدرا در ترکیب برهان و عرفان و شهود؛ شرح مشهد اول تا پنجم با رویکرد سلوک عقلی.',
    desc_ar: 'شرح كتاب الشواهد الربوبية لملا صدرا الشيرازي في براهين التوحيد والمعاد.',
    desc_en: 'Mulla Sadra’s synthesis of intellectual demonstration and spiritual contemplation.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 76,
    duration_fa: '۵۸ ساعت',
    duration_ar: '٥٨ ساعة',
    duration_en: '58 Hours',
    level_fa: 'سطح خارج حکمت متعالیه',
    level_ar: 'مستوى بحث خارج',
    level_en: 'Advanced Kharij',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/1353',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: دیباچه کتاب و مشهد اول در امور عامه الهی', duration: '46:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-falsafe-gharb': {
    id: 'course-falsafe-gharb',
    driveFolderId: '1KFKqJrbQGlvbDsEboBEyokI3PCrCPqtt',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1KFKqJrbQGlvbDsEboBEyokI3PCrCPqtt',
    title_fa: 'سیر تحلیلی تفکر در فلسفه غرب (از دکارت و کانت تا پدیدارشناسی معاصر)',
    title_ar: 'مسار الفكر في الفلسفة الغربية (من ديكارت وكانط إلى الفينومينولوجيا)',
    title_en: 'Critical Inquiries into Western Philosophy & Epistemology',
    desc_fa: 'سلسله جلسات انتقادی و تطبیقی نقد مکاتب فلسفه غرب (سوژه مدرن دکارتی، نقد عقل محض کانت، ایدئالیسم هگل و پدیدارشناسی هایدگر) در تراز حکمت اسلامی.',
    desc_ar: 'دراسات مقارنة نقدية لمباحث الفلسفة الغربية ونظرية المعرفة المعاصرة.',
    desc_en: 'Critical studies of Western philosophical paradigms from Descartes and Kant to contemporary phenomenology.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 40,
    duration_fa: '۳۲ ساعت',
    duration_ar: '٣٢ ساعة',
    duration_en: '32 Hours',
    level_fa: 'فلسفه تطبیقی و معاصر',
    level_ar: 'فلسفة مقارنة ومعاصرة',
    level_en: 'Comparative Philosophy',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'video',
    course_type: 'offline',
    subject: 'فلسفه',
    telegramUrl: 'https://t.me/AlNajmosageb313/2413',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: تولد سوژه در تفکر دکارت و بحران یقین در غرب', duration: '47:20', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'video' },
      { id: 2, title_fa: 'جلسه ۰۲: نقد کانت بر مابعدالطبیعه سنتی و پاسخ حکمت صدرایی', duration: '52:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'video' },
    ]
  },

  // ==========================================
  // ۳. کلام (Kalam)
  // ==========================================
  'course-kalam-tajrid': {
    id: 'course-kalam-tajrid',
    driveFolderId: '179y6LdMWjks7FdhKbYy4fgQcEVgGRZw9',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/179y6LdMWjks7FdhKbYy4fgQcEVgGRZw9',
    title_fa: 'شرح تجرید الاعتقاد (کشف المراد علامه حلی در عقاید امامیه)',
    title_ar: 'كشف المراد في شرح تجريد الاعتقاد للعلامة الحلي',
    title_en: 'Kashf al-Murad fi Sharh Tajrid al-I’tiqad',
    desc_fa: 'تدریس عمیق مهم‌ترین متن کلام برهانی شیعه؛ تألیف خواجه نصیرالدین طوسی و شرح علامه حلی در اثبات صانع، صفات ثبوتیه و سلبیه، نبوت، امامت و معاد.',
    desc_ar: 'شرح تحليلي معمق لأهم كتاب في علم الكلام الشيعي الإمامي.',
    desc_en: 'Foundational text of Shi’a rational theology by Khawaja Nasir al-Din Tusi with commentary by Allamah al-Hilli.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 70,
    duration_fa: '۵۵ ساعت',
    duration_ar: '٥٥ ساعة',
    duration_en: '55 Hours',
    level_fa: 'کلام استدلالی و عقاید',
    level_ar: 'كلام استدلالي وعقائد',
    level_en: 'Systematic Theology',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'کلام',
    telegramUrl: 'https://t.me/AlNajmosageb313/1230',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: مقصد اول در امور عامه کلامی و اثبات نیاز به مبدأ', duration: '50:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 2, title_fa: 'جلسه ۰۲: برهان امکان و وجوب در اثبات واجب تعالی', duration: '54:20', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },

  // ==========================================
  // ۴. عرفان نظری (Theoretical Mysticism)
  // ==========================================
  'course-erfan-mabani': {
    id: 'course-erfan-mabani',
    driveFolderId: '19-VVC89_96IgKKOv0eootTnag6lQuMIt',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/19-VVC89_96IgKKOv0eootTnag6lQuMIt',
    title_fa: 'مبانی و درآمدی بر عرفان نظری اسلامی',
    title_ar: 'مبادئ ومدخل إلى العرفان النظري الإسلامي',
    title_en: 'Foundations of Islamic Theoretical Mysticism',
    desc_fa: 'تبیین مفاهیم بنیادین وحدت وجود، تجلی، اسماء و صفات، اعیان ثابته و عوالم کلی پنج‌گانه (حضرات خمس).',
    desc_ar: 'مدخل تعليمي إلى مباحث وحدة الوجود والتجلي الإلهي والأسماء والصفات.',
    desc_en: 'Introduction to Islamic metaphysical mysticism and ontology of divine manifestation.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 28,
    duration_fa: '۲۲ ساعت',
    duration_ar: '٢٢ ساعة',
    duration_en: '22 Hours',
    level_fa: 'مقدماتی تا متوسط',
    level_ar: 'مستوى تأسيسي',
    level_en: 'Introductory Level',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'عرفان نظری',
    telegramUrl: 'https://t.me/AlNajmosageb313/224',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: تمایز روش‌شناسی عرفان نظری از فلسفه و کلام', duration: '45:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-erfan-tamhid': {
    id: 'course-erfan-tamhid',
    driveFolderId: '19-VVC89_96IgKKOv0eootTnag6lQuMIt',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/19-VVC89_96IgKKOv0eootTnag6lQuMIt',
    title_fa: 'شرح تمهید القواعد صائن‌الدین علی بن محمد ترکه اصفهانی',
    title_ar: 'شرح تمهيد القواعد لابن تركة الأصفهاني',
    title_en: 'Commentary on Tamhid al-Qawa’id by Ibn Turkah',
    desc_fa: 'تدریس تخصصی اثر برجسته ابن‌ترکه در اثبات برهانی توحید صمدی قرآنی و وحدت شخصی وجود بر پایه مبانی مکتب ابن‌عربی.',
    desc_ar: 'شرح برهاني عرفاني لكتاب تمهيد القواعد في إثبات وحدة الوجود وتوحيد الأسماء.',
    desc_en: 'Rigorous philosophical demonstration of the Oneness of Being based on Ibn Turkah.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 90,
    duration_fa: '۷۰ ساعت',
    duration_ar: '٧٠ ساعة',
    duration_en: '70 Hours',
    level_fa: 'سطح عالی عرفان برهانی',
    level_ar: 'مستوى عالٍ في العرفان البرهاني',
    level_en: 'Advanced Mystical Philosophy',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'عرفان نظری',
    telegramUrl: 'https://t.me/AlNajmosageb313/1315',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: دیباچه کتاب و اصول قواعد توحید ذاتی و اسمی', duration: '50:40', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-erfan-qaysari': {
    id: 'course-erfan-qaysari',
    driveFolderId: '19-VVC89_96IgKKOv0eootTnag6lQuMIt',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/19-VVC89_96IgKKOv0eootTnag6lQuMIt',
    title_fa: 'شرح مقدمه قیصری بر فصوص الحکم داوود بن محمود قیصری',
    title_ar: 'شرح مقدمة القيصري على فصوص الحكم للشيخ الأكبر',
    title_en: 'Commentary on Qaysari’s Introduction to Fusus al-Hikam',
    desc_fa: 'تدریس جامع‌ترین و فنی‌ترین مدخل عرفان نظری اسلامی؛ دوازده فصل کلیدی در توحید، اسماء حسنی، ولایت و نبوت، نبوت عامه و حقیقت انسانی.',
    desc_ar: 'شرح اثني عشر فصلاً في الأصول العرفانية والتجليات والولایة والرسالة.',
    desc_en: 'A foundational masterwork systematically detailing the taxonomy of Ibn Arabi’s mystical ontology.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 65,
    duration_fa: '۵۲ ساعت',
    duration_ar: '٥٢ ساعة',
    duration_en: '52 Hours',
    level_fa: 'سطح تخصصی',
    level_ar: 'مستوى تخصصي',
    level_en: 'Specialist Level',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'عرفان نظری',
    telegramUrl: 'https://t.me/AlNajmosageb313/3070',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: فصل اول در وجود و احکام آن که عین حق تعالی است', duration: '48:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-erfan-fusus': {
    id: 'course-erfan-fusus',
    driveFolderId: '19-VVC89_96IgKKOv0eootTnag6lQuMIt',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/19-VVC89_96IgKKOv0eootTnag6lQuMIt',
    title_fa: 'دوره سه ساله شرح فصوص الحکم شیخ اکبر محیی‌الدین ابن‌عربی (سال اول، دوم و سوم)',
    title_ar: 'شرح فصوص الحكم للشيخ الأكبر ابن عربي (الدورة الثلاثية الكاملة)',
    title_en: 'Comprehensive 3-Year Seminar on Fusus al-Hikam by Ibn Arabi',
    desc_fa: 'تدریس فقره به فقره و تأویل متن قله عرفان نظری؛ شرح فص آدمیه، نوحیه، ابراهیمیه، اسماعیلیه، موسویه و محمدیه با استناد به شروح معتبر.',
    desc_ar: 'شرح الفصوص النبوية من فص الحكمة الآدمية إلى فص الحكمة المحمدية.',
    desc_en: 'The definitive lecture series analyzing the prophetic wisdoms of Ibn Arabi.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 140,
    duration_fa: '۱۱۰ ساعت',
    duration_ar: '١١٠ ساعة',
    duration_en: '110 Hours',
    level_fa: 'درس خارج عرفان نظری',
    level_ar: 'بحث خارج في العرفان النظري',
    level_en: 'Kharij Level Mysticism',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free Access',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'hybrid',
    course_type: 'offline',
    subject: 'عرفان نظری',
    telegramUrl: 'https://t.me/AlNajmosageb313/6308',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: فص حکمة الهیة فی کلمة آدمیة؛ آفرینش انسان کامل به عنوان مرآت وجود', duration: '52:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
      { id: 2, title_fa: 'جلسه ۰۲: نسبت اعیان ثابته با اسماء الهیه در فص آدمی', duration: '55:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'hybrid' },
    ]
  },

  // ==========================================
  // ۵. عرفان عملی (Practical Mysticism)
  // ==========================================
  'course-erfan-manazil': {
    id: 'course-erfan-manazil',
    driveFolderId: '1l9iMC4j3T2p5kqGnxthqCEQZhSCMw34T',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1l9iMC4j3T2p5kqGnxthqCEQZhSCMw34T',
    title_fa: 'شرح منازل السائرین الی الحق جل وعلا خواجه عبدالله انصاری',
    title_ar: 'شرح منازل السائرين لشيخ الإسلام خواجه عبد الله الأنصاري',
    title_en: 'Commentary on Manazil al-Sa’irin by Khwaja Abdullah Ansari',
    desc_fa: 'تدریس صد میدان و صد منزل سلوک الی الله از بدایات تا نهایات؛ تبیین مقامات توبه، انابت، محاسبه، تفکر، اخلاص، توکل، رضا و توحید شهودی.',
    desc_ar: 'شرح مقامات السير والسلوك ومنازل القاصدين من التوبة إلى عين الجمع والتوحيد.',
    desc_en: 'The classical Persian-Islamic spiritual guide mapping the hundred stations of spiritual journey.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 80,
    duration_fa: '۶۰ ساعت',
    duration_ar: '٦٠ ساعة',
    duration_en: '60 Hours',
    level_fa: 'سیر و سلوک توحیدی',
    level_ar: 'سير وسلوك وتزكية النفس',
    level_en: 'Spiritual Wayfaring',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free Access',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'عرفان عملی',
    telegramUrl: 'https://t.me/AlNajmosageb313/5406',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: باب البدایات: حقیقت یقظه (بیداری قلب از خواب غفلت)', duration: '47:15', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 2, title_fa: 'جلسه ۰۲: باب التوبة: شرایط سه‌گانه توبه نصوح و جبران مافات', duration: '50:40', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
      { id: 3, title_fa: 'جلسه ۰۳: باب المحاسبة: مراقبه دائمی و میزان سنجش اعمال', duration: '46:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-erfan-awsaf': {
    id: 'course-erfan-awsaf',
    driveFolderId: '1l9iMC4j3T2p5kqGnxthqCEQZhSCMw34T',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1l9iMC4j3T2p5kqGnxthqCEQZhSCMw34T',
    title_fa: 'شرح اوصاف الاشراف فی السیر و السلوک خواجه نصیرالدین طوسی',
    title_ar: 'شرح أوصاف الأشراف للخواجه نصير الدين الطوسي',
    title_en: 'Commentary on Awsaf al-Ashraf by Nasir al-Din Tusi',
    desc_fa: 'تحلیل رساله سلوکی خواجه طوسی در اخلاق عقلانی و مقامات سیر الی الله با بیانی دقیق و برهانی.',
    desc_ar: 'شرح في الأخلاق العرفانية والسلوك العقلاني التوحيدي.',
    desc_en: 'Tusi’s brilliant philosophical-ethical treatise on the virtuous soul’s spiritual ascension.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 35,
    duration_fa: '۲۸ ساعت',
    duration_ar: '٢٨ ساعة',
    duration_en: '28 Hours',
    level_fa: 'سلوک عقلانی و اخلاق عرفانی',
    level_ar: 'سلوك عقلاني وأخلاق',
    level_en: 'Ethical Mysticism',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'عرفان عملی',
    telegramUrl: 'https://t.me/AlNajmosageb313/5661',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: در حرکت سالک و شرایط مقدماتی سفر الی الله', duration: '44:20', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },

  // ==========================================
  // ۶. تفسیر (Tafsir)
  // ==========================================
  'course-tafsir-hamd': {
    id: 'course-tafsir-hamd',
    driveFolderId: '1sfyx2RGAAyvsPplqK8bznjnhujpfEbd5',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1sfyx2RGAAyvsPplqK8bznjnhujpfEbd5',
    title_fa: 'تفسیر سوره مبارکه حمد صدرالمتألهین ملاصدرا الشیرازی',
    title_ar: 'تفسير سورة الحمد لصدر المتألهين الشيرازي',
    title_en: 'Esoteric Commentary on Surah al-Hamd by Mulla Sadra',
    desc_fa: 'تحلیل ژرف و برهانی بطون قرآنی فاتحة الکتاب بر مبنای حکمت متعالیه؛ اسرار بسم الله الرحمن الرحیم، ربوبیت عامه و صراط مستقیم.',
    desc_ar: 'تفسير عقلي وعرفاني فلسفي لسورة الفاتحة من تفسير القرآن الكريم لملا صدرا.',
    desc_en: 'Metaphysical and contemplative exegesis of the opening chapter of the Holy Qur’an.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 32,
    duration_fa: '۲۵ ساعت',
    duration_ar: '٢٥ ساعة',
    duration_en: '25 Hours',
    level_fa: 'تفسیر عقلی و فلسفی قرآن',
    level_ar: 'تفسير عقلي وعرفاني',
    level_en: 'Philosophical Exegesis',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free Access',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'تفسیر',
    telegramUrl: 'https://t.me/AlNajmosageb313/4229',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: حقیقت کتاب الله و مراتب نزول وحی و تاویل وجودی', duration: '48:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-tafsir-baqarah': {
    id: 'course-tafsir-baqarah',
    driveFolderId: '1sfyx2RGAAyvsPplqK8bznjnhujpfEbd5',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/1sfyx2RGAAyvsPplqK8bznjnhujpfEbd5',
    title_fa: 'تفسیر عرفانی و انفسی سوره مبارکه بقره (سال اول)',
    title_ar: 'التفسير العرفاني والأنفسي لسورة البقرة المباركة',
    title_en: 'Contemplative & Mystical Exegesis of Surah al-Baqarah',
    desc_fa: 'سلسله دروس شرح آیات شریفه سوره بقره با رویکرد سلوک انفسی، انسان‌شناسی قرآنی، خلافت آدم و هدایت متقین.',
    desc_ar: 'دروس في التفسير الأنفسي والعرفاني لآيات سورة البقرة المباركة.',
    desc_en: 'An ongoing mystical commentary series extracting ontological lessons from Surah al-Baqarah.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 48,
    duration_fa: '۳۸ ساعت',
    duration_ar: '٣٨ ساعة',
    duration_en: '38 Hours',
    level_fa: 'تفسیر انفسی قرآن مجید',
    level_ar: 'تفسير أنفسي للقرآن',
    level_en: 'Inward Qur’anic Hermeneutics',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'تفسیر',
    telegramUrl: 'https://t.me/AlNajmosageb313/6242',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: «الم * ذلك الکتاب لا ریب فیه»؛ هدایت متقین و درجات ایمان غیب', duration: '51:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },

  // ==========================================
  // ۷. اصول (Usul al-Fiqh)
  // ==========================================
  'course-osul-rasael-1': {
    id: 'course-osul-rasael-1',
    driveFolderId: '186qIjRcaKmiF6W8Z1SUwixaG2bcoLXIe',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/186qIjRcaKmiF6W8Z1SUwixaG2bcoLXIe',
    title_fa: 'فرائد الاصول (رسائل ۱: مباحث قطع و ظن شیخ اعظم انصاری)',
    title_ar: 'فرائد الأصول (الرسائل ۱: مباحث القطع والظن للشيخ الأنصاري)',
    title_en: 'Fara’id al-Usul (Rasa’il 1: Qat’ and Zann by Sheikh Ansari)',
    desc_fa: 'تدریس متن اجتهادی فرائد الاصول شیخ مرتضی انصاری؛ اقسام قطع، حجیت ذاتی قطع، قطع قطاع، تجری و ادله حجیت ظن و خبر واحد.',
    desc_ar: 'دروس تخصصية في أصول الفقه لمباحث القطع والظن وحجية الخبر الواحد.',
    desc_en: 'Seminal jurisprudence course on epistemology of legal certainty and probabilistic evidence.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 85,
    duration_fa: '۶۵ ساعت',
    duration_ar: '٦٥ ساعة',
    duration_en: '65 Hours',
    level_fa: 'سطوح عالی اصول فقه',
    level_ar: 'السطوح العليا في أصول الفقه',
    level_en: 'Advanced Legal Theory',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'اصول',
    telegramUrl: 'https://t.me/AlNajmosageb313/1869',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: تقسیم حالات مکلف به قطع و ظن و شک و ذاتی بودن کاشفیت قطع', duration: '49:20', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-osul-kifayah-1': {
    id: 'course-osul-kifayah-1',
    driveFolderId: '186qIjRcaKmiF6W8Z1SUwixaG2bcoLXIe',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/186qIjRcaKmiF6W8Z1SUwixaG2bcoLXIe',
    title_fa: 'کفایة الاصول آخوند خراسانی (جلد اول: مباحث الفاظ و اوامر و نواهی)',
    title_ar: 'كفاية الأصول للآخوند الخراساني (الجزء الأول: مباحث الألفاظ)',
    title_en: 'Kifayat al-Usul by Akhund Khorasani (Volume 1)',
    desc_fa: 'شرح تحلیلی قله علم اصول فقه معاصر؛ بررسی حقیقت وضع، مشتق، اوامر، نواهی، مفاهیم، عام و خاص و مطلق و مقید.',
    desc_ar: 'شرح دقيق لكتاب كفاية الأصول للآخوند الخراساني في مباحث الألفاظ ودلالاتها.',
    desc_en: 'Mastery over the foremost text of analytical Islamic jurisprudence and linguistic philosophy.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 90,
    duration_fa: '۷۲ ساعت',
    duration_ar: '٧٢ ساعة',
    duration_en: '72 Hours',
    level_fa: 'سطوح عالی و خارج اصول',
    level_ar: 'السطوح العليا وبحث الخارج',
    level_en: 'Advanced Legal Philosophy',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'اصول',
    telegramUrl: 'https://t.me/AlNajmosageb313/4448',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: تعریف علم اصول و موضوع آن و تمایز مسائل اصولی از فقهی', duration: '52:45', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-osul-halaqat': {
    id: 'course-osul-halaqat',
    driveFolderId: '186qIjRcaKmiF6W8Z1SUwixaG2bcoLXIe',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/186qIjRcaKmiF6W8Z1SUwixaG2bcoLXIe',
    title_fa: 'دروس فی علم الاصول (حلقه ثالثه شهید آیت‌الله سید محمدباقر صدر)',
    title_ar: 'دروس في علم الأصول (الحلقة الثالثة للشهيد الصدر)',
    title_en: 'Durus fi Ilm al-Usul (Al-Halaqah al-Thalithah by Shahid Sadr)',
    desc_fa: 'تدریس مهندسی اصول فقه نوین با متدولوژی شهید صدر؛ بررسی ادله محرزه، اصول عملیه، تزاحم و تعارض ادله با رویکرد منطقی و ساختاریافته.',
    desc_ar: 'شرح الحلقة الثالثة للشهيد محمد باقر الصدر في أصول الفقه التحليلي المعاصر.',
    desc_en: 'Analytical and contemporary structuring of legal methodology by Shahid Baqir al-Sadr.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 65,
    duration_fa: '۵۰ ساعت',
    duration_ar: '٥٠ ساعة',
    duration_en: '50 Hours',
    level_fa: 'اصول نوین و تحلیلی',
    level_ar: 'أصول معاصرة وتحليلية',
    level_en: 'Contemporary Legal Theory',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'اصول',
    telegramUrl: 'https://t.me/AlNajmosageb313/1542',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: تمایز دلیل شرعی از عقلی و ماهیت جعل حکم شرعی', duration: '46:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },

  // ==========================================
  // ۸. فقه (Jurisprudence)
  // ==========================================
  'course-fiqh-makasib-1': {
    id: 'course-fiqh-makasib-1',
    driveFolderId: '13mqu2jGgqPD11yQqz3GFO2e2A2b8XUp9',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/13mqu2jGgqPD11yQqz3GFO2e2A2b8XUp9',
    title_fa: 'مکاسب محرمه شیخ مرتضی انصاری (فقه استدلالی خارج - بخش ۱)',
    title_ar: 'المكاسب المحرمة للشيخ مرتضى الأنصاري (فقه استدلالي)',
    title_en: 'Al-Makasib al-Muharramah by Sheikh Ansari (Advanced Fiqh)',
    desc_fa: 'درس خارج فقه استدلالی معاملات؛ بررسی احکام تکلیفی و وضعی کسب‌های محرم، آلات لهو، اعیان نجسه و بیع کتب ضلال.',
    desc_ar: 'دروس في بحث الخارج لكتاب المكاسب المحرمة للشيخ الأعظم الأنصاري.',
    desc_en: 'Advanced Kharij jurisprudence seminars on prohibited commercial transactions.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 95,
    duration_fa: '۷۵ ساعت',
    duration_ar: '٧٥ ساعة',
    duration_en: '75 Hours',
    level_fa: 'درس خارج فقه معاملات',
    level_ar: 'بحث خارج في فقه المعاملات',
    level_en: 'Advanced Kharij Jurisprudence',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فقه',
    telegramUrl: 'https://t.me/AlNajmosageb313/5835',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: تقسیم مکاسب به محرمه و مباحه و قاعده حرمت اعانت بر اثم', duration: '51:30', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-fiqh-shurut': {
    id: 'course-fiqh-shurut',
    driveFolderId: '13mqu2jGgqPD11yQqz3GFO2e2A2b8XUp9',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/13mqu2jGgqPD11yQqz3GFO2e2A2b8XUp9',
    title_fa: 'شروط المتعاقدین و احکام عقد بیع (کتاب المکاسب شیخ انصاری)',
    title_ar: 'شروط المتعاقدين وأحكام البيع في المكاسب',
    title_en: 'Conditions of Contractants in Islamic Law (Al-Makasib)',
    desc_fa: 'بررسی فقهی شرایط اهلیت، بلوغ، عقل، قصد و اختیار در طرفین معامله و احکام بیع فضولی.',
    desc_ar: 'شرح شروط المتعاقدين من البلوغ والعقل والقصد والاختيار في الفقه الاستدلالي.',
    desc_en: 'The legal doctrines of contractual capacity, intent, and agency in Islamic civil law.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 60,
    duration_fa: '۴۸ ساعت',
    duration_ar: '٤٨ ساعة',
    duration_en: '48 Hours',
    level_fa: 'سطوح عالی فقه',
    level_ar: 'السطوح العليا في الفقه',
    level_en: 'Advanced Legal Studies',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فقه',
    telegramUrl: 'https://t.me/AlNajmosageb313/5948',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: شرط البلوغ فی المتعاقدین و ادله عدم نفوذ معاملات صبی', duration: '49:10', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },
  'course-fiqh-khiyar': {
    id: 'course-fiqh-khiyar',
    driveFolderId: '13mqu2jGgqPD11yQqz3GFO2e2A2b8XUp9',
    cloudStreamUrl: 'https://drive.google.com/drive/folders/13mqu2jGgqPD11yQqz3GFO2e2A2b8XUp9',
    title_fa: 'خیار عیب و احکام خیارات بیع (کتاب المکاسب شیخ انصاری)',
    title_ar: 'خيار العيب وأحكام الخيارات في المكاسب',
    title_en: 'Option of Defect (Khiyar al-Ayb) & Contractual Remedies',
    desc_fa: 'تدریس فقهی احکام عیوب مبیع، آرش و فسخ، و قواعد حاکم بر حق فسخ در عقود لازم.',
    desc_ar: 'شرح خيار العيب وأحكام الأرش والفسخ في فقه المعاملات.',
    desc_en: 'Contractual warranties and remedies under the law of sales.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 50,
    duration_fa: '۴۰ ساعت',
    duration_ar: '٤٠ ساعة',
    duration_en: '40 Hours',
    level_fa: 'سطوح عالی فقه',
    level_ar: 'السطوح العليا',
    level_en: 'Advanced Fiqh',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'audio',
    course_type: 'offline',
    subject: 'فقه',
    telegramUrl: 'https://t.me/AlNajmosageb313/5086',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: تعریف عیب و ملاک تشخیص نقص و زیاده در مبیع', duration: '47:40', isFreePreview: true, audioUrl: '/audio/sample_lecture.wav', media_type: 'audio' },
    ]
  },

  // ==========================================================
  // ۹. دوره‌های آنلاین
  // ==========================================================
  'course-online-sadra-ishraq': {
    id: 'course-online-sadra-ishraq',
    title_fa: 'روش‌شناسی اجتهادی متون حکمت صدرایی و اشراق',
    title_ar: 'منهجية الاجتهاد في نصوص الحكمة الصدرائية والإشراقية',
    title_en: 'Hermeneutical Methodology in Sadrian and Illuminationist Texts',
    desc_fa: 'دوره تعاملی و زنده با ظرفیت ۳۰ نفر جهت بازخوانی عبارات دشوار اسفار و حکمت اشراق با هدایت مستقیم استاد حجت الاسلام دکتر زنجیر زن حسینی.',
    desc_ar: 'ورشة تفاعلية مباشرة بسعة محدودة (٣٠ مقعداً) لقراءة النصوص الفلسفية المعقدة.',
    desc_en: 'Interactive live seminar with limited enrollment (30 seats) analyzing complex metaphysical texts.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 12,
    duration_fa: '۱۸ ساعت آنلاین',
    duration_ar: '١٨ ساعة مباشرة',
    duration_en: '18 Hours Live',
    level_fa: 'پیشرفته',
    level_ar: 'متقدم',
    level_en: 'Advanced',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'video',
    course_type: 'online',
    subject: 'فلسفه',
    platform: 'online',
    capacity: 30,
    enrolledCount: 22,
    schedule: 'دوشنبه‌ها ساعت ۱۸:۰۰ الی ۱۹:۳۰',
    skyroomUrl: 'https://www.skyroom.online/ch/zanjirzan/sadra-ishraq-live',
    status: 'registration_open',
    chapters: [
      { id: 1, title_fa: 'جلسه افتتاحیه: نقشه راه سلوک عقلی در متون کهن', duration: '90:00', isFreePreview: true, videoUrl: 'https://www.youtube.com/watch?v=GKjiMYw7g_s', media_type: 'video' },
      { id: 2, title_fa: 'جلسه دوم: تحلیل برهان وحدت شخصی در اسفار', duration: '90:00', isFreePreview: false, media_type: 'video' },
    ]
  },
  'course-online-epistemology': {
    id: 'course-online-epistemology',
    title_fa: 'نقد معرفت‌شناختی فیزیکالیسم و مسئله کوالیا در فلسفه ذهن',
    title_ar: 'النقد المعرفي للفيزيائية ومعضلة الكواليا في فلسفة العقل',
    title_en: 'Epistemic Critique of Physicalism & Qualia in Philosophy of Mind',
    desc_fa: 'نشست تحلیلی زنده پیرامون مسئله دشوار آگاهی (The Hard Problem of Consciousness) و ابطال فیزیکالیسم از منظر علم حضوری صدرایی.',
    desc_ar: 'ندوة فكرية مباشرة تبحث معضلة الوعي الذاتي والتجربة الظاهراتية.',
    desc_en: 'Specialized live webinar tackling physicalism and consciousness through Islamic presence knowledge.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 8,
    duration_fa: '۱۲ ساعت آنلاین',
    duration_ar: '١٢ ساعة مباشرة',
    duration_en: '12 Hours Live',
    level_fa: 'پیشرفته',
    level_ar: 'متقدم',
    level_en: 'Advanced',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'video',
    course_type: 'online',
    subject: 'کلام',
    platform: 'online',
    capacity: 25,
    enrolledCount: 21,
    schedule: 'چهارشنبه‌ها ساعت ۱۹:۰۰',
    skyroomUrl: 'https://www.skyroom.online/ch/zanjirzan/epistemology-live',
    status: 'registration_open',
    chapters: [
      { id: 1, title_fa: 'جلسه اول: گزارش اجمالی از فیزیکالیسم تقلیلی و غیرتقلیلی', duration: '90:00', isFreePreview: true, videoUrl: 'https://www.youtube.com/watch?v=dpwVDaY_yT8', media_type: 'video' },
    ]
  },
  'course-online-manazil-live': {
    id: 'course-online-manazil-live',
    title_fa: 'شرح منازل السائرین و سلوک عقلانی توحیدی',
    title_ar: 'شرح منازل السائرين والسلوك التوحيدي',
    title_en: 'Manazil al-Sa’irin & Practical Monotheistic Ascension',
    desc_fa: 'نشست هفتگی زنده؛ بررسی ابواب طهارت سر، اخلاص، توکل و رضا با حضور پرسشگران.',
    desc_ar: 'جلسات أسبوعية مباشرة في تهذيب الباطن والمقامات العرفانية.',
    desc_en: 'Weekly live interactive sessions on inner wayfaring and spiritual perfection.',
    instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی',
    instructor_ar: 'حجة الإسلام الدكتور زنجير زن حسيني',
    instructor_en: 'Hojjat al-Islam Dr. Zanjirzan Hosseini',
    episodes_count: 15,
    duration_fa: '۲۲ ساعت آنلاین',
    duration_ar: '٢٢ ساعة مباشرة',
    duration_en: '22 Hours Live',
    level_fa: 'متوسط',
    level_ar: 'متوسط',
    level_en: 'Intermediate',
    price_fa: 'رایگان',
    price_ar: 'مجاني',
    price_en: 'Free',
    sampleAudioUrl: '/audio/sample_lecture.wav',
    media_type: 'video',
    course_type: 'online',
    subject: 'عرفان عملی',
    platform: 'online',
    capacity: 35,
    enrolledCount: 35,
    schedule: 'پنجشنبه‌ها ساعت ۱۷:۰۰',
    skyroomUrl: 'https://www.skyroom.online/ch/zanjirzan/manazil-live',
    status: 'capacity_full',
    chapters: [
      { id: 1, title_fa: 'جلسه ۰۱: صد منزل سلوک و اهمیت استاد راهنما در گذر از ظلمات نفس', duration: '85:00', isFreePreview: true, videoUrl: 'https://www.youtube.com/watch?v=KoOiRI_gt-k', media_type: 'video' },
    ]
  }
};

// Re-export i18n dictionaries and types for backwards compatibility
export { i18nDict, type SupportedLang } from '@/locales';
