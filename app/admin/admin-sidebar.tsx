"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const NAV = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/secciones", label: "Secciones" },
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
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-200 bg-white min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
          Admin
        </p>
        <p className="text-[17px] font-black text-gray-900 leading-none tracking-tight">
          Micio&apos;s
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">Pizzería · San Jorge</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ href, label }) => {
          const activo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                activo
                  ? "bg-[#c6f135]/15 text-[#4a5c00] font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activo ? "bg-[#7fa800]" : "bg-gray-300"
                }`}
              />
              {label}
            </Link>
          );
        })}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            Ver sitio público
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          disabled={saliendo}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {saliendo ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}

// Header mobile standalone (sin sidebar)
export function AdminMobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  const titulo =
    pathname.startsWith("/admin/secciones")
      ? "Secciones"
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
    <div className="md:hidden sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 leading-none">
          Admin · Micio&apos;s
        </p>
        <p className="text-[16px] font-bold text-gray-900 leading-tight">{titulo}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/productos"
          className={`text-[12px] px-2.5 py-1 rounded-md border text-gray-500 border-gray-200 ${
            pathname.startsWith("/admin/productos") ? "bg-[#c6f135]/15 border-[#c6f135]/40 text-[#4a5c00] font-semibold" : ""
          }`}
        >
          Productos
        </Link>
        <Link
          href="/admin/secciones"
          className={`text-[12px] px-2.5 py-1 rounded-md border text-gray-500 border-gray-200 ${
            pathname.startsWith("/admin/secciones") ? "bg-[#c6f135]/15 border-[#c6f135]/40 text-[#4a5c00] font-semibold" : ""
          }`}
        >
          Secciones
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={saliendo}
          className="text-[12px] px-2.5 py-1 rounded-md border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
