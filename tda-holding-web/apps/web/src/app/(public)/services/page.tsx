import type { Metadata } from "next";
import Link from "next/link";
import { Car, Building2, UserCheck, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Nos Services",
  description:
    "Location et vente de véhicules, gestion immobilière et chauffeurs professionnels en Afrique de l'Ouest.",
};

const HOW_STEPS = [
  { n: "01", title: "Choisissez", desc: "Parcourez notre catalogue et sélectionnez le véhicule ou le bien qui vous convient." },
  { n: "02", title: "Réservez", desc: "Remplissez le formulaire de réservation en ligne, selon le type (flux ou RDV)." },
  { n: "03", title: "Confirmez", desc: "Recevez une confirmation de notre équipe TDA par email ou WhatsApp." },
  { n: "04", title: "Profitez", desc: "Récupérez votre véhicule ou visitez votre bien dans les meilleures conditions." },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1B2E1A] pt-32 pb-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-[#DAA520] text-xs font-semibold tracking-widest uppercase mb-3">
            Ce que nous proposons
          </p>
          <h1 className="text-5xl font-black mb-5">Nos Services</h1>
          <p className="text-gray-300 text-lg">
            TDA Platform centralise la mobilité et l&apos;immobilier pour vous offrir
            une expérience complète et sans friction en Afrique de l&apos;Ouest.
          </p>
        </div>
      </section>

      {/* Service 1 — Véhicules */}
      <section id="vehicules" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-white shadow-lg h-80 md:h-96">
            {/* Text side */}
            <div className="p-10 space-y-6 flex flex-col justify-center">
              <h2 className="text-3xl font-black text-[#1B2E1A]">
                Location &amp; Vente de Véhicules
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Bénéficiez d&apos;un parc de véhicules diversifié pour tous vos
                besoins de mobilité en Afrique de l&apos;Ouest.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "SUV, berlines, pick-ups et utilitaires",
                  "Location à la journée, semaine ou mois",
                  "Option avec ou sans chauffeur disponible",
                  "Livraison possible sur votre lieu",
                  "Assurance incluse dans la location",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#1B5E20] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/reservations?type=vehicule"
                className="inline-flex items-center gap-2 bg-[#1B5E20] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#2E7D32] transition w-fit"
              >
                Voir les véhicules <ArrowRight size={16} />
              </Link>
            </div>
            {/* Image side */}
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"
                alt="Flotte de véhicules TDA"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service 2 — Immobilier */}
      <section id="immobilier" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-white shadow-lg h-80 md:h-96">
            {/* Image side */}
            <div className="overflow-hidden order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80"
                alt="Biens immobiliers TDA"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Text side */}
            <div className="p-10 space-y-6 flex flex-col justify-center order-1 md:order-2 bg-gray-50">
              <h2 className="text-3xl font-black text-gray-900">
                Gestion Immobilière
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Un catalogue complet de biens immobiliers de prestige dans les
                quartiers résidentiels et d&apos;affaires les plus prisés d&apos;Afrique.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Villas et maisons de standing",
                  "Appartements et studios modernes",
                  "Terrains constructibles à vendre",
                  "Locaux commerciaux et bureaux",
                  "Visite virtuelle disponible sur demande",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#1B5E20] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/reservations?type=immobilier"
                className="inline-flex items-center gap-2 bg-[#1B5E20] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#2E7D32] transition w-fit"
              >
                Voir les biens <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service 3 — Chauffeurs */}
      <section id="chauffeurs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-white shadow-lg h-80 md:h-96">
            {/* Text side */}
            <div className="p-8 space-y-4 flex flex-col justify-between">
              <h2 className="text-3xl font-black text-[#1B2E1A]">
                Service de Chauffeurs Professionnels
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Des chauffeurs professionnels certifiés, formés aux standards
                internationaux pour vos déplacements en toute sécurité.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Chauffeurs certifiés et expérimentés",
                  "Disponibles 24h/24 et 7j/7",
                  "Discrétion et ponctualité garanties",
                  "Véhicules premium et confortables",
                  "Tarifs horaires et journaliers flexibles",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#1B5E20] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/reservations?type=vehicule"
                className="inline-flex items-center gap-2 bg-[#1B5E20] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#2E7D32] transition w-fit"
              >
                Réserver avec chauffeur <ArrowRight size={16} />
              </Link>
            </div>
            {/* Image side */}
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="Chauffeur professionnel TDA"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#DAA520] text-xs font-semibold tracking-widest uppercase mb-2">
            Simple &amp; Rapide
          </p>
          <h2 className="text-4xl font-black text-gray-900 mb-14">
            Comment ça marche ?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="text-6xl font-black text-[#1B5E20]/10 mb-3 leading-none">
                  {s.n}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
