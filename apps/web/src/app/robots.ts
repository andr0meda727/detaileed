import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Account, sign-in and request pages are personal.
      disallow: ['/account', '/sign-in', '/sign-up', '/auth/', '/studio/*/book'],
    },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
