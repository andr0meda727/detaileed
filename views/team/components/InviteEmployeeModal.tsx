import React, { useState } from 'react';
import { Mail, Shield, UserPlus, Loader2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { InviteEmployeeDto } from '../../../types';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (selectedRole: number, email: string) => Promise<void>;
}

const ROLES = [
  { id: 1, name: 'Właściciel', description: 'Pełen dostęp, fakturowanie, statystyki, zarządzanie zespołem' },
  { id: 2, name: 'Manager', description: 'Zarządzanie rezerwacjami, magazynem i klientami' },
  { id: 3, name: 'Pracownik', description: 'Tylko odczyt grafiku i listy zadań' },
];

const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<number>(3); // Default to Pracownik
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
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-cream-warm/30 transition-all text-green-deep"
            placeholder="np. jan@studio.pl"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2 mb-4">
            <Shield size={12} /> Uprawnienia
          </label>
          {ROLES.map(role => (
            <div
              key={role.id}
              onClick={() => !isSubmitting && setSelectedRole(role.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedRole === role.id ? 'border-green-deep bg-green-deep/5' : 'border-slate-100 bg-white hover:border-slate-200'} ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-bold text-sm ${selectedRole === role.id ? 'text-green-deep' : 'text-slate-700'}`}>{role.name}</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{role.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === role.id ? 'border-green-deep' : 'border-slate-300'}`}>
                  {selectedRole === role.id && <div className="w-2.5 h-2.5 bg-green-deep rounded-full" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-green-deep text-cream-warm rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Wyślij Zaproszenie
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteEmployeeModal;
