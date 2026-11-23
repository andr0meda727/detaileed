import type { LucideIcon } from 'lucide-react';
import { Activity, CalendarDays, DollarSign, Package, Users } from 'lucide-react';
import { Card, cn } from '@detaileed/ui';
import { FEATURES, type FeatureId } from '../model/content';
import { FeatureMiniUi } from './FeatureMiniUis';
import { column } from './landingStyles';
import { Quiet, SectionHeading } from './SectionHeading';

const FEATURE_ICONS: Record<FeatureId, LucideIcon> = {
  calendar: CalendarDays,
  crm: Users,
  finance: DollarSign,
  inventory: Package,
  reports: Activity,
};

const SPANS = { wide: 'md:col-span-7', narrow: 'md:col-span-5', third: 'md:col-span-4' } as const;

export function FeaturesSection() {
  return (
    <section id="features" className={cn(column, 'scroll-mt-14 py-20 sm:py-28')}>
      <SectionHeading
        eyebrow="Funkcje"
        title={
          <>
            Wszystko czego potrzebuje <Quiet>Twoje studio</Quiet>
          </>
        }
        className="mb-12"
      />
      <div className="grid gap-4 md:grid-cols-12">
        {FEATURES.map((feat) => {
          const Icon = FEATURE_ICONS[feat.id];
          return (
            <Card key={feat.id} className={cn('reveal flex flex-col p-6', SPANS[feat.layout])}>
              <div className="mb-5 flex size-10 items-center justify-center rounded-md bg-muted text-foreground">
                <Icon size={20} strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-lg font-semibold">{feat.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feat.desc}</p>
              <div className="mt-auto pt-6">
                <FeatureMiniUi id={feat.id} />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
