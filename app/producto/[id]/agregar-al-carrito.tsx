"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
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
  const [agregado, setAgregado] = useState(false);
  const router = useRouter();

  function handleAgregar() {
    agregarItemAlCarrito({
      productoId: producto.id,
      nombre: producto.nombre,
      tamanio: seleccion.tamanio,
      label: seleccion.label,
      precio: seleccion.precio,
      cantidad: 1,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 900);
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

      {/* Barra fija inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f7f3ea] border-t border-black/[0.08] p-4 flex gap-3 z-20">
        <motion.button
          onClick={handleAgregar}
          whileTap={{ scale: 0.97 }}
          animate={{ backgroundColor: agregado ? "#c6f135" : "#141210" }}
          transition={{ duration: 0.25 }}
          className="flex-1 rounded-full py-3.5 font-bold text-[15px]"
          style={{ color: agregado ? "#141210" : "#ffffff" }}
        >
          {agregado ? "Agregado" : "Agregar al pedido"}
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