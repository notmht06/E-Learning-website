import React from 'react';
import { Metadata } from 'next';
import { booksDatabase } from '@/lib/data';
import { BookDetailClient } from './BookDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = booksDatabase[id] || booksDatabase['book1'];
  const title = `${book.title_fa} | حجت الاسلام دکتر زنجیر زن حسینی`;
  const description = book.desc_fa || 'کتب و رسالات تحلیلی منتشر شده توسط حجت الاسلام دکتر زنجیر زن حسینی';
  const url = `https://zanjirzan.ir/books/${id}`;

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
          url: 'https://zanjirzan.ir/images/book_cover_real.jpg',
          width: 800,
          height: 1000,
          alt: title,
        },
      ],
      type: 'book',
      locale: 'fa_IR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://zanjirzan.ir/images/book_cover_real.jpg'],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const book = booksDatabase[id] || booksDatabase['book1'];

  const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title_fa,
    description: book.desc_fa,
    inLanguage: 'fa-IR',
    author: {
      '@type': 'Person',
      name: 'حجت الاسلام دکتر زنجیر زن حسینی',
      jobTitle: 'استاد سطوح عالی و خارج حوزه علمیه، پژوهشگر علوم عقلی و نقلی',
      url: 'https://zanjirzan.ir',
      image: 'https://zanjirzan.ir/images/ostad_zanjirzan.jpg',
    },
    publisher: {
      '@type': 'Organization',
      name: 'پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی',
      url: 'https://zanjirzan.ir',
    },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <BookDetailClient bookId={id} />
    </>
  );
}
