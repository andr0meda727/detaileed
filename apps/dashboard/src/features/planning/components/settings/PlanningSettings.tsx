import { Alert } from '@detaileed/ui';
import { useStudio } from '@/features/studios';
import { isOwnerRole } from '@/shared/lib/studioRole';
import { useSchedule } from '@/features/planning/api/planning';
import { BaysSettings } from '@/features/planning/components/settings/BaysSettings';
import { ScheduleSettings } from '@/features/planning/components/settings/ScheduleSettings';
import { ClosuresSettings } from '@/features/planning/components/settings/ClosuresSettings';

/** Studio settings tab: bays, opening hours, planning rules and closures. Owners edit; others see them. */
export function PlanningSettings() {
  const { selectedStudio } = useStudio();
  const canEdit = isOwnerRole(selectedStudio?.role);
  const { data: schedule } = useSchedule();

  return (
    <div className="flex flex-col gap-6">
      {schedule?.planningEnabled ? (
        <Alert tone="success">
          Planowanie jest włączone: rezerwacje trafiają na stanowiska, a klienci widzą wolne terminy.
        </Alert>
      ) : (
        <Alert tone="warning">
          Planowanie jest wyłączone. Dodaj co najmniej jedno stanowisko i godziny otwarcia, aby je włączyć.
        </Alert>
      )}
      <BaysSettings canEdit={canEdit} />
      {schedule && <ClosuresSettings closures={schedule.closures} canEdit={canEdit} />}
      {schedule && (
        // A fresh form whenever the saved schedule changes (e.g. after another owner's save).
        <ScheduleSettings key={JSON.stringify(schedule.openingHours)} schedule={schedule} canEdit={canEdit} />
      )}
    </div>
  );
}
