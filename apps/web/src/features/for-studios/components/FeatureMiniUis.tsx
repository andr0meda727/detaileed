import { Fragment } from 'react';
import type { FeatureId } from '../model/content';

const WEEKS = [
  ['', '1', '2', '3', '4', '5', '6'],
  ['7', '8', '9', '10', '11', '12', '13'],
  ['14', '15', '16', '17', '18', '19', '20'],
];
const EVENT_DAYS = ['1', '4', '7', '9', '15', '17'];
const AMBER_DAYS = ['2', '11'];
const TODAY = '18';

function CalendarMiniUi() {
  const dayClass = (day: string) =>
    day === TODAY
      ? 'mini-cal-day today'
      : AMBER_DAYS.includes(day)
        ? 'mini-cal-day event-amber'
        : EVENT_DAYS.includes(day)
          ? 'mini-cal-day event'
          : 'mini-cal-day';
  return (
    <div className="feat-ui" aria-hidden>
      <div className="mini-calendar-row">
        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
          <div key={d} className="mini-cal-label">
            {d}
          </div>
        ))}
      </div>
      {WEEKS.map((week, wi) => (
        <div key={wi} className="mini-calendar-row">
          {week.map((day, di) => (
            <div key={di} className={dayClass(day)}>
              {day}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CrmMiniUi() {
  return (
    <div className="feat-ui-dark" aria-hidden>
      {[
        { initials: 'JK', name: 'Jan Kowalski', tag: 'VIP', count: '12 wizyt' },
        { initials: 'AN', name: 'Anna Nowak', tag: 'Nowy', count: '1 wizyta' },
        { initials: 'MW', name: 'Marek Wiśniew.', tag: 'VIP', count: '28 wizyt' },
        { initials: 'PZ', name: 'Piotr Zając', tag: 'Stały', count: '6 wizyt' },
      ].map((c) => (
        <div key={c.initials} className="crm-row">
          <div className="crm-avatar">{c.initials}</div>
          <div className="crm-name">{c.name}</div>
          <div className="crm-tag">{c.tag}</div>
          <div className="crm-count">{c.count}</div>
        </div>
      ))}
    </div>
  );
}

function FinanceMiniUi() {
  const bars = [
    { height: '40%', bg: 'rgba(26,46,30,0.08)' },
    { height: '55%', bg: 'rgba(26,46,30,0.12)' },
    { height: '70%', bg: 'rgba(26,46,30,0.15)' },
    { height: '60%', bg: 'rgba(26,46,30,0.2)' },
    { height: '85%', bg: 'rgba(26,46,30,0.25)' },
    { height: '100%', bg: 'var(--color-green-light)' },
    { height: '75%', bg: 'rgba(232,168,48,0.4)' },
  ];
  return (
    <div aria-hidden>
      <div className="feat-chart">
        {bars.map((bar, i) => (
          <div key={i} className="feat-chart-bar" style={{ height: bar.height, background: bar.bg }} />
        ))}
      </div>
      <div className="feat-chart-labels">
        <span>Sty</span>
        <span>Lip</span>
      </div>
    </div>
  );
}

function InventoryMiniUi() {
  return (
    <div className="feat-ui" aria-hidden>
      {[
        { name: 'Piana aktywna', stock: '26 szt', pct: 80, low: false },
        { name: 'Szampon FX Protect', stock: '4 szt', pct: 15, low: true },
        { name: 'Szampon Szpontex', stock: '130 szt', pct: 95, low: false },
      ].map((item) => (
        <div key={item.name} className="inv-row">
          <div>
            <div className="inv-name">{item.name}</div>
            <div className="inv-bar">
              <div className={`inv-fill ${item.low ? 'low' : ''}`} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
          <div className={`inv-stock ${item.low ? 'low' : ''}`}>{item.stock}</div>
        </div>
      ))}
    </div>
  );
}

function ReportsMiniUi() {
  return (
    <div style={{ marginTop: 20 }} aria-hidden>
      {[
        { label: 'Korekta lakieru', pct: 38, color: 'var(--color-green-light)' },
        { label: 'Powłoka ceramiczna', pct: 29, color: 'var(--color-amber)' },
        { label: 'Mycie szczegółowe', pct: 21, color: 'rgba(26,46,30,0.25)' },
      ].map((s) => (
        <Fragment key={s.label}>
          <div className="feat-stat-row">
            <span className="feat-stat-label">{s.label}</span>
            <span className="feat-stat-value">{s.pct}%</span>
          </div>
          <div className="feat-stat-bar">
            <div className="feat-stat-fill" style={{ width: `${s.pct}%`, background: s.color }} />
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
