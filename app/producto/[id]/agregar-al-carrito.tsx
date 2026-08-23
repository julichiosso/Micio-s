"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { IconPlus, IconMinus } from "@/app/icons";
import { agregarItemAlCarrito } from "@/lib/carrito";

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
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const router = useRouter();

  function handleAgregar() {
    agregarItemAlCarrito({
      productoId: producto.id,
      nombre: producto.nombre,
      tamanio: seleccion.tamanio,
      label: seleccion.label,
      precio: seleccion.precio,
      cantidad,
    });
    setAgregado(true);
    setCantidad(1);
    setTimeout(() => setAgregado(false), 900);
  }

  const soloUnTamanio = opciones.length === 1;
  const subtotal = seleccion.precio * cantidad;

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
                  {activo && (
                    <motion.div
                      layoutId="fondo-tamanio-seleccionado"
                      className="absolute inset-0 bg-[#141210]"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  {!activo && <div className="absolute inset-0 bg-white" />}

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

      {/* Stepper de cantidad */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-24 border border-black/[0.06]">
        <span className="text-[13px] font-semibold text-black/60">Cantidad</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            disabled={cantidad <= 1}
            className="w-8 h-8 rounded-full bg-black/[0.06] flex items-center justify-center text-black disabled:opacity-30 active:scale-90 transition-transform"
            aria-label="Restar"
          >
            <IconMinus size={14} />
          </button>

          <div className="w-6 overflow-hidden h-6 relative">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={cantidad}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
                className="absolute inset-0 flex items-center justify-center font-bold text-[15px] text-black"
              >
                {cantidad}
              </motion.span>
            </AnimatePresence>
          </div>

          <button
            onClick={() => setCantidad((c) => Math.min(20, c + 1))}
            className="w-8 h-8 rounded-full bg-[#141210] flex items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Sumar"
          >
            <IconPlus size={14} />
          </button>
        </div>
      </div>

      {/* Barra fija inferior */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#f7f3ea] border-t border-black/[0.08] px-4 pt-4 flex gap-3 z-20"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <motion.button
          onClick={handleAgregar}
          whileTap={{ scale: 0.97 }}
          animate={{ backgroundColor: agregado ? "#c6f135" : "#141210" }}
          transition={{ duration: 0.25 }}
          className="flex-1 rounded-full py-3.5 font-bold text-[15px]"
          style={{ color: agregado ? "#141210" : "#ffffff" }}
        >
          {agregado ? "Agregado" : `Agregar · $${subtotal.toLocaleString("es-AR")}`}
        </motion.button>

        <motion.button
          onClick={() => router.push("/carrito")}
          whileTap={{ scale: 0.97 }}
          className="px-5 rounded-full border border-black/15 text-black font-semibold text-[14px]"
        >
          Ver pedido
        </motion.button>
      </div>
    </div>
  );
}