"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pizza, CakeSlice, GlassWater, ChevronDown, Search, MapPin } from "lucide-react";

const secciones = [
  {
    slug: "pizzas",
    nombre: "Pizzas",
    descripcion: "Clásicas y de autor, al molde",
    Icono: Pizza,
    destacado: true,
  },
  {
    slug: "postres",
    nombre: "Postres",
    descripcion: "Para cerrar la noche",
    Icono: CakeSlice,
    destacado: false,
  },
  {
    slug: "bebidas",
    nombre: "Bebidas",
    descripcion: "Bien frías",
    Icono: GlassWater,
    destacado: false,
  },
];

const horarios = [
  { dia: "Domingo", horario: "Cerrado", abierto: false },
  { dia: "Lunes", horario: "Cerrado", abierto: false },
  { dia: "Martes", horario: "Cerrado", abierto: false },
  { dia: "Miércoles", horario: "Cerrado", abierto: false },
  { dia: "Jueves", horario: "20:00 a 23:00", abierto: true },
  { dia: "Viernes", horario: "20:00 a 23:00", abierto: true },
  { dia: "Sábado", horario: "20:00 a 23:00", abierto: true },
];

export default function HomePage() {
  const [horariosAbiertos, setHorariosAbiertos] = useState(false);

  return (
    <main className="min-h-screen bg-[#141210]">
      {/* Hero con video real del local */}
      <div className="relative h-[46vh] min-h-[340px] w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/50 to-[#141210]/20" />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-6 flex flex-col items-start">
          <div className="w-14 h-14 relative mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            <Image src="/logo.png" alt="Micio's" fill className="object-contain" />
          </div>
          <h1 className="text-white text-[34px] font-normal leading-[0.9] tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Pizza a la piedra,
            <br />
            hecha como se debe.
          </h1>

          {/* Horarios desplegables */}
          <button
            onClick={() => setHorariosAbiertos(!horariosAbiertos)}
            className="flex items-center gap-2 mt-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c6f135]" />
            <p className="text-white/70 text-[13px] font-medium">
              Jueves a domingos · 20 a 23 hs
            </p>
            <ChevronDown
              size={14}
              className={`text-white/50 transition-transform ${
                horariosAbiertos ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Desplegable de horarios completo */}
      {horariosAbiertos && (
        <div className="bg-[#1c1a17] px-6 py-4">
          <div className="flex flex-col gap-1.5">
            {horarios.map((h) => (
              <div
                key={h.dia}
                className="flex items-center justify-between text-[13px]"
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
        </div>
      )}

      {/* Panel con buscador + menú */}
      <div className="bg-[#f7f3ea] rounded-t-[28px] -mt-6 relative px-5 pt-6 pb-10 min-h-[54vh]">
        {/* Buscador */}
        <Link
          href="/buscar"
          className="flex items-center gap-3 bg-white rounded-full px-4 py-3 mb-6 border border-black/[0.06]"
        >
          <Search size={18} className="text-black/35 shrink-0" />
          <span className="text-black/35 text-[14px]">
            Buscar pizzas, postres, bebidas...
          </span>
        </Link>

        <p className="text-[13px] font-bold uppercase tracking-wider text-black/60 mb-4 px-1">
          Elegí qué pedir
        </p>

        <div className="flex flex-col gap-3 mb-8">
          {secciones.map((s) => {
            const Icono = s.Icono;
            return (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="group flex items-center gap-4 bg-[#141210] rounded-2xl p-4 pr-5 active:scale-[0.98] transition-transform"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                    s.destacado ? "bg-[#c6f135]" : "bg-white/[0.08]"
                  }`}
                >
                  <Icono
                    size={26}
                    strokeWidth={1.75}
                    className={s.destacado ? "text-[#141210]" : "text-white"}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-[18px] leading-tight">
                    {s.nombre}
                  </p>
                  <p className="text-white/45 text-[13px] mt-0.5">
                    {s.descripcion}
                  </p>
                </div>

                <span className="text-white/30 text-xl shrink-0 group-active:text-white/60">
                  ›
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.08] px-4 py-3.5">
          <MapPin size={18} className="text-black/40 shrink-0" />
          <p className="text-[12.5px] text-black/55 leading-snug">
            Pedís acá, confirmás por WhatsApp y retirás en el local. Pago en
            el local.
          </p>
        </div>
      </div>
    </main>
  );
}