import { ArrowRight } from 'lucide-react';
import { Button, cn } from '@detaileed/ui';
import { DASHBOARD_URL } from '@/shared/lib/site';
import { STEPS } from '../model/content';
import { AppDemo } from './demo/AppDemo';
import { column } from './landingStyles';
import { Quiet, SectionHeading } from './SectionHeading';

export function DemoSection() {
  return (
    <section id="demo" className={cn(column, 'scroll-mt-14 pb-20 sm:pb-28')}>
      <SectionHeading
        align="center"
        eyebrow="Interaktywne demo"
        title={
          <>
            Wypróbuj jak to <Quiet>działa</Quiet>
          </>
        }
        subtitle="Klikaj po zakładkach w sidebarze, aby zobaczyć poszczególne widoki aplikacji z przykładowymi danymi."
        className="mb-12"
      />
      <div className="reveal">
        <AppDemo />
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-14 border-y border-border bg-subtle">
      <div className={cn(column, 'py-20 sm:py-28')}>
        <SectionHeading
          eyebrow="Jak to działa"
          title={
            <>
              Gotowy w 3 minuty. <Quiet>Serio.</Quiet>
            </>
          }
          className="mb-12"
        />
        <ol className="reveal grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.num} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
              <span className="font-mono text-sm text-faint tabular-nums" aria-hidden>
                {step.num}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className={cn(column, 'py-20 sm:py-28')}>
      <div className="reveal flex flex-col items-center rounded-lg border border-border bg-subtle px-6 py-16 text-center sm:px-12">
        <p className="text-sm font-medium text-muted-foreground">Zaczynamy?</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Twoje studio zasługuje <Quiet>na lepsze narzędzia.</Quiet>
        </h2>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Rezerwacje, klienci, magazyn i zespół w jednym miejscu, od pierwszego dnia.
        </p>
        <Button asChild size="lg" className="mt-8">
          <a href={DASHBOARD_URL}>
            Zacznij za darmo — XXX dni
            <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
          </a>
        </Button>
        <p className="mt-4 text-sm text-faint">Bez karty kredytowej. Anuluj kiedy chcesz.</p>
      </div>
    </section>
  );
}
