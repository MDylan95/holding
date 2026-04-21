"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const links = [
    {
      href: "/dashboard",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/dashboard/reservations",
      label: "Mes réservations",
      icon: Calendar,
    },
    { href: "/dashboard/favoris", label: "Mes favoris", icon: Heart },
    { href: "/dashboard/profil", label: "Mon profil", icon: User },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-20 left-4 z-40 md:hidden bg-[#1B5E20] text-white p-2 rounded-lg"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#1B2E1A] text-white pt-20 transition-transform duration-300 z-30 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 space-y-8">
          {/* User info */}
          <div className="border-b border-white/20 pb-6">
            <div className="w-12 h-12 bg-[#DAA520] rounded-full flex items-center justify-center mb-3">
              <span className="text-white font-black text-lg">
                {user?.first_name?.[0]}
              </span>
            </div>
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {links.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(href, exact)
                    ? "bg-[#DAA520] text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Back to site */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#DAA520] hover:bg-[#DAA520]/10 transition"
          >
            <Globe size={20} />
            <span className="text-sm font-medium">Retour au site</span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
