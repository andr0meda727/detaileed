import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  useGetApiInvitationsToken,
  usePostApiInvitationsTokenAccept,
  usePostApiInvitationsTokenDecline,
} from '@detaileed/api-client';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { Alert, Button, LoadingSpinner } from '@detaileed/ui';
import { AuthScreen } from './AuthScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AcceptInvitationViewProps {
  token: string;
  /** Accepting or declining needs a signed-in user. */
  isSignedIn: boolean;
  onSuccess: () => void;
  onRequireLogin?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  '1': 'Właściciel',
  '2': 'Manager',
  '3': 'Pracownik',
  Owner: 'Właściciel',
  Manager: 'Manager',
  Employee: 'Pracownik',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AcceptInvitationView: React.FC<AcceptInvitationViewProps> = ({
  token,
  isSignedIn,
  onSuccess,
  onRequireLogin,
}) => {
  const {
    data: invitation,
    isLoading: loadingInvitation,
    isError,
  } = useGetApiInvitationsToken(token, {
    query: { retry: false },
  });
  // Errors are shown inline below the buttons, not as a toast.
  const meta = { skipGlobalError: true };
  const accept = usePostApiInvitationsTokenAccept({ mutation: { meta } });
  const decline = usePostApiInvitationsTokenDecline({ mutation: { meta } });
  const [decision, setDecision] = useState<'accepted' | 'declined' | null>(null);

  const loadingAction = accept.isPending || decline.isPending;
  const failed = accept.error ?? decline.error;
  const actionError = failed ? getApiErrorMessage(failed, 'Wystąpił błąd. Spróbuj ponownie.') : '';
  const fetchError =
    isError || (!loadingInvitation && !invitation) ? 'Zaproszenie wygasło lub zostało już wykorzystane.' : '';

  const handleAction = async (action: 'accept' | 'decline') => {
    if (!isSignedIn) return;
    try {
      if (action === 'accept') {
        await accept.mutateAsync({ token });
        setDecision('accepted');
        setTimeout(onSuccess, 1800);
      } else {
        await decline.mutateAsync({ token });
        setDecision('declined');
      }
    } catch {
      // Shown through actionError.
    }
  };

  if (loadingInvitation) return <LoadingSpinner fullPage />;

  // The invitation is no longer active.
  if (fetchError) return <AuthScreen title="Link nieaktywny" description={fetchError} />;

  if (decision === 'accepted') {
    return (
      <AuthScreen title="Witaj w studiu!">
        <p role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 shrink-0 animate-spin" strokeWidth={1.75} aria-hidden />
          Zaproszenie zostało zaakceptowane. Za chwilę zostaniesz przekierowany…
        </p>
      </AuthScreen>
    );
  }

  if (decision === 'declined') {
    return <AuthScreen title="Zaproszenie odrzucone" description="Możesz zamknąć tę kartę." />;
  }

  const expiresAt = new Date(invitation!.expiresAt).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AuthScreen
      title="Masz zaproszenie!"
      description="Zostałeś zaproszony do dołączenia do studia w aplikacji Detaileed."
    >
      <dl className="flex flex-col divide-y divide-border rounded-md border border-border bg-subtle text-sm">
        <DetailRow label="Studio" value={invitation!.studioName} strong />
        <DetailRow label="Rola" value={ROLE_LABELS[invitation!.role] ?? invitation!.role} />
        <DetailRow label="Email" value={invitation!.email} />
        <DetailRow label="Wygasa" value={expiresAt} />
      </dl>

      {!isSignedIn && (
        <Alert
          tone="warning"
          action={
            onRequireLogin && (
              <Button size="sm" variant="secondary" onClick={onRequireLogin}>
                Zaloguj się
              </Button>
            )
          }
        >
          Musisz być zalogowany, aby odpowiedzieć na zaproszenie.
        </Alert>
      )}

      {actionError && <Alert tone="danger">{actionError}</Alert>}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          loading={decline.isPending}
          disabled={loadingAction || !isSignedIn}
          onClick={() => handleAction('decline')}
        >
          Odrzuć
        </Button>
        <Button
          className="flex-2"
          loading={accept.isPending}
          disabled={loadingAction || !isSignedIn}
          onClick={() => handleAction('accept')}
        >
          Dołącz do studia
        </Button>
      </div>
    </AuthScreen>
  );
};

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? 'min-w-0 truncate font-medium text-foreground' : 'min-w-0 truncate text-foreground'}>
        {value}
      </dd>
    </div>
  );
}
