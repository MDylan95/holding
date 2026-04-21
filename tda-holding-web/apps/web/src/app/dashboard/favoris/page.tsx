"use client";

import Link from "next/link";
import { Heart, Loader } from "lucide-react";
import { useFavorites } from "@/lib/hooks";

export default function FavorisPage() {
  const { favorites, loading, error, toggleFavorite } = useFavorites();

  const getTypeLabel = (type: string) => {
    return type === "vehicle" ? "Véhicule" : "Immobilier";
  };

  const getItemName = (favorite: any) => {
    if (favorite.type === "vehicle" && favorite.vehicle) {
      return favorite.vehicle.name;
    }
    if (favorite.type === "property" && favorite.property) {
      return favorite.property.name;
    }
    return "Élément";
  };

  const getItemPrice = (favorite: any) => {
    if (favorite.type === "vehicle" && favorite.vehicle) {
      return favorite.vehicle.price_per_day
        ? `${favorite.vehicle.price_per_day.toLocaleString()} FCFA/jour`
        : `${favorite.vehicle.price_sale?.toLocaleString()} FCFA`;
    }
    if (favorite.type === "property" && favorite.property) {
      return favorite.property.price
        ? `${favorite.property.price.toLocaleString()} FCFA`
        : "Sur demande";
    }
    return "-";
  };

  const getItemImage = (favorite: any) => {
    if (favorite.type === "vehicle" && favorite.vehicle) {
      return (
        favorite.vehicle.media?.[0]?.url ||
        favorite.vehicle.images?.[0]?.url ||
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80"
      );
    }
    if (favorite.type === "property" && favorite.property) {
      return (
        favorite.property.media?.[0]?.url ||
        favorite.property.images?.[0]?.url ||
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80"
      );
    }
    return "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80";
  };

  const getItemSlug = (favorite: any) => {
    if (favorite.type === "vehicle" && favorite.vehicle) {
      return `/vehicules/${favorite.vehicle.slug}`;
    }
    if (favorite.type === "property" && favorite.property) {
      return `/proprietes/${favorite.property.slug}`;
    }
    return "/reservations";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Mes favoris</h1>
        <p className="text-gray-600 mt-2">
          {favorites.length} élément{favorites.length > 1 ? "s" : ""} sauvegardé
          {favorites.length > 1 ? "s" : ""}
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
      ) : favorites.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getItemImage(favorite)}
                  alt={getItemName(favorite)}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
                <button
                  onClick={() =>
                    toggleFavorite(
                      favorite.type,
                      favorite.type === "vehicle"
                        ? favorite.vehicle_id!
                        : favorite.property_id!
                    )
                  }
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition"
                >
                  <Heart size={20} className="text-red-600 fill-red-600" />
                </button>
              </div>

              <div className="p-4">
                <span className="text-xs font-semibold text-[#1B5E20] bg-green-50 px-2 py-1 rounded">
                  {getTypeLabel(favorite.type)}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  {getItemName(favorite)}
                </h3>
                <p className="text-[#DAA520] font-semibold mt-2">
                  {getItemPrice(favorite)}
                </p>

                <Link
                  href={getItemSlug(favorite)}
                  className="block w-full mt-4 px-4 py-2 bg-[#1B5E20] text-white text-center rounded-lg font-semibold hover:bg-[#2E7D32] transition"
                >
                  Consulter
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Aucun favori pour le moment</p>
          <Link
            href="/reservations"
            className="inline-block bg-[#1B5E20] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#2E7D32] transition"
          >
            Parcourir le catalogue
          </Link>
        </div>
      )}
    </div>
  );
}
