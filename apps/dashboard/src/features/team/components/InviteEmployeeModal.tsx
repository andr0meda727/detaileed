import React, { useId, useState } from 'react';
import { ASSIGNABLE_ROLES } from '@/features/team/model/roles';
import { Mail, UserPlus } from 'lucide-react';
import { Button, FormInput, Modal, RadioCardGroup } from '@detaileed/ui';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (selectedRole: number, email: string) => Promise<void>;
}

const DEFAULT_ROLE_ID = 3; // the employee role

export const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({ isOpen, onClose, onInvite }) => {
  const rolesLabelId = useId();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<number>(DEFAULT_ROLE_ID);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await onInvite(selectedRole, email);
      setEmail('');
      setSelectedRole(DEFAULT_ROLE_ID);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Zaproś nową osobę">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Email do logowania"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="np. jan@studio.pl"
          leftIcon={<Mail size={16} strokeWidth={1.75} />}
          disabled={isSubmitting}
        />

        <div className="space-y-1.5">
          <p id={rolesLabelId} className="text-sm font-medium text-foreground">
            Uprawnienia
          </p>
          <RadioCardGroup
            aria-labelledby={rolesLabelId}
            value={String(selectedRole)}
            onValueChange={(value) => setSelectedRole(Number(value))}
            disabled={isSubmitting}
            options={ASSIGNABLE_ROLES.map((role) => ({
              value: String(role.id),
              label: role.name,
              description: role.description,
            }))}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" icon={UserPlus} loading={isSubmitting}>
            Wyślij zaproszenie
          </Button>
        </div>
      </form>
    </Modal>
  );
};
