import type { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/shared/ui/Modal';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import { useToast } from '@/shared/ui/useToast';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useCreateInventoryItem, useUpdateInventoryItem } from '@/features/inventory/api/inventory';
import { useCategories } from '@/features/inventory/api/categories';
import { inventoryItemFormSchema, type InventoryItemFormValues } from '@/features/inventory/model/schemas';
import { itemFormDefaults, toInventoryItemInput } from '@/features/inventory/model/itemForm';
import type { InventoryCategory, InventoryItem } from '@/features/inventory/model/types';
import CategoryField from '@/features/inventory/components/CategoryField';
import UnitField from '@/features/inventory/components/UnitField';

interface InventoryItemModalProps {
  isOpen: boolean;
  /** The item to edit, or null to add a new one. Remount (change `key`) to reset the form. */
  item: InventoryItem | null;
  onClose: () => void;
}

/** Add/edit form for a stock item, with an inline "new category". */
export default function InventoryItemModal({ isOpen, item, onClose }: InventoryItemModalProps) {
  // An edit needs the categories first: the item only carries the category's name, not its id.
  const { data: categories, isPending } = useCategories();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edycja Produktu' : 'Nowy Produkt'}>
      {item && isPending ? (
        <LoadingSpinner />
      ) : (
        <ItemForm item={item} categories={categories ?? []} onClose={onClose} />
      )}
    </Modal>
  );
}

const labelClass = 'text-[10px] font-semibold uppercase tracking-widest ml-4';
const errorClass = 'ml-4 text-red-500 font-bold tracking-widest uppercase text-[10px]';

function Field({
  label,
  tone,
  error,
  children,
}: {
  label: string;
  tone?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className={`${labelClass} ${tone ?? 'text-green-light'}`}>{label}</label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

interface ItemFormProps {
  item: InventoryItem | null;
  categories: InventoryCategory[];
  onClose: () => void;
}

function ItemForm({ item, categories, onClose }: ItemFormProps) {
  const { addToast } = useToast();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: itemFormDefaults(item, categories),
  });

  const onSubmit = async (values: InventoryItemFormValues) => {
    const dto = toInventoryItemInput(values);
    try {
      if (item) await updateItem.mutateAsync({ id: item.id, dto });
      else await createItem.mutateAsync(dto);
      onClose();
      addToast('Zapisano produkt w magazynie', 'success');
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas zapisywania produktu'), 'error');
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Pełna Nazwa" error={errors.name?.message}>
        <input
          type="text"
          {...register('name')}
          className="w-full px-6 py-5 bg-slate-50 border-none rounded-xl outline-hidden font-bold text-base shadow-inner focus:ring-4 focus:ring-cream-warm/20"
        />
      </Field>
      <Field label="Opis" error={errors.description?.message}>
        <input
          type="text"
          {...register('description')}
          placeholder="Opcjonalny opis..."
          className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl outline-hidden font-bold text-sm"
        />
      </Field>
      <Field label="Kategoria">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => <CategoryField value={field.value} onChange={field.onChange} />}
        />
      </Field>
      <div className="grid grid-cols-2 gap-6">
        <Field label="Stan Aktualny" tone="text-slate-400" error={errors.stock?.message}>
          <input
            type="text"
            inputMode="decimal"
            {...register('stock')}
            className="w-full px-6 py-5 bg-green-deep text-cream-warm border-none rounded-xl font-extrabold text-2xl font-mono shadow-xl"
          />
        </Field>
        <Field label="Stan Minimalny" tone="text-red-400" error={errors.minStock?.message}>
          <input
            type="text"
            inputMode="decimal"
            placeholder="brak"
            {...register('minStock')}
            className="w-full px-6 py-5 bg-red-50 text-red-500 placeholder:text-red-200 border-none rounded-xl font-extrabold text-2xl font-mono"
          />
        </Field>
      </div>
      <Field label="Jednostka Miar">
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <UnitField value={field.value} onChange={field.onChange} error={errors.unit?.message} />
          )}
        />
      </Field>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-6 bg-green-deep text-cream-warm rounded-xl font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
      >
        Zapisz
      </button>
    </form>
  );
}
