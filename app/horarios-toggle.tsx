"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
        className="flex items-center gap-2 mt-3"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#c6f135]" />
        <p className="text-white/70 text-[13px] font-medium">
          Jueves a domingos · 20 a 23 hs
        </p>
        <ChevronDown
          size={14}
          className={`text-white/50 transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto && (
        <div className="bg-[#1c1a17] rounded-xl px-4 py-3 mt-2 flex flex-col gap-1.5 w-56">
          {horarios.map((h) => (
            <div
              key={h.dia}
              className="flex items-center justify-between text-[12.5px]"
            >
              <span className="text-white/50">{h.dia}</span>
              <span
                className={h.abierto ? "text-white font-medium" : "text-white/30"}
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