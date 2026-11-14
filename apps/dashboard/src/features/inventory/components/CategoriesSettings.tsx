import React, { useState } from 'react';
import { Layers, Plus, Trash2, Loader2, Edit2 } from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/inventory/api/categories';
import Modal from '@/shared/ui/Modal';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import EmptyState from '@/shared/ui/EmptyState';
import NameForm from '@/shared/ui/NameForm';
import { ADD_CARD, CARD } from '@/shared/ui/cardGrid';

/** Studio settings tab: inventory categories as cards, with add, rename and delete. */
const CategoriesSettings: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({
  addToast,
}) => {
  const { data: items = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const openAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };
  const openEdit = (item: { id: string; name: string }) => {
    setEditing(item);
    setIsModalOpen(true);
  };

  const handleSave = async (name: string) => {
    const dto = { name };
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, dto });
        addToast('Kategoria zaktualizowana', 'success');
      } else {
        await createCategory.mutateAsync(dto);
        addToast('Kategoria dodana', 'success');
      }
      setIsModalOpen(false);
    } catch {
      addToast('Nie udało się zapisać kategorii', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      addToast('Kategoria usunięta', 'success');
    } catch {
      addToast('Nie udało się usunąć kategorii', 'error');
    }
  };

  const isMutating = createCategory.isPending || updateCategory.isPending;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400 font-medium">{items.length} kategorii</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-green-deep text-cream-warm px-5 py-3 rounded-2xl font-semibold text-[11px] uppercase tracking-widest shadow-md active:scale-95 transition-all"
        >
          <Plus size={16} /> Dodaj kategorię
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Brak kategorii. Dodaj pierwszą!" icon={Layers} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className={CARD}>
              <div className="w-10 h-10 bg-cream-warm/50 rounded-2xl flex items-center justify-center mb-1">
                <Layers size={18} className="text-green-deep/50" />
              </div>
              <p className="font-bold text-green-deep text-sm leading-tight">{item.name}</p>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-xl text-slate-300 hover:bg-green-deep hover:text-cream-warm transition-all active:scale-90"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteCategory.isPending}
                  className="p-1.5 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                >
                  {deleteCategory.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={openAdd} className={ADD_CARD}>
            <Plus size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Dodaj</span>
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edytuj Kategorię' : 'Nowa Kategoria'}
        size="sm"
      >
        <NameForm
          key={editing?.id ?? 'new'}
          label="Nazwa kategorii"
          placeholder="np. Produkty do polerowania..."
          onSave={handleSave}
          saving={isMutating}
        />
      </Modal>
    </div>
  );
};

export default CategoriesSettings;
