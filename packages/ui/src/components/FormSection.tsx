import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  /** Dark icon tile (default) or an amber one. */
  tone?: 'dark' | 'amber';
  /** Rendered on the right of the header, e.g. a mode toggle or a counter. */
  actions?: ReactNode;
  children: ReactNode;
}

/** A card with an icon + title header, used to group the steps of a longer form. */
export default function FormSection({ icon: Icon, title, tone = 'dark', actions, children }: FormSectionProps) {
  return (
    <div
      className="rounded-2xl border border-slate-100 overflow-hidden bg-white"
      style={{ boxShadow: '0 8px 20px rgba(26,46,30,0.12)' }}
    >
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {tone === 'dark' ? (
            <div className="w-8 h-8 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
              <Icon size={14} className="text-cream-warm" />
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(232,168,48,0.12)' }}
            >
              <Icon size={14} className="text-amber" />
            </div>
          )}
          <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest">{title}</p>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
