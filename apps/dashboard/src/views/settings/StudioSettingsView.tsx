import React, { useMemo, useState } from 'react';
import { Wrench, Layers, Users, Plus, Trash2, X, Save, Loader2, Mail, CheckCircle, Edit2 } from 'lucide-react';
import { CategoryCreateDto, CreateServiceDto, InviteEmployeeDto } from '../../types';
import { useServices, useCreateService, useDeleteService } from '../../hooks/useServices';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { apiPost } from '../../apiClient';
import GlobalHeader from '../../components/GlobalHeader';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../contexts/ToastContext';
import { useStudio } from '../../contexts/StudioContext';
import { isEmployeeRole } from '../../utils/studioRole';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const nameSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
});

const inviteSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').email('Niepoprawny format email'),
});

type NameFormValues = z.infer<typeof nameSchema>;
type InviteFormValues = z.infer<typeof inviteSchema>;

// ─── Card grid shared styles ─────────────────────────────────────────────────
const CARD = `relative group bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col gap-3
  hover:border-green-deep/15 hover:shadow-xl hover:shadow-green-deep/5 transition-all duration-200`;

const ADD_CARD = `border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center
  gap-2 text-slate-300 hover:border-green-deep/30 hover:text-green-deep/40 transition-all duration-200 min-h-[120px]`;

// ─── Inline form for simple name input ───────────────────────────────────────
const NameForm: React.FC<{
  label: string;
  placeholder: string;
  onSave: (name: string) => Promise<void>;
  saving: boolean;
}> = ({ label, placeholder, onSave, saving }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
  });

  const onSubmit = async (data: NameFormValues) => {
    await onSave(data.name.trim());
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-1">{label}</label>
        <input
          type="text"
          {...register('name')}
          autoFocus
          placeholder={placeholder}
          className={`w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm border-2 ${errors.name ? 'border-red-400 focus:ring-red-400/30' : 'border-transparent focus:ring-cream-warm/30'} transition-all`}
        />
        {errors.name && (
          <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] ml-1 mt-1">
            {errors.name.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-4 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Zapisz
      </button>
    </form>
  );
};

// ─── Tab: Services ────────────────────────────────────────────────────────────
const ServicesTab: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({ addToast }) => {
  const { data: items = [], isLoading } = useServices();
  const createService = useCreateService();
  const deleteService = useDeleteService();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = async (name: string) => {
    try {
      await createService.mutateAsync({ name } as CreateServiceDto);
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-deep text-cream-warm px-5 py-3 rounded-2xl font-semibold text-[11px] uppercase tracking-widest shadow-md active:scale-95 transition-all"
        >
          <Plus size={16} /> Dodaj usługę
        </button>
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

// ─── Tab: Categories ─────────────────────────────────────────────────────────
const CategoriesTab: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({ addToast }) => {
  const { data: items = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const openAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };
  const openEdit = (item: { id: string; name: string }) => {
    setEditing(item);
    setIsModalOpen(true);
  };

  const handleSave = async (name: string) => {
    const dto: CategoryCreateDto = { name };
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, dto });
        addToast('Kategoria zaktualizowana', 'success');
      } else {
        await createCategory.mutateAsync(dto);
        addToast('Kategoria dodana', 'success');
      }
      setIsModalOpen(false);
    } catch {
      addToast('Nie udało się zapisać kategorii', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      addToast('Kategoria usunięta', 'success');
    } catch {
      addToast('Nie udało się usunąć kategorii', 'error');
    }
  };

  const isMutating = createCategory.isPending || updateCategory.isPending;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400 font-medium">{items.length} kategorii</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-green-deep text-cream-warm px-5 py-3 rounded-2xl font-semibold text-[11px] uppercase tracking-widest shadow-md active:scale-95 transition-all"
        >
          <Plus size={16} /> Dodaj kategorię
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Brak kategorii. Dodaj pierwszą!" icon={Layers} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className={CARD}>
              <div className="w-10 h-10 bg-cream-warm/50 rounded-2xl flex items-center justify-center mb-1">
                <Layers size={18} className="text-green-deep/50" />
              </div>
              <p className="font-bold text-green-deep text-sm leading-tight">{item.name}</p>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-xl text-slate-300 hover:bg-green-deep hover:text-cream-warm transition-all active:scale-90"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteCategory.isPending}
                  className="p-1.5 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                >
                  {deleteCategory.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={openAdd} className={ADD_CARD}>
            <Plus size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Dodaj</span>
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edytuj Kategorię' : 'Nowa Kategoria'}
        size="sm"
      >
        <NameForm
          key={editing?.id ?? 'new'}
          label="Nazwa kategorii"
          placeholder="np. Produkty do polerowania..."
          onSave={handleSave}
          saving={isMutating}
        />
      </Modal>
    </div>
  );
};

// ─── Tab: Employees ───────────────────────────────────────────────────────────
const EmployeesTab: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({ addToast }) => {
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const onInvite = async (data: InviteFormValues) => {
    setSending(true);
    try {
      await apiPost<void>('/Employees/invite', { email: data.email, roleId: 3 } as InviteEmployeeDto);
      setLastSent(data.email);
      reset();
      addToast(`Zaproszenie wysłane do ${data.email}`, 'success');
    } catch (e: any) {
      if (e?.data?.errors) {
        const firstErrorKey = Object.keys(e.data.errors)[0];
        addToast(e.data.errors[firstErrorKey][0], 'error');
      } else {
        addToast(e.message || 'Nie udało się wysłać zaproszenia', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-deep/5 border border-green-deep/10 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
            <Mail size={18} className="text-cream-warm" />
          </div>
          <div>
            <h3 className="font-extrabold text-green-deep text-base tracking-tight">Zaproś pracownika</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Wyślij zaproszenie e-mailem. Pracownik otrzyma link do rejestracji.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onInvite)} className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full">
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="email"
                {...register('email')}
                placeholder="adres@email.com"
                className={`w-full pl-10 pr-4 py-4 bg-white border-2 rounded-2xl outline-none font-semibold text-sm ${errors.email ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-100 focus:ring-cream-warm/20 focus:border-cream-warm/40'} transition-all`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] ml-1 mt-2">
                {errors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={sending}
            className="h-[52px] flex items-center justify-center gap-2 bg-green-deep text-cream-warm px-7 rounded-2xl font-semibold text-[11px] uppercase tracking-widest active:scale-95 transition-all whitespace-nowrap disabled:opacity-60"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Wyślij zaproszenie
          </button>
        </form>
      </div>

      {lastSent && (
        <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-semibold">
          <CheckCircle size={17} />
          Zaproszono: <span className="font-extrabold">{lastSent}</span>
        </div>
      )}

      <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
        <p className="text-xs text-amber-700 font-semibold leading-relaxed">
          <strong>Jak to działa?</strong> Pracownik dostanie e-mail z linkiem do akceptacji i ustawienia hasła.
        </p>
      </div>
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────
type TabId = 'services' | 'categories' | 'employees';

const TABS: { id: TabId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'services', label: 'Usługi', icon: Wrench },
  { id: 'categories', label: 'Kategorie magazynu', icon: Layers },
  { id: 'employees', label: 'Pracownicy', icon: Users },
];

const StudioSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('services');
  const { addToast } = useToast();
  const { selectedStudio } = useStudio();
  const isEmployee = isEmployeeRole(selectedStudio?.role);
  const tabs = useMemo(() => TABS.filter((tab) => !(isEmployee && tab.id === 'employees')), [isEmployee]);

  React.useEffect(() => {
    if (isEmployee && activeTab === 'employees') {
      setActiveTab('services');
    }
  }, [activeTab, isEmployee]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <GlobalHeader title="Ustawienia Studia" subtitle="Zarządzaj usługami, kategoriami i zespołem" />

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-xl font-semibold text-[11px] uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${isActive ? 'bg-green-deep text-cream-warm shadow-lg' : 'text-slate-400 hover:text-green-deep hover:bg-slate-50'}`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'services' && <ServicesTab addToast={addToast} />}
        {activeTab === 'categories' && <CategoriesTab addToast={addToast} />}
        {activeTab === 'employees' && <EmployeesTab addToast={addToast} />}
      </div>
    </div>
  );
};

export default StudioSettingsView;
