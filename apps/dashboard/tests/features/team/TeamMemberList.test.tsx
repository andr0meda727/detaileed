import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TeamMemberList } from '@/features/team/components/TeamMemberList';
import { memberName } from '@/features/team/model/memberName';
import type { Employee } from '@/features/team/model/types';

const owner: Employee = { userId: 'u1', email: 'anna@studio.pl', name: 'Anna Nowak', roleId: 1, roleName: 'Owner' };
const employee: Employee = { userId: 'u2', email: 'jan@studio.pl', name: null, roleId: 3, roleName: 'Employee' };

describe('memberName', () => {
  it('falls back to the email before "@"', () => {
    expect(memberName(owner)).toBe('Anna Nowak');
    expect(memberName(employee)).toBe('jan');
  });
});

describe('TeamMemberList', () => {
  it('lets an owner change roles of others and remove them', () => {
    const onRoleChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <TeamMemberList
        employees={[owner, employee]}
        loading={false}
        canManage
        onRoleChange={onRoleChange}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('Właściciel')).toBeInTheDocument();
    expect(screen.queryByLabelText('Rola: Anna Nowak')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Rola: jan'), { target: { value: '2' } });
    expect(onRoleChange).toHaveBeenCalledWith('u2', 2);

    fireEvent.click(screen.getByRole('button', { name: 'Usuń pracownika: jan' }));
    expect(onRemove).toHaveBeenCalledWith(employee);
  });

  it('shows roles read-only to other members', () => {
    render(
      <TeamMemberList
        employees={[employee]}
        loading={false}
        canManage={false}
        onRoleChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText('Pracownik')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('says when there is nobody', () => {
    render(<TeamMemberList employees={[]} loading={false} canManage onRoleChange={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Brak pracowników')).toBeInTheDocument();
  });
});
