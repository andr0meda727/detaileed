'use client';

import type { ReactNode } from 'react';
import { ThemeSwitch } from '@detaileed/ui';
import { ChoiceExamples, DialogExamples, MenuExamples, NavigationExamples } from './examples';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">{children}</div>
    </section>
  );
}

function Panel({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div data-theme={theme} className="flex min-w-0 flex-col gap-6 rounded-lg bg-background p-4 text-foreground sm:p-6">
      <p className="font-mono text-xs text-faint">data-theme=&quot;{theme}&quot;</p>
      <Section title="Modal i ConfirmDialog">
        <DialogExamples />
      </Section>
      <Section title="Tabs i SegmentedControl">
        <NavigationExamples idPrefix={theme} />
      </Section>
      <Section title="Checkbox, Switch i RadioCardGroup">
        <ChoiceExamples />
      </Section>
      <Section title="DropdownMenu, Tooltip i ThemeSwitch">
        <MenuExamples />
      </Section>
    </div>
  );
}

/**
 * Every component of task T2c in both themes. Dialogs, menus and tooltips open in a portal on `<body>`, so they
 * follow the page theme: switch it at the top.
 */
export function InteractiveGallery() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Komponenty interaktywne</h1>
          <p className="text-sm text-muted-foreground">
            Radix w Grafit. Okna, menu i podpowiedzi otwierają się w motywie strony.
          </p>
        </div>
        <ThemeSwitch />
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel theme="light" />
        <Panel theme="dark" />
      </div>
    </main>
  );
}
