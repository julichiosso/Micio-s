"use client";

import { useState } from "react";

export default function MapaLazy() {
  const [cargarMapa, setCargarMapa] = useState(false);

  if (cargarMapa) {
    return (
      <iframe
        src="https://maps.google.com/maps?q=Mendoza+1480,+San+Jorge,+Santa+Fe,+Argentina&output=embed&z=16"
        width="100%"
        height="100%"
        style={{
          border: 0,
          filter: "invert(92%) hue-rotate(180deg) grayscale(15%) contrast(90%)",
        }}
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación Micio's Pizzería"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setCargarMapa(true)}
      className="w-full h-full flex flex-col items-center justify-center gap-2 bg-black/[0.04] active:bg-black/[0.08] transition-colors"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-black/50">
        <path
          d="M12 21s-7-6.4-7-11.5A7 7 0 0 1 19 9.5C19 14.6 12 21 12 21z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span className="text-black/60 text-[13px] font-medium">Ver mapa</span>
    </button>
  );
}