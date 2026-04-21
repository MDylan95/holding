"use client";

import Link from "next/link";
import { MapPin, Users, MessageCircle, Loader } from "lucide-react";
import { useState } from "react";
import { useVehicles, useProperties } from "@/lib/hooks";

function ReservationsPageContent() {
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { properties, loading: propertiesLoading } = useProperties();
  const [activeTab, setActiveTab] = useState<"vehicles" | "properties">(
    "vehicles"
  );
  const [selectedCity, setSelectedCity] = useState("Tous");
  const [selectedType, setSelectedType] = useState("Tous types");

  // Extraire les villes uniques
  const cities = [
    "Tous",
    ...new Set(vehicles.map((v) => v.city)),
  ];

  // Filtrer les véhicules
  const filteredVehicles = vehicles.filter((v) => {
    const cityMatch = selectedCity === "Tous" || v.city === selectedCity;
    const typeMatch = selectedType === "Tous types" || v.type === selectedType;
    return cityMatch && typeMatch;
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1B2E1A] pt-28 pb-10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-[#DAA520] text-xs font-semibold tracking-widest uppercase mb-2">
            Catalogue Complet
          </p>
          <h1 className="text-4xl font-black mb-3">Réservations</h1>
          <p className="text-gray-300 text-sm max-w-xl">
            Parcourez notre catalogue de véhicules et biens immobiliers.
            Réservez en ligne ou prenez rendez-vous directement.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeTab === "vehicles"
                  ? "bg-[#1B5E20] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span>🚗</span> Véhicules
            </button>
            <button
              onClick={() => setActiveTab("properties")}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeTab === "properties"
                  ? "bg-[#1B5E20] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span>🏠</span> Immobilier
            </button>
          </div>

          {activeTab === "vehicles" && (
            <div className="flex gap-3 ml-auto flex-wrap">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#1B5E20]"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#1B5E20]"
              >
                <option>Tous types</option>
                <option>SUV</option>
                <option>Berline</option>
                <option>Pick-up</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-10 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {activeTab === "vehicles" ? (
            <>
              {vehiclesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="animate-spin text-[#1B5E20]" size={32} />
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-6">
                    <span className="font-semibold text-gray-900">
                      {filteredVehicles.length} véhicule(s)
                    </span>{" "}
                    trouvé(s)
                  </p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.length > 0 ? (
                      filteredVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Image */}
                          <div className="relative">
                            <img
                              src={
                                v.media?.[0]?.url ||
                                v.images?.[0]?.url ||
                                "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80"
                              }
                              alt={v.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="bg-[#1B5E20] text-white text-xs rounded-full px-2.5 py-0.5 font-semibold">
                                {v.price_per_day ? "Location" : "Vente"}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-1">
                              {v.name}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                              <span className="flex items-center gap-1">
                                <MapPin size={11} className="text-[#DAA520]" />
                                {v.city}
                              </span>
                              <span>·</span>
                              <span>{v.type}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-black text-gray-900">
                                  {v.price_per_day
                                    ? `${v.price_per_day.toLocaleString()} FCFA`
                                    : `${v.price_sale?.toLocaleString()} FCFA`}
                                </span>
                                {v.price_per_day && (
                                  <span className="text-gray-400 text-xs">
                                    {" "}
                                    / jour
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`https://wa.me/2250700000000?text=Bonjour, je suis intéressé par ${encodeURIComponent(v.name)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-green-500 transition"
                                  title="Contacter sur WhatsApp"
                                >
                                  <MessageCircle
                                    size={15}
                                    className="text-white"
                                  />
                                </a>
                                <Link
                                  href={`/vehicules/${v.slug}`}
                                  className="bg-[#1B5E20] text-white text-xs rounded-full px-4 py-1.5 font-semibold hover:bg-[#2E7D32] transition"
                                >
                                  Voir
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">
                          Aucun véhicule ne correspond à votre recherche
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {propertiesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="animate-spin text-[#1B5E20]" size={32} />
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-6">
                    <span className="font-semibold text-gray-900">
                      {properties.length} bien(s)
                    </span>{" "}
                    trouvé(s)
                  </p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.length > 0 ? (
                      properties.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Image */}
                          <div className="relative">
                            <img
                              src={
                                p.media?.[0]?.url ||
                                p.images?.[0]?.url ||
                                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80"
                              }
                              alt={p.name}
                              className="w-full h-48 object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-1">
                              {p.name}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                              <span className="flex items-center gap-1">
                                <MapPin size={11} className="text-[#DAA520]" />
                                {p.city}
                              </span>
                              <span>·</span>
                              <span>{p.type}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-black text-gray-900">
                                  {p.price
                                    ? `${p.price.toLocaleString()} FCFA`
                                    : "Sur demande"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={`https://wa.me/2250700000000?text=Bonjour, je suis intéressé par ${encodeURIComponent(p.name)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-green-500 transition"
                                  title="Contacter sur WhatsApp"
                                >
                                  <MessageCircle
                                    size={15}
                                    className="text-white"
                                  />
                                </a>
                                <Link
                                  href={`/proprietes/${p.slug}`}
                                  className="bg-[#1B5E20] text-white text-xs rounded-full px-4 py-1.5 font-semibold hover:bg-[#2E7D32] transition"
                                >
                                  Voir
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">
                          Aucun bien ne correspond à votre recherche
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default ReservationsPageContent;
