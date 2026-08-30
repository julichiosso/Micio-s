"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconClose } from "./icons";

type SidebarProps = {
  abierto: boolean;
  onCerrar: () => void;
  secciones: string[];
};

export default function Sidebar({ abierto, onCerrar, secciones }: SidebarProps) {
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [abierto]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCerrar]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          abierto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] z-50 bg-[#141210] flex flex-col transition-transform duration-200 ease-out ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Menú de navegación"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-white/[0.07]">
          <span
            className="text-white text-[18px] tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            MICIO&apos;S
          </span>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.08] text-white/60 active:bg-white/[0.14] transition-colors"
            aria-label="Cerrar menú"
          >
            <IconClose size={16} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col px-4 pt-4 gap-1 flex-1">
          <Link
            href="/"
            onClick={onCerrar}
            className="px-4 py-3.5 rounded-xl text-white/70 text-[15px] font-medium active:bg-white/[0.06] transition-colors hover:text-white"
          >
            Inicio
          </Link>
          {secciones.map((nombre) => (
            <Link
              key={nombre}
              href={`/${nombre.toLowerCase()}`}
              onClick={onCerrar}
              className="px-4 py-3.5 rounded-xl text-white/70 text-[15px] font-medium active:bg-white/[0.06] transition-colors hover:text-white"
            >
              {nombre}
            </Link>
          ))}

          {/* Encontranos */}
          <Link
            href="/#encontranos"
            onClick={onCerrar}
            className="px-4 py-3.5 rounded-xl text-white/70 text-[15px] font-medium active:bg-white/[0.06] transition-colors hover:text-white flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Encontranos
          </Link>
        </nav>

        {/* Footer del sidebar: info + acceso admin */}
        <div className="px-6 pb-8 border-t border-white/[0.07] pt-5 flex flex-col gap-3">
          <p className="text-white/25 text-[11px] leading-snug">
            Pedís acá, retirás en el local.
            <br />
            Pago en el local.
          </p>
        </div>
      </div>
    </>
  );
}
