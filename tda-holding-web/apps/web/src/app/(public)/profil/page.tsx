"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { apiFetch, ApiError, initCsrf } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ProfilPage() {
  const { refetch, isAuthenticated, loading: authLoading } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Initialize CSRF on mount
  useEffect(() => {
    initCsrf().catch((err) => {
      console.error("CSRF init failed:", err);
    });
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [authLoading, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Ensure CSRF is initialized before login
      await initCsrf();
      
      await apiFetch<{ user: unknown; token?: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          login: loginEmail,
          password: loginPassword,
        }),
      });

      setSuccess("Connexion réussie ! Redirection...");
      // Wait a bit for cookies to be set, then refetch user
      await new Promise(resolve => setTimeout(resolve, 500));
      const success = await refetch();
      if (success) {
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        setError("Erreur lors du chargement du profil. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof ApiError) {
        setError(err.message || "Identifiants invalides");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Ensure CSRF is initialized before register
      await initCsrf();
      
      await apiFetch<{ user: unknown; token?: string }>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          first_name: registerFirstName,
          last_name: registerLastName,
          email: registerEmail,
          password: registerPassword,
          password_confirmation: registerPassword,
        }),
      });

      setSuccess("Inscription réussie ! Connexion en cours...");
      // Wait a bit for cookies to be set, then refetch user
      await new Promise(resolve => setTimeout(resolve, 500));
      const success = await refetch();
      if (success) {
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        setError("Erreur lors du chargement du profil. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Register error:", err);
      if (err instanceof ApiError) {
        setError(err.message || "Erreur lors de l'inscription");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur d'inscription. Vérifiez votre connexion internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4 pt-32">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-[#DAA520] rounded-full flex items-center justify-center">
            <span className="text-white font-black text-lg">TDA</span>
          </div>
        </div>

        {mode === "login" ? (
          <>
            <h1 className="text-2xl font-black text-center text-gray-900 mb-1">
              Connexion
            </h1>
            <p className="text-center text-gray-500 text-sm mb-8">
              Accédez à votre espace personnel
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition pr-11 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B5E20] text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-[#2E7D32] transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Pas encore de compte ?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-[#1B5E20] font-semibold hover:underline"
              >
                S&apos;inscrire
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black text-center text-gray-900 mb-1">
              Créer un compte
            </h1>
            <p className="text-center text-gray-500 text-sm mb-8">
              Rejoignez TDA Platform
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Prénom
                  </label>
                  <input
                    type="text"
                    placeholder="Jean"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nom
                  </label>
                  <input
                    type="text"
                    placeholder="Dupont"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition disabled:bg-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition pr-11 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B5E20] text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-[#2E7D32] transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Déjà un compte ?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-[#1B5E20] font-semibold hover:underline"
              >
                Se connecter
              </button>
            </p>
          </>
        )}

        {/* WhatsApp help */}
        <div className="mt-6 text-center">
          <a
            href="https://wa.me/2250700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#25D366] text-sm font-semibold hover:underline"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Besoin d&apos;aide ? Contactez-nous sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
