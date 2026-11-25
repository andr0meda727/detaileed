'use client';

import { useState } from 'react';
import { CalendarDays, Copy, LayoutGrid, List, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  Button,
  Checkbox,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormInput,
  Modal,
  RadioCardGroup,
  SegmentedControl,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeSwitch,
  Tooltip,
} from '@detaileed/ui';

export function DialogExamples() {
  const [open, setOpen] = useState(false);
  const [nested, setNested] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = () => {
    setDeleting(true);
    window.setTimeout(() => {
      setDeleting(false);
      setConfirm(false);
    }, 1200);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Otwórz okno
      </Button>
      <Button variant="danger" onClick={() => setConfirm(true)}>
        Usuń pojazd
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Nowy klient"
        description="Dane kontaktowe widoczne dla zespołu."
      >
        <div className="flex flex-col gap-4 text-sm">
          <FormInput label="Imię i nazwisko" defaultValue="Anna Nowak" />
          <Checkbox label="Zgoda na SMS" description="Przypomnienia o wizycie dzień wcześniej." defaultChecked />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setNested(true)}>
              Okno w oknie
            </Button>
            <Button onClick={() => setOpen(false)}>Zapisz</Button>
          </div>
        </div>
        <Modal isOpen={nested} onClose={() => setNested(false)} title="Drugie okno" size="sm">
          <p className="text-sm text-muted-foreground">Escape zamyka tylko to okno.</p>
        </Modal>
      </Modal>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        tone="danger"
        title="Usunąć pojazd?"
        description="Toyota Corolla (WA 12345) zniknie z karty klienta. Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        loading={deleting}
        onConfirm={remove}
      />
    </div>
  );
}

const ranges = [
  { value: 'day', label: 'Dzień' },
  { value: 'week', label: 'Tydzień' },
  { value: 'month', label: 'Miesiąc' },
] as const;

const views = [
  { value: 'list', label: 'Lista', icon: List },
  { value: 'grid', label: 'Siatka', icon: LayoutGrid },
  { value: 'calendar', label: 'Kalendarz', icon: CalendarDays },
] as const;

export function NavigationExamples({ idPrefix }: { idPrefix: string }) {
  const [tab, setTab] = useState('items');
  const [range, setRange] = useState<(typeof ranges)[number]['value']>('week');
  const [view, setView] = useState<(typeof views)[number]['value']>('list');

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Magazyn">
          <TabsTrigger value="items">Produkty</TabsTrigger>
          <TabsTrigger value="ledger">Ruchy</TabsTrigger>
          <TabsTrigger value="settings">Ustawienia</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="text-sm text-muted-foreground">
          24 produkty, 3 z niskim stanem.
        </TabsContent>
        <TabsContent value="ledger" className="text-sm text-muted-foreground">
          Przyjęcia, zużycie i korekty z ostatnich 30 dni.
        </TabsContent>
        <TabsContent value="settings" className="text-sm text-muted-foreground">
          Kategorie i jednostki.
        </TabsContent>
      </Tabs>
      <Tabs value="ledger">
        <TabsList aria-label="Zakładki w adresie">
          <TabsTrigger value="items" asChild>
            <a href={`#${idPrefix}-items`}>Link: produkty</a>
          </TabsTrigger>
          <TabsTrigger value="ledger" asChild>
            <a href={`#${idPrefix}-ledger`}>Link: ruchy</a>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl aria-label="Zakres" options={ranges} value={range} onValueChange={setRange} />
        <SegmentedControl aria-label="Widok" size="sm" options={views} value={view} onValueChange={setView} />
        <SegmentedControl aria-label="Widok (ikony)" iconOnly options={views} value={view} onValueChange={setView} />
      </div>
    </>
  );
}

const slots = [
  { value: '10:00-2', label: '10:00 · Stanowisko 2', description: 'Wolne do 13:00', trailing: '3 h' },
  { value: '12:30-1', label: '12:30 · Stanowisko 1', description: 'Wolne do 16:00', trailing: '3,5 h' },
  { value: '15:00-1', label: '15:00 · Stanowisko 1', description: 'Zajęte', disabled: true },
];

export function ChoiceExamples() {
  const [extras, setExtras] = useState({ wax: true, interior: false });
  const [visible, setVisible] = useState(true);
  const [slot, setSlot] = useState('');
  const all = extras.wax && extras.interior ? true : extras.wax || extras.interior ? 'indeterminate' : false;

  return (
    <>
      <div className="flex flex-col gap-3">
        <Checkbox
          label="Wszystkie dodatki"
          checked={all}
          onCheckedChange={(next) => setExtras({ wax: next === true, interior: next === true })}
        />
        <Checkbox
          className="pl-6"
          label="Wosk twardy"
          description="+ 120 zł"
          checked={extras.wax}
          onCheckedChange={(next) => setExtras((e) => ({ ...e, wax: next === true }))}
        />
        <Checkbox
          className="pl-6"
          label="Pranie tapicerki"
          description="+ 250 zł"
          checked={extras.interior}
          onCheckedChange={(next) => setExtras((e) => ({ ...e, interior: next === true }))}
        />
        <Checkbox label="Niedostępne" disabled />
      </div>
      <Switch
        label="Widoczne w wyszukiwarce"
        description="Klienci znajdą studio na mapie."
        checked={visible}
        onCheckedChange={setVisible}
      />
      <RadioCardGroup aria-label="Wolne terminy" columns={2} options={slots} value={slot} onValueChange={setSlot} />
    </>
  );
}

export function MenuExamples() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" icon={MoreHorizontal}>
            Akcje
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Rezerwacja #1042</DropdownMenuLabel>
          <DropdownMenuItem icon={Pencil}>Edytuj</DropdownMenuItem>
          <DropdownMenuItem icon={Copy}>Duplikuj</DropdownMenuItem>
          <DropdownMenuItem disabled>Wyślij fakturę</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem danger icon={Trash2}>
            Anuluj rezerwację
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip content="Kopiuje link do profilu studia">
        <Button variant="ghost" icon={Copy} aria-label="Kopiuj link" />
      </Tooltip>
      <ThemeSwitch iconOnly />
    </div>
  );
}
