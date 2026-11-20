import React, { useState } from 'react';
import { ASSIGNABLE_ROLES } from '@/features/team/model/roles';
import { Mail, Shield, UserPlus } from 'lucide-react';
import { Button, Modal } from '@detaileed/ui';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (selectedRole: number, email: string) => Promise<void>;
}

const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<number>(3); // Default to the employee role
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await onInvite(selectedRole, email);
      setEmail('');
      setSelectedRole(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Zaproś Nową Osobę">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
            <Mail size={12} /> Email do logowania
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-hidden font-bold text-sm focus:ring-4 focus:ring-cream-warm/30 transition-all text-green-deep"
            placeholder="np. jan@studio.pl"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2 mb-4">
            <Shield size={12} /> Uprawnienia
          </label>
          {ASSIGNABLE_ROLES.map((role) => (
            <div
              key={role.id}
              onClick={() => !isSubmitting && setSelectedRole(role.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedRole === role.id ? 'border-green-deep bg-green-deep/5' : 'border-slate-100 bg-white hover:border-slate-200'} ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4
                    className={`font-bold text-sm ${selectedRole === role.id ? 'text-green-deep' : 'text-slate-700'}`}
                  >
                    {role.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{role.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === role.id ? 'border-green-deep' : 'border-slate-300'}`}
                >
                  {selectedRole === role.id && <div className="w-2.5 h-2.5 bg-green-deep rounded-full" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="ghost" size="lg" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button size="lg" type="submit" icon={UserPlus} loading={isSubmitting}>
            Wyślij Zaproszenie
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteEmployeeModal;
