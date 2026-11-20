import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { VehicleSize } from '@detaileed/api-client';
import { getSignedInUser } from '@/lib/supabase/server';
import { signInPath } from '@/features/auth/model/returnPath';
import { getListing } from '@/features/studio/api/server';
import BookingRequestPage from '@/features/booking/components/BookingRequestPage';

export const metadata: Metadata = { title: 'Zapytanie o termin', robots: { index: false } };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uslugi?: string; rozmiar?: string }>;
};

/** Sending a booking request to a studio; needs a signed-in customer. */
export default async function RequestPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { uslugi = '', rozmiar } = await searchParams;
  const user = await getSignedInUser();
  if (!user) {
    const query = new URLSearchParams({ uslugi, ...(rozmiar ? { rozmiar } : {}) }).toString();
    redirect(signInPath(`/studio/${id}/book?${query}`));
  }
  const listing = await getListing(id);
  if (!listing) notFound();

  const known = new Set(listing.services.map((s) => s.id));
  const serviceIds = uslugi.split(',').filter((s) => known.has(s));
  const size = Object.values(VehicleSize).includes(rozmiar as VehicleSize)
    ? (rozmiar as VehicleSize)
    : VehicleSize.Medium;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div>
        <Link href={`/studio/${id}`} className="text-sm font-semibold text-green-light hover:text-green-deep">
          ← {listing.name}
        </Link>
        <h1 className="font-serif text-4xl tracking-tight mt-2">Zapytanie o termin</h1>
      </div>
      <BookingRequestPage listing={listing} initialServiceIds={serviceIds} initialSize={size} />
    </section>
  );
}
