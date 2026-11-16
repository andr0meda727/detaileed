import React, { useMemo, useState } from 'react';
import { Wrench, Layers, Users, Building2, Globe, CalendarCog } from 'lucide-react';
import { PlanningSettings } from '@/features/planning';
import { ListingSettings } from '@/features/marketplace';
import { ServicesSettings } from '@/features/services';

import { CategoriesSettings, SizeFactorsSettings } from '@/features/inventory';
import { EmployeesSettings } from '@/features/team';
import GlobalHeader from '@/shared/ui/GlobalHeader';

import { useToast } from '@detaileed/ui';
import { StudioTimeZoneSettings, useStudio } from '@/features/studios';
import { isEmployeeRole, isOwnerRole } from '@/shared/lib/studioRole';

// ─── Main View ────────────────────────────────────────────────────────────────
type TabId = 'services' | 'categories' | 'employees' | 'planning' | 'listing' | 'studio';

const TABS: { id: TabId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'services', label: 'Usługi', icon: Wrench },
  { id: 'categories', label: 'Magazyn', icon: Layers },
  { id: 'employees', label: 'Pracownicy', icon: Users },
  { id: 'planning', label: 'Planowanie', icon: CalendarCog },
  { id: 'listing', label: 'Profil publiczny', icon: Globe },
  { id: 'studio', label: 'Studio', icon: Building2 },
];

const StudioSettingsView: React.FC = () => {
  const [selectedTab, setActiveTab] = useState<TabId>('services');
  const { addToast } = useToast();
  const { selectedStudio } = useStudio();
  const isEmployee = isEmployeeRole(selectedStudio?.role);
  // Employees can't see the employees tab, so they fall back to services.
  const activeTab = isEmployee && selectedTab === 'employees' ? 'services' : selectedTab;
  const tabs = useMemo(() => TABS.filter((tab) => !(isEmployee && tab.id === 'employees')), [isEmployee]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <GlobalHeader title="Ustawienia Studia" subtitle="Zarządzaj usługami, kategoriami, zespołem i studiem" />

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
        {activeTab === 'services' && <ServicesSettings addToast={addToast} />}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            <CategoriesSettings addToast={addToast} />
            <SizeFactorsSettings canEdit={isOwnerRole(selectedStudio?.role)} />
          </div>
        )}
        {activeTab === 'employees' && <EmployeesSettings addToast={addToast} />}
        {activeTab === 'planning' && <PlanningSettings />}
        {activeTab === 'listing' && <ListingSettings onOpenServices={() => setActiveTab('services')} />}
        {activeTab === 'studio' && <StudioTimeZoneSettings />}
      </div>
    </div>
  );
};

export default StudioSettingsView;
