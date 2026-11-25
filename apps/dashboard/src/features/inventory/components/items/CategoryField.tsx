import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Button, FormInput, Select, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useCategories, useCreateCategory } from '@/features/inventory/api/categories';

interface CategoryFieldProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
}

const NONE = '';

/** Category select (optional) with an inline "new category" that is created and selected right away. */
export function CategoryField({ value, onChange }: CategoryFieldProps) {
  const { addToast } = useToast();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

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
      <div className="flex items-start gap-2">
        <FormInput
          label="Nowa kategoria"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="np. Polerowanie"
          autoFocus
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            void handleCreate();
          }}
        />
        <div className="mt-6.5 flex gap-1">
          <Button
            icon={Check}
            aria-label="Dodaj kategorię"
            onClick={handleCreate}
            disabled={!newName.trim()}
            loading={createCategory.isPending}
          />
          <Button variant="ghost" icon={X} aria-label="Anuluj" onClick={stopAdding} />
        </div>
      </div>
    );
  }

  const options = [{ value: NONE, label: 'Bez kategorii' }, ...categories.map((c) => ({ value: c.id, label: c.name }))];
  return (
    <div className="flex items-start gap-2">
      <Select
        label="Kategoria"
        options={options}
        value={value ?? NONE}
        onChange={(e) => onChange(e.target.value || null)}
      />
      <Button variant="secondary" icon={Plus} onClick={() => setAdding(true)} className="mt-6.5 shrink-0">
        Nowa
      </Button>
    </div>
  );
}
