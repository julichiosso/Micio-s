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
      <aside aria-label="Aviso de estado del local" className="bg-red-950/80 border-b border-red-800/60 text-red-200 px-4 py-2 text-center text-[12.5px] font-medium backdrop-blur-sm sticky top-[60px] z-30 animate-in fade-in">
        <span className="font-bold">⚠️ Local Cerrado:</span>{" "}
        {estado.mensajePersonalizado ||
          "En este momento no estamos tomando pedidos."}
      </aside>
    );
  }

  // Si está abierto y hay un mensaje personalizado (ej: demora, lluvia)
  if (estado.mensajePersonalizado) {
    return (
      <aside aria-label="Aviso de estado del local" className="bg-[#24210a]/90 border-b border-[#c6f135]/30 text-[#f5ffd1] px-4 py-2 text-center text-[12.5px] font-medium backdrop-blur-sm sticky top-[60px] z-30 animate-in fade-in">
        <span className="text-[#c6f135] font-bold">📢 Aviso:</span>{" "}
        {estado.mensajePersonalizado}
      </aside>
    );
  }

  return null;
}
