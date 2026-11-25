import React from 'react';
import { Pencil, Phone, Users } from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  LicensePlate,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@detaileed/ui';
import type { Client } from '@/features/clients/model/types';

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  /** Fades the list while a new search is pending. */
  dimmed: boolean;
  onOpen: (client: Client) => void;
  onEdit: (client: Client) => void;
}

const COLUMNS = 4;

/** On tablets (`md` to `xl`) the contact column gives way and the phone shows under the name. */
const CONTACT_COLUMN = 'md:max-xl:hidden';

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={`skeleton-${i}`}>
      <TableCell stack="primary">
        <div className="flex items-center gap-3">
          <Skeleton circle width="32px" height="32px" />
          <Skeleton width="140px" height="14px" />
        </div>
      </TableCell>
      <TableCell className={CONTACT_COLUMN}>
        <div className="space-y-1.5">
          <Skeleton width="100px" height="14px" />
          <Skeleton width="140px" height="12px" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton width="200px" height="22px" />
      </TableCell>
      <TableCell stack="actions">
        <Skeleton width="72px" height="32px" className="ml-auto" />
      </TableCell>
    </TableRow>
  ));
}

function VehicleList({ vehicles }: { vehicles: Client['vehicles'] }) {
  if (vehicles.length === 0) return <span className="text-faint">Brak pojazdów</span>;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {vehicles.slice(0, 2).map((v) => (
        <span key={v.id} className="inline-flex min-w-0 items-center gap-2">
          {(v.brand || v.model) && (
            <span className="max-w-[140px] truncate text-muted-foreground">
              {[v.brand, v.model].filter(Boolean).join(' ')}
            </span>
          )}
          <LicensePlate plate={v.licensePlate} />
        </span>
      ))}
      {vehicles.length > 2 && <span className="font-mono text-xs text-faint tabular-nums">+{vehicles.length - 2}</span>}
    </div>
  );
}

function ClientRow({ client, onOpen, onEdit }: { client: Client } & Pick<ClientsTableProps, 'onOpen' | 'onEdit'>) {
  return (
    <TableRow onClick={() => onOpen(client)} className="cursor-pointer hover:bg-muted">
      <TableCell stack="primary" className="max-md:pr-20">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} decorative />
          <div className="min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(client);
              }}
              className="block max-w-[220px] truncate rounded-sm text-left font-medium text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {client.name}
            </button>
            {client.nip && <p className="font-mono text-xs text-faint tabular-nums">NIP {client.nip}</p>}
            {client.phone && (
              <p className="hidden font-mono text-xs text-muted-foreground tabular-nums md:max-xl:block">
                {client.phone}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell label="Kontakt" stack="full" className={CONTACT_COLUMN}>
        {client.phone ? (
          <p className="font-mono tabular-nums">{client.phone}</p>
        ) : (
          <p className="text-faint">Brak telefonu</p>
        )}
        {client.email && <p className="max-w-[200px] truncate text-xs text-muted-foreground">{client.email}</p>}
      </TableCell>

      <TableCell label="Pojazdy" stack="full">
        <VehicleList vehicles={client.vehicles} />
      </TableCell>

      <TableCell stack="actions">
        <div className="flex items-center justify-end gap-1">
          {client.phone && (
            <Button asChild variant="ghost" size="sm" icon={Phone} className="size-8 px-0">
              <a
                href={`tel:${client.phone}`}
                aria-label={`Zadzwoń: ${client.name}`}
                onClick={(e) => e.stopPropagation()}
              />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={Pencil}
            aria-label={`Edytuj klienta: ${client.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(client);
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

/** Client list with contact details, vehicles and call/edit actions (stacked cards on phones). */
export const ClientsTable: React.FC<ClientsTableProps> = ({ clients, isLoading, dimmed, onOpen, onEdit }) => (
  <Card className={cn('overflow-hidden transition-opacity duration-150', dimmed && 'opacity-70')}>
    <Table aria-label="Klienci" stacked>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[28%]">Klient</TableHead>
          <TableHead className={cn('w-[22%]', CONTACT_COLUMN)}>Kontakt</TableHead>
          <TableHead>Pojazdy</TableHead>
          <TableHead className="w-24 text-right">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <SkeletonRows />
        ) : clients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLUMNS}>
              <EmptyState icon={Users} message="Nie znaleziono klientów." />
            </TableCell>
          </TableRow>
        ) : (
          clients.map((client) => <ClientRow key={client.id} client={client} onOpen={onOpen} onEdit={onEdit} />)
        )}
      </TableBody>
    </Table>
  </Card>
);
