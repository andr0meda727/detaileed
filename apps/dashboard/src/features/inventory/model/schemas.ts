import { z } from 'zod';

/** A non-negative number typed by a person: digits with an optional `,` or `.` decimal part. */
const quantity = /^\d+([.,]\d+)?$/;

export const inventoryItemFormSchema = z.object({
  name: z.string().trim().min(1, 'Nazwa produktu jest wymagana').max(200),
  description: z.string().max(500),
  categoryId: z.string().nullable(),
  unit: z.string().trim().min(1, 'Wybierz lub wpisz jednostkę').max(20),
  stock: z.string().trim().regex(quantity, 'Podaj ilość, np. 2,5'),
  /** Empty or 0 means the item has no minimum. */
  minStock: z.string().trim().regex(quantity, 'Podaj ilość, np. 2,5').or(z.literal('')),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;
