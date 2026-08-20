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
  // Bloquear scroll del body cuando el sidebar está abierto
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCerrar]);

  return (
    <>
      {/* Overlay — tap para cerrar */}
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
        {/* Header del sidebar */}
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
        <nav className="flex flex-col px-4 pt-4 gap-1">
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
        </nav>

        {/* Footer del sidebar */}
        <div className="mt-auto px-6 pb-8 border-t border-white/[0.07] pt-5">
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
