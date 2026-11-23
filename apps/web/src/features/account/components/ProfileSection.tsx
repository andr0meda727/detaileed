'use client';

import { Card, CardContent, CardHeader, Skeleton } from '@detaileed/ui';
import { useProfile } from '@/features/account/api/me';
import { ProfileForm } from '@/features/account/components/ProfileForm';

/** The contact details studios get with each request. */
export function ProfileSection() {
  const profile = useProfile();
  if (profile.isLoading) return <Skeleton width="100%" height="160px" className="rounded-lg" />;
  return (
    <Card>
      <CardHeader title="Dane kontaktowe" description="Studio dostaje je razem z zapytaniem, aby potwierdzić termin." />
      <CardContent>
        <ProfileForm key={profile.data ? 'saved' : 'new'} profile={profile.data ?? null} />
      </CardContent>
    </Card>
  );
}
