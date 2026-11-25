import React from 'react';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, FormInput } from '@detaileed/ui';

const nameSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
});

type NameFormValues = z.infer<typeof nameSchema>;

/** One required "name" field with a save button, for small create/rename modals. */
export const NameForm: React.FC<{
  label: string;
  placeholder: string;
  onSave: (name: string) => Promise<void>;
  saving: boolean;
}> = ({ label, placeholder, onSave, saving }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
  });

  const onSubmit = async (data: NameFormValues) => {
    await onSave(data.name.trim());
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormInput label={label} placeholder={placeholder} autoFocus error={errors.name?.message} {...register('name')} />
      <div className="flex justify-end">
        <Button type="submit" loading={saving} icon={Save}>
          Zapisz
        </Button>
      </div>
    </form>
  );
};
