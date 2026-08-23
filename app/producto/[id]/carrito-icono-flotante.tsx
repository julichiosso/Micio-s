"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { IconCarrito } from "@/app/icons";
import { getCarrito } from "@/lib/carrito";

type Vuelo = {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
} | null;

export default function CarritoIconoFlotante() {
  const [cantidad, setCantidad] = useState(0);
  const [vuelo, setVuelo] = useState<Vuelo>(null);
  const iconoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    function cargar() {
      const items = getCarrito();
      setCantidad(items.reduce((acc, i) => acc + i.cantidad, 0));
    }
    cargar();
    window.addEventListener("carrito-actualizado", cargar);
    return () => window.removeEventListener("carrito-actualizado", cargar);
  }, []);

  useEffect(() => {
    function handleFly(e: Event) {
      const detail = (e as CustomEvent<{ x: number; y: number }>).detail;
      const destino = iconoRef.current?.getBoundingClientRect();
      if (!destino || !detail) return;

      setVuelo({
        startX: detail.x,
        startY: detail.y,
        deltaX: destino.left + destino.width / 2 - detail.x,
        deltaY: destino.top + destino.height / 2 - detail.y,
      });
    }
    window.addEventListener("fly-to-cart", handleFly);
    return () => window.removeEventListener("fly-to-cart", handleFly);
  }, []);

  return (
    <>
      <Link
        ref={iconoRef}
        href="/carrito"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#141210]/70 text-white backdrop-blur-sm relative"
        aria-label="Ver carrito"
      >
        <IconCarrito size={17} />
        {cantidad > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c6f135] text-[#141210] text-[9px] font-black flex items-center justify-center leading-none">
            {cantidad}
          </span>
        )}
      </Link>

      {/* Ícono clonado que "vuela" desde el botón de agregar hasta acá */}
      <AnimatePresence>
        {vuelo && (
          <motion.div
            className="fixed z-50 pointer-events-none w-8 h-8 rounded-full bg-[#c6f135] flex items-center justify-center text-[#141210]"
            style={{ left: vuelo.startX - 16, top: vuelo.startY - 16 }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: vuelo.deltaX, y: vuelo.deltaY, scale: 0.4, opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.32, 0, 0.67, 0] }}
            onAnimationComplete={() => setVuelo(null)}
          >
            <IconCarrito size={15} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}