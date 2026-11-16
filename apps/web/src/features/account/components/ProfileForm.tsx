'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import type { ProfileDto } from '@detaileed/api-client';
import { Button, FormInput, useToast } from '@detaileed/ui';
import { useSaveProfile } from '@/features/account/api/me';
import { profileSchema, type ProfileValues } from '@/features/account/model/schemas';

interface ProfileFormProps {
  profile: ProfileDto | null;
  onSaved?: () => void;
  submitLabel?: string;
}

/** Name and phone that go on booking requests, so the studio can contact the customer. */
export default function ProfileForm({ profile, onSaved, submitLabel = 'Zapisz' }: ProfileFormProps) {
  const { addToast } = useToast();
  const save = useSaveProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile?.name ?? '', phone: profile?.phone ?? '' },
  });

  const onSubmit = (values: ProfileValues) =>
    save.mutate(values, {
      onSuccess: () => {
        addToast('Zapisano dane kontaktowe.', 'success');
        onSaved?.();
      },
    });

  return (
    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid sm:grid-cols-2 gap-x-3">
        <FormInput label="Imię i nazwisko" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <FormInput
          label="Telefon"
          type="tel"
          autoComplete="tel"
          placeholder="500 600 700"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>
      <Button type="submit" icon={Save} loading={save.isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
