"use client";

import { useState } from "react";
import { Lock, Bell, Eye, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export default function ParametresPage() {
  const { logout } = useAuth();
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setMessage(null);

    if (passwordData.password !== passwordData.password_confirmation) {
      setMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas",
      });
      setChangingPassword(false);
      return;
    }

    try {
      await apiFetch("/api/v1/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: passwordData.current_password,
          password: passwordData.password,
          password_confirmation: passwordData.password_confirmation,
        }),
      });
      setMessage({
        type: "success",
        text: "Mot de passe changé avec succès",
      });
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du changement de mot de passe",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePreferenceChange = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">
          Gérez vos préférences et votre sécurité
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`rounded-2xl p-4 flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div
            className={
              message.type === "success" ? "text-green-600" : "text-red-600"
            }
          >
            {message.type === "success" ? "✓" : "✕"}
          </div>
          <p
            className={
              message.type === "success" ? "text-green-800" : "text-red-800"
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Security Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Lock size={24} className="text-[#1B5E20]" />
          <h2 className="text-2xl font-black text-gray-900">Sécurité</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={passwordData.password_confirmation}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full bg-[#1B5E20] text-white rounded-lg px-6 py-3 font-semibold hover:bg-[#2E7D32] transition disabled:opacity-70"
          >
            {changingPassword ? "Changement en cours..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-[#1B5E20]" />
          <h2 className="text-2xl font-black text-gray-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">
                Notifications par email
              </p>
              <p className="text-sm text-gray-600">
                Recevez les mises à jour importantes par email
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange("email_notifications")}
              className={`relative w-12 h-7 rounded-full transition ${
                preferences.email_notifications
                  ? "bg-[#1B5E20]"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${
                  preferences.email_notifications ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">
                Notifications SMS
              </p>
              <p className="text-sm text-gray-600">
                Recevez les alertes urgentes par SMS
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange("sms_notifications")}
              className={`relative w-12 h-7 rounded-full transition ${
                preferences.sms_notifications ? "bg-[#1B5E20]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${
                  preferences.sms_notifications ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">
                Emails marketing
              </p>
              <p className="text-sm text-gray-600">
                Recevez nos offres spéciales et promotions
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange("marketing_emails")}
              className={`relative w-12 h-7 rounded-full transition ${
                preferences.marketing_emails ? "bg-[#1B5E20]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${
                  preferences.marketing_emails ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
        <h2 className="text-2xl font-black text-red-900 mb-6">Zone de danger</h2>

        <button
          onClick={() => {
            if (
              confirm(
                "Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte."
              )
            ) {
              logout();
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-red-700 transition"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
