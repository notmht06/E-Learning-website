'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

interface CourseFaqAccordionProps {
  className?: string;
}

export function CourseFaqAccordion({ className = '' }: CourseFaqAccordionProps) {
  const { currentLang, dict } = useLanguage();

  const t = {
    heading: dict.course_faq_heading,
    faqs: [
      {
        id: 'faq-1',
        q: dict.course_faq_q1,
        a: dict.course_faq_a1,
      },
      {
        id: 'faq-2',
        q: dict.course_faq_q2,
        a: dict.course_faq_a2,
      },
      {
        id: 'faq-3',
        q: dict.course_faq_q3,
        a: dict.course_faq_a3,
      },
      {
        id: 'faq-4',
        q: dict.course_faq_q4,
        a: dict.course_faq_a4,
      },
    ],
  };

  return (
    <section
      aria-label="پرسش‌های متداول"
      className={`bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-start ${className}`}
    >
      <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D8] dark:border-[#24262D]">
        <HelpCircle className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {t.heading}
        </h2>
      </div>

      <Accordion type="single" collapsible defaultValue="faq-1" className="space-y-2">
        {t.faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={faq.id}
            className="border border-[#E6E1D8] dark:border-[#24262D] rounded-2xl px-4 last:border-b transition"
          >
            <AccordionTrigger className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 py-3.5 hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pb-4 pt-1">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
