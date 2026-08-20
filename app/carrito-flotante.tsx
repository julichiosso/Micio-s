"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { getCarrito, getTotalCarrito, ItemCarrito } from "@/lib/carrito";

export default function CarritoFlotante() {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function cargar() {
      setItems(getCarrito());
    }
    cargar();
    window.addEventListener("carrito-actualizado", cargar);
    window.addEventListener("storage", cargar);
    return () => {
      window.removeEventListener("carrito-actualizado", cargar);
      window.removeEventListener("storage", cargar);
    };
  }, [pathname]);

  // No mostrar en el panel admin, ni en la página del carrito (ya está ahí),
  // ni si no hay items todavía.
  const ocultarEn = pathname.startsWith("/admin") || pathname === "/carrito";
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  if (ocultarEn || cantidadTotal === 0) return null;

  const total = getTotalCarrito(items);

  return (
    <button
      onClick={() => router.push("/carrito")}
      className="fixed bottom-4 left-4 right-4 z-50 bg-[#141210] text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.35)] active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#c6f135] flex items-center justify-center shrink-0 relative">
          <ShoppingBag size={16} className="text-[#141210]" />
          <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] rounded-full bg-white text-[#141210] text-[10px] font-black flex items-center justify-center">
            {cantidadTotal}
          </span>
        </div>
        <span className="font-bold text-[14px]">Ver pedido</span>
      </div>
      <span className="font-black text-[16px]">
        ${total.toLocaleString("es-AR")}
      </span>
    </button>
  );
}