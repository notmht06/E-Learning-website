'use client';

import { useEffect } from 'react';

export function PWARegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch((err) => {
            console.warn('Development service worker unregister failed:', err);
          });
        }
      });
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Production service worker register failed:', err);
      });
    });
  }, []);

  return null;
}
