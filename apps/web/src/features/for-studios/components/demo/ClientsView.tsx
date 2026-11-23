import { useMemo, useState } from 'react';
import { Pencil, Phone, Users } from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  LicensePlate,
  SearchInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@detaileed/ui';
import { MOCK_CLIENTS } from '../../model/demoData';
import { DemoHeader } from './DemoHeader';

type DemoClient = (typeof MOCK_CLIENTS)[number];

function VehicleList({ vehicles }: { vehicles: DemoClient['vehicles'] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {vehicles.slice(0, 2).map((v) => (
        <span key={v.id} className="inline-flex min-w-0 items-center gap-2">
          <span className="max-w-[140px] truncate text-muted-foreground">
            {v.brand} {v.model}
          </span>
          <LicensePlate plate={v.licensePlate} />
        </span>
      ))}
      {vehicles.length > 2 && <span className="font-mono text-xs text-faint tabular-nums">+{vehicles.length - 2}</span>}
    </div>
  );
}

function ClientRow({ client }: { client: DemoClient }) {
  return (
    <TableRow className="hover:bg-muted">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar name={client.name} decorative />
          <div className="min-w-0">
            <p className="max-w-[220px] truncate font-medium text-foreground">{client.name}</p>
            {client.nip && <p className="font-mono text-xs text-faint tabular-nums">NIP {client.nip}</p>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="font-mono tabular-nums">{client.phone}</p>
        {client.email && <p className="max-w-[200px] truncate text-xs text-muted-foreground">{client.email}</p>}
      </TableCell>
      <TableCell>
        <VehicleList vehicles={client.vehicles} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Phone} aria-label={`Zadzwoń: ${client.name}`} />
          <Button variant="ghost" size="sm" icon={Pencil} aria-label={`Edytuj klienta: ${client.name}`} />
        </div>
      </TableCell>
    </TableRow>
  );
}

/** The demo's client list (CRM) with a search. */
export function ClientsView() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        c.vehicles.some(
          (v) => v.licensePlate.toLowerCase().includes(q) || `${v.brand} ${v.model}`.toLowerCase().includes(q),
        ),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <DemoHeader title="Klienci" subtitle="CRM • Zarządzanie relacjami" />

      <SearchInput
        aria-label="Szukaj klienta"
        placeholder="Szukaj klienta, tablicy, modelu..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        wrapperClassName="md:w-96"
      />

      <Card className="overflow-hidden">
        <Table aria-label="Klienci" className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Klient</TableHead>
              <TableHead className="w-[22%]">Kontakt</TableHead>
              <TableHead>Pojazdy</TableHead>
              <TableHead className="w-24 text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState icon={Users} message="Nie znaleziono klientów." />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => <ClientRow key={client.id} client={client} />)
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
