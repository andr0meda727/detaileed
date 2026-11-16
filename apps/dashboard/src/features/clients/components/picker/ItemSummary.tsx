import type { LucideIcon } from 'lucide-react';

/** What a search result or a picked item shows: a title, a subtitle and an optional badge (a plate). */
export interface ItemSummary {
  key: string;
  title: string;
  subtitle: string;
  badge?: string;
}

function Badge({ text }: { text: string }) {
  return (
    <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest">
      {text}
    </div>
  );
}

/** A search result row. */
export function ResultRow({ item, onPick }: { item: ItemSummary; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="w-full p-3.5 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-between hover:border-cream-warm/60 hover:shadow-sm transition-all"
    >
      <div className="text-left">
        <h5 className="font-bold text-green-deep text-sm">{item.title}</h5>
        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{item.subtitle}</p>
      </div>
      {item.badge && <Badge text={item.badge} />}
    </button>
  );
}

/** The highlighted card of the item that is currently picked. */
export function PickedItem({ item, icon: Icon }: { item: ItemSummary; icon: LucideIcon }) {
  return (
    <div
      className="p-4 rounded-xl flex items-center justify-between"
      style={{ background: 'rgba(232,168,48,0.08)', border: '2px solid rgba(232,168,48,0.3)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-amber/15 rounded-xl flex items-center justify-center shrink-0">
          <Icon size={16} className="text-amber" />
        </div>
        <div>
          <h5 className="font-bold text-green-deep text-sm">{item.title}</h5>
          <p className="text-[9px] font-semibold text-green-light uppercase tracking-widest mt-0.5">{item.subtitle}</p>
        </div>
      </div>
      {item.badge && <Badge text={item.badge} />}
    </div>
  );
}
