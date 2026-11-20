import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteUrl } from '@/lib/site';
import { getFirstReviews, getListing } from '@/features/studio/api/server';
import { studioJsonLd } from '@/features/studio/model/jsonLd';
import StudioHeader from '@/features/studio/components/StudioHeader';
import StudioLocation from '@/features/studio/components/StudioLocation';
import StudioOffer from '@/features/studio/components/StudioOffer';
import ReviewsList from '@/features/studio/components/ReviewsList';

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
    <article className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped, so a description can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <StudioHeader listing={listing} />
        <StudioLocation lat={listing.latitude} lng={listing.longitude} name={listing.name} />
      </div>
      {/* The chosen car size comes from ?size=, which a static page reads in the browser. */}
      <Suspense>
        <StudioOffer listing={listing} />
      </Suspense>
      <ReviewsList
        studioId={listing.studioId}
        timeZone={listing.timeZone}
        reviewCount={listing.reviewCount}
        initial={reviews}
      />
    </article>
  );
}
