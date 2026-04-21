"use client";

import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";

export default function ProfilPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Implémenter l'appel API pour mettre à jour le profil
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Mon profil</h1>
        <p className="text-gray-600 mt-2">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-[#DAA520] rounded-full flex items-center justify-center">
            <span className="text-white font-black text-3xl">
              {user?.first_name?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 text-xs font-semibold text-[#1B5E20] bg-green-50 px-3 py-1 rounded-full">
              Client
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+225..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ville
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Abidjan"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pays
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Côte d'Ivoire"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1B5E20]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#1B5E20] text-white rounded-lg px-6 py-3 font-semibold hover:bg-[#2E7D32] transition disabled:opacity-70"
        >
          <Save size={20} />
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>

      {/* Security Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-6">Sécurité</h3>
        <button className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition">
          Changer le mot de passe
        </button>
      </div>
    </div>
  );
}
