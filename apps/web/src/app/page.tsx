import MapSearch from '@/features/search/components/MapSearch';
import { parseSearch } from '@/features/search/model/searchState';

/** Home: find a detailing studio on the map. The map position and filters come from the URL. */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initial = parseSearch(await searchParams);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div>
        <h1 className="font-serif text-3xl sm:text-5xl tracking-tight">Studia detailingu w Twojej okolicy</h1>
        <p className="mt-2 text-green-light">
          Wybierz rodzaj usługi i wielkość auta, a zobaczysz ceny dla siebie. Przesuń mapę albo użyj swojej lokalizacji.
        </p>
      </div>
      <MapSearch initial={initial} />
    </section>
  );
}
