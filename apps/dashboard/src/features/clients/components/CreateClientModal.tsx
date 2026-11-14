import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import FormInput from '@/shared/ui/FormInput';
import { clientFormSchema, ClientFormValues } from '@/shared/lib/validations';
import { useToast } from '@/shared/ui/ToastContext';
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
    defaultValues: { name: '', phone: '', email: '', nip: '' }
  });

  const handleCreateClient = async (data: ClientFormValues) => {
    try {
      if (clientToEdit) {
        await updateClient({
          id: clientToEdit.id,
          dto: {
            name: data.name,
            phone: data.phone || null,
            email: data.email || null,
            nip: data.nip || null,
          }
        });
        addToast('Dane klienta zostały zaktualizowane.', 'success');
      } else {
        await createClientMutation.mutateAsync({
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          nip: data.nip || null,
        });
        addToast('Nowy klient został dodany.', 'success');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (e: any) {
      if (e?.data?.errors) {
        const firstErrorKey = Object.keys(e.data.errors)[0];
        addToast(e.data.errors[firstErrorKey][0], 'error');
      } else {
        console.error(e);
        addToast(e.message || (clientToEdit ? 'Błąd podczas aktualizacji klienta.' : 'Błąd podczas dodawania klienta.'), 'error');
      }
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
          nip: clientToEdit.nip || ''
        });
      } else {
        reset({ name: '', phone: '', email: '', nip: '' });
      }
    } else {
        reset({ name: '', phone: '', email: '', nip: '' });
    }
  }, [isOpen, clientToEdit, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={clientToEdit ? "Edytuj Klienta" : "Nowy Klient"}>
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl flex justify-center items-center gap-2 hover:bg-[#152518] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>TRWA ZAPIS...</span>
            ) : (
              <>
                <Save size={16} /> {clientToEdit ? 'Zapisz Zmiany' : 'Załóż Kartę Klienta'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
