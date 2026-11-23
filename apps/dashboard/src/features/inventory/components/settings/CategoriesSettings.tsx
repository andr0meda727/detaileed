import React, { useState } from 'react';
import { Layers, Plus, Trash2, Pencil } from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/inventory/api/categories';
import { Button, ConfirmDialog, Modal, LoadingSpinner, EmptyState } from '@detaileed/ui';
import { NameForm } from '@/shared/ui/NameForm';
import { ADD_CARD, CARD } from '@/shared/ui/cardGrid';

/** Studio settings tab: inventory categories as cards, with add, rename and delete. */
export const CategoriesSettings: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({
  addToast,
}) => {
  const { data: items = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

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
      setDeleting(null);
      addToast('Kategoria usunięta', 'success');
    } catch {
      addToast('Nie udało się usunąć kategorii', 'error');
    }
  };

  const isMutating = createCategory.isPending || updateCategory.isPending;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono tabular-nums">{items.length}</span> kategorii
        </p>
        <Button variant="secondary" onClick={openAdd} icon={Plus}>
          Dodaj kategorię
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          message="Brak kategorii. Dodaj pierwszą."
          icon={Layers}
          action={
            <Button icon={Plus} onClick={openAdd}>
              Dodaj kategorię
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className={CARD}>
              <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Layers size={16} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="pr-14 text-sm font-medium text-foreground">{item.name}</p>
              <div className="absolute top-3 right-3 flex gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Pencil}
                  aria-label={`Zmień nazwę: ${item.name}`}
                  onClick={() => openEdit(item)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  aria-label={`Usuń kategorię: ${item.name}`}
                  onClick={() => setDeleting(item)}
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={openAdd} className={ADD_CARD}>
            <Plus size={20} strokeWidth={1.75} aria-hidden />
            <span className="text-sm font-medium">Dodaj</span>
          </button>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        tone="danger"
        title="Usunąć kategorię?"
        description={`Kategoria „${deleting?.name ?? ''}” zniknie z listy. Tej operacji nie można cofnąć.`}
        confirmLabel="Usuń"
        loading={deleteCategory.isPending}
        onConfirm={() => deleting && void handleDelete(deleting.id)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edytuj kategorię' : 'Nowa kategoria'}
        size="sm"
      >
        <NameForm
          key={editing?.id ?? 'new'}
          label="Nazwa kategorii"
          placeholder="np. Produkty do polerowania"
          onSave={handleSave}
          saving={isMutating}
        />
      </Modal>
    </div>
  );
};
