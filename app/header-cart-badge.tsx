"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
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
    <Link href="/carrito" className="relative">
      <ShoppingBag size={20} className="text-white/70" />
      {cantidad > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#c6f135] text-[#141210] text-[9px] font-black flex items-center justify-center">
          {cantidad}
        </span>
      )}
    </Link>
  );
}