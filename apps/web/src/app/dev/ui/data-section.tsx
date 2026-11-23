'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  FormSection,
  LicensePlate,
  PageHeader,
  Pagination,
  Stat,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@detaileed/ui';
import { GallerySection } from './section';

const visits = [
  {
    time: '08:00',
    name: 'Tomasz Wiśniewski',
    plate: 'WX 4821K',
    service: 'Mycie + wosk',
    status: 'done',
    price: '280 zł',
  },
  {
    time: '09:00',
    name: 'Anna Kowalczyk',
    plate: 'we7720s',
    service: 'Korekta lakieru',
    status: 'info',
    price: '1 200 zł',
  },
  {
    time: '12:30',
    name: 'Marek Zieliński',
    plate: 'KR 1A234',
    service: 'Pranie tapicerki',
    status: 'danger',
    price: '450 zł',
  },
] as const;

/** Page header, cards, stats, the form section, the table and pagination. */
export function DataSection() {
  const [page, setPage] = useState(2);
  return (
    <>
      <GallerySection title="PageHeader">
        <PageHeader
          breadcrumb={<nav aria-label="Ścieżka">Połysk Detailing / Rezerwacje</nav>}
          title="Rezerwacje"
          description="Wszystkie wizyty studia w jednym miejscu."
          actions={
            <>
              <Button variant="secondary">Eksportuj</Button>
              <Button>Nowa rezerwacja</Button>
            </>
          }
        />
      </GallerySection>

      <GallerySection title="Card i Stat">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-5">
            <Stat label="Przychód dziś" value="2 340 zł" hint="z 2 ukończonych wizyt" />
          </Card>
          <Card className="p-5">
            <Stat label="Klienci" value="218" hint="+6 w tym miesiącu" tone="success" />
          </Card>
          <Card className="p-5">
            <Stat label="Niski stan" value="3" hint="produkty do zamówienia" tone="warning" />
          </Card>
        </div>
        <Card>
          <CardHeader
            title="Godziny otwarcia"
            description="Widoczne na stronie studia"
            actions={
              <Button size="sm" variant="secondary">
                Edytuj
              </Button>
            }
          />
          <CardContent className="text-sm text-muted-foreground">Pon–pt 8:00–18:00, sob 9:00–14:00.</CardContent>
          <CardFooter>
            <Button variant="ghost">Anuluj</Button>
            <Button>Zapisz</Button>
          </CardFooter>
        </Card>
        <FormSection icon={CalendarDays} title="Termin" actions={<Badge tone="info">Krok 2 z 3</Badge>}>
          <p className="p-5 text-sm text-muted-foreground">Treść sekcji formularza.</p>
        </FormSection>
      </GallerySection>

      <GallerySection title="Table, Avatar, LicensePlate i Pagination">
        <Card className="overflow-hidden">
          <Table aria-label="Dzisiejsze wizyty" className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Godzina</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Usługa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Kwota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((v) => (
                <TableRow key={v.time} className="hover:bg-muted">
                  <TableCell className="font-mono tabular-nums">{v.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={v.name} size="sm" decorative />
                      <span className="font-medium">{v.name}</span>
                      <LicensePlate plate={v.plate} />
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{v.service}</TableCell>
                  <TableCell>
                    {v.status === 'done' && <Badge>Zakończona</Badge>}
                    {v.status === 'info' && <Badge tone="info">Utworzona</Badge>}
                    {v.status === 'danger' && <Badge tone="danger">Anulowana</Badge>}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{v.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Pagination page={page} totalPages={5} onPageChange={setPage} />
        <div className="flex items-center gap-2">
          <Avatar name="Anna Kowalczyk" size="sm" />
          <Avatar name="Połysk Detailing" />
          <Avatar name="Jan" size="lg" />
        </div>
      </GallerySection>
    </>
  );
}
