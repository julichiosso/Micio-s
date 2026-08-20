"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
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
    <main className="min-h-screen bg-[#f7f3ea]">
      {/* Header */}
      <div className="bg-[#141210] px-5 pt-6 pb-6 flex items-center gap-3">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-white text-[22px] font-black">Tu pedido</h1>
      </div>

      <div className="px-4 pt-6 pb-28">
        {items.length === 0 ? (
          <div className="text-center pt-16">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={26} className="text-black/30" />
            </div>
            <p className="text-black/50 text-[14px] mb-6">
              Todavía no agregaste nada.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#141210] text-white rounded-full px-6 py-3 font-semibold text-[14px]"
            >
              Ver el menú
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {items.map((item) => (
                <div
                  key={`${item.productoId}-${item.tamanio}`}
                  className="flex items-center justify-between bg-white rounded-2xl p-4"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-bold text-black text-[15px] truncate">
                      {item.nombre}
                    </p>
                    <p className="text-[13px] text-black/45 mt-0.5">
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
                      className="w-8 h-8 rounded-full bg-[#141210] text-white flex items-center justify-center"
                      aria-label="Restar"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center font-bold text-black text-[14px]">
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
                      className="w-8 h-8 rounded-full bg-[#141210] text-white flex items-center justify-center"
                      aria-label="Sumar"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/buscar"
              className="flex items-center justify-center gap-2 border border-dashed border-black/20 text-black/60 rounded-2xl py-3.5 font-semibold text-[14px] mb-6"
            >
              <Plus size={16} />
              ¿Querés agregar algo más?
            </Link>

            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-wider text-black/40 mb-2">
                Tu nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="¿Cómo te llamamos?"
                className="w-full bg-white rounded-xl px-4 py-3.5 text-black placeholder:text-black/35 outline-none text-[15px] border border-black/[0.06]"
              />
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-[#f7f3ea] border-t border-black/[0.08] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-black/60 font-medium text-[14px]">
                  Total
                </span>
                <span className="text-[22px] font-black text-black">
                  ${total.toLocaleString("es-AR")}
                </span>
              </div>
              <button
                onClick={handleConfirmar}
                disabled={!nombre.trim()}
                className="w-full bg-[#141210] text-white rounded-full py-3.5 font-bold text-[15px] disabled:opacity-35"
              >
                Confirmar por WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}