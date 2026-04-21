import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, Send } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Nos Services" },
  { href: "/reservations", label: "Réservations" },
  { href: "/profil", label: "Mon Profil" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1B2E1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#DAA520] rounded-full flex items-center justify-center">
                <span className="text-white font-black text-xs">TDA</span>
              </div>
              <span className="font-bold text-lg">TDA Platform</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              La plateforme de référence pour la mobilité et l&apos;immobilier
              en Afrique de l&apos;Ouest.
            </p>
            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email..."
                className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-[#DAA520]"
              />
              <button className="bg-[#DAA520] rounded-full w-9 h-9 flex items-center justify-center hover:bg-yellow-600 transition shrink-0">
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#DAA520] shrink-0" />
                +225 07 00 00 00 00
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#DAA520] shrink-0" />
                contact@tda-platform.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-[#DAA520] shrink-0 mt-0.5" />
                <span>
                  Abidjan, Côte d&apos;Ivoire
                  <br />
                  Dakar, Sénégal
                </span>
              </li>
              <li>
                <a
                  href="https://wa.me/2250700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-green-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {[
              { icon: Facebook, href: "#" },
              { icon: Instagram, href: "#" },
              { icon: Twitter, href: "#" },
              { icon: Linkedin, href: "#" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            © 2026 TDA Platform. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition">
              Confidentialité
            </a>
            <a href="#" className="hover:text-white transition">
              CGU
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
