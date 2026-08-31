"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IconMenu, IconCarrito, IconInstagram } from "./icons";
import dynamic from "next/dynamic";
import { getCarrito } from "@/lib/carrito";
import Image from "next/image";
import EstadoBanner from "./estado-banner";

const Sidebar = dynamic(() => import("./sidebar"), { ssr: false });

type HeaderProps = {
  variante?: "oscura" | "clara";
  secciones?: string[];
};

export default function Header({ variante = "oscura", secciones = [] }: HeaderProps) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    function cargar() {
      const items = getCarrito();
      setCantidadCarrito(items.reduce((acc, i) => acc + i.cantidad, 0));
    }
    cargar();
    window.addEventListener("carrito-actualizado", cargar);
    return () => window.removeEventListener("carrito-actualizado", cargar);
  }, []);

  useEffect(() => {
    function onScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        tickingRef.current = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const esOscura = variante === "oscura";
  const colorTexto = esOscura ? "text-white/80" : "text-black/70";

  return (
    <>
      <Sidebar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        secciones={secciones}
      />

      {/* Header Unificado Fixed (Navbar + Banner de Estado) */}
      <header className="fixed top-0 inset-x-0 z-40 flex flex-col transition-all duration-200">
        <div
          className={`flex items-center justify-between px-5 pt-4 pb-3 transition-colors duration-300 ${
            scrolled
              ? "bg-[#141210]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              : "bg-gradient-to-b from-[#141210]/90 via-[#141210]/60 to-transparent"
          }`}
        >
          {/* Izquierda: menú */}
          <button
            type="button"
            onClick={() => setSidebarAbierto(true)}
            className={`${colorTexto} hover:text-white active:opacity-60 transition-opacity relative z-10 cursor-pointer p-1 -ml-1`}
            aria-label="Abrir menú"
          >
            <IconMenu size={20} />
          </button>

          {/* Centro: logo centrado */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" aria-label="Ir al inicio">
              <Image
                src="/micios_logo_white.svg"
                alt="Micio's"
                width={130}
                height={36}
                priority
                className="h-5.5 w-auto"
              />
            </Link>
          </div>

          {/* Derecha: Instagram + Carrito */}
          <div className="flex items-center gap-3.5 relative z-10">
            <a
              href="https://www.instagram.com/miciospizza/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${colorTexto} hover:text-white active:opacity-60 transition-opacity p-1`}
              aria-label="Ver Instagram"
            >
              <IconInstagram size={19} />
            </a>

            <Link
              href="/carrito"
              className={`relative ${colorTexto} hover:text-white p-1`}
              aria-label="Ver carrito"
            >
              <IconCarrito size={19} />
              {cantidadCarrito > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#c6f135] text-[#141210] text-[9.5px] font-black flex items-center justify-center leading-none">
                  {cantidadCarrito}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Banner de estado integrado suavemente debajo del navbar */}
        <EstadoBanner />
      </header>

      {/* Espaciador base para el contenido debajo */}
      <div className="h-[56px]" />
    </>
  );
}