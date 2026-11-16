import React from 'react';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Modal, FormInput, useToast } from '@detaileed/ui';
import { clientFormSchema, type ClientFormValues } from '@/features/clients/model/schemas';
import { useCreateClient, useUpdateClient } from '@/features/clients/api/clients';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientToEdit?: { id: string; name: string; email?: string | null; phone?: string | null; nip?: string | null } | null;
}

export default function CreateClientModal({ isOpen, onClose, onSuccess, clientToEdit }: CreateClientModalProps) {
  const { addToast } = useToast();
  const createClientMutation = useCreateClient();
  const { mutateAsync: updateClient } = useUpdateClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { name: '', phone: '', email: '', nip: '' },
  });

  const handleCreateClient = async (data: ClientFormValues) => {
    try {
      if (clientToEdit) {
        await updateClient({
          id: clientToEdit.id,
          dto: {
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            nip: data.nip || null,
          },
        });
        addToast('Dane klienta zostały zaktualizowane.', 'success');
      } else {
        await createClientMutation.mutateAsync({
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          nip: data.nip || null,
        });
        addToast('Nowy klient został dodany.', 'success');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (e) {
      addToast(
        getApiErrorMessage(e, clientToEdit ? 'Błąd podczas aktualizacji klienta.' : 'Błąd podczas dodawania klienta.'),
        'error',
      );
    }
  };

  // Reset form when modal closes/opens
  React.useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        reset({
          name: clientToEdit.name,
          phone: clientToEdit.phone || '',
          email: clientToEdit.email || '',
          nip: clientToEdit.nip || '',
        });
      } else {
        reset({ name: '', phone: '', email: '', nip: '' });
      }
    } else {
      reset({ name: '', phone: '', email: '', nip: '' });
    }
  }, [isOpen, clientToEdit, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={clientToEdit ? 'Edytuj Klienta' : 'Nowy Klient'}>
      <form className="space-y-4" onSubmit={handleSubmit(handleCreateClient)}>
        <FormInput
          label="Imię i Nazwisko *"
          placeholder="Jan Kowalski"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Telefon *"
            type="tel"
            placeholder="+48 123 456 789"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <FormInput
            label="Email (opcjonalnie)"
            type="email"
            placeholder="jan@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <FormInput
          label="NIP (opcjonalnie)"
          placeholder="1234567890"
          error={errors.nip?.message}
          {...register('nip')}
        />

        <div className="pt-2">
          <Button size="lg" fullWidth type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>TRWA ZAPIS...</span>
            ) : (
              <>
                <Save size={16} /> {clientToEdit ? 'Zapisz Zmiany' : 'Załóż Kartę Klienta'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
