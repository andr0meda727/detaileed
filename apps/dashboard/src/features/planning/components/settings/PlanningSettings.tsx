import { CalendarCheck2 } from 'lucide-react';
import { useStudio } from '@/features/studios';
import { isOwnerRole } from '@/shared/lib/studioRole';
import { useSchedule } from '@/features/planning/api/planning';
import BaysSettings from '@/features/planning/components/settings/BaysSettings';
import ScheduleSettings from '@/features/planning/components/settings/ScheduleSettings';
import ClosuresSettings from '@/features/planning/components/settings/ClosuresSettings';

/** Studio settings tab: bays, opening hours, planning rules and closures. Owners edit; others see them. */
export default function PlanningSettings() {
  const { selectedStudio } = useStudio();
  const canEdit = isOwnerRole(selectedStudio?.role);
  const { data: schedule } = useSchedule();

  return (
    <div className="space-y-6">
      <p
        className={`flex items-center gap-2 text-sm rounded-xl p-4 ${schedule?.planningEnabled ? 'bg-green-pale/30 text-green-deep' : 'bg-amber/10 text-amber-800'}`}
      >
        <CalendarCheck2 size={16} />
        {schedule?.planningEnabled
          ? 'Planowanie jest włączone: rezerwacje trafiają na stanowiska, a klienci widzą wolne terminy.'
          : 'Planowanie jest wyłączone. Dodaj co najmniej jedno stanowisko i godziny otwarcia, aby je włączyć.'}
      </p>
      <BaysSettings canEdit={canEdit} />
      {schedule && <ClosuresSettings closures={schedule.closures} canEdit={canEdit} />}
      {schedule && (
        // A fresh form whenever the saved schedule changes (e.g. after another owner's save).
        <ScheduleSettings key={JSON.stringify(schedule.openingHours)} schedule={schedule} canEdit={canEdit} />
      )}
    </div>
  );
}
