"use client";

import { useEffect, useState } from "react";

type EstadoData = {
  abierto: boolean;
  mensajePersonalizado: string | null;
  textoDemora?: string;
  horaApertura?: string;
  horaCierre?: string;
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
    const interval = setInterval(cargar, 25000);
    return () => {
      montado = false;
      clearInterval(interval);
    };
  }, []);

  if (!estado) return null;

  // 1. Si está cerrado
  if (!estado.abierto) {
    return (
      <div
        aria-label="Aviso de estado del local"
        className="w-full bg-red-950/85 border-b border-red-900/40 text-red-200 px-4 py-1.5 text-center text-[12px] font-medium backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
        <span className="truncate max-w-[90vw]">
          <strong className="font-bold text-white">Local cerrado</strong>
          {estado.mensajePersonalizado ? ` · ${estado.mensajePersonalizado}` : " en este momento"}
        </span>
      </div>
    );
  }

  // 2. Si está abierto y hay un mensaje o aviso
  if (estado.mensajePersonalizado) {
    return (
      <div
        aria-label="Aviso de estado del local"
        className="w-full bg-[#1c1a0e]/90 border-b border-[#c6f135]/20 text-[#e9f6b4] px-4 py-1.5 text-center text-[12px] font-medium backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#c6f135] shrink-0" />
        <span className="truncate max-w-[90vw]">
          <strong className="text-[#c6f135] font-bold">Aviso:</strong> {estado.mensajePersonalizado}
        </span>
      </div>
    );
  }

  return null;
}
