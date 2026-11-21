'use client';

import { Star } from 'lucide-react';

export interface StarRatingProps {
  /** 0–5, may be fractional when only shown (4.7 fills four stars and most of the fifth). */
  value: number;
  /** Makes the stars buttons that pick a whole rating. */
  onChange?: (rating: number) => void;
  size?: number;
  /** Accessible name for the picker, e.g. "Ocena". */
  label?: string;
}

/** Five stars: a read-only rating, or a picker when `onChange` is given. */
export function StarRating({ value, onChange, size = 16, label = 'Ocena' }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${label}: ${value.toFixed(1)} na 5`}>
        {stars.map((n) => {
          const fill = Math.max(0, Math.min(1, value - (n - 1)));
          return (
            <span key={n} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-amber/30" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-amber fill-amber" />
              </span>
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1" role="radiogroup" aria-label={label}>
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} na 5`}
          onClick={() => onChange(n)}
          className="p-0.5 rounded-md transition-transform hover:scale-110"
        >
          <Star size={size} className={n <= value ? 'text-amber fill-amber' : 'text-amber/30'} />
        </button>
      ))}
    </span>
  );
}
