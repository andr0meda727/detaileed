import React from 'react';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@detaileed/ui';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-1">{label}</label>
        <input
          type="text"
          {...register('name')}
          autoFocus
          placeholder={placeholder}
          className={`w-full px-5 py-4 bg-slate-50 rounded-2xl outline-hidden font-bold text-sm border-2 ${errors.name ? 'border-red-400 focus:ring-red-400/30' : 'border-transparent focus:ring-cream-warm/30'} transition-all`}
        />
        {errors.name && (
          <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] ml-1 mt-1">
            {errors.name.message}
          </p>
        )}
      </div>
      <Button size="lg" fullWidth type="submit" loading={saving} icon={Save}>
        Zapisz
      </Button>
    </form>
  );
};
