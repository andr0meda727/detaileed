import { useState } from 'react';
import { Check, Plus, Wrench } from 'lucide-react';
import { FormSection, useToast } from '@detaileed/ui';
import { toggleIdSelection } from '@/shared/lib/selection';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useCreateService, useServices } from '@/features/services';

interface BookingServicesSectionProps {
  value: string[];
  onChange: (serviceIds: string[]) => void;
  error?: string;
}

/** Toggle tiles for the studio's services, plus a field that creates a new service and selects it. */
export default function BookingServicesSection({ value, onChange, error }: BookingServicesSectionProps) {
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
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#1a2e1e' }}>
      <Check size={10} strokeWidth={3} className="text-cream-warm" />
      <span className="text-[9px] font-bold text-cream-warm tracking-widest">{value.length}</span>
    </div>
  );

  return (
    <FormSection icon={Wrench} title="Wybierz Usługi" actions={counter}>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {services.map((svc) => {
          const isSelected = value.includes(svc.id);
          return (
            <button
              key={svc.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(toggleIdSelection(value, svc.id))}
              className="group relative flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200"
              style={
                isSelected
                  ? { background: '#1a2e1e', boxShadow: '0 4px 12px rgba(26,46,30,0.2)' }
                  : { background: '#f8f9fa' }
              }
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={
                  isSelected
                    ? { background: 'rgba(245,240,232,0.15)', border: '1.5px solid rgba(245,240,232,0.4)' }
                    : { background: 'white', border: '1.5px solid rgba(0,0,0,0.12)' }
                }
              >
                {isSelected && <Check size={10} strokeWidth={3.5} className="text-cream-warm" />}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wide leading-tight line-clamp-2"
                style={{ color: isSelected ? '#f5f0e8' : '#2d4f33' }}
              >
                {svc.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <input
          type="text"
          value={newServiceName}
          onChange={(e) => setNewServiceName(e.target.value)}
          placeholder="Dodaj inną usługę..."
          className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-hidden font-semibold text-sm focus:border-cream-warm/50"
        />
        <button
          type="button"
          aria-label="Dodaj usługę"
          onClick={handleAddService}
          disabled={createService.isPending}
          className="w-12 h-12 bg-green-deep text-cream-warm rounded-xl flex items-center justify-center shadow-md active:scale-95 disabled:opacity-60"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
      {error && <p className="px-4 pb-4 text-red-500 font-bold tracking-widest uppercase text-[10px]">{error}</p>}
    </FormSection>
  );
}
