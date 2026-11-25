import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import type { Studio } from '@/features/studios/model/types';
import { useStudios } from '@/features/studios/api/studios';
import { getLastStudioId } from '@/features/studios/model/activeStudio';
import { Alert, Button, LogoMark, Skeleton } from '@detaileed/ui';
import { CreateStudioModal } from '@/features/studios/components/CreateStudioModal';
import { NewStudioCard, StudioCard } from './select/StudioCard';

interface StudioSelectViewProps {
  onSelect: (studio: Studio) => void;
}

/** Owners and managers can create a new studio (anyone can create their first). */
const canCreateStudio = (studios: Studio[]) =>
  studios.length === 0 || studios.some((s) => s.role === 'Owner' || s.role === 'Manager');

// ─── View ─────────────────────────────────────────────────────────────────────
export const StudioSelectView: React.FC<StudioSelectViewProps> = ({ onSelect }) => {
  const { data: studios = [], isLoading, isError, refetch } = useStudios();
  const lastStudioId = getLastStudioId();

  const [selecting, setSelecting] = useState<string | null>(null);
  // Opened by hand only; the automatic opening is below
  const [manualOpen, setManualOpen] = useState(false);

  // ── Computed open state ──────────────────────────────────────────────────────
  // The modal opens when:
  // (a) the user clicked the new studio card (manualOpen)
  // (b) the studios have loaded and there are none (onboarding)
  const noStudiosAfterLoad = !isLoading && studios.length === 0;
  const isModalOpen = manualOpen || noStudiosAfterLoad;
  // It can be closed only when the user already has a studio
  const canClose = studios.length > 0;

  const handleSelect = (studio: Studio) => {
    setSelecting(studio.studioId);
    setTimeout(() => {
      setSelecting(null);
      onSelect(studio);
    }, 350);
  };

  const handleCreateSuccess = (newStudio: Studio) => {
    setManualOpen(false);
    handleSelect(newStudio);
  };

  const showCreateCard = !isLoading && !isError && canCreateStudio(studios) && studios.length > 0;

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-10 text-foreground sm:px-7">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <LogoMark size={36} className="text-foreground" />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Wybierz studio</h1>
            <p className="text-sm text-muted-foreground">
              Wybierz studio, z którym chcesz pracować. Możesz je zmienić w dowolnym momencie.
            </p>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <span role="status" className="sr-only">
                Ładowanie studiów…
              </span>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-44 w-full rounded-lg" />
              ))}
            </div>
          )}

          {isError && (
            <Alert
              tone="danger"
              title="Nie udało się pobrać listy studiów."
              className="mx-auto max-w-lg"
              action={
                <>
                  <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => refetch()}>
                    Spróbuj ponownie
                  </Button>
                  <Button size="sm" icon={Plus} onClick={() => setManualOpen(true)}>
                    Utwórz studio
                  </Button>
                </>
              }
            />
          )}

          {!isLoading && !isError && studios.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {studios.map((studio) => (
                <StudioCard
                  key={studio.studioId}
                  studio={studio}
                  isActive={lastStudioId === studio.studioId}
                  isSelecting={selecting === studio.studioId}
                  isDimmed={!!selecting && selecting !== studio.studioId}
                  onSelect={() => handleSelect(studio)}
                />
              ))}

              {/* New studio card: only when the user already has studios */}
              {showCreateCard && <NewStudioCard onClick={() => setManualOpen(true)} />}
            </div>
          )}
        </div>
      </main>

      {/* Opens by itself when there are no studios, or by hand */}
      <CreateStudioModal
        isOpen={isModalOpen}
        onClose={() => setManualOpen(false)}
        onSuccess={handleCreateSuccess}
        canClose={canClose}
      />
    </>
  );
};
