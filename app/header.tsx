"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IconMenu, IconCarrito, IconInstagram } from "./icons";
import Sidebar from "./sidebar";
import { getCarrito } from "@/lib/carrito";
import Image from "next/image";

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
        setScrolled(window.scrollY > 30);
        tickingRef.current = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const esOscura = variante === "oscura";
  const colorTexto = esOscura ? "text-white/70" : "text-black/60";

  return (
    <>
      <Sidebar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        secciones={secciones}
      />

      {/* Espaciador: como el header pasa a fixed, el contenido de abajo
          necesita este hueco para no quedar tapado al cargar la página */}
      <div className="h-[60px]" />

      <div
        className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between px-5 pt-5 pb-3 transition-all duration-300 ease-out ${
          scrolled
            ? "bg-[#141210]/90 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        }`}
      >
        {/* Izquierda: menú */}
        <button
          onClick={() => setSidebarAbierto(true)}
          className={`${colorTexto} active:opacity-60 transition-opacity`}
          aria-label="Abrir menú"
        >
          <IconMenu size={20} />
        </button>

        {/* Centro: logo */}
        <Image
          src="/micios_logo_white.svg"
          alt="Micio's"
          width={140}
          height={40}
          priority
          className="h-6 w-auto"
        />

        {/* Derecha: instagram + carrito, agrupados */}
        <div className="flex items-center gap-4">
          
          <a  href="https://www.instagram.com/miciospizza/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${colorTexto} active:opacity-60 transition-opacity`}
            aria-label="Ver Instagram"
          >
            <IconInstagram size={20} />
          </a>

          <Link href="/carrito" className={`relative ${colorTexto}`} aria-label="Ver carrito">
            <IconCarrito size={20} />
            {cantidadCarrito > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#c6f135] text-[#141210] text-[9px] font-black flex items-center justify-center leading-none">
                {cantidadCarrito}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}