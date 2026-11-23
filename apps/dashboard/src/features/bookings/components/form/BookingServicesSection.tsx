import { useState } from 'react';
import { Check, Plus, Wrench } from 'lucide-react';
import { Badge, Button, FieldError, FormInput, FormSection, cn, useToast } from '@detaileed/ui';
import { toggleIdSelection } from '@/shared/lib/selection';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useCreateService, useServices } from '@/features/services';

interface BookingServicesSectionProps {
  value: string[];
  onChange: (serviceIds: string[]) => void;
  error?: string;
}

/** Toggle tiles for the studio's services, plus a field that creates a new service and selects it. */
export function BookingServicesSection({ value, onChange, error }: BookingServicesSectionProps) {
  const { addToast } = useToast();
  const { data: services = [] } = useServices();
  const createService = useCreateService();
  const [newServiceName, setNewServiceName] = useState('');

  const handleAddService = async () => {
    const name = newServiceName.trim();
    if (!name) return;
    try {
      const created = await createService.mutateAsync({ name });
      onChange([...value, created.id]);
      setNewServiceName('');
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Nie udało się dodać usługi.'), 'error');
    }
  };

  const counter = value.length > 0 && (
    <Badge dot={false}>
      Wybrano: <span className="font-mono tabular-nums">{value.length}</span>
    </Badge>
  );

  return (
    <FormSection icon={Wrench} title="Wybierz usługi" actions={counter}>
      <div className="grid grid-cols-1 gap-2 p-5 pb-3 sm:grid-cols-3">
        {services.map((svc) => {
          const isSelected = value.includes(svc.id);
          return (
            <button
              key={svc.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(toggleIdSelection(value, svc.id))}
              className={cn(
                'flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                isSelected
                  ? 'border-primary bg-muted text-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong',
                )}
              >
                {isSelected && <Check size={12} strokeWidth={2.5} />}
              </span>
              <span className="line-clamp-2 leading-tight">{svc.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 px-5 pb-5">
        <div className="flex-1">
          <FormInput
            aria-label="Nowa usługa"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="Dodaj inną usługę..."
          />
        </div>
        <Button
          variant="secondary"
          icon={Plus}
          aria-label="Dodaj usługę"
          onClick={handleAddService}
          loading={createService.isPending}
        />
      </div>
      <FieldError className="px-5 pb-5">{error}</FieldError>
    </FormSection>
  );
}
