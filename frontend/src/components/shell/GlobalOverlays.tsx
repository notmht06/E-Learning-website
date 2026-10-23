'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { AudioPlayerIsland } from '@/components/AudioPlayerIsland';
import { PWARegistration } from './PWARegistration';
import { RouteProgressBar } from './RouteProgressBar';

const CommandPalette = dynamic(
  () => import('./CommandPalette').then((mod) => mod.CommandPalette),
  { ssr: false }
);

const ScholarlyAIAssistant = dynamic(
  () => import('@/components/ScholarlyAIAssistant').then((mod) => mod.ScholarlyAIAssistant),
  { ssr: false }
);

export function GlobalOverlays() {
  return (
    <>
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>
      <AudioPlayerIsland />
      <CommandPalette />
      <PWARegistration />
      <ScholarlyAIAssistant />
    </>
  );
}
