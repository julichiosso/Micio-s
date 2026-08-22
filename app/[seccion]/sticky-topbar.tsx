"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { IconArrowLeft, IconSearch } from "@/app/icons";

export default function StickyTopbar({ nombreSeccion }: { nombreSeccion: string }) {
  const [scrolled, setScrolled] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 140);
        tickingRef.current = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 inset-x-0 z-40 px-5 pt-6 pb-3 flex items-center justify-between transition-all duration-300 ease-out ${
        scrolled
          ? "bg-[#141210]/90 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] pb-3.5"
          : "bg-transparent"
      }`}
    >
      <Link
        href="/"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white shrink-0 active:scale-90 transition-transform"
        aria-label="Volver al inicio"
      >
        <IconArrowLeft size={18} />
      </Link>

      {/* Título aparece centrado solo cuando está scrolleado */}
      <span
        className={`absolute left-1/2 -translate-x-1/2 text-white font-black text-[15px] tracking-tight transition-all duration-300 ease-out pointer-events-none ${
          scrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {nombreSeccion}
      </span>

      <Link
        href="/buscar"
        className={`w-9 h-9 flex items-center justify-center rounded-full text-white shrink-0 transition-all duration-300 active:scale-90 ${
          scrolled
            ? "bg-[#c6f135] text-[#141210] shadow-[0_0_0_4px_rgba(198,241,53,0.15)]"
            : "bg-white/15 backdrop-blur-sm"
        }`}
        aria-label="Buscar"
      >
        <IconSearch size={17} />
      </Link>
    </div>
  );
}