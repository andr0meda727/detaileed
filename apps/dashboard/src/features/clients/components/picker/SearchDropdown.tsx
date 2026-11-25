import { SearchInput } from '@detaileed/ui';
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

/** A search box whose results open below it while there is a query. */
export function SearchDropdown<T>({
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
      <SearchInput
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onClear={() => onQueryChange('')}
      />
      {open && (
        <div className="max-h-[150px] overflow-y-auto rounded-lg border border-border bg-surface p-1">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-faint">Brak wyników</p>
          ) : (
            results.map((item) => {
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
            })
          )}
        </div>
      )}
    </>
  );
}
