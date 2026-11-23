import React, { useState } from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';
import { InviteEmployeeModal } from '@/features/team/components/InviteEmployeeModal';
import { TeamMemberList } from '@/features/team/components/TeamMemberList';
import { memberName } from '@/features/team/model/memberName';
import {
  useEmployees,
  useInviteEmployee,
  useChangeEmployeeRole,
  useRemoveEmployee,
} from '@/features/team/api/employees';
import type { Employee } from '@/features/team/model/types';
import { Button, Card, CardHeader, ConfirmDialog, SearchInput, useToast } from '@detaileed/ui';

import { CreateBookingModal } from '@/features/bookings';
import { CreateClientModal } from '@/features/clients';

import { useStudio } from '@/features/studios';
import { isOwnerRole } from '@/shared/lib/studioRole';

export const TeamView: React.FC = () => {
  const { data: employees = [], isLoading: loading, refetch } = useEmployees();
  const inviteEmployeeMut = useInviteEmployee();
  const changeEmployeeRoleMut = useChangeEmployeeRole();
  const removeEmployeeMut = useRemoveEmployee();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toRemove, setToRemove] = useState<Employee | null>(null);

  const { addToast } = useToast();
  const { selectedStudio } = useStudio();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const isOwner = isOwnerRole(selectedStudio?.role);

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

  const handleRemove = async () => {
    if (!toRemove) return;
    try {
      await removeEmployeeMut.mutateAsync(toRemove.userId);
      addToast('Pracownik został pomyślnie usunięty.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Usuwanie nie powiodło się.', 'error');
    } finally {
      setToRemove(null);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-20">
      <GlobalHeader
        title="Zespół"
        subtitle="Zarządzaj pracownikami w studiu"
        onAddBooking={() => setIsBookingModalOpen(true)}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          aria-label="Szukaj osoby"
          placeholder="Szukaj osoby…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          wrapperClassName="sm:max-w-sm"
        />
        {isOwner && (
          <Button variant="secondary" icon={UserPlus} onClick={() => setIsInviteModalOpen(true)}>
            Zaproś do zespołu
          </Button>
        )}
      </div>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              Kadra pracownicza
              <span className="font-mono text-xs font-normal text-faint tabular-nums">{employees.length} osób</span>
            </span>
          }
          actions={
            <Button variant="ghost" size="sm" icon={RefreshCw} aria-label="Odśwież listę" onClick={() => refetch()} />
          }
        />
        <TeamMemberList
          employees={filteredEmployees}
          loading={loading}
          canManage={isOwner}
          onRoleChange={handleRoleChange}
          onRemove={setToRemove}
        />
      </Card>

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(open) => !open && setToRemove(null)}
        tone="danger"
        title="Usunąć pracownika?"
        description={
          toRemove
            ? `Czy na pewno chcesz usunąć ${memberName(toRemove)} ze studia?`
            : 'Czy na pewno chcesz usunąć tego pracownika ze studia?'
        }
        confirmLabel="Usuń"
        loading={removeEmployeeMut.isPending}
        onConfirm={handleRemove}
      />

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
