import { useMemo, useState } from 'react';
import { Clock, Save } from 'lucide-react';
import { Button, FormSection, useToast } from '@detaileed/ui';
import { useStudio } from '@/features/studios/model/StudioContext';
import { useChangeStudioTimeZone } from '@/features/studios/api/studios';
import { DEFAULT_TIME_ZONE, formatInZone } from '@detaileed/domain/studioTime';
import { isOwnerRole } from '@/shared/lib/studioRole';

/** IANA zones the browser knows, the studio's current one included even if it doesn't. */
function zoneList(current: string): string[] {
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  return zones.includes(current) ? zones : [current, ...zones];
}

/**
 * The studio's time zone: every time on the screens and in emails is shown in it. Owners change it; other
 * members see it.
 */
export default function StudioTimeZoneSettings() {
  const { addToast } = useToast();
  const { selectedStudio } = useStudio();
  const current = selectedStudio?.timeZone || DEFAULT_TIME_ZONE;
  const isOwner = isOwnerRole(selectedStudio?.role);
  const [zone, setZone] = useState(current);
  const changeZone = useChangeStudioTimeZone();
  const zones = useMemo(() => zoneList(current), [current]);

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
      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-500">
          Godziny rezerwacji, kalendarz i e-maile pokazujemy w strefie studia, niezależnie od tego, gdzie jest osoba
          przy komputerze.
        </p>
        {isOwner ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              aria-label="Strefa czasowa"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl font-semibold text-sm outline-hidden focus:border-cream-warm/50"
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <Button icon={Save} loading={changeZone.isPending} disabled={zone === current} onClick={save}>
              Zapisz
            </Button>
          </div>
        ) : (
          <p className="font-bold text-green-deep">{current.replace(/_/g, ' ')}</p>
        )}
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Teraz w studiu: {now}</p>
      </div>
    </FormSection>
  );
}
