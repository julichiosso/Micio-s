"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { IconClose, IconImage } from "@/app/icons";
import imageCompression from "browser-image-compression";

type Precio = { id: number; tamanio: string; precio: number };
type Categoria = { id: number; nombre: string };

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

const LABELS: Record<string, string> = {
  xl: "Pizza XL",
  media_xl: "1/2 XL",
  clasica: "Clásica",
  media_clasica: "1/2 Clásica",
  unico: "Precio",
};

export function ModalEditarProducto({
  producto,
  categorias: _categorias,
  onClose,
  actionEditarProducto,
  actionSubirFoto,
  actionActualizarPrecioUnico,
  actionActualizarPreciosPizza,
}: {
  producto: Producto;
  categorias: Categoria[];
  onClose: () => void;
  actionEditarProducto: (id: number, nombre: string, descripcion: string) => Promise<void>;
  actionSubirFoto: (id: number, fd: FormData) => Promise<unknown>;
  actionActualizarPrecioUnico: (id: number, precio: number) => Promise<void>;
  actionActualizarPreciosPizza: (id: number, map: Record<string, number>) => Promise<void>;
}) {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(producto.fotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombreValor, setNombreValor] = useState(producto.nombre);
  const [descripcionValor, setDescripcionValor] = useState(producto.descripcion ?? "");

  const precioUnicoInicial = producto.precios[0]?.precio ?? "";
  const [precioUnicoValor, setPrecioUnicoValor] = useState<string | number>(precioUnicoInicial);

  const preciosPizzaIniciales: Record<string, string | number> = {};
  for (const tam of ["xl", "media_xl", "clasica", "media_clasica"]) {
    preciosPizzaIniciales[tam] = producto.precios.find((p) => p.tamanio === tam)?.precio ?? "";
  }
  const [preciosPizzaValor, setPreciosPizzaValor] = useState(preciosPizzaIniciales);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMensaje(null);

    try {
      const comprimido = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      setArchivoSeleccionado(comprimido);
      setPreviewUrl(URL.createObjectURL(comprimido));
    } catch {
      setArchivoSeleccionado(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleGuardarTodo(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      // 1. Guardar foto si cambió
      if (archivoSeleccionado) {
        const fd = new FormData();
        fd.append("foto", archivoSeleccionado);
        const res = await actionSubirFoto(producto.id, fd);
        if (res && typeof res === "object" && "publicUrl" in res && typeof res.publicUrl === "string") {
          setPreviewUrl(res.publicUrl);
        }
        setArchivoSeleccionado(null);
      }

      // 2. Guardar datos (nombre y descripción)
      await actionEditarProducto(producto.id, nombreValor, descripcionValor);

      // 3. Guardar precios
      if (producto.tieneTamanios) {
        const map: Record<string, number> = {};
        for (const tam of ["xl", "media_xl", "clasica", "media_clasica"]) {
          const val = Number(preciosPizzaValor[tam]);
          if (val > 0) map[tam] = val;
        }
        await actionActualizarPreciosPizza(producto.id, map);
      } else {
        const precio = Number(precioUnicoValor);
        if (precio > 0) {
          await actionActualizarPrecioUnico(producto.id, precio);
        }
      }

      setMensaje({ tipo: "exito", texto: "✓ Cambios guardados correctamente" });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar los cambios";
      if (errorMsg.includes("NEXT_REDIRECT")) {
        setMensaje({ tipo: "exito", texto: "✓ Cambios guardados correctamente" });
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        setMensaje({ tipo: "error", texto: `❌ ${errorMsg}` });
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container: Compacto, centrado, sin scroll exterior */}
      <div className="relative bg-[#1a1814] md:bg-white text-white md:text-gray-900 border border-white/[0.12] md:border-gray-200 rounded-2xl md:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Cabecera compacta */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] md:border-gray-100 flex items-center justify-between bg-[#141210] md:bg-gray-50/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider bg-[#c6f135]/20 md:bg-[#c6f135]/30 text-[#c6f135] md:text-[#3e4d00] px-2 py-0.5 rounded-full shrink-0">
              {producto.seccion.nombre}
            </span>
            <h2 className="text-[16px] font-bold text-white md:text-gray-900 truncate">
              {producto.nombre}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] md:bg-gray-100 hover:bg-white/10 md:hover:bg-gray-200 text-white/60 md:text-gray-500 hover:text-white md:hover:text-gray-900 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar"
          >
            <IconClose size={16} />
          </button>
        </div>

        {/* Formulario unificado */}
        <form onSubmit={handleGuardarTodo} className="flex flex-col overflow-y-auto flex-1 p-4 sm:p-5 gap-4">
          {/* Fila 1: Foto + Nombre */}
          <div className="flex items-start gap-3.5">
            {/* Foto thumbnail */}
            <div className="relative group shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl bg-white/[0.05] md:bg-gray-100 border border-white/[0.1] md:border-gray-200 relative overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-85 transition-opacity"
                title="Cambiar foto"
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={producto.nombre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/30 md:text-gray-400">
                    <IconImage size={22} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition-opacity">
                  Cambiar
                </div>
              </div>
              {/* Badge: foto nueva lista para subir */}
              {archivoSeleccionado && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#c6f135] rounded-full flex items-center justify-center text-[#141210] text-[10px] font-black shadow-md z-10">
                  ✓
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>


            {/* Nombre */}
            <div className="flex-1 min-w-0">
              <label className="block text-white/50 md:text-gray-500 text-[10.5px] uppercase tracking-wider font-bold mb-1">
                Nombre del producto
              </label>
              <input
                type="text"
                value={nombreValor}
                onChange={(e) => setNombreValor(e.target.value)}
                required
                placeholder="Nombre del producto"
                className="w-full bg-white/[0.06] md:bg-gray-50 rounded-xl px-3 py-2 text-white md:text-gray-900 text-[14.5px] font-medium outline-none border border-white/[0.08] md:border-gray-200 focus:border-[#c6f135] transition-colors"
              />
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div>
            <label className="block text-white/50 md:text-gray-500 text-[10.5px] uppercase tracking-wider font-bold mb-1">
              Descripción / Ingredientes (opcional)
            </label>
            <input
              type="text"
              value={descripcionValor}
              onChange={(e) => setDescripcionValor(e.target.value)}
              placeholder="Detalle o ingredientes del producto"
              className="w-full bg-white/[0.06] md:bg-gray-50 rounded-xl px-3 py-2 text-white md:text-gray-900 text-[14px] outline-none border border-white/[0.08] md:border-gray-200 focus:border-[#c6f135] transition-colors placeholder:text-white/20 md:placeholder:text-gray-400"
            />
          </div>

          {/* Fila 3: Precios */}
          <div className="pt-1">
            <label className="block text-white/50 md:text-gray-500 text-[10.5px] uppercase tracking-wider font-bold mb-1.5">
              {producto.tieneTamanios ? "Precios por tamaño" : "Precio"}
            </label>

            {producto.tieneTamanios ? (
              <div className="grid grid-cols-2 gap-2">
                {["xl", "media_xl", "clasica", "media_clasica"].map((tam) => (
                  <div
                    key={tam}
                    className="flex items-center gap-1.5 bg-white/[0.04] md:bg-gray-50 px-2.5 py-1.5 rounded-xl border border-white/[0.06] md:border-gray-200"
                  >
                    <span className="text-[12px] text-white/70 md:text-gray-600 font-semibold w-20 shrink-0 truncate">
                      {LABELS[tam]}
                    </span>
                    <div className="relative flex-1">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white/30 md:text-gray-400 text-[12px]">
                        $
                      </span>
                      <input
                        type="number"
                        value={preciosPizzaValor[tam]}
                        onChange={(e) =>
                          setPreciosPizzaValor((prev) => ({ ...prev, [tam]: e.target.value }))
                        }
                        placeholder="0"
                        className="w-full bg-transparent pl-4 pr-1 py-1 text-white md:text-gray-900 text-[14px] font-bold outline-none text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 md:text-gray-400 text-[14px] font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={precioUnicoValor}
                  onChange={(e) => setPrecioUnicoValor(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full bg-white/[0.06] md:bg-gray-50 rounded-xl pl-7 pr-3 py-2 text-white md:text-gray-900 text-[15px] font-bold outline-none border border-white/[0.08] md:border-gray-200 focus:border-[#c6f135] transition-colors"
                />
              </div>
            )}
          </div>

          {/* Mensaje de estado */}
          {mensaje && (
            <p
              className={`text-[12.5px] font-semibold text-center ${
                mensaje.tipo === "exito" ? "text-[#c6f135] md:text-green-700" : "text-red-400 md:text-red-600"
              }`}
            >
              {mensaje.texto}
            </p>
          )}

          {/* Botones de acción inferiores */}
          <div className="pt-2 flex items-center justify-end gap-2.5 mt-auto border-t border-white/[0.06] md:border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-white/60 md:text-gray-600 hover:text-white md:hover:text-gray-900 text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 rounded-xl bg-[#c6f135] hover:bg-[#d6ff47] text-[#141210] font-bold text-[13.5px] transition-all disabled:opacity-50 cursor-pointer active:scale-95 shadow-sm"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}