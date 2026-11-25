import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteUrl } from '@/shared/lib/site';
import { getFirstReviews, getListing } from '@/features/studio/server';
import { studioJsonLd, StudioHeader, StudioLocation, StudioOffer, ReviewsList } from '@/features/studio';

// Rebuilt at most once a minute, like the API's own cache of public studios.
export const revalidate = 60;

/** No studio is built ahead of time; each page is built on its first visit and then cached (ISR). */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [];
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing((await params).id);
  if (!listing) return { title: 'Nie znaleziono studia' };
  const description =
    listing.description?.slice(0, 160) ??
    `Studio detailingu ${listing.name}, ${listing.city}: ceny usług dla Twojego auta, opinie i zapytania o termin.`;
  return {
    title: `${listing.name}, ${listing.city}`,
    description,
    alternates: { canonical: `/studio/${listing.studioId}` },
    openGraph: { title: listing.name, description, url: `/studio/${listing.studioId}` },
  };
}

/** A published studio's public page: profile, services with prices, estimate, location and reviews. */
export default async function StudioPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();
  const reviews = await getFirstReviews(id);
  const jsonLd = studioJsonLd(listing, siteUrl(`/studio/${listing.studioId}`));

  return (
    <article className="mx-auto w-full max-w-[1160px] px-4 pt-7 pb-16 sm:px-6">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped, so a description can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <StudioHeader listing={listing} />
      {/* Services and reviews on the left, the sticky estimate and the map on the right (from tablets; stacked on phones). */}
      <div className="grid items-start gap-8 pt-7 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* The chosen car size comes from ?size=, which a static page reads in the browser. */}
        <Suspense>
          <StudioOffer
            listing={listing}
            aside={<StudioLocation lat={listing.latitude} lng={listing.longitude} name={listing.name} />}
          />
        </Suspense>
        <div className="min-w-0 md:col-start-1 md:row-start-2">
          <ReviewsList
            studioId={listing.studioId}
            timeZone={listing.timeZone}
            reviewCount={listing.reviewCount}
            initial={reviews}
          />
        </div>
      </div>
    </article>
  );
}
