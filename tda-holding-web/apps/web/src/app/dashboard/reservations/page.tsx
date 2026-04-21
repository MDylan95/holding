"use client";

import { Calendar, Loader } from "lucide-react";
import { useUserBookings } from "@/lib/hooks";

export default function ReservationsPage() {
  const { bookings, loading, error } = useUserBookings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "vehicle":
        return "Véhicule";
      case "property":
        return "Immobilier";
      case "driver":
        return "Chauffeur";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Mes réservations</h1>
        <p className="text-gray-600 mt-2">
          Gérez et suivez toutes vos réservations
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-[#1B5E20]" size={32} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-800 font-semibold">Erreur de chargement</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#1B5E20] bg-green-50 px-3 py-1 rounded-full">
                      {getTypeLabel(booking.type)}
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">
                    {booking.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                <Calendar size={16} />
                <span>
                  {formatDate(booking.start_date)}
                  {booking.end_date && ` - ${formatDate(booking.end_date)}`}
                </span>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-[#1B5E20] text-white rounded-lg font-semibold hover:bg-[#2E7D32] transition">
                  Voir détails
                </button>
                {booking.status !== "cancelled" && (
                  <button className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition">
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Aucune réservation pour le moment</p>
          <a
            href="/reservations"
            className="inline-block bg-[#1B5E20] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#2E7D32] transition"
          >
            Parcourir le catalogue
          </a>
        </div>
      )}
    </div>
  );
}
