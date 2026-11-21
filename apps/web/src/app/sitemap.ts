import type { MetadataRoute } from 'next';
import { getApiPublicStudios } from '@detaileed/api-client';
import { siteUrl } from '@/shared/lib/site';
import '@/shared/lib/api/server';

// Rebuilt at most once an hour.
export const revalidate = 3600;

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

/** Every published studio, found with the public search over the whole world, page by page. */
async function publishedStudioIds(): Promise<string[]> {
  const ids: string[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await getApiPublicStudios(
      { MinLat: -90, MaxLat: 90, MinLng: -180, MaxLng: 180, Page: page, PageSize: PAGE_SIZE },
      { next: { revalidate } },
    );
    ids.push(...res.items.map((s) => s.studioId));
    if (page >= Number(res.totalPages ?? 0)) break;
  }
  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let ids: string[] = [];
  try {
    ids = await publishedStudioIds();
  } catch {
    // Without the API (e.g. a build without network) the sitemap still lists the home page.
  }
  return [
    { url: siteUrl('/'), changeFrequency: 'daily', priority: 1 },
    ...ids.map((id) => ({ url: siteUrl(`/studio/${id}`), changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
