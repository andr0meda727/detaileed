/** Route id of the studio layout; every screen inside a studio sits below it. */
const STUDIO_ROUTE_ID = '/_signed-in/s/$studioId';

/** Names of the screens inside a studio, by route id relative to the studio layout. */
const PAGE_NAMES: Record<string, string> = {
  '/': 'Panel główny',
  '/tasks': 'Rezerwacje',
  '/archived': 'Archiwum',
  '/requests': 'Zapytania',
  '/board': 'Grafik',
  '/clients': 'Klienci',
  '/team': 'Zespół',
  '/inventory': 'Magazyn',
  '/reports': 'Raporty',
  '/settings/studio': 'Ustawienia studia',
  '/settings/user': 'Moje konto',
};

/** The name of the studio screen with this route id, for the top bar; `undefined` outside a studio. */
export function pageName(routeId: string): string | undefined {
  if (!routeId.startsWith(STUDIO_ROUTE_ID)) return undefined;
  return PAGE_NAMES[routeId.slice(STUDIO_ROUTE_ID.length) || '/'];
}
