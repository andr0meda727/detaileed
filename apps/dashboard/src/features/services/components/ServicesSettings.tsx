import { useState } from 'react';
import { Clock, Plus, Trash2, Wrench } from 'lucide-react';
import { Badge, Button, EmptyState, LoadingSpinner } from '@detaileed/ui';
import { formatPln } from '@/shared/lib/money';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { serviceCategoryLabel } from '@/shared/lib/serviceCategory';
import { ADD_CARD, CARD } from '@/shared/ui/cardGrid';
import { useDeleteService, useServices } from '@/features/services/api/services';
import { fromPrice, type Service } from '@/features/services/model/types';
import ServiceFormModal from '@/features/services/components/ServiceFormModal';

interface ServicesSettingsProps {
  addToast: (message: string, type: 'success' | 'error') => void;
}

/** Studio settings tab: the studio's services as cards (category, duration, prices); click one to edit it. */
export default function ServicesSettings({ addToast }: ServicesSettingsProps) {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400 font-medium">{items.length} usług</p>
        <Button onClick={() => openForm(null)} icon={Plus}>
          Dodaj usługę
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Brak usług. Dodaj pierwszą!" icon={Wrench} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const from = fromPrice(item);
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => openForm(item)}
                onKeyDown={(e) => e.key === 'Enter' && openForm(item)}
                className={`${CARD} cursor-pointer text-left`}
              >
                <Badge tone="brand" size="sm" className="self-start">
                  {serviceCategoryLabel(item.category)}
                </Badge>
                <p className="font-bold text-green-deep text-sm leading-tight pr-6">{item.name}</p>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {item.durationMinutes} min
                  </span>
                  <span>{from === null ? 'Cena na zapytanie' : `od ${formatPln(from)} zł`}</span>
                </div>
                <button
                  aria-label={`Usuń ${item.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDelete(item.id);
                  }}
                  disabled={deleteService.isPending}
                  className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-200 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          <button onClick={() => openForm(null)} className={ADD_CARD}>
            <Plus size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Dodaj</span>
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
