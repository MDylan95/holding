import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Users, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Réservations — Catalogue complet",
  description:
    "Parcourez notre catalogue de véhicules et biens immobiliers. Réservez en ligne ou prenez rendez-vous.",
};

const VEHICLES = [
  {
    id: "v1",
    name: "Toyota Land Cruiser",
    city: "Abidjan",
    type: "SUV",
    seats: 7,
    img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80",
    tag: "Location",
    tagColor: "bg-[#1B5E20]",
    price: "85 000 FCFA",
    unit: "/ jour",
    cta: "Réserver",
  },
  {
    id: "v2",
    name: "Mercedes Classe E",
    city: "Dakar",
    type: "Berline",
    seats: 5,
    img: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80",
    tag: "Location",
    tagColor: "bg-[#1B5E20]",
    badge: "Réservé",
    price: "95 000 FCFA",
    unit: "/ jour",
    cta: "Réserver",
  },
  {
    id: "v3",
    name: "Hyundai Tucson",
    city: "Lomé",
    type: "SUV",
    seats: 5,
    img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80",
    tag: "Vente",
    tagColor: "bg-[#DAA520]",
    price: "12 500 000 FCFA",
    unit: null,
    cta: "Rendez-vous",
  },
  {
    id: "v4",
    name: "Toyota Hilux",
    city: "Cotonou",
    type: "Pick-up",
    seats: 5,
    img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80",
    tag: "Location",
    tagColor: "bg-[#1B5E20]",
    price: "55 000 FCFA",
    unit: "/ jour",
    cta: "Réserver",
  },
  {
    id: "v5",
    name: "BMW Série 5",
    city: "Abidjan",
    type: "Berline",
    seats: 5,
    img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
    tag: "Vente",
    tagColor: "bg-[#DAA520]",
    price: "18 000 000 FCFA",
    unit: null,
    cta: "Rendez-vous",
    badge: "Réservé",
  },
  {
    id: "v6",
    name: "Renault Duster",
    city: "Ouagadougou",
    type: "SUV",
    seats: 5,
    img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80",
    tag: "Location",
    tagColor: "bg-[#1B5E20]",
    price: "40 000 FCFA",
    unit: "/ jour",
    cta: "Réserver",
  },
];

export default function ReservationsPage() {
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
            <button className="inline-flex items-center gap-1.5 bg-[#1B5E20] text-white rounded-full px-5 py-2 text-sm font-semibold">
              <span>🚗</span> Véhicules
            </button>
            <button className="inline-flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 rounded-full px-5 py-2 text-sm hover:bg-gray-50 transition">
              <span>🏠</span> Immobilier
            </button>
          </div>

          <div className="flex gap-3 ml-auto flex-wrap">
            <select className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#1B5E20]">
              <option>Tous</option>
              <option>Abidjan</option>
              <option>Dakar</option>
              <option>Lomé</option>
              <option>Cotonou</option>
            </select>
            <select className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#1B5E20]">
              <option>Toutes</option>
              <option>Location</option>
              <option>Vente</option>
            </select>
            <select className="border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#1B5E20]">
              <option>Tous types</option>
              <option>SUV</option>
              <option>Berline</option>
              <option>Pick-up</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-gray-900">{VEHICLES.length} véhicule(s)</span> trouvé(s)
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VEHICLES.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={v.img}
                    alt={v.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {"badge" in v && v.badge && (
                      <span className="bg-orange-500 text-white text-xs rounded-full px-2.5 py-0.5 font-semibold">
                        {v.badge as string}
                      </span>
                    )}
                    <span
                      className={`${v.tagColor} text-white text-xs rounded-full px-2.5 py-0.5 font-semibold`}
                    >
                      {v.tag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{v.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[#DAA520]" />
                      {v.city}
                    </span>
                    <span>·</span>
                    <span>{v.type}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {v.seats} places
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-gray-900">{v.price}</span>
                      {v.unit && (
                        <span className="text-gray-400 text-xs"> {v.unit}</span>
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
                        <MessageCircle size={15} className="text-white" />
                      </a>
                      <Link
                        href={`/reservations?type=vehicule&id=${v.id}`}
                        className="bg-[#1B5E20] text-white text-xs rounded-full px-4 py-1.5 font-semibold hover:bg-[#2E7D32] transition"
                      >
                        {v.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
