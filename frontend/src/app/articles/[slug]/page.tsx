import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { scholarlyArticlesDatabase } from '@/lib/data';
import { ArticleDetailClient } from './ArticleDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return scholarlyArticlesDatabase.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = scholarlyArticlesDatabase.find((a) => a.slug === slug || a.id === slug);

  if (!article) {
    return {
      title: 'صفحه یا اثر مورد نظر یافت نشد | حجت الاسلام دکتر زنجیر زن حسینی',
      robots: { index: false, follow: false },
    };
  }

  const title = `${article.title_fa || article.title} | حجت الاسلام دکتر زنجیر زن حسینی`;
  const description =
    article.abstract_fa ||
    article.abstract ||
    'مقالات و جستارهای برهانی پایگاه رسمی حیات (حجت الاسلام دکتر زنجیر زن حسینی)';
  const url = `https://zanjirzan.ir/articles/${article.slug}`;

  return {
    title,
    description,
    authors: [{ name: 'حجت الاسلام دکتر زنجیر زن حسینی', url: 'https://zanjirzan.ir' }],
    openGraph: {
      title,
      description,
      url,
      siteName: 'پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی (حیات)',
      type: 'article',
      locale: 'fa_IR',
      authors: ['حجت الاسلام دکتر زنجیر زن حسینی'],
      images: [
        {
          url: 'https://zanjirzan.ir/images/ostad_zanjirzan.jpg',
          width: 800,
          height: 600,
          alt: title,
        },
      ],
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

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = scholarlyArticlesDatabase.find((a) => a.slug === slug || a.id === slug);

  if (!article) {
    notFound();
  }

  const scholarlyArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: article.title_fa || article.title,
    description: article.abstract_fa || article.abstract,
    image: 'https://zanjirzan.ir/images/ostad_zanjirzan.jpg',
    datePublished: article.publishDate_en || article.publishDate,
    inLanguage: 'fa-IR',
    author: {
      '@type': 'Person',
      name: 'حجت الاسلام دکتر زنجیر زن حسینی',
      jobTitle: 'استاد سطوح عالی و خارج حوزه علمیه، پژوهشگر علوم عقلی و نقلی',
      url: 'https://zanjirzan.ir',
    },
    publisher: {
      '@type': 'Organization',
      name: 'پایگاه علمی و پژوهشی حیات',
      url: 'https://zanjirzan.ir',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://zanjirzan.ir/articles/${article.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'صفحه نخست',
        item: 'https://zanjirzan.ir',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'مقالات علمی',
        item: 'https://zanjirzan.ir/articles',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title_fa || article.title,
        item: `https://zanjirzan.ir/articles/${article.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scholarlyArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ArticleDetailClient slug={slug} />
    </>
  );
}
