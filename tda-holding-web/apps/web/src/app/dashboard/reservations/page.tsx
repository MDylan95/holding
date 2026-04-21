"use client";

import { Calendar, MapPin, User, Phone } from "lucide-react";

export default function ReservationsPage() {
  const reservations = [
    {
      id: 1,
      type: "Véhicule",
      name: "BMW X5 2024",
      date: "15 avril - 20 avril 2026",
      status: "Confirmée",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 2,
      type: "Immobilier",
      name: "Villa prestige - Abidjan",
      date: "Visite : 18 avril 2026",
      status: "En attente",
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 3,
      type: "Chauffeur",
      name: "Déplacement professionnel",
      date: "22 avril 2026",
      status: "Confirmée",
      statusColor: "bg-green-100 text-green-800",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Mes réservations</h1>
        <p className="text-gray-600 mt-2">
          Gérez et suivez toutes vos réservations
        </p>
      </div>

      <div className="space-y-4">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#1B5E20] bg-green-50 px-3 py-1 rounded-full">
                    {reservation.type}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${reservation.statusColor}`}
                  >
                    {reservation.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900">
                  {reservation.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
              <Calendar size={16} />
              {reservation.date}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-[#1B5E20] text-white rounded-lg font-semibold hover:bg-[#2E7D32] transition">
                Voir détails
              </button>
              <button className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition">
                Annuler
              </button>
            </div>
          </div>
        ))}
      </div>

      {reservations.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Aucune réservation pour le moment</p>
        </div>
      )}
    </div>
  );
}
