import { PageHeader } from '@detaileed/ui';
import { MapSearch, parseSearch } from '@/features/search';

/** Home: find a detailing studio on the map. The map position and filters come from the URL. */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initial = parseSearch(await searchParams);
  return (
    <section className="mx-auto w-full max-w-[1160px] space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Studia detailingu w Twojej okolicy"
        description="Wybierz rodzaj usługi i wielkość auta, a zobaczysz ceny dla siebie. Przesuń mapę albo użyj swojej lokalizacji."
      />
      <MapSearch initial={initial} />
    </section>
  );
}
