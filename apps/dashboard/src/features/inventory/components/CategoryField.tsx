import { useState } from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { useToast } from '@/shared/ui/useToast';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useCategories, useCreateCategory } from '@/features/inventory/api/categories';

interface CategoryFieldProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

const NO_CATEGORY = 'Wybierz kategorię (opcjonalnie)';

const optionClass = (selected: boolean) =>
  `w-full text-left px-6 py-3.5 text-sm font-bold transition-all block select-none ${selected ? 'bg-amber/10 text-amber' : 'text-slate-500 hover:bg-slate-50 hover:text-green-deep'}`;

/** Category dropdown (optional) with an inline "new category" that is created and selected right away. */
export default function CategoryField({ value, onChange }: CategoryFieldProps) {
  const { addToast } = useToast();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const pick = (categoryId: string | null) => {
    onChange(categoryId);
    setOpen(false);
  };

  const stopAdding = () => {
    setAdding(false);
    setNewName('');
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const created = await createCategory.mutateAsync({ name });
      onChange(created.id);
      stopAdding();
      addToast('Kategoria dodana', 'success');
    } catch (e) {
      addToast(getApiErrorMessage(e, 'Błąd podczas dodawania kategorii'), 'error');
    }
  };

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nazwa nowej kategorii..."
          autoFocus
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            void handleCreate();
          }}
          className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm shadow-inner"
        />
        <button
          type="button"
          aria-label="Dodaj kategorię"
          onClick={handleCreate}
          disabled={!newName.trim() || createCategory.isPending}
          className="p-4 bg-green-deep text-cream-warm rounded-xl hover:bg-opacity-90 disabled:opacity-50 transition-all"
        >
          <Check size={18} />
        </button>
        <button
          type="button"
          aria-label="Anuluj"
          onClick={stopAdding}
          className="p-4 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div
        className="relative flex-1"
        tabIndex={0}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <div
          onClick={() => setOpen((o) => !o)}
          className={`w-full px-6 py-5 bg-slate-50 border-2 rounded-xl outline-none transition-all font-bold text-sm cursor-pointer flex items-center h-full hover:border-cream-warm/40 ${open ? 'border-cream-warm/60 ring-4 ring-cream-warm/20 text-green-deep' : 'border-transparent text-slate-700'}`}
        >
          <span className="truncate flex-1 select-none">
            {categories.find((c) => c.id === value)?.name ?? NO_CATEGORY}
          </span>
          <ChevronDown
            size={18}
            className={`pointer-events-none ml-3 transition-transform duration-300 ${open ? 'rotate-180 text-green-deep' : 'text-slate-400'}`}
          />
        </div>

        <div
          className={`absolute z-10 top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden py-2 transform origin-top transition-all duration-200 ease-out ${open ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}
        >
          <div className="max-h-[250px] overflow-y-auto w-full custom-scrollbar">
            <button
              type="button"
              onClick={() => pick(null)}
              className={`${optionClass(!value)} border-b border-slate-50`}
            >
              {NO_CATEGORY}
            </button>
            {categories.map((c) => (
              <button key={c.id} type="button" onClick={() => pick(c.id)} className={optionClass(value === c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="px-5 bg-slate-50 text-green-deep font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-100 shadow-sm"
      >
        <Plus size={18} /> Nowa
      </button>
    </div>
  );
}
