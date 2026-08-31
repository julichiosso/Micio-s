"use client";

import { useEffect, useState } from "react";

type EstadoData = {
  abierto: boolean;
  mensajePersonalizado: string | null;
  textoDemora?: string;
};

export default function EstadoBanner() {
  const [estado, setEstado] = useState<EstadoData | null>(null);

  useEffect(() => {
    let montado = true;
    async function cargar() {
      try {
        const res = await fetch("/api/estado-turno");
        if (res.ok) {
          const data = await res.json();
          if (montado) setEstado(data);
        }
      } catch (err) {
        console.error("Error al cargar banner de estado:", err);
      }
    }
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => {
      montado = false;
      clearInterval(interval);
    };
  }, []);

  if (!estado) return null;

  // Si está cerrado, mostrar banner de cerrado
  if (!estado.abierto) {
    return (
      <aside aria-label="Aviso de estado del local" className="bg-red-950/90 border-b border-red-800/60 text-red-200 px-4 py-2 text-center text-[12.5px] font-medium backdrop-blur-sm sticky top-[60px] z-30 animate-in fade-in flex items-center justify-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          <strong className="font-bold">Local Cerrado:</strong>{" "}
          {estado.mensajePersonalizado || "En este momento no estamos tomando pedidos."}
        </span>
      </aside>
    );
  }

  // Si está abierto y hay un mensaje personalizado (ej: demora, lluvia)
  if (estado.mensajePersonalizado) {
    return (
      <aside aria-label="Aviso de estado del local" className="bg-[#24210a]/90 border-b border-[#c6f135]/30 text-[#f5ffd1] px-4 py-2 text-center text-[12.5px] font-medium backdrop-blur-sm sticky top-[60px] z-30 animate-in fade-in flex items-center justify-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#c6f135]">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>
          <strong className="text-[#c6f135] font-bold">Aviso:</strong>{" "}
          {estado.mensajePersonalizado}
        </span>
      </aside>
    );
  }

  return null;
}
