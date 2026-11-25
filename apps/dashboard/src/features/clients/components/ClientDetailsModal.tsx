import React from 'react';
import { Car as CarIcon, Mail, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, LicensePlate, Modal } from '@detaileed/ui';
import { vehicleSizeLabel } from '@detaileed/domain/vehicleSize';
import type { Client } from '@/features/clients/model/types';

interface ClientDetailsModalProps {
  /** The client to show; null closes the modal. */
  client: Client | null;
  onClose: () => void;
  onEditClient: (client: Client) => void;
  onAddVehicle: () => void;
  onEditVehicle: (vehicleId: string) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

function ContactRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string | null }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border px-4 py-3">
      <Icon size={16} strokeWidth={1.75} className="shrink-0 text-faint" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-faint">{label}</dt>
        <dd className={value ? 'truncate text-sm text-foreground' : 'text-sm text-faint'}>{value || 'Brak'}</dd>
      </div>
    </div>
  );
}

function VehicleRow({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Client['vehicles'][number];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const name = [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Pojazd';
  const size = vehicleSizeLabel(vehicle.size);
  return (
    <li className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <CarIcon size={16} strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          {size && (
            <Badge tone="neutral" size="sm" dot={false} className="mt-0.5">
              {size}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <LicensePlate plate={vehicle.licensePlate} className="mr-2" />
        <Button
          variant="ghost"
          size="sm"
          icon={Pencil}
          aria-label={`Edytuj pojazd ${vehicle.licensePlate}`}
          onClick={onEdit}
        />
        <Button
          variant="ghost"
          size="sm"
          icon={Trash2}
          aria-label={`Usuń pojazd ${vehicle.licensePlate}`}
          onClick={onDelete}
        />
      </div>
    </li>
  );
}

/** Client card: contact details and vehicles, with edit/add/delete actions. */
export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  onClose,
  onEditClient,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
}) => (
  <Modal isOpen={client !== null} onClose={onClose} title="Karta klienta">
    {client && (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size="lg" decorative />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">{client.name}</h3>
            {client.nip && <p className="font-mono text-xs text-faint tabular-nums">NIP {client.nip}</p>}
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ContactRow icon={Phone} label="Telefon" value={client.phone} />
          <ContactRow icon={Mail} label="Email" value={client.email} />
        </dl>

        <Card>
          <CardHeader
            titleAs="h4"
            title={
              <span className="flex items-center gap-2">
                Pojazdy we flocie
                <span className="font-mono text-xs font-normal text-faint tabular-nums">{client.vehicles.length}</span>
              </span>
            }
            actions={
              <Button variant="secondary" size="sm" icon={Plus} onClick={onAddVehicle}>
                Dodaj pojazd
              </Button>
            }
          />
          {client.vehicles.length > 0 ? (
            <ul className="divide-y divide-border">
              {client.vehicles.map((v) => (
                <VehicleRow
                  key={v.id}
                  vehicle={v}
                  onEdit={() => onEditVehicle(v.id)}
                  onDelete={() => onDeleteVehicle(v.id)}
                />
              ))}
            </ul>
          ) : (
            <EmptyState icon={CarIcon} message="Klient nie posiada jeszcze dodanych pojazdów." className="py-8" />
          )}
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" icon={Pencil} onClick={() => onEditClient(client)}>
            Edytuj klienta
          </Button>
          {client.phone ? (
            <Button asChild icon={Phone}>
              <a href={`tel:${client.phone}`}>Zadzwoń</a>
            </Button>
          ) : (
            <Button icon={Phone} disabled>
              Brak numeru
            </Button>
          )}
        </div>
      </div>
    )}
  </Modal>
);
