import React, { useState } from 'react';
import supabase from '../../utils/supabase.ts';

interface SetPasswordViewProps {
    onSuccess: () => void;
}

const SetPasswordView: React.FC<SetPasswordViewProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne!');
            return;
        }

        if (password.length < 6) {
            setError('Hasło musi mieć minimum 6 znaków.');
            return;
        }

        setLoading(true);

        // TODO: Odkomentuj, gdy podepniesz klienta Supabase
        const { error } = await supabase.auth.updateUser({
            password: password,
            data: { needs_password: false }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Symulacja ładowania dla testów (usuń potem)
        setTimeout(() => {
            setLoading(false);
            onSuccess();
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-cream-warm max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-green-deep mb-2">Witaj w Zespole!</h1>
                    <p className="text-gray-500 text-sm">
                        Zostałeś zaproszony do aplikacji. Ustaw swoje hasło, aby uzyskać dostęp do panelu.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-green-deep mb-2">
                            Nowe hasło
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-deep focus:ring-1 focus:ring-green-deep outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-green-deep mb-2">
                            Powtórz hasło
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-deep focus:ring-1 focus:ring-green-deep outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-deep text-cream font-semibold py-3.5 rounded-xl hover:bg-[#1a423a] transition-all disabled:opacity-70 mt-4"
                    >
                        {loading ? 'Zapisywanie...' : 'Zapisz hasło i wejdź'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPasswordView;
