import { useMemo, useState } from 'react';
import { Clock, Save } from 'lucide-react';
import { Button, FormSection, Select, useToast } from '@detaileed/ui';
import { useStudio } from '@/features/studios/model/StudioContext';
import { useChangeStudioTimeZone } from '@/features/studios/api/studios';
import { DEFAULT_TIME_ZONE, formatInZone } from '@detaileed/domain/studioTime';
import { isOwnerRole } from '@/shared/lib/studioRole';

/** "America/New_York" → "America/New York". */
const zoneLabel = (zone: string) => zone.replace(/_/g, ' ');

/** IANA zones the browser knows, the studio's current one included even if it doesn't. */
function zoneList(current: string): string[] {
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  return zones.includes(current) ? zones : [current, ...zones];
}

/**
 * The studio's time zone: every time on the screens and in emails is shown in it. Owners change it; other
 * members see it.
 */
export function StudioTimeZoneSettings() {
  const { addToast } = useToast();
  const { selectedStudio } = useStudio();
  const current = selectedStudio?.timeZone || DEFAULT_TIME_ZONE;
  const isOwner = isOwnerRole(selectedStudio?.role);
  const [zone, setZone] = useState(current);
  const changeZone = useChangeStudioTimeZone();
  const zoneOptions = useMemo(() => zoneList(current).map((z) => ({ value: z, label: zoneLabel(z) })), [current]);

  // Errors (e.g. INVALID_TIME_ZONE) are toasted globally.
  const save = () => {
    if (!selectedStudio) return;
    changeZone.mutate(
      { studioId: selectedStudio.studioId, timeZone: zone },
      { onSuccess: () => addToast('Zapisano strefę czasową studia.', 'success') },
    );
  };

  const now = formatInZone(new Date(), zone, { weekday: 'long', hour: '2-digit', minute: '2-digit' });

  return (
    <FormSection icon={Clock} title="Strefa czasowa">
      <div className="flex flex-col gap-4 p-5">
        <p className="text-sm text-muted-foreground">
          Godziny rezerwacji, kalendarz i e-maile pokazujemy w strefie studia, niezależnie od tego, gdzie jest osoba
          przy komputerze.
        </p>
        {isOwner ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <Select
                aria-label="Strefa czasowa"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                options={zoneOptions}
              />
            </div>
            <Button icon={Save} loading={changeZone.isPending} disabled={zone === current} onClick={save}>
              Zapisz
            </Button>
          </div>
        ) : (
          <p className="text-sm font-medium text-foreground">{zoneLabel(current)}</p>
        )}
        <p className="text-xs text-faint">
          Teraz w studiu: <span className="font-mono tabular-nums">{now}</span>
        </p>
      </div>
    </FormSection>
  );
}
