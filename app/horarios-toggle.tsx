"use client";

import { useState } from "react";
import { IconChevronDown } from "./icons";

const horarios = [
  { dia: "Domingo", horario: "Cerrado", abierto: false },
  { dia: "Lunes", horario: "Cerrado", abierto: false },
  { dia: "Martes", horario: "Cerrado", abierto: false },
  { dia: "Miércoles", horario: "Cerrado", abierto: false },
  { dia: "Jueves", horario: "20:00 a 23:00", abierto: true },
  { dia: "Viernes", horario: "20:00 a 23:00", abierto: true },
  { dia: "Sábado", horario: "20:00 a 23:00", abierto: true },
];

export default function HorariosToggle() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div>
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-1.5 mt-2.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#c6f135]" />
        <p className="text-white/60 text-[13px] font-normal">
          Jueves a domingos, 20 a 23 hs
        </p>
        <IconChevronDown
          size={13}
          strokeWidth={2}
          className={`text-white/35 transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto && (
        <div className="bg-white/[0.06] rounded-xl px-4 py-3 mt-2.5 flex flex-col divide-y divide-white/[0.06] w-56">
          {horarios.map((h) => (
            <div
              key={h.dia}
              className="flex items-center justify-between text-[12.5px] py-1.5 first:pt-0 last:pb-0"
            >
              <span className="text-white/45 font-normal">{h.dia}</span>
              <span
                className={
                  h.abierto
                    ? "text-white/90 font-normal"
                    : "text-white/25 font-normal"
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