import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormInput, Modal, LoadingSpinner, cn, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useCreateInventoryItem, useUpdateInventoryItem } from '@/features/inventory/api/inventory';
import { useCategories } from '@/features/inventory/api/categories';
import { inventoryItemFormSchema, type InventoryItemFormValues } from '@/features/inventory/model/schemas';
import { itemFormDefaults, toInventoryItemInput } from '@/features/inventory/model/itemForm';
import type { InventoryCategory, InventoryItem } from '@/features/inventory/model/types';
import { CategoryField } from '@/features/inventory/components/items/CategoryField';
import { UnitField } from '@/features/inventory/components/items/UnitField';

interface InventoryItemModalProps {
  isOpen: boolean;
  /** The item to edit, or null to add a new one. Remount (change `key`) to reset the form. */
  item: InventoryItem | null;
  onClose: () => void;
}

/** Add/edit form for a stock item, with an inline "new category". */
export function InventoryItemModal({ isOpen, item, onClose }: InventoryItemModalProps) {
  // An edit needs the categories first: the item only carries the category's name, not its id.
  const { data: categories, isPending } = useCategories();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edycja produktu' : 'Nowy produkt'}>
      {item && isPending ? (
        <LoadingSpinner className="py-8" />
      ) : (
        <ItemForm item={item} categories={categories ?? []} onClose={onClose} />
      )}
    </Modal>
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
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <FormInput label="Nazwa" error={errors.name?.message} {...register('name')} />
      <FormInput
        label="Opis"
        placeholder="Opcjonalnie"
        error={errors.description?.message}
        {...register('description')}
      />
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => <CategoryField value={field.value} onChange={field.onChange} />}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          label={item ? 'Stan' : 'Stan początkowy'}
          hint={item ? 'Zmienia się przez dostawę lub inwentaryzację' : undefined}
          inputMode="decimal"
          readOnly={!!item}
          error={errors.stock?.message}
          className={cn('font-mono tabular-nums', item && 'bg-muted text-muted-foreground')}
          {...register('stock')}
        />
        <FormInput
          label="Stan minimalny"
          hint="Poniżej pokażemy niski stan"
          inputMode="decimal"
          placeholder="brak"
          error={errors.minStock?.message}
          className="font-mono tabular-nums"
          {...register('minStock')}
        />
      </div>
      <Controller
        name="unit"
        control={control}
        render={({ field }) => <UnitField value={field.value} onChange={field.onChange} error={errors.unit?.message} />}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Anuluj
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Zapisz
        </Button>
      </div>
    </form>
  );
}
