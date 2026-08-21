"use client";

import { useState } from "react";
import { IconChevronDown } from "@/app/icons";

export function SeccionAcordeon({
  nombre,
  cantidad,
  children,
  inicialmenteAbierto = true,
}: {
  nombre: string;
  cantidad: number;
  children: React.ReactNode;
  inicialmenteAbierto?: boolean;
}) {
  const [abierto, setAbierto] = useState(inicialmenteAbierto);

  return (
    <div className="flex flex-col">
      {/* Cabecera interactiva y minimalista */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between py-2 px-2.5 -mx-1 rounded-xl active:bg-white/[0.04] transition-colors group select-none text-left cursor-pointer mb-2.5"
        aria-expanded={abierto}
        title={abierto ? `Minimizar ${nombre}` : `Desplegar ${nombre}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-white/50 group-hover:text-white/80 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors">
            {nombre}
          </span>
          <span className="bg-white/[0.07] text-white/40 group-hover:text-white/60 text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors">
            {cantidad}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-white/30 group-hover:text-white/60 transition-colors">
          <span className="text-[11px] font-normal hidden xs:inline">
            {abierto ? "Ocultar" : "Mostrar"}
          </span>
          <div
            className={`w-6 h-6 rounded-full bg-white/[0.05] group-hover:bg-white/[0.1] flex items-center justify-center transition-all duration-200 ${
              abierto ? "rotate-0 text-[#c6f135]/80" : "-rotate-90 text-white/40"
            }`}
          >
            <IconChevronDown size={13} strokeWidth={2.2} />
          </div>
        </div>
      </button>

      {/* Contenido colapsable */}
      {abierto ? (
        <div className="flex flex-col gap-3 transition-all duration-200">
          {children}
        </div>
      ) : (
        <div
          onClick={() => setAbierto(true)}
          className="border border-dashed border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-3 text-center cursor-pointer transition-colors"
        >
          <p className="text-white/30 text-[12px]">
            {cantidad} {cantidad === 1 ? "producto minimizado" : "productos minimizados"} · <span className="text-[#c6f135]/70 underline underline-offset-2">Tocar para desplegar</span>
          </p>
        </div>
      )}
    </div>
  );
}
