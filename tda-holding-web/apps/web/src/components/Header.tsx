"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Nos Services" },
  { href: "/reservations", label: "Réservations" },
  { href: "/profil", label: "Profil" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[#DAA520] rounded-full flex items-center justify-center">
            <span className="text-white font-black text-xs">TDA</span>
          </div>
          <span className="text-white font-bold text-sm hidden sm:block">
            TDA Platform
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? "text-[#DAA520] font-semibold"
                  : scrolled
                  ? "text-gray-600 hover:text-gray-900"
                  : "text-white hover:text-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/profil"
            className={`text-sm rounded-full px-4 py-1.5 transition font-semibold ${
              scrolled
                ? "text-gray-600 border border-gray-300 hover:bg-gray-50"
                : "text-white border border-white/40 hover:bg-white/10"
            }`}
          >
            Connexion
          </Link>
          <Link
            href="/reservations"
            className="text-sm bg-[#1B5E20] text-white rounded-full px-5 py-1.5 hover:bg-[#2E7D32] transition font-semibold"
          >
            Réserver
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className={`md:hidden p-2 transition-colors ${
            scrolled ? "text-gray-900" : "text-white"
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className={`md:hidden border-t px-4 py-4 flex flex-col gap-4 ${
            scrolled
              ? "bg-white border-gray-100"
              : "bg-[#1B2E1A]/95 border-white/10"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-sm ${
                pathname === link.href
                  ? "text-[#DAA520] font-semibold"
                  : scrolled
                  ? "text-gray-600"
                  : "text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              href="/profil"
              onClick={() => setOpen(false)}
              className={`flex-1 text-sm text-center rounded-full py-2 transition ${
                scrolled
                  ? "text-gray-600 border border-gray-300 hover:bg-gray-50"
                  : "text-white border border-white/40 hover:bg-white/10"
              }`}
            >
              Connexion
            </Link>
            <Link
              href="/reservations"
              onClick={() => setOpen(false)}
              className="flex-1 text-sm text-center bg-[#1B5E20] text-white rounded-full py-2 font-semibold hover:bg-[#2E7D32] transition"
            >
              Réserver
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
