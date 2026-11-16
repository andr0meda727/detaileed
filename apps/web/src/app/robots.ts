import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Account, sign-in and request pages are personal.
      disallow: ['/konto', '/logowanie', '/rejestracja', '/auth/', '/studio/*/rezerwuj'],
    },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
