"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const NAV = [
  {
    href: "/admin/turnos",
    label: "Horarios y Pedidos",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    href: "/admin/secciones",
    label: "Categorías",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function handleLogout() {
    setSaliendo(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-gray-200 bg-white min-h-screen sticky top-0">
      {/* Brand Header */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <p className="text-[20px] font-black text-gray-900 leading-none tracking-tight">
          Micio&apos;s
        </p>
        <p className="text-[12px] text-gray-400 mt-1 font-medium">Panel de administración</p>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-3.5 py-4 flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-1">
          Operación y Catálogo
        </p>

        {NAV.map(({ href, label, icon }) => {
          const activo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all ${
                activo
                  ? "bg-[#c6f135]/20 text-[#3e4d00] shadow-sm font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className={activo ? "text-[#5e7700]" : "text-gray-400"}>
                {icon}
              </span>
              <span>{label}</span>
              {activo && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7fa800]" />
              )}
            </Link>
          );
        })}

        {/* Acceso Rápido al Menú de Clientes */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-1">
            Accesos directos
          </p>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Ver menú público</span>
            <span className="ml-auto text-gray-400 text-[11px]">↗</span>
          </Link>
        </div>
      </nav>

      {/* Botón Logout */}
      <div className="px-3.5 pb-5 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          disabled={saliendo}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{saliendo ? "Cerrando..." : "Cerrar sesión"}</span>
        </button>
      </div>
    </aside>
  );
}

// Header mobile para celulares
export function AdminMobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  const titulo =
    pathname.startsWith("/admin/turnos")
      ? "Horarios"
      : pathname.startsWith("/admin/secciones")
      ? "Categorías"
      : pathname.startsWith("/admin/productos")
      ? "Productos"
      : "Admin";

  async function handleLogout() {
    setSaliendo(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-2.5 flex items-center justify-between shadow-sm">
      <div className="min-w-0 pr-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none truncate">
          Micio&apos;s
        </p>
        <p className="text-[16px] font-black text-gray-900 leading-tight mt-0.5 truncate">
          {titulo}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href="/admin/turnos"
          className={`text-[11.5px] px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
            pathname.startsWith("/admin/turnos")
              ? "bg-[#c6f135]/25 border-[#c6f135] text-[#3e4d00]"
              : "border-gray-200 text-gray-600 bg-white"
          }`}
        >
          Horarios
        </Link>
        <Link
          href="/admin/productos"
          className={`text-[11.5px] px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
            pathname.startsWith("/admin/productos")
              ? "bg-[#c6f135]/25 border-[#c6f135] text-[#3e4d00]"
              : "border-gray-200 text-gray-600 bg-white"
          }`}
        >
          Productos
        </Link>
        <Link
          href="/admin/secciones"
          className={`text-[11.5px] px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
            pathname.startsWith("/admin/secciones")
              ? "bg-[#c6f135]/25 border-[#c6f135] text-[#3e4d00]"
              : "border-gray-200 text-gray-600 bg-white"
          }`}
        >
          Categorías
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={saliendo}
          className="text-[11px] px-2 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50 font-medium"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
