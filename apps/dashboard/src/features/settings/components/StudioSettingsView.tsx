import React, { useMemo, useState } from 'react';
import { Wrench, Layers, Users, Building2, Globe, CalendarCog, type LucideIcon } from 'lucide-react';
import { PlanningSettings } from '@/features/planning';
import { ListingSettings } from '@/features/marketplace';
import { ServicesSettings } from '@/features/services';

import { CategoriesSettings, SizeFactorsSettings } from '@/features/inventory';
import { EmployeesSettings } from '@/features/team';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';

import { Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@detaileed/ui';
import { StudioDetailsSettings, StudioTimeZoneSettings, useStudio } from '@/features/studios';
import { isEmployeeRole, isOwnerRole } from '@/shared/lib/studioRole';

type TabId = 'services' | 'categories' | 'employees' | 'planning' | 'listing' | 'studio';

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'services', label: 'Usługi', icon: Wrench },
  { id: 'categories', label: 'Magazyn', icon: Layers },
  { id: 'employees', label: 'Pracownicy', icon: Users },
  { id: 'planning', label: 'Planowanie', icon: CalendarCog },
  { id: 'listing', label: 'Profil publiczny', icon: Globe },
  { id: 'studio', label: 'Studio', icon: Building2 },
];

const isTabId = (value: string): value is TabId => TABS.some((tab) => tab.id === value);

export const StudioSettingsView: React.FC = () => {
  const [selectedTab, setActiveTab] = useState<TabId>('services');
  const { addToast } = useToast();
  const { selectedStudio } = useStudio();
  const isEmployee = isEmployeeRole(selectedStudio?.role);
  // Employees can't see the employees tab, so they fall back to services.
  const activeTab = isEmployee && selectedTab === 'employees' ? 'services' : selectedTab;
  const tabs = useMemo(() => TABS.filter((tab) => !(isEmployee && tab.id === 'employees')), [isEmployee]);

  return (
    <div>
      <GlobalHeader title="Ustawienia studia" subtitle="Zarządzaj usługami, kategoriami, zespołem i studiem" />

      <Tabs value={activeTab} onValueChange={(value) => isTabId(value) && setActiveTab(value)} className="gap-6">
        <TabsList aria-label="Ustawienia studia">
          {tabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id}>
              <Icon strokeWidth={1.75} aria-hidden />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="services">
          <ServicesSettings addToast={addToast} />
        </TabsContent>
        <TabsContent value="categories" className="flex flex-col gap-8">
          <CategoriesSettings addToast={addToast} />
          <SizeFactorsSettings canEdit={isOwnerRole(selectedStudio?.role)} />
        </TabsContent>
        {!isEmployee && (
          <TabsContent value="employees">
            <EmployeesSettings addToast={addToast} />
          </TabsContent>
        )}
        <TabsContent value="planning">
          <PlanningSettings />
        </TabsContent>
        <TabsContent value="listing">
          <ListingSettings
            onOpenServices={() => setActiveTab('services')}
            onOpenStudio={() => setActiveTab('studio')}
          />
        </TabsContent>
        <TabsContent value="studio" className="flex flex-col gap-8">
          <StudioDetailsSettings />
          <StudioTimeZoneSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
