'use client';

import React, { forwardRef } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export interface LocalizedLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>,
    NextLinkProps {
  children?: React.ReactNode;
}

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ href, ...props }, ref) => {
    const { localizeHref } = useLanguage();
    const targetHref = typeof href === 'string' ? localizeHref(href) : href;

    return (
      <NextLink
        ref={ref}
        href={targetHref}
        {...props}
      />
    );
  }
);

LocalizedLink.displayName = 'LocalizedLink';
export default LocalizedLink;
