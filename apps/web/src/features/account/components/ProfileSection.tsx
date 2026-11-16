'use client';

import { UserRound } from 'lucide-react';
import { FormSection, Skeleton } from '@detaileed/ui';
import { useProfile } from '@/features/account/api/me';
import ProfileForm from '@/features/account/components/ProfileForm';

/** The contact details studios get with each request. */
export default function ProfileSection() {
  const profile = useProfile();
  if (profile.isLoading) return <Skeleton width="100%" height="160px" className="rounded-2xl" />;
  return (
    <FormSection icon={UserRound} title="Dane kontaktowe">
      <div className="p-5 space-y-3">
        <p className="text-sm text-green-light">Studio dostaje je razem z zapytaniem, aby potwierdzić termin.</p>
        <ProfileForm key={profile.data ? 'saved' : 'new'} profile={profile.data ?? null} />
      </div>
    </FormSection>
  );
}
