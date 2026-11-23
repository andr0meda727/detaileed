import { useState } from 'react';
import { Clock, Plus, Trash2, Wrench } from 'lucide-react';
import { Badge, Button, EmptyState, LoadingSpinner } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { serviceCategoryLabel } from '@detaileed/domain/serviceCategory';
import { ADD_CARD, CARD } from '@/shared/ui/cardGrid';
import { useDeleteService, useServices } from '@/features/services/api/services';
import { fromPrice, type Service } from '@/features/services/model/types';
import { ServiceFormModal } from '@/features/services/components/ServiceFormModal';

interface ServicesSettingsProps {
  addToast: (message: string, type: 'success' | 'error') => void;
}

/** Studio settings tab: the studio's services as cards (category, duration, prices); click one to edit it. */
export function ServicesSettings({ addToast }: ServicesSettingsProps) {
  const { data: items = [], isLoading } = useServices();
  const deleteService = useDeleteService();
  // The open form: a new service (null) or one to edit; `key` remounts it with fresh values.
  const [form, setForm] = useState<{ key: number; service: Service | null } | null>(null);
  const openForm = (service: Service | null) => setForm({ key: Date.now(), service });

  const handleDelete = async (id: string) => {
    try {
      await deleteService.mutateAsync(id);
      addToast('Usługa usunięta', 'success');
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Nie udało się usunąć usługi'), 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono tabular-nums">{items.length}</span> usług
        </p>
        <Button onClick={() => openForm(null)} icon={Plus}>
          Dodaj usługę
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Brak usług. Dodaj pierwszą." icon={Wrench} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const from = fromPrice(item);
            return (
              <div key={item.id} className={CARD}>
                <Badge size="sm" dot={false} className="self-start">
                  {serviceCategoryLabel(item.category)}
                </Badge>
                {/* The whole card opens the form: the button's overlay covers it, the delete button sits above. */}
                <button
                  type="button"
                  onClick={() => openForm(item)}
                  className="pr-8 text-left text-sm font-medium text-foreground outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                  {item.name}
                </button>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={12} strokeWidth={1.75} aria-hidden />
                    <span className="font-mono tabular-nums">{item.durationMinutes}</span> min
                  </span>
                  <span>
                    {from === null ? (
                      'Cena na zapytanie'
                    ) : (
                      <>
                        od <span className="font-mono tabular-nums">{formatPln(from)}</span> zł
                      </>
                    )}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  aria-label={`Usuń ${item.name}`}
                  onClick={() => void handleDelete(item.id)}
                  disabled={deleteService.isPending}
                  className="absolute top-3 right-3 z-10"
                />
              </div>
            );
          })}
          <button type="button" onClick={() => openForm(null)} className={ADD_CARD}>
            <Plus size={20} strokeWidth={1.75} aria-hidden />
            <span className="text-sm font-medium">Dodaj</span>
          </button>
        </div>
      )}

      <ServiceFormModal
        key={form?.key ?? 'closed'}
        isOpen={form !== null}
        service={form?.service ?? null}
        onClose={() => setForm(null)}
      />
    </div>
  );
}
