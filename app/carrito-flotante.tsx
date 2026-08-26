"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconCarrito } from "./icons";
import { getCarrito, getTotalCarrito, ItemCarrito } from "@/lib/carrito";

export default function CarritoFlotante() {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const barRef = useRef<HTMLButtonElement>(null);

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

  const ocultarEn =
    pathname.startsWith("/admin") ||
    pathname === "/carrito" ||
    pathname.startsWith("/producto/");

  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
  const visible = !ocultarEn && cantidadTotal > 0;

  // Publica la altura real de esta barra (o 0 si no está) en una variable
  // CSS global, así otros elementos flotantes (ej. el buscador) pueden
  // apilarse arriba sin necesitar conocerse entre sí directamente.
  useEffect(() => {
    function actualizarAltura() {
      const alto = visible && barRef.current ? barRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty(
        "--cart-bar-height",
        alto > 0 ? `${alto + 12}px` : "0px" // +12 = separación entre ambos
      );
    }
    actualizarAltura();
    window.addEventListener("resize", actualizarAltura);
    return () => window.removeEventListener("resize", actualizarAltura);
  }, [visible, cantidadTotal]);

  if (!visible) return null;

  const total = getTotalCarrito(items);

  return (
    <button
      ref={barRef}
      onClick={() => router.push("/carrito")}
      className="fixed left-4 right-4 z-30 bg-[#141210] text-white rounded-2xl px-5 py-4 flex items-center justify-between border border-white/[0.08] active:scale-[0.98] transition-transform"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      aria-label={`Ver pedido — $${total.toLocaleString("es-AR")}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#c6f135] flex items-center justify-center shrink-0 relative">
          <IconCarrito size={16} className="text-[#141210]" />
          <span
            key={cantidadTotal}
            className="animate-pop-badge absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-white text-[#141210] text-[10px] font-black flex items-center justify-center leading-none"
          >
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