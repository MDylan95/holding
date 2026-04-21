import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez TDA Platform. Notre équipe répond sous 24h ouvrées.",
};

const OFFICES = [
  {
    city: "Abidjan, Côte d'Ivoire",
    address: "Cocody, Rue des Jardins, Abidjan",
    phone: "+225 07 00 00 00 00",
    email: "abidjan@tda-platform.com",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80",
  },
  {
    city: "Dakar, Sénégal",
    address: "Plateau, Avenue Léopold Sédar Senghor, Dakar",
    phone: "+221 77 00 00 00 00",
    email: "dakar@tda-platform.com",
    img: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&q=80",
  },
];


export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1B2E1A] pt-32 pb-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-[#DAA520] text-xs font-semibold tracking-widest uppercase mb-3">
            Nous sommes là pour vous
          </p>
          <h1 className="text-5xl font-black mb-5">Contactez-nous</h1>
          <p className="text-gray-300 text-lg">
            Une question, une demande de devis ou besoin d&apos;informations ?
            Notre équipe vous répond dans les plus brefs délais.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Envoyez-nous un message
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Nous vous répondrons sous 24h ouvrées.
              </p>

              <ContactForm />
            </div>

            {/* Contact info */}
            <div className="space-y-6">
              {/* WhatsApp CTA */}
              <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Réponse instantanée
                  </p>
                  <p className="text-gray-500 text-xs">
                    Disponible 7j/7 sur WhatsApp
                  </p>
                </div>
                <a
                  href="https://wa.me/2250700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto bg-[#25D366] text-white text-xs rounded-full px-4 py-2 font-semibold hover:bg-green-500 transition shrink-0"
                >
                  Écrire
                </a>
              </div>

              {/* Offices */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Nos Bureaux</h3>
                <div className="space-y-4">
                  {OFFICES.map((office) => (
                    <div
                      key={office.city}
                      className="flex gap-4 border border-gray-100 rounded-2xl p-4 hover:border-[#1B5E20]/30 transition"
                    >
                      <img
                        src={office.img}
                        alt={office.city}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-sm text-gray-900">
                          {office.city}
                        </h4>
                        <p className="flex items-start gap-1.5 text-xs text-gray-500">
                          <MapPin size={12} className="text-[#DAA520] mt-0.5 shrink-0" />
                          {office.address}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone size={12} className="text-[#DAA520] shrink-0" />
                          {office.phone}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail size={12} className="text-[#DAA520] shrink-0" />
                          {office.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
