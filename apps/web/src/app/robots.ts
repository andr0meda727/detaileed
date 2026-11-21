import type { MetadataRoute } from 'next';
import { siteUrl } from '@/shared/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Sign-in, password, account and booking request pages are personal.
      disallow: [
        // (auth) group
        '/sign-in',
        '/sign-up',
        '/forgot-password',
        '/reset-password',
        '/confirm-email',
        '/auth/',
        // (customer) group
        '/account',
        '/studio/*/book',
      ],
    },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
