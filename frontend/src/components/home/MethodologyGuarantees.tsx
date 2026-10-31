'use client';

import React from 'react';
import {
  Scale,
  Unlock,
  Layers,
  Compass,
  MessageSquareQuote,
  Award,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function MethodologyGuarantees() {
  const { currentLang, toLocale, dict } = useLanguage();

  const GUARANTEES = [
    {
      num: '01',
      icon: Scale,
      title_fa: 'اقامه براهین قطعی و نفی تقلید در معقولات',
      title_ar: 'إقامة البراهين اليقينية ونفي التقليد في المعقولات',
      title_en: 'Definitive Rational Proofs & Elimination of Dogmatism',
      desc_fa:
        'در ساحت علوم عقلی و وجودشناسی، تقلید رهزن اندیشه است؛ تمامی مباحث منحصراً بر براهین یقینی و مبادی اولی برهانی بنا شده‌اند.',
      desc_ar:
        'في فضاء العلوم العقلية والمعارف الوجودية لا مجال للتقليد؛ تبنى كافة المباحث حصراً على البراهين القطعية والمقدمات الأولية.',
      desc_en:
        'In the rational sciences, blind imitation is rejected; all tenets are established strictly upon deductive proofs and self-evident axioms.',
    },
    {
      num: '02',
      icon: Unlock,
      title_fa: 'دسترسی آزاد و وقف عام مبادی اولیه',
      title_ar: 'الوصول المفتوح والوقف العلمي للمبادئ التأسيسية',
      title_en: 'Open Access Foundations & Public Academic Endowment',
      desc_fa:
        'دروس پایه‌ای منطق، بدایة الحکمة و آشنایی با فلسفه اسلامی جهت تسهیل مسیر پویندگان معرفت به‌صورت رایگان و وقف عام در دسترس است.',
      desc_ar:
        'الدروس التأسيسية في المنطق الصوري وبداية الحكمة متاحة مجاناً وقفاً علمياً عاماً لكافة طلاب العلوم الأكاديمية والحوزوية.',
      desc_en:
        'Introductory courses in classical logic and foundational philosophy are provided free as an academic endowment for all earnest seekers.',
    },
    {
      num: '03',
      icon: Layers,
      title_fa: 'تقریر مهندسی‌شده و دسته‌بندی گام‌به‌گام',
      title_ar: 'تقرير هندسي منظم وتصنيف شجري للمباحث',
      title_en: 'Engineered Pedagogy & Systematic Taxonomic Delivery',
      desc_fa:
        'ارائه نظام‌مند درس‌ها، تفکیک شقوق مسأله، رسم نمودارهای درختی هر مبحث و تبیین دقیق اصطلاحات پیچیده متون فلسفی کهن.',
      desc_ar:
        'عرض منهجي مرتب للدروس، تفكيك شقوق المسائل، رسم مشجرات المفاهيم الفلسفية، وشرح دقيق لمصطلحات النصوص الكلاسيكية الصعبة.',
      desc_en:
        'Systematic lecture delivery with conceptual tree diagrams, disambiguation of complex classical terms, and clear step-by-step progressions.',
    },
    {
      num: '04',
      icon: Compass,
      title_fa: 'تطبیق بر مسائل و شبهات معاصر فلسفه',
      title_ar: 'الربط المنهجي مع الشبهات والإشكالات الفلسفية المعاصرة',
      title_en: 'Integration with Contemporary Epistemological Debates',
      desc_fa:
        'پیوند زنده میان حکمت کهن ابن‌سینا و ملاصدرا با مکاتب فلسفه ذهن، پدیدارشناسی، فیزیکالیسم و معرفت‌شناسی مدرن غربی.',
      desc_ar:
        'جسر حي بين حكمة الصدر الشيرازي وابن سينا مع أحدث أطروحات فلسفة الذهن، والظاهراتية، ونظريات المعرفة الحديثة في الفكر الغربي.',
      desc_en:
        'A living bridge connecting classical Avicennian and Sadrian metaphysics with contemporary philosophy of mind and modern epistemology.',
    },
    {
      num: '05',
      icon: MessageSquareQuote,
      title_fa: 'کرسی فعال مباحثه و طرح اشکال علمی',
      title_ar: 'منبر الحوار والمباحثة وطرح الإشكالات الاستدلالية',
      title_en: 'Active Dialectical Forum & Rigorous Scholarly Critique',
      desc_fa:
        'بستر تعاملی اختصاصی برای پژوهشگران جهت طرح «ان‌قلت»های علمی و دریافت پاسخ‌های تفصیلی و برهانی متناسب با تراز خارج حوزه.',
      desc_ar:
        'مساحة تفاعلية حية تتيح للباحثين طرح إشكالاتهم العلمية وتلقي إجابات استدلالية رصينة تتناسب مع مستوى دروس الخارج الحوزوية.',
      desc_en:
        'A dedicated dialectical forum enabling scholars to submit philosophical objections and receive rigorous deductive rejoinders.',
    },
    {
      num: '06',
      icon: Award,
      title_fa: 'اعطای گواهی‌نامه رسمی با کد استعلام برخط',
      title_ar: 'شهادات تخرج رسمية برمز استعلام رقمي موثق',
      title_en: 'Official Certificate with Cryptographic Online Verification',
      desc_fa:
        'صدور گواهی‌نامه دیجیتال پایان‌دوره با کد شناسایی یکتا و قابلیت صحت‌سنجی برخط جهت ارائه به مجامع دانشگاهی و حوزوی.',
      desc_ar:
        'منح شهادة رسمية إلكترونية تحمل رمزاً رقمياً فريداً قابلاً للتحقق الفوري لتقديمها إلى المراكز العلمية والجامعات.',
      desc_en:
        'Digital credentials issued with unique verification identifiers, instantly verifiable online for academic and seminary submissions.',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-8 select-none">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8A532B]/30 bg-[#8A532B]/5 text-[#8A532B] dark:text-[#C58B43] text-xs font-mono font-bold">
          <span>
            {dict.ui_methodological_guarantees}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {dict.ui_six_core_pillars_of_instruction}
        </h2>

        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {dict.ui_every_course_is_formulated_upon_system}
        </p>
      </div>

      {/* 6-Card Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GUARANTEES.map((item) => {
          const Icon = item.icon;
          const title =
            currentLang === 'en'
              ? item.title_en
              : currentLang === 'ar'
              ? item.title_ar
              : item.title_fa;
          const desc =
            currentLang === 'en'
              ? item.desc_en
              : currentLang === 'ar'
              ? item.desc_ar
              : item.desc_fa;

          return (
            <div
              key={item.num}
              className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white dark:bg-[#141518] p-5 sm:p-6 flex flex-col justify-between hover:border-[#8A532B]/60 dark:hover:border-[#C58B43]/60 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group"
            >
              {/* Top Row: Icon & Serial Number */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center border border-[#8A532B]/20 dark:border-[#C58B43]/20 group-hover:bg-[#8A532B] group-hover:text-white dark:group-hover:bg-[#C58B43] dark:group-hover:text-[#0C0D0E] transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 shadow-xs">
                  <Icon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
                </div>

                <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">
                  [{toLocale(item.num)}]
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition-colors leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
                  {desc}
                </p>
              </div>

              {/* Bottom Subtle Accent Line */}
              <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-2">
                <span className="w-2 h-0.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43] group-hover:w-6 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300" />
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  DAR AL-HIKMAH VERIFIED
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
