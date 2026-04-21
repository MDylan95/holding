"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Car, Building2, UserCheck } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "Votre Vie,",
    subtitle: "Votre Espace,",
    highlight: "Votre Liberté.",
    desc: "Location et vente de véhicules, biens immobiliers de prestige et chauffeurs professionnels — tout en un seul endroit pour le marché africain.",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80",
    ctas: [
      { label: "Explorer les Véhicules", href: "/reservations?type=vehicule", icon: Car },
      { label: "Voir les Biens", href: "/reservations?type=immobilier", icon: Building2 },
    ],
    tag: "Mobilité & Immobilier en Afrique",
  },
  {
    id: 2,
    title: "Mobilité",
    subtitle: "Sans",
    highlight: "Limites.",
    desc: "Découvrez notre flotte de véhicules premium : SUV, berlines, pick-ups et utilitaires. Location flexible avec ou sans chauffeur professionnel.",
    img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80",
    ctas: [
      { label: "Explorer les Véhicules", href: "/reservations?type=vehicule", icon: Car },
      { label: "Nos Services", href: "/services", icon: UserCheck },
    ],
    tag: "Location & Vente de Véhicules",
  },
  {
    id: 3,
    title: "Immobilier",
    subtitle: "De",
    highlight: "Prestige.",
    desc: "Villas, appartements et terrains dans les quartiers les plus prisés d'Afrique de l'Ouest. Visite virtuelle disponible sur demande.",
    img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80",
    ctas: [
      { label: "Voir les Biens", href: "/reservations?type=immobilier", icon: Building2 },
      { label: "Nos Services", href: "/services", icon: UserCheck },
    ],
    tag: "Gestion Immobilière",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplay]);

  const slide = SLIDES[current];

  const next = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
    setAutoplay(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setAutoplay(false);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden group">
      {/* Slides */}
      <div className="absolute inset-0">
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${s.img}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
        <p className="text-[#DAA520] text-sm font-semibold tracking-widest uppercase mb-4 animate-fade-in">
          {slide.tag}
        </p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 max-w-2xl animate-fade-in">
          {slide.title}
          <br />
          <span className="text-[#DAA520]">{slide.subtitle}</span>
          <br />
          {slide.highlight}
        </h1>
        <p className="text-gray-300 text-lg max-w-xl mb-10 leading-relaxed animate-fade-in">
          {slide.desc}
        </p>

        <div className="flex flex-wrap gap-4 mb-16 animate-fade-in">
          {slide.ctas.map((cta) => {
            const Icon = cta.icon;
            return (
              <Link
                key={cta.href}
                href={cta.href}
                className="inline-flex items-center gap-2 bg-[#1B5E20] text-white rounded-full px-7 py-3.5 font-semibold text-sm hover:bg-[#2E7D32] transition"
              >
                <Icon size={18} />
                {cta.label}
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 animate-fade-in">
          {[
            { value: "500+", label: "Véhicules" },
            { value: "1 200+", label: "Biens Immobiliers" },
            { value: "50+", label: "Chauffeurs" },
            { value: "98%", label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Slide précédent"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Slide suivant"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrent(idx);
              setAutoplay(false);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current
                ? "bg-[#DAA520] w-8"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
