'use client';

import type { VehicleSize } from '@detaileed/api-client';
import { FormSection, Skeleton } from '@detaileed/ui';
import { UserRound } from 'lucide-react';
import type { Listing } from '@detaileed/domain/listing';
import { useGarage, useProfile } from '@/features/account/api/me';
import ProfileForm from '@/features/account/components/ProfileForm';
import BookingRequestForm from '@/features/booking/components/BookingRequestForm';

interface BookingRequestPageProps {
  listing: Listing;
  initialServiceIds: string[];
  initialSize: VehicleSize;
}

/** Asks for contact details first if the customer has none, then shows the request form. */
export default function BookingRequestPage({ listing, initialServiceIds, initialSize }: BookingRequestPageProps) {
  const profile = useProfile();
  const garage = useGarage();

  if (profile.isLoading || garage.isLoading) return <Skeleton width="100%" height="320px" className="rounded-2xl" />;

  if (!profile.data) {
    return (
      <FormSection icon={UserRound} title="Twoje dane kontaktowe">
        <div className="p-5 space-y-3">
          <p className="text-sm text-green-light">
            Studio użyje ich, aby potwierdzić termin. Zapiszemy je na Twoim koncie na następne zapytania.
          </p>
          <ProfileForm profile={null} submitLabel="Zapisz i przejdź dalej" />
        </div>
      </FormSection>
    );
  }

  return (
    <BookingRequestForm
      listing={listing}
      garage={garage.data ?? []}
      initialServiceIds={initialServiceIds}
      initialSize={initialSize}
    />
  );
}
