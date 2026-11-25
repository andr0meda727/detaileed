import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { VehicleSize } from '@detaileed/api-client';
import { PageHeader } from '@detaileed/ui';
import { getSignedInUser } from '@/shared/lib/supabase/server';
import { signInPath } from '@/features/auth';
import { getListing } from '@/features/studio/server';
import { BookingRequestPage } from '@/features/booking';

export const metadata: Metadata = { title: 'Zapytanie o termin' };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ services?: string; size?: string }>;
};

/** Sending a booking request to a studio; needs a signed-in customer. */
export default async function RequestPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { services = '', size: sizeParam } = await searchParams;
  const user = await getSignedInUser();
  if (!user) {
    const query = new URLSearchParams({ services, ...(sizeParam ? { size: sizeParam } : {}) }).toString();
    redirect(signInPath(`/studio/${id}/book?${query}`));
  }
  const listing = await getListing(id);
  if (!listing) notFound();

  const known = new Set(listing.services.map((s) => s.id));
  const serviceIds = services.split(',').filter((s) => known.has(s));
  const size = Object.values(VehicleSize).includes(sizeParam as VehicleSize)
    ? (sizeParam as VehicleSize)
    : VehicleSize.Medium;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        title="Zapytanie o termin"
        breadcrumb={
          <Link
            href={`/studio/${id}`}
            className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-foreground"
          >
            <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
            {listing.name}
          </Link>
        }
      />
      <BookingRequestPage listing={listing} initialServiceIds={serviceIds} initialSize={size} />
    </section>
  );
}
