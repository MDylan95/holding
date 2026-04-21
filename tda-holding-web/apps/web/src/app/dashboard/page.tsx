"use client";

import { useAuth } from "@/lib/auth-context";
import { Calendar, Heart, User } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      label: "Réservations actives",
      value: "3",
      icon: Calendar,
      href: "/dashboard/reservations",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Favoris sauvegardés",
      value: "12",
      icon: Heart,
      href: "/dashboard/favoris",
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Profil complété",
      value: "85%",
      icon: User,
      href: "/dashboard/profil",
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">
          Bienvenue, {user?.first_name} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez vos réservations, favoris et profil en un seul endroit
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{label}</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-6">
          Actions rapides
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/reservations?type=vehicule"
            className="p-4 border-2 border-[#1B5E20] rounded-xl text-[#1B5E20] font-semibold hover:bg-[#1B5E20] hover:text-white transition"
          >
            Réserver un véhicule
          </Link>
          <Link
            href="/reservations?type=immobilier"
            className="p-4 border-2 border-[#1B5E20] rounded-xl text-[#1B5E20] font-semibold hover:bg-[#1B5E20] hover:text-white transition"
          >
            Consulter les biens
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-6">
          Activité récente
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-2 h-2 bg-[#1B5E20] rounded-full" />
            <div>
              <p className="font-semibold text-gray-900">
                Réservation confirmée
              </p>
              <p className="text-sm text-gray-600">
                BMW X5 - 15 avril 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-2 h-2 bg-[#DAA520] rounded-full" />
            <div>
              <p className="font-semibold text-gray-900">Bien ajouté aux favoris</p>
              <p className="text-sm text-gray-600">Villa prestige - Abidjan</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <div>
              <p className="font-semibold text-gray-900">Profil mis à jour</p>
              <p className="text-sm text-gray-600">10 avril 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
