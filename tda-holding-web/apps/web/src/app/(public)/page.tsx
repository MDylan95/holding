import Link from "next/link";
import {
  Car,
  Building2,
  UserCheck,
  ArrowRight,
  Star,
  ChevronRight,
} from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";

// --- Stats ---
const STATS = [
  { value: "500+", label: "Véhicules" },
  { value: "1 200+", label: "Biens Immobiliers" },
  { value: "50+", label: "Chauffeurs" },
  { value: "98%", label: "Satisfaction" },
];

// --- Services ---
const SERVICES = [
  {
    icon: Car,
    title: "Location & Vente de Véhicules",
    desc: "SUV, berlines, pick-ups et utilitaires disponibles à la location ou à la vente. Options avec ou sans chauffeur professionnel.",
    href: "/reservations?type=vehicule",
    cta: "Explorer",
    dark: true,
  },
  {
    img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    badge: "Immobilier",
    title: "Villas · Appartements · Terrains",
    desc: "Duplex, studios et locaux commerciaux à l'achat ou à la location.",
    href: "/reservations?type=immobilier",
    cta: "Voir les biens",
    dark: false,
  },
  {
    icon: UserCheck,
    title: "Chauffeurs Professionnels",
    desc: "Des chauffeurs expérimentés, formés et disponibles pour vos déplacements professionnels et personnels.",
    href: "/services#chauffeurs",
    cta: "En savoir plus",
    dark: true,
  },
];

// --- Featured offers ---
const VEHICLES = [
  {
    name: "Toyota Land Cruiser",
    city: "Abidjan",
    type: "SUV",
    img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80",
    tag: "Location",
    tagColor: "bg-[#1B5E20]",
    price: "85 000 FCFA",
    unit: "/ jour",
    cta: "Réserver",
    href: "/reservations?type=vehicule&id=v1",
    badge: null,
  },
  {
    name: "Mercedes Classe E",
    city: "Dakar",
    type: "Berline",
    img: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80",
    tag: "Location",
    tagColor: "bg-[#1B5E20]",
    badge: "Réservé",
    price: "95 000 FCFA",
    unit: "/ jour",
    cta: "Réserver",
    href: "/reservations?type=vehicule&id=v2",
  },
  {
    name: "Hyundai Tucson",
    city: "Lomé",
    type: "SUV",
    img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80",
    tag: "Vente",
    tagColor: "bg-[#DAA520]",
    price: "12 500 000 FCFA",
    unit: null,
    cta: "Rendez-vous",
    href: "/reservations?type=vehicule&id=v3",
    badge: null,
  },
  {
    name: "Toyota Hilux",
    city: "Cotonou",
    type: "Pick-up",
    img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80",
    tag: "Location",
    tagColor: "bg-[#1B5E20]",
    price: "55 000 FCFA",
    unit: "/ jour",
    cta: "Réserver",
    href: "/reservations?type=vehicule&id=v4",
    badge: null,
  },
];

// --- Testimonials ---
const TESTIMONIALS = [
  {
    name: "Kouassi Ama",
    role: "Chef d'entreprise · Abidjan",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80",
    text: "Service exceptionnel ! J'ai loué un Land Cruiser avec chauffeur pour un déplacement professionnel. Ponctuel, propre et très professionnel. Je recommande vivement TDA Platform.",
    stars: 5,
  },
  {
    name: "Mamadou Diallo",
    role: "Directeur Commercial · Dakar",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    text: "J'ai trouvé mon appartement idéal au Plateau grâce à TDA. Le processus de réservation est simple et l'équipe très réactive. Excellent service immobilier !",
    stars: 5,
  },
  {
    name: "Fatou Traoré",
    role: "Architecte · Lomé",
    img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&q=80",
    text: "La plateforme est intuitive et les biens proposés sont de qualité. J'ai visité plusieurs villas avant de trouver la parfaite. Merci à toute l'équipe TDA !",
    stars: 5,
  },
  {
    name: "Kofi Mensah",
    role: "Entrepreneur · Cotonou",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    text: "Très satisfait de la location de véhicule sans chauffeur. Le Hilux était en parfait état. Le contact WhatsApp facilite vraiment les échanges. Top !",
    stars: 4,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO CAROUSEL ─── */}
      <HeroCarousel />

      {/* ─── SERVICES ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#DAA520] text-xs font-semibold tracking-widest uppercase mb-2">
                Ce que nous offrons
              </p>
              <h2 className="text-4xl font-black text-gray-900">
                Nos Services
              </h2>
            </div>
            <Link
              href="/services"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-[#1B5E20] font-semibold hover:underline"
            >
              Voir tous les services <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card Véhicules */}
            <div className="bg-[#1B2E1A] rounded-2xl p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-[#DAA520]/20 rounded-xl flex items-center justify-center mb-5">
                  <Car size={24} className="text-[#DAA520]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Location &amp; Vente de Véhicules
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  SUV, berlines, pick-ups et utilitaires disponibles à la
                  location ou à la vente. Options avec ou sans chauffeur.
                </p>
              </div>
              <Link
                href="/reservations?type=vehicule"
                className="inline-flex items-center gap-1 text-[#DAA520] text-sm font-semibold mt-6 hover:gap-2 transition-all"
              >
                Explorer <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card Immobilier — avec image */}
            <div className="relative rounded-2xl overflow-hidden min-h-[280px] group">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-8 flex flex-col justify-between h-full min-h-[280px]">
                <div>
                  <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs rounded-full px-3 py-1 mb-4">
                    <Building2 size={12} /> Immobilier
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Villas · Appartements · Terrains
                  </h3>
                  <p className="text-gray-200 text-sm">
                    Duplex, studios et locaux commerciaux à l&apos;achat ou à
                    la location.
                  </p>
                </div>
                <Link
                  href="/reservations?type=immobilier"
                  className="inline-flex items-center gap-1 text-white text-sm font-semibold mt-6 hover:gap-2 transition-all"
                >
                  Voir les biens <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Card Chauffeurs */}
            <div className="bg-[#1B2E1A] rounded-2xl p-8 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-12 h-12 bg-[#DAA520]/20 rounded-xl flex items-center justify-center mb-5">
                  <UserCheck size={24} className="text-[#DAA520]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Chauffeurs
                  <br />
                  Professionnels
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Des chauffeurs expérimentés, formés et disponibles pour vos
                  déplacements professionnels et personnels.
                </p>
              </div>
              <Link
                href="/services#chauffeurs"
                className="inline-flex items-center gap-1 text-[#DAA520] text-sm font-semibold mt-6 hover:gap-2 transition-all"
              >
                En savoir plus <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATALOGUE ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#DAA520] text-xs font-semibold tracking-widest uppercase mb-2">
                Catalogue
              </p>
              <h2 className="text-4xl font-black text-gray-900">
                Nos Meilleures
                <br />
                Offres du Moment
              </h2>
            </div>
            <Link
              href="/reservations"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-[#1B5E20] font-semibold hover:underline"
            >
              Voir tout le catalogue <ChevronRight size={16} />
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-8">
            <button className="bg-[#1B5E20] text-white rounded-full px-5 py-2 text-sm font-semibold">
              Véhicules
            </button>
            <button className="bg-white text-gray-600 border border-gray-200 rounded-full px-5 py-2 text-sm hover:bg-gray-50 transition">
              Immobilier
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VEHICLES.map((v) => (
              <div
                key={v.name}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={v.img}
                    alt={v.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {v.badge && (
                      <span className="bg-orange-500 text-white text-xs rounded-full px-2.5 py-0.5 font-semibold">
                        {v.badge}
                      </span>
                    )}
                    <span
                      className={`${v.tagColor} text-white text-xs rounded-full px-2.5 py-0.5 font-semibold`}
                    >
                      {v.tag}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{v.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <span className="text-[#DAA520]">●</span>
                    {v.city} · {v.type}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-gray-900 text-sm">
                        {v.price}
                      </span>
                      {v.unit && (
                        <span className="text-gray-400 text-xs"> {v.unit}</span>
                      )}
                    </div>
                    <Link
                      href={v.href}
                      className="bg-[#1B5E20] text-white text-xs rounded-full px-4 py-1.5 font-semibold hover:bg-[#2E7D32] transition"
                    >
                      {v.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#DAA520] text-xs font-semibold tracking-widest uppercase mb-2">
              ★ Témoignages
            </p>
            <h2 className="text-4xl font-black text-gray-900">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              {TESTIMONIALS.slice(0, 2).map((t) => (
                <TestimonialCard key={t.name} {...t} />
              ))}
            </div>

            {/* Center image */}
            <div className="hidden md:block relative rounded-3xl overflow-hidden h-[420px]">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"
                alt="Clients satisfaits"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B5E20]/80 to-transparent" />
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <div className="text-white font-black text-2xl">
                  +2 000 clients
                </div>
                <div className="text-green-200 text-sm mt-1">
                  satisfaits à travers l&apos;Afrique de l&apos;Ouest
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              {TESTIMONIALS.slice(2).map((t) => (
                <TestimonialCard key={t.name} {...t} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-0">
        <div className="grid md:grid-cols-2">
          {/* Image half */}
          <div className="relative min-h-[300px]">
            <img
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80"
              alt="Réservez maintenant"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <p className="text-[#DAA520] text-xs font-semibold tracking-widest uppercase mb-3">
                  Passez à l&apos;action
                </p>
                <h3 className="text-4xl font-black leading-tight">
                  Réservez.
                  <br />
                  Conduisez.
                  <br />
                  Habitez.
                </h3>
              </div>
            </div>
          </div>

          {/* Text half */}
          <div className="bg-gray-50 flex items-center justify-center p-12">
            <div className="max-w-sm">
              <p className="text-[#1B5E20] text-xs font-semibold tracking-widest uppercase mb-2">
                TDA Platform
              </p>
              <h3 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
                Votre Prochaine Destination Commence Ici
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                Que vous cherchiez un véhicule pour vos déplacements ou un bien
                immobilier de prestige, TDA Platform vous accompagne à chaque
                étape.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/reservations"
                  className="inline-flex items-center gap-2 bg-[#1B5E20] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-[#2E7D32] transition"
                >
                  Commencer maintenant <ArrowRight size={16} />
                </Link>
                <a
                  href="https://wa.me/2250700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-green-500 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function TestimonialCard({
  name,
  role,
  img,
  text,
  stars,
}: {
  name: string;
  role: string;
  img: string;
  text: string;
  stars: number;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={img}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} size={12} className="fill-[#DAA520] text-[#DAA520]" />
        ))}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{text}&rdquo;</p>
    </div>
  );
}
