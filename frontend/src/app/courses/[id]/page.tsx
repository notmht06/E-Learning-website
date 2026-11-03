import React from 'react';
import { Metadata } from 'next';
import { coursesDatabase } from '@/lib/data';
import { CourseDetailClient } from './CourseDetailClient';
import { serializeJsonLd } from '@/lib/jsonLd';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = coursesDatabase[id] || coursesDatabase['course-mantiq-mabadi'] || Object.values(coursesDatabase)[0];
  const title = `${course.title_fa} | حجت الاسلام دکتر زنجیر زن حسینی`;
  const description = course.desc_fa || 'درس‌گفتارهای تحلیلی و تخصصی علوم عقلی و نقلی';
  const url = `https://zanjirzan.ir/courses/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی',
      images: [
        {
          url: 'https://zanjirzan.ir/images/ostad_zanjirzan.jpg',
          width: 800,
          height: 600,
          alt: title,
        },
      ],
      type: 'website',
      locale: 'fa_IR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://zanjirzan.ir/images/ostad_zanjirzan.jpg'],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  const course = coursesDatabase[id] || coursesDatabase['course-mantiq-mabadi'] || Object.values(coursesDatabase)[0];

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title_fa,
    description: course.desc_fa,
    provider: {
      '@type': 'Person',
      name: 'حجت الاسلام دکتر زنجیر زن حسینی',
      jobTitle: 'استاد سطوح عالی و خارج حوزه علمیه، پژوهشگر علوم عقلی و نقلی',
      url: 'https://zanjirzan.ir',
      image: 'https://zanjirzan.ir/images/ostad_zanjirzan.jpg',
    },
    courseCode: course.id,
    educationalLevel: course.level_fa || 'سطوح عالی و خارج',
    inLanguage: 'fa-IR',
  };

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'حجت الاسلام دکتر زنجیر زن حسینی',
    alternateName: ['دکتر زنجیر زن حسینی', 'Dr. Zanjirzan Hosseini'],
    jobTitle: 'استاد سطوح عالی و خارج حوزه علمیه، پژوهشگر علوم عقلی و نقلی',
    description: 'مدرس دروس خارج فقه، اصول، فلسفه، کلام، تفسیر و عرفان اسلامی',
    image: 'https://zanjirzan.ir/images/ostad_zanjirzan.jpg',
    url: 'https://zanjirzan.ir',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'مدرس این دوره تخصصی کیست؟',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'این دوره توسط حجت الاسلام دکتر زنجیر زن حسینی تدریس شده است.',
        },
      },
      {
        '@type': 'Question',
        name: 'سطح علمی و مخاطبان این درس چه کسانی هستند؟',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `این دوره در سطح ${course.level_fa || 'سطوح عالی و خارج'} ویژه پژوهشگران و طلاب علوم دینی ارائه شده است.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <CourseDetailClient courseId={id} />
    </>
  );
}
