'use client';

import type { VehicleSize } from '@detaileed/api-client';
import { FormSection, Skeleton } from '@detaileed/ui';
import { UserRound } from 'lucide-react';
import type { Listing } from '@detaileed/domain/listing';
import { useGarage, useProfile, ProfileForm } from '@/features/account';
import { BookingRequestForm } from '@/features/booking/components/BookingRequestForm';

interface BookingRequestPageProps {
  listing: Listing;
  initialServiceIds: string[];
  initialSize: VehicleSize;
}

/** Asks for contact details first if the customer has none, then shows the request form. */
export function BookingRequestPage({ listing, initialServiceIds, initialSize }: BookingRequestPageProps) {
  const profile = useProfile();
  const garage = useGarage();

  if (profile.isLoading || garage.isLoading) return <Skeleton width="100%" height="320px" className="rounded-lg" />;

  if (!profile.data) {
    return (
      <FormSection icon={UserRound} title="Twoje dane kontaktowe">
        <div className="flex flex-col gap-3 p-5">
          <p className="text-sm text-muted-foreground">
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
