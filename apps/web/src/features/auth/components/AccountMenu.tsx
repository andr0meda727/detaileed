'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@detaileed/ui';
import { getSupabase } from '@/shared/lib/supabase/client';

/** "Zaloguj się" and "Załóż konto", or a menu with the account and sign-out once someone is signed in. */
export function AccountMenu() {
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
      <div className="flex items-center gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href="/sign-in">Zaloguj się</Link>
        </Button>
        <Button asChild size="sm" className="max-sm:hidden">
          <Link href="/sign-up">Załóż konto</Link>
        </Button>
      </div>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" icon={UserRound}>
          <span className="max-sm:sr-only">Moje konto</span>
          <ChevronDown size={14} strokeWidth={1.75} aria-hidden className="text-muted-foreground max-sm:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={UserRound} onSelect={() => router.push('/account')}>
          Moje konto
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={LogOut} onSelect={signOut}>
          Wyloguj
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
