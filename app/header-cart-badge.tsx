"use client";

// Este componente está en desuso — el nuevo <Header> integra el carrito directamente.
// Se mantiene por compatibilidad hasta que todas las páginas migren al nuevo Header.

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconCarrito } from "./icons";
import { getCarrito } from "@/lib/carrito";

export default function HeaderCartBadge() {
  const [cantidad, setCantidad] = useState(0);

  useEffect(() => {
    function cargar() {
      const items = getCarrito();
      setCantidad(items.reduce((acc, i) => acc + i.cantidad, 0));
    }
    cargar();
    window.addEventListener("carrito-actualizado", cargar);
    return () => window.removeEventListener("carrito-actualizado", cargar);
  }, []);

  return (
    <Link href="/carrito" className="relative text-white/70" aria-label="Ver carrito">
      <IconCarrito size={20} />
      {cantidad > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#c6f135] text-[#141210] text-[9px] font-black flex items-center justify-center">
          {cantidad}
        </span>
      )}
    </Link>
  );
}