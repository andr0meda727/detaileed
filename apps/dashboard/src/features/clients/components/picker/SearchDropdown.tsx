import { Search } from 'lucide-react';
import { ResultRow, type ItemSummary } from '@/features/clients/components/picker/ItemSummary';

interface SearchDropdownProps<T> {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder: string;
  results: T[];
  describe: (item: T) => ItemSummary;
  /** Called with the clicked result; the query is cleared afterwards. */
  onPick: (item: T) => void;
}

/** A search box whose results slide open below it while there is a query. */
export default function SearchDropdown<T>({
  query,
  onQueryChange,
  placeholder,
  results,
  describe,
  onPick,
}: SearchDropdownProps<T>) {
  const open = query.trim() !== '';
  return (
    <>
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl font-semibold text-sm outline-none focus:border-cream-warm/50 transition-all"
        />
      </div>
      <div
        style={{ height: open ? '130px' : '0px', opacity: open ? 1 : 0, transition: 'all 0.25s', overflow: 'hidden' }}
      >
        <div className="overflow-y-auto custom-scrollbar rounded-xl h-full">
          {results.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Brak wyników</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {results.map((item) => {
                const summary = describe(item);
                return (
                  <ResultRow
                    key={summary.key}
                    item={summary}
                    onPick={() => {
                      onPick(item);
                      onQueryChange('');
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
