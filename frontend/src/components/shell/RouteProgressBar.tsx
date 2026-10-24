'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

function RouteProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const prevRouteRef = useRef(`${pathname}?${searchParams?.toString() || ''}`);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const jumpTimerRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, complete the progress bar smoothly
  useEffect(() => {
    const currentRoute = `${pathname}?${searchParams?.toString() || ''}`;
    if (prevRouteRef.current !== currentRoute) {
      prevRouteRef.current = currentRoute;
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      // Complete bar to 100%
      setProgress(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 260);
    }
  }, [pathname, searchParams]);

  // Global click listener for internal link navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // Only primary mouse button
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // Ignore modifier clicks

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      // Ignore links that open in a new tab or trigger downloads
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore hash-only links and special protocols
      if (
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Ignore external origin links
        if (url.origin !== currentUrl.origin) return;

        // Ignore exact same route
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return;
        }

        // Trigger navigation progress bar
        if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
        if (timerRef.current) clearTimeout(timerRef.current);
        setProgress(20);
        setVisible(true);

        jumpTimerRef.current = setTimeout(() => {
          setProgress(85);
        }, 40);
      } catch (urlErr) {
        console.debug('Invalid link URL clicked in RouteProgressBar:', urlErr);
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="route-progress-bar-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 inset-x-0 z-[100] h-[3px] pointer-events-none bg-black/5 dark:bg-white/5"
        >
          <motion.div
            className="h-full bg-[#8A532B] dark:bg-[#C58B43] shadow-[0_1px_6px_rgba(138,83,43,0.35)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 34,
              mass: 0.6,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <RouteProgressBarContent />
    </Suspense>
  );
}
