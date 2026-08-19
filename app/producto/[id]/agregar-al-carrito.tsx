"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      {/* Selector de tamaño (si hay más de 1 opción) */}
      {!soloUnTamanio && (
        <div className="flex flex-col gap-2 mb-6">
          {opciones.map((op) => {
            const activo = op.tamanio === seleccion.tamanio;
            return (
              <button
                key={op.tamanio}
                onClick={() => setSeleccion(op)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
                  activo
                    ? "bg-black text-[#dcccaa]"
                    : "bg-black/5 text-black"
                }`}
              >
                <span className="font-medium">{op.label}</span>
                <span>${op.precio.toLocaleString("es-AR")}</span>
              </button>
            );
          })}
        </div>
      )}

      {soloUnTamanio && (
        <p className="text-xl font-bold text-black mb-6">
          ${opciones[0].precio.toLocaleString("es-AR")}
        </p>
      )}

      {/* Botones */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#dcccaa] border-t border-black/10 p-4 flex gap-3">
        <button
          onClick={handleAgregar}
          className="flex-1 bg-black text-[#dcccaa] rounded-full py-3.5 font-bold"
        >
          {agregado ? "¡Agregado!" : "Agregar al pedido"}
        </button>
        <button
          onClick={() => router.push("/carrito")}
          className="px-5 rounded-full border border-black text-black font-medium"
        >
          Ver pedido
        </button>
      </div>
    </div>
  );
}