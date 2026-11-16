import { DEFAULT_UNITS } from '@/features/inventory/model/itemForm';

interface UnitFieldProps {
  value: string;
  onChange: (unit: string) => void;
  error?: string;
}

/** Preset unit buttons plus a text field for any other unit; both edit the same value. */
export default function UnitField({ value, onChange, error }: UnitFieldProps) {
  const isPreset = DEFAULT_UNITS.includes(value);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {DEFAULT_UNITS.map((unit) => (
          <button
            key={unit}
            type="button"
            aria-pressed={value === unit}
            onClick={() => onChange(unit)}
            className={`px-5 py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest border-2 transition-all ${value === unit ? 'bg-green-deep text-cream-warm border-green-deep' : 'bg-slate-50 text-slate-400 border-transparent'}`}
          >
            {unit}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={isPreset ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Własna jednostka..."
        className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm"
      />
      {error && <p className="ml-4 text-red-500 font-bold tracking-widest uppercase text-[10px]">{error}</p>}
    </div>
  );
}
