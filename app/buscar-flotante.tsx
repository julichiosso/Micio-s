"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { IconSearch } from "./icons";

export default function BuscarFlotante() {
  const [visible, setVisible] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 420);
        tickingRef.current = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 z-30 flex justify-center pointer-events-none transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{
        // Se apila arriba del cart bar si está visible (variable publicada
        // por CarritoFlotante), y respeta el safe-area de iOS.
        bottom: "calc(1.5rem + env(safe-area-inset-bottom) + var(--cart-bar-height, 0px))",
      }}
    >
      <Link
        href="/buscar"
        className="pointer-events-auto flex items-center gap-2 bg-white text-[#141210] pl-4 pr-5 py-3 rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.25)] active:scale-95 transition-transform"
        aria-label="Buscar"
      >
        <IconSearch size={16} />
        <span className="text-[13.5px] font-bold">¿Qué pedís hoy?</span>
      </Link>
    </div>
  );
}