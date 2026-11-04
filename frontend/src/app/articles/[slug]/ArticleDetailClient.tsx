'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Copy,
  Check,
  Printer,
  Share2,
  Headphones,
  Quote,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { useCart } from '@/context/CartContext';
import { scholarlyArticlesDatabase } from '@/lib/data';
import { getLocalizedArticle, getLocalizedCourse } from '@/lib/localization';
import { SCHOLAR_NAME } from '@/lib/constants';
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
  Separator,
} from '@/components/ui';

interface ArticleDetailClientProps {
  slug: string;
}

export function ArticleDetailClient({ slug }: ArticleDetailClientProps) {
  const { currentLang, dict, toLocale, localizeHref } = useLanguage();
  const { courses, articles } = useData();
  const { items: cartItems, isOpen: isCartOpen, openCart, closeCart, removeItem } = useCart();

  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const rawArticle = useMemo(() => {
    const list = articles && articles.length > 0 ? articles : scholarlyArticlesDatabase;
    return (
      list.find((a) => a.slug === slug || a.id === slug) ||
      scholarlyArticlesDatabase.find((a) => a.slug === slug || a.id === slug) ||
      scholarlyArticlesDatabase[0]
    );
  }, [slug, articles]);

  const locArticle = useMemo(
    () => getLocalizedArticle(rawArticle, currentLang),
    [rawArticle, currentLang]
  );

  const title = locArticle?.title || rawArticle.title_fa || rawArticle.title;
  const category = locArticle?.category || rawArticle.category_fa || rawArticle.category;
  const readTime = locArticle?.readTime || rawArticle.readTime_fa || rawArticle.readTime;
  const publishDate = locArticle?.publishDate || rawArticle.publishDate_fa || rawArticle.publishDate;
  const abstractText = locArticle?.abstract || rawArticle.abstract_fa || rawArticle.abstract;
  const authorName = dict.scholar_name || SCHOLAR_NAME;

  const relatedCourses = useMemo(() => {
    const all = Object.values(courses);
    const matched = all.filter((c) => c.subject === rawArticle.category);
    return (matched.length > 0 ? matched : all).slice(0, 2);
  }, [courses, rawArticle.category]);

  const citationString = useMemo(() => {
    if (currentLang === 'en') {
      return `${authorName}. (${publishDate}). "${title}". Hayat Academic Platform. https://zanjirzan.ir/articles/${rawArticle.slug}`;
    }
    if (currentLang === 'ar') {
      return `${authorName}. (${publishDate}). «${title}». بوابة حياة العلمية. https://zanjirzan.ir/articles/${rawArticle.slug}`;
    }
    return `${authorName}. (${publishDate}). «${title}». پایگاه علمی و پژوهشی حیات. https://zanjirzan.ir/articles/${rawArticle.slug}`;
  }, [authorName, publishDate, title, rawArticle.slug, currentLang]);

  const handleCopyCitation = () => {
    triggerTactileHaptic('tick');
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(citationString);
      setCopiedCitation(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedCitation(false), 2200);
    }
  };

  const handleShare = async () => {
    triggerTactileHaptic('tick');
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text: abstractText,
            url: window.location.href,
          });
          return;
        } catch (shareErr) {
          console.debug('Navigator share aborted or unsupported, falling back to clipboard:', shareErr);
        }
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
        shareTimeoutRef.current = setTimeout(() => setCopiedShare(false), 2200);
      }
    }
  };

  const sections = useMemo(() => {
    if (currentLang === 'en') {
      return [
        {
          heading: '1. Problem Statement & Epistemological Grounding',
          body: 'In the analytical tradition of Islamic philosophy, every metaphysical claim must first undergo rigorous conceptual demarcation in formal and material logic. Confusing the mental concept of reality with its extra-mental instantiation has historically been the root of numerous theological and philosophical fallacies.',
        },
        {
          heading: '2. Demonstrative Analysis in Transcendent & Illuminationist Wisdom',
          body: 'By synthesizing the intuitive immediacy of Suhrawardi’s Knowledge by Presence (al-ilm al-huduri) with Mulla Sadra’s demonstration of the Primacy and Gradation of Existence (asalat wa tashkik al-wujud), this treatise establishes an apodictic foundation that resolves classical objections without resorting to superficial eclecticism.',
        },
        {
          heading: '3. Scholarly Conclusion & Methodological Implications',
          body: 'The fruit of this demonstrative inquiry is the alignment of rational certainty with spiritual wayfaring—demonstrating that fidelity to critically edited classical texts provides the most resilient framework for addressing contemporary epistemological challenges.',
        },
      ];
    }
    if (currentLang === 'ar') {
      return [
        {
          heading: '١. تحرير المسألة والتأصيل المعرفي',
          body: 'في المنظومة البرهانية للعلوم العقلية، يبتني كل مدعى ميتافيزيقي على التمييز الدقيق بين المفهوم الذهني والحقيقة العينية الخارجية. إن الخلط بين المعقولات الثانية الفلسفية وبين متن الواقع الخارجي كان منشأً لكثير من الشبهات الكلامية والفلسفية عبر التاريخ.',
        },
        {
          heading: '٢. التحليل البرهاني في ضوء الحكمة المتعالية والإشراق',
          body: 'من خلال الجمع المنهجي بين شهود العلم الحضوري في مدرسة شيخ الإشراق السهروردي وبين براهين أصالة الوجود وتشكيكه عند صدر المتألهين الشيرازي، يقدم هذا البحث تقريراً برهانياً محكماً يدفع الإشكالات المعاصرة.',
        },
        {
          heading: '٣. الخاتمة والثمرة العلمية للبحث',
          body: 'تتجلى ثمرة هذا التحقيق في إثبات التلازم الوثيق بين البرهان العقلي الرصين وبين الشهود المعرفي، مما يفتح آفاقاً جديدة أمام الباحثين في الحوزات العلمية والمراكز الأكاديمية.',
        },
      ];
    }
    return [
      {
        heading: '۱. طرح مسئله و مبادی معرفت‌شناختی',
        body: 'در منظومه اجتهادی علوم عقلی، هر مدعای مابعدالطبیعی پیش از هر چیز نیازمند تنقیح مناط و تفکیک دقیق میان «مفهوم ذهنی» و «حقیقت عینی خارجی» با ترازوی منطق صوری و صناعت برهان است. خلط میان معقولات ثانی فلسفی و متن واقعیت انضمامی، منشأ بسیاری از مغالطات تاریخی در مکاتب کلامی و فلسفی بوده است.',
      },
      {
        heading: '۲. تحلیل برهانی در تراز حکمت متعالیه و اشراق',
        body: 'با بهره‌گیری از پیوند عمیق میان «علم حضوری و شهود نوری» شیخ شهاب‌الدین سهروردی و براهین «اصالت و تشکیک وجود» صدرالمتألهین شیرازی، این جستار نشان می‌دهد که حقیقت هستی به ذات خود منشأ تمامی آثار و کمالات است و ماهیات صرفاً حدود اعتباری و حکایات ذهنی از مراتب وجود هستند.',
      },
      {
        heading: '۳. نتیجه‌گیری و ثمره علمی پژوهش',
        body: 'ثمره این بازخوانی اجتهادی و متن‌محور، اثبات هماهنگی کامل میان برهان قاطع عقلی، شهود عرفانی و ظواهر وحیانی است؛ روشی که به دانش‌پژوه امکان می‌دهد بدون التقاط سطحی، به شبهات معرفت‌شناختی معاصر پاسخی برهانی و متقن ارائه دهد.',
      },
    ];
  }, [currentLang]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors pb-12 print:bg-white print:text-black print:pb-0">
      <div className="print:hidden">
        <Navbar
          cartCount={cartItems.length}
          onOpenCart={openCart}
        />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 w-full text-start print:p-0 print:m-0 print:max-w-full print:space-y-4">
        {/* Breadcrumb Bar */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E1D8] dark:border-[#22242A] pb-4 text-xs print:hidden"
        >
          <div className="flex items-center gap-2 font-mono text-zinc-500">
            <Link href={localizeHref('/')} className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition">
              {dict.nav_home}
            </Link>
            <span>/</span>
            <Link
              href={localizeHref('/articles')}
              className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition"
            >
              {dict.nav_articles}
            </Link>
            <span>/</span>
            <span className="text-[#8A532B] dark:text-[#C58B43] font-bold">{category}</span>
          </div>

          <Link
            href={localizeHref('/articles')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition"
          >
            <span>
              {dict.ui_back_to_articles_archive}
            </span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </nav>

        {/* Article Header Card */}
        <Card className="p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
          <header className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="accent" className="text-xs font-bold">
                  {category}
                </Badge>
                <span className="text-[11px] font-mono text-zinc-400">
                  [{rawArticle.id.toUpperCase()}]
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-500 font-num">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                  <span>{toLocale(readTime)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                  <span>{toLocale(publishDate)}</span>
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
              {title}
            </h1>

            {/* Author & Actions Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/ostad_zanjirzan.jpg"
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    {authorName}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">
                    {dict.bio_status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs font-bold gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                  <span>
                    {dict.ui_print_pdf}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  className="h-8 w-8"
                  title={
                    copiedShare
                      ? dict.ui_link_copied
                      : dict.ui_share_article_link
                  }
                >
                  {copiedShare ? (
                    <Check className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* Abstract Box */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
              <Quote className="w-4 h-4" />
              <span>{dict.articles_modal_abstract}</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed text-justify">
              {abstractText}
            </p>
          </div>

          {/* Full Treatise Sections or Rich HTML Content */}
          {rawArticle.content_fa && rawArticle.content_fa.trim() ? (
            <div
              className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-[2.2] text-justify space-y-4 cms-rich-content"
              dangerouslySetInnerHTML={{ __html: rawArticle.content_fa }}
            />
          ) : (
            <div className="space-y-6">
              {sections.map((sec, idx) => (
                <section key={idx} className="space-y-2.5">
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {sec.heading}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-8 text-justify">
                    {sec.body}
                  </p>
                </section>
              ))}
            </div>
          )}

          {/* Academic Citation Box */}
          <Separator className="my-4" />
          <footer className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {dict.ui_standard_academic_citation}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyCitation}
                className="gap-1.5 text-xs font-bold"
              >
                {copiedCitation ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {dict.ui_copied}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>
                      {dict.ui_copy_citation}
                    </span>
                  </>
                )}
              </Button>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed select-all">
              {citationString}
            </div>
          </footer>
        </Card>

        {/* Related Courses Section */}
        <section className="space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
              <span>
                {dict.ui_related_audio_video_lecture_series}
              </span>
            </h2>
            <Link
              href={localizeHref('/courses')}
              className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline flex items-center gap-1"
            >
              <span>{dict.courses_view_all}</span>
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedCourses.map((rc) => {
              const locRc = getLocalizedCourse(rc, currentLang);
              return (
                <Link
                  key={rc.id}
                  href={localizeHref(`/courses/${rc.id}`)}
                  className="group block"
                >
                  <Card className="p-5 h-full flex flex-col justify-between gap-3 hover:border-[#8A532B] dark:hover:border-[#C58B43] transition">
                    <div className="space-y-1.5">
                      <Badge variant="accent" className="text-[11px] font-bold">
                        {locRc?.subject || rc.subject}
                      </Badge>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition line-clamp-2 min-h-[2.5rem]">
                        {locRc?.title || rc.title_fa}
                      </h3>
                    </div>
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-num">
                      <span>
                        {toLocale(rc.episodes_count)} {dict.course_unit_sessions} •{' '}
                        {locRc?.duration || rc.duration_fa}
                      </span>
                      <span className="font-bold text-[#8A532B] dark:text-[#C58B43] flex items-center gap-1">
                        <span>{dict.catalog_featured_action}</span>
                        <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <CartModal
        isOpen={isCartOpen}
        items={cartItems}
        currentLang={currentLang}
        onClose={closeCart}
        onRemoveItem={removeItem}
      />
    </div>
  );
}
