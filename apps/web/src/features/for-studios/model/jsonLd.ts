/** schema.org data for the landing page: Detaileed as a web app for detailing studios. */
export function forStudiosJsonLd(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': url,
    url,
    name: 'Detaileed',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: 'pl',
    description:
      'System do zarządzania studiem detailingu: rezerwacje, baza klientów, magazyn, zespół i raporty w jednym miejscu.',
  };
}
