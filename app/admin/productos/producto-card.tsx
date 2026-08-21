"use client";

import { useState } from "react";
import Image from "next/image";
import { IconStar, IconTrash, IconImage } from "@/app/icons";
import { ModalEditarProducto } from "./modal-editar-producto";

// -------- Tipos --------
type Precio = {
  id: number;
  tamanio: string;
  precio: number;
};

type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  fotoUrl: string | null;
  tieneTamanios: boolean;
  activo: boolean;
  destacado: boolean;
  seccion: { id: number; nombre: string };
  precios: Precio[];
};

type Seccion = {
  id: number;
  nombre: string;
};

const LABELS: Record<string, string> = {
  xl: "XL",
  media_xl: "1/2 XL",
  clasica: "Clásica",
  media_clasica: "Clásica 1/2",
  unico: "Único",
};

// -------- Modal de confirmación de borrado --------
function ModalConfirmacion({
  nombre,
  onConfirmar,
  onCancelar,
}: {
  nombre: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onCancelar}
      />
      <div className="relative w-full max-w-sm bg-[#1a1814] border border-white/[0.12] rounded-2xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-white font-bold text-[17px] tracking-tight mb-2">
          Eliminar producto
        </h3>
        <p className="text-white/60 text-[14px] leading-relaxed mb-6">
          Se eliminará <span className="text-white font-semibold">{nombre}</span> de la base de datos de forma permanente. Esta acción no se puede deshacer.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2.5 rounded-xl border border-white/15 text-white/80 hover:text-white hover:bg-white/[0.06] text-[13px] font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2.5 rounded-xl bg-[#c62828] hover:bg-[#b71c1c] text-white text-[13px] font-semibold transition-colors active:scale-[0.98]"
          >
            Eliminar definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

// -------- Tarjeta de producto (Mobile) --------
export function ProductoCard({
  producto,
  secciones,
  actionToggleDestacado,
  actionDesactivar,
  actionReactivar,
  actionEliminarDefinitivo,
  actionEditarProducto,
  actionSubirFoto,
  actionActualizarPrecioUnico,
  actionActualizarPreciosPizza,
}: {
  producto: Producto;
  secciones: Seccion[];
  actionToggleDestacado: (id: number, valor: boolean) => Promise<void>;
  actionDesactivar: (id: number) => Promise<void>;
  actionReactivar: (id: number) => Promise<void>;
  actionEliminarDefinitivo: (id: number) => Promise<void>;
  actionEditarProducto: (id: number, nombre: string, descripcion: string) => Promise<void>;
  actionSubirFoto: (productoId: number, formData: FormData) => Promise<unknown>;
  actionActualizarPrecioUnico: (productoId: number, precio: number) => Promise<void>;
  actionActualizarPreciosPizza: (productoId: number, precios: Record<string, number>) => Promise<void>;
}) {
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

  const precioTexto = producto.precios.length
    ? producto.precios
        .map((pr) => `${LABELS[pr.tamanio] ?? pr.tamanio}: $${pr.precio.toLocaleString("es-AR")}`)
        .join(" · ")
    : "Sin precios cargados";

  return (
    <>
      {mostrarModalEliminar && (
        <ModalConfirmacion
          nombre={producto.nombre}
          onCancelar={() => setMostrarModalEliminar(false)}
          onConfirmar={async () => {
            setMostrarModalEliminar(false);
            await actionEliminarDefinitivo(producto.id);
          }}
        />
      )}

      {mostrarModalEditar && (
        <ModalEditarProducto
          producto={producto}
          categorias={secciones}
          onClose={() => setMostrarModalEditar(false)}
          actionEditarProducto={actionEditarProducto}
          actionSubirFoto={actionSubirFoto}
          actionActualizarPrecioUnico={actionActualizarPrecioUnico}
          actionActualizarPreciosPizza={actionActualizarPreciosPizza}
        />
      )}

      <div
        className={`border rounded-2xl overflow-hidden transition-all shadow-sm ${
          producto.activo
            ? "border-white/[0.1] bg-[#1a1814]"
            : "border-white/[0.07] bg-[#161410] opacity-75"
        }`}
      >
        {/* Cabecera de la tarjeta */}
        <div className="p-4 flex items-start gap-3.5">
          {/* Thumbnail grande y nítido (w-18 h-18 = 72px) */}
          <div
            onClick={() => setMostrarModalEditar(true)}
            className="w-[72px] h-[72px] rounded-2xl bg-white/[0.05] border border-white/[0.08] shrink-0 relative overflow-hidden shadow-inner cursor-pointer"
            title="Tocar para editar"
          >
            {producto.fotoUrl ? (
              <Image
                src={producto.fotoUrl}
                alt={producto.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                <IconImage size={22} />
                <span className="text-[9px] mt-0.5">Sin foto</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  onClick={() => setMostrarModalEditar(true)}
                  className="text-white font-bold text-[16px] leading-tight truncate cursor-pointer hover:text-[#c6f135] transition-colors"
                >
                  {producto.nombre}
                </p>
                <p className="text-white/40 text-[12px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="bg-white/[0.06] text-white/60 px-2 py-0.5 rounded-md font-medium">
                    {producto.seccion.nombre}
                  </span>
                  {!producto.activo && (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">
                      Inactivo
                    </span>
                  )}
                </p>
              </div>

              {/* Botón estrella destacado */}
              <button
                onClick={() => actionToggleDestacado(producto.id, !producto.destacado)}
                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  producto.destacado
                    ? "text-[#c6f135] bg-[#c6f135]/15"
                    : "text-white/20 hover:text-white/50 bg-transparent"
                }`}
                aria-label={producto.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                title={producto.destacado ? "Destacado en portada" : "Marcar como destacado"}
              >
                <IconStar size={16} filled={producto.destacado} />
              </button>
            </div>

            <p className="text-[#c6f135]/90 text-[12.5px] font-semibold mt-1.5 leading-snug">
              {precioTexto}
            </p>
          </div>
        </div>

        {/* Barra de acciones inferiores */}
        <div className="border-t border-white/[0.06] px-4 py-2.5 flex items-center justify-between bg-black/20">
          <button
            type="button"
            onClick={() => setMostrarModalEditar(true)}
            className="flex items-center gap-1.5 bg-[#c6f135]/15 hover:bg-[#c6f135]/25 text-[#c6f135] text-[13px] font-bold px-3.5 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Editar producto
          </button>

          <div className="flex items-center gap-2">
            {/* Desactivar / Reactivar */}
            {producto.activo ? (
              <button
                onClick={() => actionDesactivar(producto.id)}
                className="text-white/45 hover:text-white text-[12px] px-3 py-1.5 rounded-xl border border-white/[0.08] active:opacity-60 transition-colors font-medium cursor-pointer"
              >
                Desactivar
              </button>
            ) : (
              <button
                onClick={() => actionReactivar(producto.id)}
                className="text-[#c6f135] bg-[#c6f135]/10 text-[12px] px-3 py-1.5 rounded-xl border border-[#c6f135]/25 active:opacity-60 transition-colors font-bold cursor-pointer"
              >
                Reactivar
              </button>
            )}

            {/* Eliminar definitivo */}
            <button
              onClick={() => setMostrarModalEliminar(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-red-900/30 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 active:opacity-60 transition-colors cursor-pointer"
              aria-label="Eliminar definitivamente"
              title="Eliminar definitivamente"
            >
              <IconTrash size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
