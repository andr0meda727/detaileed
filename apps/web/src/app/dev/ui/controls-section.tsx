'use client';

import { useState } from 'react';
import { Mail, Plus, Save, Settings, Trash2 } from 'lucide-react';
import { Badge, Button, FieldError, FormInput, Kbd, SearchInput, Select, StarRating, Textarea } from '@detaileed/ui';
import { GallerySection, Row } from './section';

const sizes = [
  { value: 'Small', label: 'Małe' },
  { value: 'Medium', label: 'Średnie' },
  { value: 'Large', label: 'Duże' },
];

/** Buttons, badges and form fields. */
export function ControlsSection() {
  const [query, setQuery] = useState('Kowalczyk');
  const [rating, setRating] = useState(4);
  return (
    <>
      <GallerySection title="Button">
        <Row>
          <Button icon={Plus}>Nowa rezerwacja</Button>
          <Button variant="secondary">Anuluj</Button>
          <Button variant="ghost">Więcej</Button>
          <Button variant="danger" icon={Trash2}>
            Usuń
          </Button>
          <Button variant="success">Zakończ (alias)</Button>
        </Row>
        <Row>
          <Button size="sm">Mały</Button>
          <Button>Średni</Button>
          <Button size="lg">Duży</Button>
          <Button loading icon={Save}>
            Zapisywanie
          </Button>
          <Button disabled>Wyłączony</Button>
          <Button variant="secondary" icon={Settings} aria-label="Ustawienia" />
          <Button variant="ghost" size="sm" icon={Trash2} aria-label="Usuń" />
        </Row>
      </GallerySection>

      <GallerySection title="Badge">
        <Row>
          <Badge>Zakończona</Badge>
          <Badge tone="info">Utworzona</Badge>
          <Badge tone="success">Zaakceptowane</Badge>
          <Badge tone="warning">Oczekuje</Badge>
          <Badge tone="danger">Anulowana</Badge>
          <Badge color="var(--info)">Kolor z API</Badge>
          <Badge size="sm" dot={false}>
            3
          </Badge>
          <Badge size="lg" tone="warning">
            Właściciel
          </Badge>
        </Row>
      </GallerySection>

      <GallerySection title="Pola formularza">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormInput label="E-mail" type="email" placeholder="anna@example.com" leftIcon={<Mail size={16} />} />
          <FormInput label="Telefon" defaultValue="12 345" error="Podaj 9 cyfr" />
          <Select label="Wielkość auta" options={sizes} defaultValue="Medium" hint="Wpływa na cenę usługi" />
          <Select label="Wielkość (błąd)" options={sizes} error="Wybierz wielkość" />
          <Textarea label="Uwagi" placeholder="Rysa na lewych drzwiach…" />
          <FormInput label="Wyłączone" disabled defaultValue="Nie do zmiany" />
        </div>
        <FieldError>Samodzielny komunikat błędu (FieldError)</FieldError>
      </GallerySection>

      <GallerySection title="SearchInput, Kbd i StarRating">
        <SearchInput
          aria-label="Szukaj klienta"
          placeholder="Imię, telefon, rejestracja…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
        />
        <Row>
          <span className="text-sm text-muted-foreground">
            Zamknij: <Kbd>Esc</Kbd> · Szukaj: <Kbd>⌘K</Kbd>
          </span>
        </Row>
        <Row>
          <StarRating value={4.6} />
          <StarRating value={rating} onChange={setRating} size={22} label="Twoja ocena" />
        </Row>
      </GallerySection>
    </>
  );
}
