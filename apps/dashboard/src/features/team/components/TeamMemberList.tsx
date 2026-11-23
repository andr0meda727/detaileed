import { Mail, Trash2, Users } from 'lucide-react';
import { Avatar, Badge, Button, EmptyState, Select, Skeleton } from '@detaileed/ui';
import { ASSIGNABLE_ROLES, OWNER_ROLE_ID, roleById } from '@/features/team/model/roles';
import type { Employee } from '@/features/team/model/types';
import { memberName } from '@/features/team/model/memberName';

interface TeamMemberListProps {
  employees: Employee[];
  loading: boolean;
  /** Owners can change roles and remove people. */
  canManage: boolean;
  onRoleChange: (userId: string, roleId: number) => void;
  onRemove: (employee: Employee) => void;
}

const ROLE_OPTIONS = ASSIGNABLE_ROLES.map((r) => ({ value: String(r.id), label: r.name }));

function MemberRow({
  emp,
  canManage,
  onRoleChange,
  onRemove,
}: { emp: Employee } & Omit<TeamMemberListProps, 'employees' | 'loading'>) {
  const role = roleById(emp.roleId);
  const name = memberName(emp);
  const editable = canManage && emp.roleId !== OWNER_ROLE_ID;
  return (
    <li className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={emp.name || emp.email} decorative />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground" title={emp.name || emp.email}>
            {name}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} strokeWidth={1.75} className="shrink-0 text-faint" aria-hidden />
            <span className="truncate">{emp.email}</span>
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
        {editable ? (
          // Inline in a row: hide the field's empty hint/error slot so the select centres with the row.
          <div className="w-40 [&>div>div:last-child]:hidden">
            <Select
              aria-label={`Rola: ${name}`}
              options={ROLE_OPTIONS}
              value={String(emp.roleId)}
              onChange={(e) => onRoleChange(emp.userId, parseInt(e.target.value))}
            />
          </div>
        ) : (
          <Badge tone={role.tone}>{role.name}</Badge>
        )}
        {canManage && (
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            aria-label={`Usuń pracownika: ${name}`}
            onClick={() => onRemove(emp)}
          />
        )}
      </div>
    </li>
  );
}

/** The studio's members with their roles; owners can change roles and remove people. */
export function TeamMemberList({ employees, loading, ...actions }: TeamMemberListProps) {
  if (loading) {
    return (
      <ul className="divide-y divide-border" aria-hidden>
        {[1, 2, 3].map((i) => (
          <li key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton circle width="32px" height="32px" />
            <div className="flex-1 space-y-1.5">
              <Skeleton width="140px" height="14px" />
              <Skeleton width="180px" height="12px" />
            </div>
            <Skeleton width="96px" height="22px" />
          </li>
        ))}
      </ul>
    );
  }

  if (employees.length === 0) {
    return (
      <EmptyState icon={Users} title="Brak pracowników" message="Zaproś personel, aby zacząć zarządzać studiem." />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {employees.map((emp) => (
        <MemberRow key={emp.userId} emp={emp} {...actions} />
      ))}
    </ul>
  );
}
