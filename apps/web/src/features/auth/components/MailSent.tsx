import type { ReactNode } from 'react';
import { MailCheck } from 'lucide-react';

/** "Sprawdź skrzynkę": shown in place of a form once a sign-up or password-reset email has gone out. */
export function MailSent({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <MailCheck size={22} strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-lg font-semibold">Sprawdź skrzynkę</p>
      <div className="w-full space-y-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
