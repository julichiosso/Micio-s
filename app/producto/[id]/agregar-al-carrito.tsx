"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { IconCarrito } from "@/app/icons";
import { agregarItemAlCarrito } from "@/lib/carrito";
import { useRef } from "react"; // sumalo al import existente de "react"

type Opcion = {
  tamanio: string;
  label: string;
  precio: number;
};

export default function AgregarAlCarrito({
  producto,
  opciones,
}: {
  producto: { id: number; nombre: string };
  opciones: Opcion[];
}) {
  const [seleccion, setSeleccion] = useState<Opcion>(opciones[0]);
  const [agregado, setAgregado] = useState(false);
  const router = useRouter();
  const iconoAgregarRef = useRef<HTMLSpanElement>(null);
  function handleAgregar() {
  const rect = iconoAgregarRef.current?.getBoundingClientRect();
  if (rect) {
    window.dispatchEvent(
      new CustomEvent("fly-to-cart", {
        detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      })
    );
  }

  agregarItemAlCarrito({
    productoId: producto.id,
    nombre: producto.nombre,
    tamanio: seleccion.tamanio,
    label: seleccion.label,
    precio: seleccion.precio,
    cantidad: 1,
  });
  setAgregado(true);
  setTimeout(() => setAgregado(false), 1500);
}

  const soloUnTamanio = opciones.length === 1;

  return (
    <div>
      {!soloUnTamanio && (
        <>
          <p className="text-[11px] uppercase tracking-wider text-black/40 mb-2.5">
            Elegí el tamaño
          </p>
          <div className="flex flex-col gap-2 mb-6">
            {opciones.map((op) => {
              const activo = op.tamanio === seleccion.tamanio;
              return (
                <button
                  key={op.tamanio}
                  onClick={() => setSeleccion(op)}
                  className="relative flex items-center justify-between rounded-xl px-4 py-3.5 text-left overflow-hidden"
                >
                  {/* Fondo animado: se desliza de un botón a otro en vez de "saltar" */}
                  {activo && (
                    <motion.div
                      layoutId="fondo-tamanio-seleccionado"
                      className="absolute inset-0 bg-[#141210]"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  {/* Fondo estático de fallback cuando no está activo */}
                  {!activo && (
                    <div className="absolute inset-0 bg-white" />
                  )}

                  <span
                    className={`relative z-10 font-semibold text-[14px] transition-colors duration-150 ${
                      activo ? "text-white" : "text-black"
                    }`}
                  >
                    {op.label}
                  </span>
                  <span
                    className={`relative z-10 font-bold text-[14px] transition-colors duration-150 ${
                      activo ? "text-white" : "text-black"
                    }`}
                  >
                    ${op.precio.toLocaleString("es-AR")}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {soloUnTamanio && (
        <p className="text-2xl font-black text-black mb-6">
          ${opciones[0].precio.toLocaleString("es-AR")}
        </p>
      )}

      {/* Barra fija inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f7f3ea] border-t border-black/[0.08] p-4 flex gap-3 z-20">
        <motion.button
          onClick={handleAgregar}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex-1 flex items-center justify-center gap-2 bg-[#141210] text-white rounded-full py-3.5 font-bold text-[15px] overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            {agregado ? (
              <motion.span
                key="agregado"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="flex items-center gap-2"
              >
                Agregado ✓
              </motion.span>
            ) : (
              <motion.span
                key="agregar"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="flex items-center gap-2"
              >
                <span ref={iconoAgregarRef}>
  <IconCarrito size={17} />
</span>
Agregar al pedido
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          onClick={() => router.push("/carrito")}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="px-5 rounded-full border border-black/15 text-black font-semibold text-[14px]"
        >
          Ver pedido
        </motion.button>
      </div>
    </div>
  );
}