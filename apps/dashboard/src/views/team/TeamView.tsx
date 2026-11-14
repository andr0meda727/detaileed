import React, { useState, useEffect, useCallback } from 'react';
import { Plus, User, Phone, Users, Search, Shield, Trash2, Mail, Loader2, RefreshCw } from 'lucide-react';
import GlobalHeader from '@/shared/ui/GlobalHeader';
import InviteEmployeeModal from './components/InviteEmployeeModal';
import { useEmployees, useInviteEmployee, useChangeEmployeeRole, useRemoveEmployee } from '../../hooks/useEmployees';
import { useToast } from '@/shared/ui/ToastContext';

import { PREDEFINED_SERVICES, BOOKING_STATUSES } from '../../constants';
import {
  X as XIcon,
  Clock,
  MessageSquare,
  AlertCircle,
  Calendar,
  Hash,
  Wrench,
  UserPlus,
  Save,
  Car as CarIcon,
  Edit2,
  Check,
} from 'lucide-react';
import CreateBookingModal from '@/features/bookings/components/CreateBookingModal';
import CreateClientModal from '../../components/modals/CreateClientModal';

import { EmployeeResponseDto } from '../../types';
import { useStudio } from '@/features/studios';
import Skeleton from '@/shared/ui/Skeleton';
import { isOwnerRole } from '@/shared/lib/studioRole';

const ROLES = [
  { id: 1, name: 'Właściciel', color: 'text-amber-600 bg-amber-50', badgeColor: 'bg-amber-500' },
  { id: 2, name: 'Manager', color: 'text-indigo-600 bg-indigo-50', badgeColor: 'bg-indigo-500' },
  { id: 3, name: 'Pracownik', color: 'text-emerald-600 bg-emerald-50', badgeColor: 'bg-emerald-500' },
];

export const TeamView: React.FC = () => {
  const { data: employees = [], isLoading: loading, refetch } = useEmployees();
  const inviteEmployeeMut = useInviteEmployee();
  const changeEmployeeRoleMut = useChangeEmployeeRole();
  const removeEmployeeMut = useRemoveEmployee();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { addToast } = useToast();
  const { selectedStudio } = useStudio();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const isOwner = isOwnerRole(selectedStudio?.role);

  const onAddBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleInvite = async (roleId: number, email: string) => {
    try {
      await inviteEmployeeMut.mutateAsync({ email, roleId });
      addToast(`Wysłano zaproszenie na adres ${email}`, 'success');
      setIsInviteModalOpen(false);
    } catch (e) {
      console.error(e);
      addToast('Wystąpił błąd podczas wysyłania zaproszenia.', 'error');
    }
  };

  const handleRoleChange = async (userId: string, newRoleId: number) => {
    try {
      await changeEmployeeRoleMut.mutateAsync({ userId, roleId: newRoleId });
      addToast('Uprawnienia zostały zaktualizowane', 'success');
    } catch (e) {
      console.error(e);
      addToast('Nie udało się zmienić uprawnień.', 'error');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tego pracownika ze studia?')) return;
    try {
      await removeEmployeeMut.mutateAsync(userId);
      addToast('Pracownik został pomyślnie usunięty.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Usuwanie nie powiodło się.', 'error');
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Removed full-page loading to keep layout static

  return (
    <div className="space-y-8 pb-20">
      <GlobalHeader
        title="Zespół"
        subtitle="Zarządzaj Pracownikami w Studiu"
        onAddBooking={onAddBooking}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      {/* Akcje / Panel Górny */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative group max-w-sm">
          <Search
            size={20}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-light transition-colors"
          />
          <input
            type="text"
            placeholder="Szukaj osoby..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-xl font-bold text-sm outline-none shadow-sm focus:border-cream-warm/40 focus:ring-4 focus:ring-cream-warm/20 transition-all text-green-deep placeholder:text-slate-400"
          />
        </div>

        {isOwner && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-green-deep text-cream-warm rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all"
          >
            <UserPlus size={16} /> Zaproś do Zespołu
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl lg:rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm relative z-0">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-green-deep tracking-tight flex items-center gap-3">
            <Users className="text-amber-500" /> Kadra Pracownicza
            <span className="text-xs font-semibold text-slate-400 py-1 px-3 bg-slate-50 rounded-full">
              {employees.length} OSÓB
            </span>
          </h3>
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-green-deep transition-colors p-2 bg-slate-50 hover:bg-slate-100 rounded-full"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between h-[180px]"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton width="48px" height="48px" className="rounded-2xl shrink-0" />
                    <Skeleton width="80px" height="28px" className="rounded-xl shrink-0" />
                  </div>
                  <Skeleton width="140px" height="22px" className="mb-3 rounded-lg" />
                  <div className="flex items-center gap-2">
                    <Skeleton width="16px" height="16px" className="rounded-md shrink-0" />
                    <Skeleton width="180px" height="14px" className="rounded-md" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {filteredEmployees.map((emp) => {
                const roleDetails = ROLES.find((r) => r.id === emp.roleId) || ROLES[2];
                return (
                  <div
                    key={emp.userId}
                    className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
                          style={{ backgroundColor: '#1a2e1e', color: '#fbf8f1' }}
                        >
                          {(emp.name || emp.email || 'N')[0].toUpperCase()}
                        </div>
                        {isOwner ? (
                          <select
                            value={emp.roleId}
                            onChange={(e) => handleRoleChange(emp.userId, parseInt(e.target.value))}
                            className={`text-[10px] font-bold uppercase tracking-widest pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer appearance-none ${roleDetails.color} border-none`}
                          >
                            {ROLES.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl ${roleDetails.color}`}
                          >
                            {roleDetails.name}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-green-deep mb-1 truncate" title={emp.name || emp.email}>
                        {emp.name || emp.email.split('@')[0]}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                        <Mail size={12} className="text-green-deep/40" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="border-t border-slate-200 pt-4 mt-6 flex justify-end">
                        <button
                          onClick={() => handleRemove(emp.userId)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0"
                          title="Usuń pracownika"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {filteredEmployees.length === 0 && !loading && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <Users size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-400">Brak pracowników</h4>
            <p className="text-sm font-semibold text-slate-400 mt-1 max-w-xs mx-auto">
              Zaproś personel, aby zacząć zarządzać studiem.
            </p>
          </div>
        )}
      </div>

      <InviteEmployeeModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
      <CreateBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </div>
  );
};

export default TeamView;
