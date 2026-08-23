"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconCarrito } from "@/app/icons";
import { getCarrito } from "@/lib/carrito";

export default function CarritoIconoFlotante() {
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
    <Link
      href="/carrito"
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-[#141210] shadow-[0_2px_8px_rgba(0,0,0,0.15)] relative"
      aria-label="Ver carrito"
    >
      <IconCarrito size={17} />
      {cantidad > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c6f135] text-[#141210] text-[10px] font-black flex items-center justify-center leading-none">
          {cantidad}
        </span>
      )}
    </Link>
  );
}