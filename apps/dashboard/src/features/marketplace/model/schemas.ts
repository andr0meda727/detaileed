import { z } from 'zod';

/** What the owner writes on the profile itself; the name, phone and location are the studio's details. */
export const listingFormSchema = z.object({
  description: z.string().trim().max(2000, 'Opis może mieć najwyżej 2000 znaków'),
});

export type ListingFormInput = z.input<typeof listingFormSchema>;
export type ListingFormValues = z.output<typeof listingFormSchema>;
