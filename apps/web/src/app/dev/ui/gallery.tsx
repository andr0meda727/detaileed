'use client';

import Link from 'next/link';
import { Logo } from '@detaileed/ui';
import { ControlsSection } from './controls-section';
import { DataSection } from './data-section';
import { FeedbackSection } from './feedback-section';
import { MapSection } from './map-section';

type PanelTheme = 'light' | 'dark';

function Panel({ theme }: { theme: PanelTheme }) {
  return (
    <div
      data-theme={theme}
      className="flex min-w-0 flex-col gap-8 rounded-lg border border-border bg-background p-4 text-foreground sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <Logo />
        <span className="text-sm text-muted-foreground">{theme === 'light' ? 'Jasny' : 'Ciemny'}</span>
      </div>
      <ControlsSection />
      <DataSection />
      <FeedbackSection />
      <MapSection theme={theme} />
    </div>
  );
}

/** Both panels side by side on wide screens, one under the other on phones. */
export function Gallery() {
  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Komponenty Grafit: podstawy</h1>
        <Link
          href="/dev/ui/interactive"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Komponenty interaktywne →
        </Link>
      </header>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel theme="light" />
        <Panel theme="dark" />
      </div>
    </main>
  );
}
