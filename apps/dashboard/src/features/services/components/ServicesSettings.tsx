import React, { useState } from 'react';
import { Wrench, Plus, Trash2, Loader2 } from 'lucide-react';
import { useServices, useCreateService, useDeleteService } from '@/features/services/api/services';
import { Button, Modal, LoadingSpinner, EmptyState } from '@detaileed/ui';
import NameForm from '@/shared/ui/NameForm';
import { ADD_CARD, CARD } from '@/shared/ui/cardGrid';

/** Studio settings tab: the studio's services as cards, with add and delete. */
const ServicesSettings: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({
  addToast,
}) => {
  const { data: items = [], isLoading } = useServices();
  const createService = useCreateService();
  const deleteService = useDeleteService();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = async (name: string) => {
    try {
      await createService.mutateAsync({ name });
      addToast('Usługa dodana', 'success');
      setIsModalOpen(false);
    } catch {
      addToast('Nie udało się dodać usługi', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService.mutateAsync(id);
      addToast('Usługa usunięta', 'success');
    } catch {
      addToast('Nie udało się usunąć usługi', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400 font-medium">{items.length} usług</p>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Dodaj usługę
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Brak usług. Dodaj pierwszą!" icon={Wrench} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className={CARD}>
              <div className="w-10 h-10 bg-green-deep/5 rounded-2xl flex items-center justify-center mb-1">
                <Wrench size={18} className="text-green-deep/40" />
              </div>
              <p className="font-bold text-green-deep text-sm leading-tight">{item.name}</p>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deleteService.isPending}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-200 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              >
                {deleteService.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
          <button onClick={() => setIsModalOpen(true)} className={ADD_CARD}>
            <Plus size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Dodaj</span>
          </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nowa Usługa" size="sm">
        <NameForm
          label="Nazwa usługi"
          placeholder="np. Korekta lakieru..."
          onSave={handleAdd}
          saving={createService.isPending}
        />
      </Modal>
    </div>
  );
};

export default ServicesSettings;
