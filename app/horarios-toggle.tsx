"use client";

import { useState, useEffect } from "react";
import { IconChevronDown, IconClose } from "./icons";

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

  // Bloquear scroll si el modal de horarios está abierto
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
      if (e.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* Botón trigger en el hero */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1.5 mt-3 active:opacity-75 transition-opacity"
        aria-label="Ver horarios de atención"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#c6f135]" />
        <span className="text-white/70 text-[13px] font-normal hover:text-white transition-colors">
          Jueves a domingos, 20 a 23 hs
        </span>
        <IconChevronDown
          size={13}
          strokeWidth={2}
          className="text-white/40"
        />
      </button>

      {/* Modal / Sheet de horarios: nunca empuja el hero ni corta el título */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <div
            className="relative w-full max-w-xs bg-[#1a1814] border border-white/[0.12] rounded-2xl p-5 shadow-2xl z-10"
            role="dialog"
            aria-label="Horarios de atención"
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-3">
              <div>
                <h3 className="text-white font-bold text-[16px] tracking-tight">
                  Horarios de atención
                </h3>
                <p className="text-white/40 text-[12px] mt-0.5">
                  Take away · Retiro en el local
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white/60 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <IconClose size={14} />
              </button>
            </div>

            {/* Lista de días */}
            <div className="flex flex-col divide-y divide-white/[0.05]">
              {horarios.map((h) => (
                <div
                  key={h.dia}
                  className="flex items-center justify-between text-[13px] py-2"
                >
                  <span className={h.abierto ? "text-white/80 font-medium" : "text-white/30"}>
                    {h.dia}
                  </span>
                  <span
                    className={
                      h.abierto
                        ? "text-white font-semibold"
                        : "text-white/25 text-[12px]"
                    }
                  >
                    {h.horario}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-1 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-[13px] font-medium transition-colors text-center"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}