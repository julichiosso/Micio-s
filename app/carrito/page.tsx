"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCarrito,
  actualizarCantidad,
  vaciarCarrito,
  getTotalCarrito,
  ItemCarrito,
} from "@/lib/carrito";
import { armarLinkWhatsapp } from "@/lib/whatsapp";

export default function CarritoPage() {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    function cargar() {
      setItems(getCarrito());
      setCargando(false);
    }
    cargar();
    window.addEventListener("carrito-actualizado", cargar);
    return () => window.removeEventListener("carrito-actualizado", cargar);
  }, []);

  const total = getTotalCarrito(items);

  function handleConfirmar() {
    const link = armarLinkWhatsapp({ items, nombre, total });
    vaciarCarrito();
    window.location.href = link;
  }

  if (cargando) return null;

  return (
    <main className="min-h-screen bg-[#dcccaa] px-5 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-[#dcccaa] shrink-0"
          aria-label="Volver al inicio"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-black">
          Tu pedido
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center pt-10">
          <p className="text-black/60 mb-6">Todavía no agregaste nada.</p>
          <Link
            href="/"
            className="inline-block bg-black text-[#dcccaa] rounded-full px-6 py-3 font-medium"
          >
            Ver el menú
          </Link>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="flex flex-col gap-3 mb-6">
            {items.map((item) => (
              <div
                key={`${item.productoId}-${item.tamanio}`}
                className="flex items-center justify-between bg-black/5 rounded-2xl p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black truncate">
                    {item.nombre}
                  </p>
                  <p className="text-sm text-black/60">
                    {item.label} · ${item.precio.toLocaleString("es-AR")}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() =>
                      actualizarCantidad(
                        item.productoId,
                        item.tamanio,
                        item.cantidad - 1
                      )
                    }
                    className="w-8 h-8 rounded-full bg-black text-[#dcccaa] flex items-center justify-center font-bold"
                    aria-label="Restar"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-medium text-black">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() =>
                      actualizarCantidad(
                        item.productoId,
                        item.tamanio,
                        item.cantidad + 1
                      )
                    }
                    className="w-8 h-8 rounded-full bg-black text-[#dcccaa] flex items-center justify-center font-bold"
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Nombre */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black/70 mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="¿Cómo te llamamos?"
              className="w-full bg-white/60 rounded-xl px-4 py-3 text-black placeholder:text-black/40 outline-none"
            />
          </div>

          {/* Total + confirmar */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#dcccaa] border-t border-black/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-black/70 font-medium">Total</span>
              <span className="text-xl font-bold text-black">
                ${total.toLocaleString("es-AR")}
              </span>
            </div>
            <button
              onClick={handleConfirmar}
              disabled={!nombre.trim()}
              className="w-full bg-black text-[#dcccaa] rounded-full py-3.5 font-bold disabled:opacity-40"
            >
              Confirmar por WhatsApp
            </button>
          </div>
        </>
      )}
    </main>
  );
}