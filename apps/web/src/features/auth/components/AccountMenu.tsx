'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle } from 'lucide-react';
import { getSupabase } from '@/shared/lib/supabase/client';

/** "Zaloguj się", or the account link and sign-out once someone is signed in. */
export default function AccountMenu() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    // The session comes from an external system (cookies via Supabase), so subscribing here is the right place.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await getSupabase().auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (signedIn === null) return <span className="w-24" aria-hidden />;
  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        className="px-4 py-2 rounded-xl bg-green-deep text-cream-warm text-xs font-bold uppercase tracking-widest"
      >
        Zaloguj się
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Link href="/account" className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-green-deep/5">
        <UserCircle size={18} /> <span className="hidden sm:inline">Moje konto</span>
      </Link>
      <button type="button" onClick={signOut} aria-label="Wyloguj" className="p-2 rounded-xl hover:bg-green-deep/5">
        <LogOut size={18} />
      </button>
    </div>
  );
}
