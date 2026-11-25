import { Check } from 'lucide-react';
import { Badge, Button, Card, cn } from '@detaileed/ui';
import { DASHBOARD_URL } from '@/shared/lib/site';
import { PRICING } from '../model/content';
import { column } from './landingStyles';
import { SectionHeading } from './SectionHeading';

export function PricingSection() {
  return (
    <section id="pricing" className={cn(column, 'scroll-mt-14 py-20 sm:py-28')}>
      <SectionHeading
        align="center"
        eyebrow="Cennik"
        title="Prosty cennik, bez niespodzianek"
        subtitle="XXX dni za darmo. Bez karty kredytowej."
        className="mb-12"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {PRICING.map((plan) => (
          <Card
            key={plan.tier}
            className={cn('reveal flex flex-col p-6', plan.featured && 'border-primary ring-1 ring-primary')}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold">{plan.tier}</h3>
              {plan.featured && <Badge>Najpopularniejszy</Badge>}
            </div>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums">{plan.amount}</span>
              <span className="text-sm text-faint">{plan.period}</span>
            </p>
            <ul className="mt-6 mb-8 flex flex-col gap-3 border-t border-border pt-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-foreground" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild fullWidth variant={plan.featured ? 'primary' : 'secondary'} className="mt-auto">
              <a href={DASHBOARD_URL}>{plan.btnLabel}</a>
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
