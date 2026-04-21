"use client";

import { Heart, Trash2 } from "lucide-react";

export default function FavorisPage() {
  const favorites = [
    {
      id: 1,
      type: "Véhicule",
      name: "Mercedes-Benz S-Class",
      price: "150 000 FCFA/jour",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80",
    },
    {
      id: 2,
      type: "Immobilier",
      name: "Villa prestige avec piscine",
      price: "25 000 000 FCFA",
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80",
    },
    {
      id: 3,
      type: "Véhicule",
      name: "Range Rover Sport",
      price: "120 000 FCFA/jour",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Mes favoris</h1>
        <p className="text-gray-600 mt-2">
          {favorites.length} élément{favorites.length > 1 ? "s" : ""} sauvegardé
          {favorites.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition"
              />
              <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition">
                <Heart size={20} className="text-red-600 fill-red-600" />
              </button>
            </div>

            <div className="p-4">
              <span className="text-xs font-semibold text-[#1B5E20] bg-green-50 px-2 py-1 rounded">
                {item.type}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-2">
                {item.name}
              </h3>
              <p className="text-[#DAA520] font-semibold mt-2">{item.price}</p>

              <button className="w-full mt-4 px-4 py-2 bg-[#1B5E20] text-white rounded-lg font-semibold hover:bg-[#2E7D32] transition">
                Consulter
              </button>
            </div>
          </div>
        ))}
      </div>

      {favorites.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Aucun favori pour le moment</p>
        </div>
      )}
    </div>
  );
}
