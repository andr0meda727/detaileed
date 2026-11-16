export type PickerMode = 'existing' | 'new';

interface ModeToggleProps {
  value: PickerMode;
  onChange: (mode: PickerMode) => void;
  labels: Record<PickerMode, string>;
}

/** Two-button switch between picking an existing record and creating a new one. */
export default function ModeToggle({ value, onChange, labels }: ModeToggleProps) {
  return (
    <div className="flex bg-slate-50 p-1 rounded-xl">
      {(['existing', 'new'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${value === mode ? 'bg-green-deep text-cream-warm shadow-xs' : 'text-slate-400 hover:text-green-deep'}`}
        >
          {labels[mode]}
        </button>
      ))}
    </div>
  );
}
