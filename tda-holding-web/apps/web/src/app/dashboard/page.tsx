"use client";

import { useAuth } from "@/lib/auth-context";
import { Calendar, Heart, User, Bell } from "lucide-react";
import Link from "next/link";
import { useUserBookings, useFavorites } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const { bookings } = useUserBookings();
  const { favorites } = useFavorites();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiFetch<{ data: any[] }>("/api/v1/notifications");
        const unread = (data.data || []).filter((n) => !n.read).length;
        setUnreadNotifications(unread);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  const stats = [
    {
      label: "Réservations actives",
      value: bookings.filter((b) => b.status === "confirmed").length.toString(),
      icon: Calendar,
      href: "/dashboard/reservations",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Favoris sauvegardés",
      value: favorites.length.toString(),
      icon: Heart,
      href: "/dashboard/favoris",
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Notifications",
      value: unreadNotifications.toString(),
      icon: Bell,
      href: "/dashboard/notifications",
      color: "bg-yellow-50 text-yellow-600",
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
          {bookings.length > 0 ? (
            <>
              {bookings.slice(0, 2).map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 pb-4 border-b">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-[#1B5E20]"
                        : "bg-[#DAA520]"
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Réservation{" "}
                      {booking.status === "confirmed"
                        ? "confirmée"
                        : "en attente"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.name} -{" "}
                      {new Date(booking.start_date).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                </div>
              ))}
              {favorites.length > 0 && (
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {favorites.length} favori{favorites.length > 1 ? "s" : ""}{" "}
                      sauvegardé{favorites.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      Accédez à vos favoris depuis votre profil
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Aucune activité récente</p>
              <Link
                href="/reservations"
                className="inline-block bg-[#1B5E20] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#2E7D32] transition"
              >
                Parcourir le catalogue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
