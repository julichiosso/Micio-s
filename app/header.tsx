"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMenu, IconCarrito } from "./icons";
import Sidebar from "./sidebar";
import { useEffect } from "react";
import { getCarrito } from "@/lib/carrito";
import Image from "next/image";

type HeaderProps = {
  /** Variante oscura (sobre video/fondo oscuro) o clara (sobre fondo claro) */
  variante?: "oscura" | "clara";
  /** Nombres de secciones para el sidebar */
  secciones?: string[];
};

export default function Header({ variante = "oscura", secciones = [] }: HeaderProps) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  useEffect(() => {
    function cargar() {
      const items = getCarrito();
      setCantidadCarrito(items.reduce((acc, i) => acc + i.cantidad, 0));
    }
    cargar();
    window.addEventListener("carrito-actualizado", cargar);
    return () => window.removeEventListener("carrito-actualizado", cargar);
  }, []);

  const esOscura = variante === "oscura";
  const colorTexto = esOscura ? "text-white/70" : "text-black/60";
  const colorMarca = esOscura ? "text-white" : "text-black";

  return (
    <>
      <Sidebar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        secciones={secciones}
      />

      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <button
          onClick={() => setSidebarAbierto(true)}
          className={`${colorTexto} active:opacity-60 transition-opacity`}
          aria-label="Abrir menú"
        >
          <IconMenu size={20} />
        </button>

        <Image
          src="/micios_logo_white.svg"
          alt="Micio's"
          width={140}
          height={40}
          priority
          className="h-6 w-auto"
        />

        <Link href="/carrito" className={`relative ${colorTexto}`} aria-label="Ver carrito">
          <IconCarrito size={20} />
          {cantidadCarrito > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#c6f135] text-[#141210] text-[9px] font-black flex items-center justify-center leading-none">
              {cantidadCarrito}
            </span>
          )}
        </Link>
      </div>
    </>
  );
}
