"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { IconStar, IconTrash } from "@/app/icons";

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
  seccion: { nombre: string };
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

// -------- Modal de confirmación de borrado (Diseño Senior) --------
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
      <div className="relative w-full max-w-sm bg-[#1a1814] border border-white/[0.12] rounded-2xl p-6 shadow-2xl">
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

// -------- Tarjeta de producto --------
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
  actionSubirFoto: (productoId: number, formData: FormData) => Promise<void>;
  actionActualizarPrecioUnico: (productoId: number, precio: number) => Promise<void>;
  actionActualizarPreciosPizza: (productoId: number, precios: Record<string, number>) => Promise<void>;
}) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const precioTexto = producto.precios.length
    ? producto.precios
        .map((pr) => `${LABELS[pr.tamanio] ?? pr.tamanio}: $${pr.precio.toLocaleString("es-AR")}`)
        .join(" · ")
    : "Sin precios";

  return (
    <>
      {mostrarModal && (
        <ModalConfirmacion
          nombre={producto.nombre}
          onCancelar={() => setMostrarModal(false)}
          onConfirmar={async () => {
            setMostrarModal(false);
            await actionEliminarDefinitivo(producto.id);
          }}
        />
      )}

      <div
        className={`border rounded-2xl overflow-hidden transition-colors ${
          producto.activo
            ? "border-white/[0.1] bg-[#1a1814]"
            : "border-white/[0.07] bg-[#161410]"
        }`}
      >
        {/* Cabecera de la tarjeta */}
        <div className="p-4 flex items-start gap-3">
          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-xl bg-white/[0.06] shrink-0 relative overflow-hidden">
            {producto.fotoUrl ? (
              <Image
                src={producto.fotoUrl}
                alt={producto.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/20 text-[10px]">Sin foto</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white font-semibold text-[15px] leading-tight truncate">
                  {producto.nombre}
                </p>
                <p className="text-white/35 text-[12px] mt-0.5">
                  {producto.seccion.nombre}
                  {!producto.activo && (
                    <span className="ml-2 bg-white/[0.08] text-white/40 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Inactivo
                    </span>
                  )}
                </p>
              </div>
              {/* Botón estrella */}
              <button
                onClick={() => actionToggleDestacado(producto.id, !producto.destacado)}
                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  producto.destacado
                    ? "text-[#c6f135] bg-[#c6f135]/10"
                    : "text-white/25 hover:text-white/50 bg-transparent"
                }`}
                aria-label={producto.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                title={producto.destacado ? "Destacado" : "Marcar como destacado"}
              >
                <IconStar size={16} filled={producto.destacado} />
              </button>
            </div>
            <p className="text-white/40 text-[12px] mt-1.5 leading-snug">{precioTexto}</p>
          </div>
        </div>

        {/* Expandir/colapsar edición */}
        <div className="border-t border-white/[0.06] px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setExpandido(!expandido)}
            className="text-white/50 text-[12.5px] font-medium active:opacity-60 transition-opacity"
          >
            {expandido ? "Cerrar edición" : "Editar"}
          </button>

          <div className="flex items-center gap-2">
            {/* Desactivar / Reactivar */}
            {producto.activo ? (
              <button
                onClick={() => actionDesactivar(producto.id)}
                className="text-white/40 text-[12px] px-3 py-1.5 rounded-lg border border-white/[0.08] active:opacity-60 transition-opacity"
              >
                Desactivar
              </button>
            ) : (
              <button
                onClick={() => actionReactivar(producto.id)}
                className="text-[#c6f135]/80 text-[12px] px-3 py-1.5 rounded-lg border border-[#c6f135]/20 active:opacity-60 transition-opacity"
              >
                Reactivar
              </button>
            )}

            {/* Eliminar definitivo */}
            <button
              onClick={() => setMostrarModal(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-900/40 text-red-500/60 active:opacity-60 transition-opacity"
              aria-label="Eliminar definitivamente"
              title="Eliminar definitivamente"
            >
              <IconTrash size={14} />
            </button>
          </div>
        </div>

        {/* Panel de edición expandible */}
        {expandido && (
          <div className="border-t border-white/[0.06] p-4 flex flex-col gap-4">
            {/* Subir foto */}
            <div>
              <p className="text-white/40 text-[11px] uppercase tracking-wide mb-2">
                Foto del producto
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const file = fileRef.current?.files?.[0];
                  if (!file) return;
                  setSubiendo(true);
                  const fd = new FormData();
                  fd.append("foto", file);
                  await actionSubirFoto(producto.id, fd);
                  setSubiendo(false);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="flex-1 text-white/50 text-[13px] bg-white/[0.05] rounded-xl px-3 py-2 file:mr-3 file:bg-white/10 file:border-0 file:text-white/60 file:text-[12px] file:rounded-lg file:px-2 file:py-1"
                />
                <button
                  type="submit"
                  disabled={subiendo}
                  className="shrink-0 bg-white/[0.08] text-white/70 text-[13px] font-medium px-4 py-2 rounded-xl disabled:opacity-40 active:opacity-60 transition-opacity"
                >
                  {subiendo ? "Subiendo..." : "Subir"}
                </button>
              </form>
            </div>

            {/* Editar nombre y descripción */}
            <div>
              <p className="text-white/40 text-[11px] uppercase tracking-wide mb-2">
                Datos del producto
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const nombre = fd.get("nombre") as string;
                  const descripcion = fd.get("descripcion") as string;
                  await actionEditarProducto(producto.id, nombre, descripcion);
                }}
                className="flex flex-col gap-2"
              >
                <input
                  name="nombre"
                  defaultValue={producto.nombre}
                  placeholder="Nombre"
                  className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-white text-[14px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
                />
                <input
                  name="descripcion"
                  defaultValue={producto.descripcion ?? ""}
                  placeholder="Descripción (opcional)"
                  className="w-full bg-white/[0.06] rounded-xl px-3 py-2.5 text-white text-[14px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
                />
                <button
                  type="submit"
                  className="self-end bg-white/[0.08] text-white/70 text-[13px] font-medium px-4 py-2 rounded-xl active:opacity-60 transition-opacity"
                >
                  Guardar
                </button>
              </form>
            </div>

            {/* Editar precios */}
            <div>
              <p className="text-white/40 text-[11px] uppercase tracking-wide mb-2">
                Precios
              </p>
              {producto.tieneTamanios ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const preciosMap: Record<string, number> = {};
                    for (const tam of ["xl", "media_xl", "clasica", "media_clasica"]) {
                      const val = Number(fd.get(`precio_${tam}`));
                      if (val > 0) preciosMap[tam] = val;
                    }
                    await actionActualizarPreciosPizza(producto.id, preciosMap);
                  }}
                  className="flex flex-col gap-2"
                >
                  {["xl", "media_xl", "clasica", "media_clasica"].map((tam) => (
                    <div key={tam} className="flex items-center gap-2">
                      <span className="text-white/40 text-[13px] w-24 shrink-0">{LABELS[tam]}</span>
                      <input
                        type="number"
                        name={`precio_${tam}`}
                        placeholder="$ precio"
                        defaultValue={producto.precios.find((p) => p.tamanio === tam)?.precio ?? ""}
                        className="flex-1 bg-white/[0.06] rounded-xl px-3 py-2 text-white text-[14px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="self-end bg-white/[0.08] text-white/70 text-[13px] font-medium px-4 py-2 rounded-xl active:opacity-60 transition-opacity mt-1"
                  >
                    Guardar precios
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const precio = Number(fd.get("precio"));
                    if (precio > 0) await actionActualizarPrecioUnico(producto.id, precio);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    name="precio"
                    placeholder="$ precio"
                    defaultValue={producto.precios[0]?.precio ?? ""}
                    className="flex-1 bg-white/[0.06] rounded-xl px-3 py-2.5 text-white text-[14px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
                  />
                  <button
                    type="submit"
                    className="shrink-0 bg-white/[0.08] text-white/70 text-[13px] font-medium px-4 py-2 rounded-xl active:opacity-60 transition-opacity"
                  >
                    Guardar
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
