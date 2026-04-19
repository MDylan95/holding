import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Connexion - TDA Holding" />
            <div className="flex min-h-screen">
                {/* Left panel — branding */}
                <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-tda-green-900 via-tda-green-800 to-tda-green-700 p-12">
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-tda-gold-500 text-tda-green-900 text-2xl font-extrabold shadow-lg">
                            TDA
                        </div>
                        <h1 className="text-3xl font-bold text-white">TDA <span className="text-tda-gold-400">Holding</span></h1>
                        <p className="mt-3 text-tda-green-300 text-sm max-w-xs mx-auto">
                            Plateforme de gestion — Mobilité & Immobilier
                        </p>
                        <div className="mt-10 flex justify-center gap-8 text-tda-green-300 text-xs">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-tda-gold-400">🚗</div>
                                <p className="mt-1">Véhicules</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-tda-gold-400">🏠</div>
                                <p className="mt-1">Immobilier</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-tda-gold-400">👤</div>
                                <p className="mt-1">Chauffeurs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right panel — login form */}
                <div className="flex w-full items-center justify-center bg-tda-silver-50 px-6 lg:w-1/2">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="mb-8 text-center lg:hidden">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-tda-gold-500 text-tda-green-900 text-lg font-extrabold">
                                TDA
                            </div>
                            <h1 className="text-xl font-bold text-tda-green-900">TDA <span className="text-tda-gold-500">Holding</span></h1>
                        </div>

                        <div className="rounded-2xl bg-white p-8 shadow-sm border border-tda-silver-200">
                            <h2 className="text-xl font-bold text-tda-green-900">Connexion</h2>
                            <p className="mt-1 text-sm text-tda-silver-500">Accédez au back-office d'administration</p>

                            {status && (
                                <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{status}</div>
                            )}

                            <form onSubmit={submit} className="mt-6 space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-tda-silver-500 mb-1">
                                        Adresse email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                        placeholder="admin@tda-holding.com"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-tda-silver-500 mb-1">
                                        Mot de passe
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded border-tda-silver-300 text-tda-green-600 focus:ring-tda-green-500"
                                        />
                                        <span className="text-sm text-tda-silver-500">Se souvenir de moi</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-lg bg-tda-green-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-tda-green-700 disabled:opacity-50 transition"
                                >
                                    {processing ? 'Connexion...' : 'Se connecter'}
                                </button>
                            </form>
                        </div>

                        <p className="mt-6 text-center text-xs text-tda-silver-400">
                            &copy; {new Date().getFullYear()} TDA Holding. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
