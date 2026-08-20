"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCarrito } from "@/app/icons";
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
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors ${
                    activo
                      ? "bg-[#141210] text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <span className="font-semibold text-[14px]">{op.label}</span>
                  <span className="font-bold text-[14px]">
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

      {/* Barra fija inferior — z-20: sobre el contenido, bajo el carrito flotante
          (pero el flotante no aparece en /producto/* por la lógica de CarritoFlotante) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f7f3ea] border-t border-black/[0.08] p-4 flex gap-3 z-20">
        <button
          onClick={handleAgregar}
          className="flex-1 flex items-center justify-center gap-2 bg-[#141210] text-white rounded-full py-3.5 font-bold text-[15px] active:scale-[0.98] transition-transform"
        >
          {agregado ? (
            "Agregado"
          ) : (
            <>
              <IconCarrito size={17} />
              Agregar al pedido
            </>
          )}
        </button>
        <button
          onClick={() => router.push("/carrito")}
          className="px-5 rounded-full border border-black/15 text-black font-semibold text-[14px] active:scale-[0.98] transition-transform"
        >
          Ver pedido
        </button>
      </div>
    </div>
  );
}