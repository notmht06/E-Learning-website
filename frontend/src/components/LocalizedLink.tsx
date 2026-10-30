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
    let targetHref = href;
    if (typeof href === 'string') {
      targetHref = localizeHref(href);
    } else if (typeof href === 'object' && href !== null && href.pathname) {
      targetHref = {
        ...href,
        pathname: localizeHref(href.pathname),
      };
    }

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
