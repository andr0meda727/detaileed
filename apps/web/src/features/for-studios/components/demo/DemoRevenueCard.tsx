import { useState } from 'react';
import { Card, CardContent, CardHeader, SegmentedControl, Stat } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { MOCK_REVENUE } from '../../model/demoData';

type Period = keyof typeof MOCK_REVENUE;

const PERIODS = [
  { value: 'weekly', label: 'Tydzień' },
  { value: 'monthly', label: 'Miesiąc' },
] as const;

const WIDTH = 600;
const HEIGHT = 200;
const PAD = 8;

/** The area chart's line and fill paths in a WIDTH × HEIGHT box. */
function paths(values: number[]) {
  const max = Math.max(...values, 1);
  const step = (WIDTH - PAD * 2) / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => [PAD + i * step, HEIGHT - PAD - (v / max) * (HEIGHT - PAD * 2)] as const);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = points[points.length - 1]?.[0] ?? PAD;
  return { line, area: `${line} L${last.toFixed(1)},${HEIGHT} L${PAD},${HEIGHT} Z` };
}

/** The demo's copy of the dashboard's revenue chart: a plain SVG area chart in the theme's colours. */
export function DemoRevenueCard() {
  const [period, setPeriod] = useState<Period>('weekly');
  const data = MOCK_REVENUE[period];
  const total = data.reduce((sum, d) => sum + d.rev, 0);
  const { line, area } = paths(data.map((d) => d.rev));

  return (
    <Card>
      <CardHeader
        title="Finanse studia"
        titleAs="h4"
        actions={
          <SegmentedControl
            aria-label="Okres przychodu"
            size="sm"
            options={PERIODS}
            value={period}
            onValueChange={setPeriod}
          />
        }
      />
      <CardContent className="flex flex-col gap-4">
        <Stat
          label={period === 'weekly' ? 'Przychód z 7 dni' : 'Przychód z 4 tygodni'}
          value={`${formatPln(total)} zł`}
        />
        <div>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-[200px] w-full"
            role="img"
            aria-label={`Wykres przychodu: ${data.map((d) => `${d.name} ${formatPln(d.rev)} zł`).join(', ')}`}
          >
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line
                key={f}
                x1={0}
                x2={WIDTH}
                y1={HEIGHT * f - (f === 1 ? 1 : 0)}
                y2={HEIGHT * f - (f === 1 ? 1 : 0)}
                stroke="var(--border)"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={area} fill="var(--foreground)" fillOpacity={0.06} />
            <path
              d={line}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-2 flex justify-between text-xs text-faint" aria-hidden>
            {data.map((d) => (
              <span key={d.name}>{d.name}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
