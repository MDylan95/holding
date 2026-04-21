"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Users, Fuel, Calendar, MessageCircle, ArrowLeft, Loader } from "lucide-react";
import { useVehicleBySlug } from "@/lib/hooks";

export default function VehicleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { vehicle, loading, error } = useVehicleBySlug(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin text-[#1B5E20]" size={48} />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Véhicule non trouvé</h1>
          <p className="text-gray-600 mb-6">{error || "Ce véhicule n\'existe pas."}</p>
          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 bg-[#1B5E20] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#2E7D32] transition"
          >
            <ArrowLeft size={18} />
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = vehicle.media?.[0]?.url || vehicle.images?.[0]?.url || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80";
  const additionalImages = (vehicle.media || vehicle.images || []).slice(1, 4);

  return (
    <>
      {/* Header */}
      <section className="bg-[#1B2E1A] pt-28 pb-10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 text-[#DAA520] hover:text-yellow-400 transition mb-4"
          >
            <ArrowLeft size={18} />
            Retour au catalogue
          </Link>
          <h1 className="text-4xl font-black mb-3">{vehicle.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <MapPin size={16} className="text-[#DAA520]" />
              {vehicle.city}
            </span>
            <span>·</span>
            <span>{vehicle.type}</span>
          </div>
        </div>
      </section>

      {/* Gallery & Details */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Images */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <img
                  src={mainImage}
                  alt={vehicle.name}
                  className="w-full h-96 object-cover rounded-2xl"
                />
              </div>

              {additionalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {additionalImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`${vehicle.name} ${idx + 2}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info & CTA */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                {/* Price */}
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-1">Prix</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900">
                      {vehicle.price_per_day
                        ? `${vehicle.price_per_day.toLocaleString()} FCFA`
                        : `${vehicle.price_sale?.toLocaleString()} FCFA`}
                    </span>
                    {vehicle.price_per_day && (
                      <span className="text-gray-600">/ jour</span>
                    )}
                  </div>
                </div>

                {/* Type badge */}
                <div className="mb-6">
                  <span className="inline-block bg-[#1B5E20] text-white text-xs font-semibold px-4 py-2 rounded-full">
                    {vehicle.price_per_day ? "Location" : "Vente"}
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/2250700000000?text=Bonjour, je suis intéressé par ${encodeURIComponent(vehicle.name)} - ${vehicle.price_per_day ? `${vehicle.price_per_day.toLocaleString()} FCFA/jour` : `${vehicle.price_sale?.toLocaleString()} FCFA`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-full font-semibold hover:bg-green-500 transition"
                  >
                    <MessageCircle size={20} />
                    Contacter sur WhatsApp
                  </a>
                  <button className="w-full bg-[#1B5E20] text-white py-3 rounded-full font-semibold hover:bg-[#2E7D32] transition">
                    {vehicle.price_per_day ? "Réserver maintenant" : "Prendre rendez-vous"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {vehicle.description && (
        <section className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
          </div>
        </section>
      )}

      {/* Specs */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Caractéristiques</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#DAA520]/20 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-[#DAA520]" />
                </div>
                <span className="text-sm text-gray-600">Capacité</span>
              </div>
              <p className="text-2xl font-black text-gray-900">5-7</p>
              <p className="text-xs text-gray-500">places</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#DAA520]/20 rounded-lg flex items-center justify-center">
                  <Fuel size={20} className="text-[#DAA520]" />
                </div>
                <span className="text-sm text-gray-600">Type</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{vehicle.type}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#DAA520]/20 rounded-lg flex items-center justify-center">
                  <MapPin size={20} className="text-[#DAA520]" />
                </div>
                <span className="text-sm text-gray-600">Localisation</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{vehicle.city}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#DAA520]/20 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-[#DAA520]" />
                </div>
                <span className="text-sm text-gray-600">Disponibilité</span>
              </div>
              <p className="text-2xl font-black text-gray-900">24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related vehicles */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Autres véhicules</h2>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Découvrez d'autres véhicules disponibles</p>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-2 bg-[#1B5E20] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#2E7D32] transition"
            >
              Voir le catalogue complet
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
