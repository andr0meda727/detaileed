import React from 'react';
import { CheckCircle2, Crown, Loader2, MapPin, Plus, Shield, UserCheck, type LucideIcon } from 'lucide-react';
import { Badge, cn, type BadgeTone } from '@detaileed/ui';
import type { Studio } from '@/features/studios/model/types';

// The same tones as the team screen (features/team/model/roles.ts).
const ROLES: Record<string, { label: string; icon: LucideIcon; tone: BadgeTone }> = {
  Owner: { label: 'Właściciel', icon: Crown, tone: 'info' },
  Manager: { label: 'Menedżer', icon: Shield, tone: 'neutral' },
  Employee: { label: 'Pracownik', icon: UserCheck, tone: 'neutral' },
};

const cardClass = cn(
  'flex min-h-44 flex-col gap-4 rounded-lg border p-5 text-left transition-colors duration-150',
  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

interface StudioCardProps {
  studio: Studio;
  /** The studio the user worked in last. */
  isActive: boolean;
  isSelecting: boolean;
  /** Another studio is being opened: this card fades out and can't be picked. */
  isDimmed: boolean;
  onSelect: () => void;
}

/** One studio in the picker: the user's role, its name and address. */
export const StudioCard: React.FC<StudioCardProps> = ({ studio, isActive, isSelecting, isDimmed, onSelect }) => {
  const role = ROLES[studio.role] ?? { label: studio.role, icon: UserCheck, tone: 'neutral' as const };
  const RoleIcon = role.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isSelecting || isDimmed}
      aria-current={isActive || undefined}
      className={cn(
        cardClass,
        'bg-surface hover:bg-muted',
        isActive ? 'border-primary' : 'border-border',
        isDimmed && 'pointer-events-none opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone={role.tone} dot={false}>
          <RoleIcon className="size-3" strokeWidth={1.75} aria-hidden />
          {role.label}
        </Badge>
        {isSelecting ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" strokeWidth={1.75} aria-hidden />
        ) : (
          isActive && <CheckCircle2 className="size-4 text-foreground" strokeWidth={1.75} aria-hidden />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{studio.name}</h2>
        {studio.address ? (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{studio.address}</span>
          </p>
        ) : (
          <p className="text-sm text-faint">Brak adresu</p>
        )}
      </div>

      <p className="text-xs text-faint">{isActive ? 'Aktualnie wybrane' : 'Kliknij, aby wybrać'}</p>
    </button>
  );
};

/** The last tile of the picker: opens the new studio form. */
export const NewStudioCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      cardClass,
      'items-center justify-center border-dashed border-border-strong bg-transparent text-center hover:bg-muted',
    )}
  >
    <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Plus className="size-4" strokeWidth={1.75} aria-hidden />
    </span>
    <span className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-foreground">Nowe studio</span>
      <span className="text-xs text-muted-foreground">Utwórz kolejne studio</span>
    </span>
  </button>
);
