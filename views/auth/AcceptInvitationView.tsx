import React, { useEffect, useState } from 'react';
import supabase from '../../utils/supabase.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvitationPreview {
    studioName: string;
    role: string;
    expiresAt: string;
    email: string;
}

interface AcceptInvitationViewProps {
    token: string;
    onSuccess: () => void;
    onRequireLogin?: () => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API = 'http://localhost:5174';

const ROLE_LABELS: Record<string, string> = {
    '1': 'Właściciel',
    '2': 'Manager',
    '3': 'Pracownik',
    Owner: 'Właściciel',
    Manager: 'Manager',
    Employee: 'Pracownik',
};

// ─── Component ────────────────────────────────────────────────────────────────

const AcceptInvitationView: React.FC<AcceptInvitationViewProps> = ({ token, onSuccess, onRequireLogin }) => {
    const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [loadingInvitation, setLoadingInvitation] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [actionError, setActionError] = useState('');
    const [decision, setDecision] = useState<'accepted' | 'declined' | null>(null);

    // Pobierz JWT z aktywnej sesji Supabase
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthToken(session?.access_token ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
            setAuthToken(session?.access_token ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Pobierz podgląd zaproszenia
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API}/api/invitations/${token}`);
                if (!res.ok) throw new Error('Zaproszenie nieaktywne');
                const data = await res.json();
                setInvitation(data);
            } catch {
                setFetchError('Zaproszenie wygasło lub zostało już wykorzystane.');
            } finally {
                setLoadingInvitation(false);
            }
        };

        load();
    }, [token]);

    const handleAction = async (action: 'accept' | 'decline') => {
        if (!authToken) return;

        setActionError('');
        setLoadingAction(true);

        try {
            const res = await fetch(`${API}/api/invitations/${token}/${action}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message ?? 'Wystąpił błąd. Spróbuj ponownie.');
            }

            setDecision(action === 'accept' ? 'accepted' : 'declined');

            if (action === 'accept') {
                setTimeout(onSuccess, 1800);
            }
        } catch (err) {
            setActionError((err as Error).message);
        } finally {
            setLoadingAction(false);
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

    // ── Error — zaproszenie nieaktywne ───────────────────────────────────────

    if (fetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-cream-warm max-w-md w-full text-center">
                    <div className="text-4xl mb-4">🔗</div>
                    <h1 className="text-2xl font-bold text-green-deep mb-2">Link nieaktywny</h1>
                    <p className="text-gray-500 text-sm">{fetchError}</p>
                </div>
            </div>
        );
    }

    // ── Zaakceptowane ────────────────────────────────────────────────────────

    if (decision === 'accepted') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-cream-warm max-w-md w-full text-center">
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

    // ── Odrzucone ────────────────────────────────────────────────────────────

    if (decision === 'declined') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-cream-warm max-w-md w-full text-center">
                    <div className="text-4xl mb-4">👋</div>
                    <h1 className="text-2xl font-bold text-green-deep mb-2">Zaproszenie odrzucone</h1>
                    <p className="text-gray-500 text-sm">Możesz zamknąć tę kartę.</p>
                </div>
            </div>
        );
    }

    // ── Główny widok ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-cream-warm max-w-md w-full">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-green-deep mb-2">Masz zaproszenie!</h1>
                    <p className="text-gray-500 text-sm">
                        Zostałeś zaproszony do dołączenia do studia w aplikacji DetailFlow.
                    </p>
                </div>

                {/* Szczegóły zaproszenia */}
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

                {/* Ostrzeżenie — niezalogowany */}
                {!authToken && (
                    <div className="mb-5 p-4 bg-amber-50 text-amber-700 text-sm rounded-xl border border-amber-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <span>Musisz być zalogowany, aby odpowiedzieć na zaproszenie.</span>
                        {onRequireLogin && (
                            <button
                                onClick={onRequireLogin}
                                className="px-5 py-2.5 w-full sm:w-auto bg-amber-600 text-white font-semibold rounded-lg text-xs hover:bg-amber-700 transition-colors shadow-sm"
                            >
                                Zaloguj się
                            </button>
                        )}
                    </div>
                )}

                {/* Błąd akcji */}
                {actionError && (
                    <div className="mb-5 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                        {actionError}
                    </div>
                )}

                {/* Przyciski */}
                <div className="flex gap-3">
                    <button
                        onClick={() => handleAction('decline')}
                        disabled={loadingAction || !authToken}
                        className="flex-1 border border-gray-200 text-green-deep font-semibold py-3.5 rounded-xl
  hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Odrzuć
                    </button>
                    <button
                        onClick={() => handleAction('accept')}
                        disabled={loadingAction || !authToken}
                        className="flex-[2] bg-green-deep text-cream font-semibold py-3.5 rounded-xl
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
            <span className={`text-sm text-green-deep ${bold ? 'font-bold' : 'font-medium'}`}>
                {value}
            </span>
        </div>
    );
}

export default AcceptInvitationView;
