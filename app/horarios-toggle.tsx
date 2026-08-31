"use client";

import { useState, useRef, useEffect } from "react";
import { IconChevronDown } from "./icons";

const horarios = [
  { dia: "Lunes", horario: "Cerrado", abierto: false },
  { dia: "Martes", horario: "Cerrado", abierto: false },
  { dia: "Miércoles", horario: "Cerrado", abierto: false },
  { dia: "Jueves", horario: "20:00 a 23:00", abierto: true },
  { dia: "Viernes", horario: "20:00 a 23:00", abierto: true },
  { dia: "Sábado", horario: "20:00 a 23:00", abierto: true },
  { dia: "Domingo", horario: "20:00 a 23:00", abierto: true },
];

export default function HorariosToggle() {
  const [abierto, setAbierto] = useState(false);
  const [localAbierto, setLocalAbierto] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkEstado() {
      try {
        const res = await fetch("/api/estado-turno");
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.abierto === "boolean") {
            setLocalAbierto(data.abierto);
          }
        }
      } catch (e) {
        // Fallback silencioso
      }
    }
    checkEstado();
  }, []);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    }
    if (abierto) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [abierto]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div ref={containerRef} className="relative mt-2.5">
      {/* Botón trigger */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-1.5 active:opacity-75 transition-opacity select-none"
        aria-expanded={abierto}
        aria-label="Desplegar horarios de atención"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            localAbierto ? "bg-[#c6f135]" : "bg-red-500"
          }`}
        />
        <span className="text-white/70 text-[13px] font-normal hover:text-white transition-colors">
          {localAbierto ? "Jueves a domingos, 20 a 23 hs" : "Cerrado en este momento"}
        </span>
        <IconChevronDown
          size={13}
          strokeWidth={2}
          className={`text-white/40 transition-transform duration-200 ${
            abierto ? "rotate-180 text-white/80" : ""
          }`}
        />
      </button>

      {/* Popover flotante en el lugar: posicionado absolutamente debajo del botón,
          sin alterar el flujo de la página ni empujar el título hacia arriba */}
      {abierto && (
        <div className="absolute top-full left-0 mt-2.5 w-60 bg-[#1a1814] border border-white/[0.12] rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.8)] z-30 flex flex-col divide-y divide-white/[0.06] animate-in fade-in zoom-in-95 duration-150">
          {horarios.map((h) => (
            <div
              key={h.dia}
              className="flex items-center justify-between text-[12.5px] py-1.5 first:pt-0 last:pb-0"
            >
              <span className={h.abierto ? "text-white/70 font-medium" : "text-white/30"}>
                {h.dia}
              </span>
              <span
                className={
                  h.abierto
                    ? "text-white font-semibold"
                    : "text-white/20 text-[11.5px]"
                }
              >
                {h.horario}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}