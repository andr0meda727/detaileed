import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Card, CardContent, CardHeader, FormInput } from '@detaileed/ui';
import { useInviteEmployee } from '@/features/team/api/employees';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';

const inviteSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').email('Niepoprawny format email'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

/** Studio settings tab: invite an employee by email. */
export const EmployeesSettings: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({
  addToast,
}) => {
  const inviteEmployee = useInviteEmployee();
  const sending = inviteEmployee.isPending;
  const [lastSent, setLastSent] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const onInvite = async (data: InviteFormValues) => {
    try {
      // Invitations from settings always add a regular employee (role 3).
      await inviteEmployee.mutateAsync({ email: data.email, roleId: 3 });
      setLastSent(data.email);
      reset();
      addToast(`Zaproszenie wysłane do ${data.email}`, 'success');
    } catch (e) {
      addToast(getApiErrorMessage(e, 'Nie udało się wysłać zaproszenia'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Zaproś pracownika"
          description="Wyślij zaproszenie e-mailem. Pracownik otrzyma link do rejestracji."
        />
        <CardContent>
          <form onSubmit={handleSubmit(onInvite)} className="flex flex-col items-start gap-3 sm:flex-row">
            <FormInput
              type="email"
              aria-label="Email pracownika"
              placeholder="adres@email.com"
              leftIcon={<Mail size={16} strokeWidth={1.75} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" icon={Mail} loading={sending} className="w-full sm:w-auto">
              Wyślij zaproszenie
            </Button>
          </form>
        </CardContent>
      </Card>

      {lastSent && (
        <Alert tone="success">
          Zaproszono: <span className="font-medium">{lastSent}</span>
        </Alert>
      )}

      <Alert tone="info" title="Jak to działa?">
        Pracownik dostanie e-mail z linkiem do akceptacji i ustawienia hasła.
      </Alert>
    </div>
  );
};
