import React, { useState } from 'react';
import {
  useGetApiInvitationsToken,
  usePostApiInvitationsTokenAccept,
  usePostApiInvitationsTokenDecline,
} from '@detaileed/api-client';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';

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

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-4 border-green-deep border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error: invitation no longer active ────────────────────────────────────

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xs border border-cream-warm max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-green-deep mb-2">Link nieaktywny</h1>
          <p className="text-gray-500 text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  // ── Accepted ────────────────────────────────────────────────────────────

  if (decision === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xs border border-cream-warm max-w-md w-full text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-deep mb-2">Witaj w studiu!</h1>
          <p className="text-gray-500 text-sm">
            Zaproszenie zostało zaakceptowane. Za chwilę zostaniesz przekierowany…
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-6 h-6 border-2 border-green-deep border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // ── Declined ────────────────────────────────────────────────────────────

  if (decision === 'declined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xs border border-cream-warm max-w-md w-full text-center">
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-2xl font-bold text-green-deep mb-2">Zaproszenie odrzucone</h1>
          <p className="text-gray-500 text-sm">Możesz zamknąć tę kartę.</p>
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xs border border-cream-warm max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-deep mb-2">Masz zaproszenie!</h1>
          <p className="text-gray-500 text-sm">Zostałeś zaproszony do dołączenia do studia w aplikacji Detaileed.</p>
        </div>

        {/* Invitation details */}
        <div className="bg-cream rounded-2xl p-5 mb-6 space-y-3">
          <DetailRow label="Studio" value={invitation!.studioName} bold />
          <DetailRow label="Rola" value={ROLE_LABELS[invitation!.role] ?? invitation!.role} />
          <DetailRow label="Email" value={invitation!.email} />
          <DetailRow
            label="Wygasa"
            value={new Date(invitation!.expiresAt).toLocaleDateString('pl-PL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
        </div>

        {/* Warning: not signed in */}
        {!isSignedIn && (
          <div className="mb-5 p-4 bg-amber-50 text-amber-700 text-sm rounded-xl border border-amber-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <span>Musisz być zalogowany, aby odpowiedzieć na zaproszenie.</span>
            {onRequireLogin && (
              <button
                onClick={onRequireLogin}
                className="px-5 py-2.5 w-full sm:w-auto bg-amber-600 text-white font-semibold rounded-lg text-xs hover:bg-amber-700 transition-colors shadow-xs"
              >
                Zaloguj się
              </button>
            )}
          </div>
        )}

        {/* Action error */}
        {actionError && (
          <div className="mb-5 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{actionError}</div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleAction('decline')}
            disabled={loadingAction || !isSignedIn}
            className="flex-1 border border-gray-200 text-green-deep font-semibold py-3.5 rounded-xl
  hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Odrzuć
          </button>
          <button
            onClick={() => handleAction('accept')}
            disabled={loadingAction || !isSignedIn}
            className="flex-2 bg-green-deep text-cream font-semibold py-3.5 rounded-xl
  hover:bg-[#1a423a] transition-all disabled:opacity-70 disabled:cursor-not-allowed
  flex items-center justify-center gap-2"
          >
            {loadingAction ? (
              <>
                <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                Przetwarzanie…
              </>
            ) : (
              'Dołącz do studia'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm text-green-deep ${bold ? 'font-bold' : 'font-medium'}`}>{value}</span>
    </div>
  );
}
