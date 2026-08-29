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

type OpcionCombo = {
  productoId: number;
  nombre: string;
  precio: number;
};

export default function AgregarAlCarrito({
  producto,
  opciones,
  opcionesCombo,
}: {
  producto: { id: number; nombre: string };
  opciones: Opcion[];
  // Para tamaños "media_*": lista de otras pizzas disponibles para la otra mitad
  opcionesCombo?: Record<string, OpcionCombo[]>;
}) {
  const [seleccion, setSeleccion] = useState<Opcion>(opciones[0]);
  const [otraMitad, setOtraMitad] = useState<OpcionCombo | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const router = useRouter();

  const esMedia = seleccion.tamanio.startsWith("media_");
  const listaCombo = opcionesCombo?.[seleccion.tamanio] ?? [];

  // Opción para completar con la misma pizza (mitad y mitad iguales = entera)
  const opcionMismaPizza: OpcionCombo = {
    productoId: producto.id,
    nombre: producto.nombre,
    precio: seleccion.precio,
  };

  function handleSeleccionarTamanio(op: Opcion) {
    setSeleccion(op);
    setOtraMitad(null); // resetea la mitad elegida al cambiar de tamaño
  }

  function handleAgregar() {
    if (esMedia && !otraMitad) return; // no debería poder llegar acá sin elegir

    const esComboConsigoMisma = otraMitad?.productoId === producto.id;

    agregarItemAlCarrito({
      productoId: producto.id,
      nombre: esMedia && !esComboConsigoMisma
        ? `${producto.nombre} + ${otraMitad!.nombre}`
        : producto.nombre,
      tamanio: seleccion.tamanio,
      label: seleccion.label,
      precio: esMedia ? seleccion.precio + (otraMitad?.precio ?? 0) : seleccion.precio,
      cantidad,
      combo:
        esMedia && otraMitad && !esComboConsigoMisma
          ? { productoId: otraMitad.productoId, nombre: otraMitad.nombre }
          : undefined,
    });
    setAgregado(true);
    setCantidad(1);
    setOtraMitad(null);
    setTimeout(() => setAgregado(false), 900);
  }

  const soloUnTamanio = opciones.length === 1;
  const subtotal = esMedia
    ? (seleccion.precio + (otraMitad?.precio ?? 0)) * cantidad
    : seleccion.precio * cantidad;

  const puedeAgregar = !esMedia || otraMitad !== null;

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
                  onClick={() => handleSeleccionarTamanio(op)}
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

      {soloUnTamanio && !esMedia && (
        <p className="text-2xl font-black text-black mb-6">
          ${opciones[0].precio.toLocaleString("es-AR")}
        </p>
      )}

      {/* Selector de la otra mitad — obligatorio si el tamaño elegido es "media" */}
      {esMedia && (
        <>
          <p className="text-[11px] uppercase tracking-wider text-black/40 mb-2.5">
            Elegí la otra mitad
          </p>
          <div className="flex flex-col gap-2 mb-6 max-h-[280px] overflow-y-auto">
            <button
              onClick={() => setOtraMitad(opcionMismaPizza)}
              className={`relative flex items-center justify-between rounded-xl px-4 py-3.5 text-left border ${
                otraMitad?.productoId === producto.id
                  ? "bg-[#141210] border-[#141210]"
                  : "bg-white border-black/[0.06]"
              }`}
            >
              <span
                className={`font-semibold text-[14px] ${
                  otraMitad?.productoId === producto.id ? "text-white" : "text-black"
                }`}
              >
                Misma pizza completa ({producto.nombre})
              </span>
              <span
                className={`font-bold text-[14px] ${
                  otraMitad?.productoId === producto.id ? "text-white" : "text-black"
                }`}
              >
                ${opcionMismaPizza.precio.toLocaleString("es-AR")}
              </span>
            </button>

            {listaCombo.map((op) => {
              const activo = otraMitad?.productoId === op.productoId;
              return (
                <button
                  key={op.productoId}
                  onClick={() => setOtraMitad(op)}
                  className={`relative flex items-center justify-between rounded-xl px-4 py-3.5 text-left border ${
                    activo ? "bg-[#141210] border-[#141210]" : "bg-white border-black/[0.06]"
                  }`}
                >
                  <span
                    className={`font-semibold text-[14px] ${activo ? "text-white" : "text-black"}`}
                  >
                    {op.nombre}
                  </span>
                  <span
                    className={`font-bold text-[14px] ${activo ? "text-white" : "text-black"}`}
                  >
                    ${op.precio.toLocaleString("es-AR")}
                  </span>
                </button>
              );
            })}
          </div>

          {!otraMitad && (
            <p className="text-[12.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 mb-6">
              Elegí la otra mitad para poder agregar al pedido.
            </p>
          )}
        </>
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
          disabled={!puedeAgregar}
          whileTap={{ scale: puedeAgregar ? 0.97 : 1 }}
          animate={{ backgroundColor: agregado ? "#c6f135" : "#141210" }}
          transition={{ duration: 0.25 }}
          className="flex-1 rounded-full py-3.5 font-bold text-[15px] disabled:opacity-40"
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