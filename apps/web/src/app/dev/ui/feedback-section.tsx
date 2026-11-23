'use client';

import { Inbox } from 'lucide-react';
import { Alert, Button, Card, EmptyState, LoadingSpinner, Skeleton, useToast } from '@detaileed/ui';
import { GallerySection, Row } from './section';

/** Alerts, empty and loading states, toasts. */
export function FeedbackSection() {
  const { addToast } = useToast();
  return (
    <>
      <GallerySection title="Alert">
        <Alert
          tone="danger"
          title="Nie udało się wczytać rezerwacji"
          action={
            <Button size="sm" variant="secondary">
              Spróbuj ponownie
            </Button>
          }
        >
          Sprawdź połączenie z internetem.
        </Alert>
        <Alert tone="warning" title="Niezapisane zmiany">
          Zapisz formularz, zanim wyjdziesz.
        </Alert>
        <Alert tone="success">Zaproszenie zostało wysłane.</Alert>
        <Alert tone="info">Masz 3 nowe zapytania.</Alert>
        <Alert>Neutralna informacja bez tonu.</Alert>
      </GallerySection>

      <GallerySection title="EmptyState, LoadingSpinner i Skeleton">
        <Card>
          <EmptyState
            icon={Inbox}
            title="Brak zapytań"
            message="Opublikuj profil studia, aby klienci mogli je wysyłać."
            action={<Button variant="secondary">Opublikuj profil</Button>}
          />
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <Skeleton circle width={32} height={32} />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton width="40%" height={14} />
              <Skeleton width="70%" height={12} />
            </div>
          </div>
          <Skeleton width="100%" height={64} className="rounded-lg" />
        </Card>
        <Card>
          <LoadingSpinner className="py-8" />
        </Card>
      </GallerySection>

      <GallerySection title="Toasty (pokazują się w motywie strony)">
        <Row>
          <Button variant="secondary" onClick={() => addToast('Zapisano zmiany', 'success')}>
            Sukces
          </Button>
          <Button variant="secondary" onClick={() => addToast('Nie udało się zapisać rezerwacji', 'error')}>
            Błąd
          </Button>
          <Button variant="secondary" onClick={() => addToast('Wysłano zaproszenie do zespołu', 'info')}>
            Informacja
          </Button>
        </Row>
      </GallerySection>
    </>
  );
}
