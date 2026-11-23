import { Fragment } from 'react';
import { Avatar, Badge, cn } from '@detaileed/ui';
import type { FeatureId } from '../model/content';

const WEEKS = [
  ['', '1', '2', '3', '4', '5', '6'],
  ['7', '8', '9', '10', '11', '12', '13'],
  ['14', '15', '16', '17', '18', '19', '20'],
];
const EVENT_DAYS = ['1', '4', '7', '9', '15', '17'];
const BUSY_DAYS = ['2', '11'];
const TODAY = '18';

/** The inset panel the mini UIs sit in. */
const panel = 'rounded-md border border-border bg-subtle p-3';

function CalendarMiniUi() {
  const dayClass = (day: string) =>
    day === TODAY
      ? 'bg-primary text-primary-foreground font-medium'
      : BUSY_DAYS.includes(day)
        ? 'bg-muted text-foreground font-medium ring-1 ring-inset ring-border-strong'
        : EVENT_DAYS.includes(day)
          ? 'bg-muted text-foreground font-medium'
          : 'text-faint';
  return (
    <div className={cn(panel, 'grid grid-cols-7 gap-1 text-center text-xs')} aria-hidden>
      {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
        <div key={d} className="py-1 font-medium text-muted-foreground">
          {d}
        </div>
      ))}
      {WEEKS.flat().map((day, i) => (
        <div key={i} className={cn('rounded-md py-1.5 font-mono tabular-nums', day && dayClass(day))}>
          {day}
        </div>
      ))}
    </div>
  );
}

function CrmMiniUi() {
  return (
    <div className={cn(panel, 'flex flex-col py-1')} aria-hidden>
      {[
        { name: 'Jan Kowalski', tag: 'VIP', count: '12 wizyt' },
        { name: 'Anna Nowak', tag: 'Nowy', count: '1 wizyta' },
        { name: 'Marek Wiśniew.', tag: 'VIP', count: '28 wizyt' },
        { name: 'Piotr Zając', tag: 'Stały', count: '6 wizyt' },
      ].map((c) => (
        <div key={c.name} className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0">
          <Avatar name={c.name} size="sm" decorative />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.name}</span>
          <Badge size="sm" tone={c.tag === 'Nowy' ? 'info' : 'neutral'} dot={false}>
            {c.tag}
          </Badge>
          <span className="w-16 text-right font-mono text-xs text-faint tabular-nums">{c.count}</span>
        </div>
      ))}
    </div>
  );
}

function FinanceMiniUi() {
  const bars = [
    { height: '40%', fill: 'bg-foreground/10' },
    { height: '55%', fill: 'bg-foreground/15' },
    { height: '70%', fill: 'bg-foreground/20' },
    { height: '60%', fill: 'bg-foreground/25' },
    { height: '85%', fill: 'bg-foreground/30' },
    { height: '100%', fill: 'bg-foreground' },
    { height: '75%', fill: 'bg-foreground/40' },
  ];
  return (
    <div aria-hidden>
      <div className="flex h-24 items-end gap-1.5">
        {bars.map((bar, i) => (
          <div key={i} className={cn('flex-1 rounded-sm', bar.fill)} style={{ height: bar.height }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-faint">
        <span>Sty</span>
        <span>Lip</span>
      </div>
    </div>
  );
}

function InventoryMiniUi() {
  return (
    <div className={cn(panel, 'flex flex-col gap-3')} aria-hidden>
      {[
        { name: 'Piana aktywna', stock: '26 szt', pct: 80, low: false },
        { name: 'Szampon FX Protect', stock: '4 szt', pct: 15, low: true },
        { name: 'Szampon Szpontex', stock: '130 szt', pct: 95, low: false },
      ].map((item) => (
        <div key={item.name} className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm">{item.name}</div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full', item.low ? 'bg-warning' : 'bg-foreground/60')}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
          <div className={cn('font-mono text-xs tabular-nums', item.low ? 'text-warning' : 'text-faint')}>
            {item.stock}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsMiniUi() {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5" aria-hidden>
      {[
        { label: 'Korekta lakieru', pct: 38, fill: 'bg-foreground' },
        { label: 'Powłoka ceramiczna', pct: 29, fill: 'bg-foreground/50' },
        { label: 'Mycie szczegółowe', pct: 21, fill: 'bg-foreground/25' },
      ].map((s) => (
        <Fragment key={s.label}>
          <span className="text-sm text-muted-foreground">{s.label}</span>
          <span className="text-right font-mono text-sm font-medium tabular-nums">{s.pct}%</span>
          <div className="col-span-2 mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full', s.fill)} style={{ width: `${s.pct}%` }} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}

const MINI_UIS: Record<FeatureId, () => React.JSX.Element> = {
  calendar: CalendarMiniUi,
  crm: CrmMiniUi,
  finance: FinanceMiniUi,
  inventory: InventoryMiniUi,
  reports: ReportsMiniUi,
};

/** The small illustration on a feature card. */
export function FeatureMiniUi({ id }: { id: FeatureId }) {
  const MiniUi = MINI_UIS[id];
  return <MiniUi />;
}
