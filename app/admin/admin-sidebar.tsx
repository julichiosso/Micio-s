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

// Header mobile para celulares: Espacioso, cómodo y nativo
export function AdminMobileHeader({ currentPath }: { currentPath?: string }) {
  const routerPath = usePathname();
  const pathname = currentPath || routerPath || "";
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
    <div
      suppressHydrationWarning
      className="md:hidden sticky top-0 z-20 bg-[#141210]/95 backdrop-blur-md border-b border-white/[0.1] px-4 pt-3.5 pb-3 flex flex-col gap-2.5 shadow-sm"
    >
      {/* Fila superior: Logo Admin + Ver Web + Salir */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-black text-white tracking-tight">
            Micio&apos;s
          </span>
          <span className="text-[10.5px] font-bold text-white/40 uppercase tracking-widest bg-white/[0.06] px-2 py-0.5 rounded-md">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="text-[12px] font-bold text-[#c6f135] bg-[#c6f135]/15 hover:bg-[#c6f135]/25 border border-[#c6f135]/30 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors active:scale-95"
          >
            Ver web ↗
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={saliendo}
            className="text-[12px] font-medium text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {saliendo ? "..." : "Salir"}
          </button>
        </div>
      </div>

      {/* Fila inferior: Segmented Tabs con área táctil cómoda */}
      <nav className="grid grid-cols-3 gap-1.5 bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
        <Link
          href="/admin/turnos"
          className={`text-[12.5px] font-bold py-2 rounded-xl text-center transition-all flex items-center justify-center min-h-[38px] ${
            pathname.startsWith("/admin/turnos")
              ? "bg-[#c6f135] text-[#141210] shadow-sm"
              : "text-white/60 hover:text-white active:bg-white/[0.08]"
          }`}
        >
          Horarios
        </Link>
        <Link
          href="/admin/productos"
          className={`text-[12.5px] font-bold py-2 rounded-xl text-center transition-all flex items-center justify-center min-h-[38px] ${
            pathname.startsWith("/admin/productos")
              ? "bg-[#c6f135] text-[#141210] shadow-sm"
              : "text-white/60 hover:text-white active:bg-white/[0.08]"
          }`}
        >
          Productos
        </Link>
        <Link
          href="/admin/secciones"
          className={`text-[12.5px] font-bold py-2 rounded-xl text-center transition-all flex items-center justify-center min-h-[38px] ${
            pathname.startsWith("/admin/secciones")
              ? "bg-[#c6f135] text-[#141210] shadow-sm"
              : "text-white/60 hover:text-white active:bg-white/[0.08]"
          }`}
        >
          Categorías
        </Link>
      </nav>
    </div>
  );
}
