"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { IconClose, IconImage } from "@/app/icons";

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
  media_xl: "1/2 Pizza XL",
  clasica: "Pizza Clásica",
  media_clasica: "1/2 Pizza Clásica",
  unico: "Precio Único",
};

export function ModalEditarProducto({
  producto,
  categorias,
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
  actionSubirFoto: (id: number, fd: FormData) => Promise<void>;
  actionActualizarPrecioUnico: (id: number, precio: number) => Promise<void>;
  actionActualizarPreciosPizza: (id: number, map: Record<string, number>) => Promise<void>;
}) {
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoMensaje, setFotoMensaje] = useState<string | null>(null);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [datosMensaje, setDatosMensaje] = useState<string | null>(null);
  const [guardandoPrecios, setGuardandoPrecios] = useState(false);
  const [preciosMensaje, setPreciosMensaje] = useState<string | null>(null);

  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(producto.fotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoSeleccionado(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFotoMensaje(null);
    }
  }

  async function handleSubirFoto(e: React.FormEvent) {
    e.preventDefault();
    if (!archivoSeleccionado) return;

    setSubiendoFoto(true);
    setFotoMensaje(null);

    try {
      const fd = new FormData();
      fd.append("foto", archivoSeleccionado);
      await actionSubirFoto(producto.id, fd);
      setFotoMensaje("✓ Foto actualizada con éxito");
      setArchivoSeleccionado(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al subir la foto";
      setFotoMensaje(`❌ ${errorMsg}`);
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function handleGuardarDatos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardandoDatos(true);
    setDatosMensaje(null);

    try {
      const fd = new FormData(e.currentTarget);
      const nombre = fd.get("nombre") as string;
      const descripcion = fd.get("descripcion") as string;
      await actionEditarProducto(producto.id, nombre, descripcion);
      setDatosMensaje("✓ Datos guardados con éxito");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar datos";
      setDatosMensaje(`❌ ${errorMsg}`);
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function handleGuardarPreciosPizza(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardandoPrecios(true);
    setPreciosMensaje(null);

    try {
      const fd = new FormData(e.currentTarget);
      const map: Record<string, number> = {};
      for (const tam of ["xl", "media_xl", "clasica", "media_clasica"]) {
        const val = Number(fd.get(`precio_${tam}`));
        if (val > 0) map[tam] = val;
      }
      await actionActualizarPreciosPizza(producto.id, map);
      setPreciosMensaje("✓ Precios actualizados");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar precios";
      setPreciosMensaje(`❌ ${errorMsg}`);
    } finally {
      setGuardandoPrecios(false);
    }
  }

  async function handleGuardarPrecioUnico(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardandoPrecios(true);
    setPreciosMensaje(null);

    try {
      const fd = new FormData(e.currentTarget);
      const precio = Number(fd.get("precio"));
      if (precio > 0) {
        await actionActualizarPrecioUnico(producto.id, precio);
        setPreciosMensaje("✓ Precio actualizado");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar precio";
      setPreciosMensaje(`❌ ${errorMsg}`);
    } finally {
      setGuardandoPrecios(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#1a1814] text-white border border-white/[0.12] rounded-3xl shadow-2xl w-full max-w-xl my-8 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-[#141210]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#c6f135]/15 text-[#c6f135] px-2.5 py-0.5 rounded-full">
                {producto.seccion.nombre}
              </span>
              {!producto.activo && (
                <span className="text-[10.5px] uppercase font-semibold bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                  Inactivo
                </span>
              )}
            </div>
            <h2 className="text-[18px] font-bold text-white leading-tight">
              Editar: {producto.nombre}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          {/* 1. SECCIÓN FOTO */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 mb-3">
              Foto del producto
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview de la foto */}
              <div className="w-24 h-24 rounded-2xl bg-white/[0.05] border border-white/[0.1] relative overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={producto.nombre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/20">
                    <IconImage size={28} />
                    <span className="text-[10px] mt-1">Sin foto</span>
                  </div>
                )}
              </div>

              {/* Controles de subida */}
              <div className="flex-1 w-full flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer active:scale-95"
                  >
                    {archivoSeleccionado ? "Cambiar archivo" : "Seleccionar foto"}
                  </button>

                  {archivoSeleccionado && (
                    <button
                      type="button"
                      onClick={handleSubirFoto}
                      disabled={subiendoFoto}
                      className="px-4 py-2.5 bg-[#c6f135] hover:bg-[#d6ff47] text-[#141210] text-[13px] font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95 shadow-md shadow-[#c6f135]/20"
                    >
                      {subiendoFoto ? "Subiendo archivo..." : "Subir y Guardar Foto"}
                    </button>
                  )}
                </div>

                {archivoSeleccionado && (
                  <p className="text-[12px] text-white/50 truncate">
                    Archivo listo: <span className="text-white font-medium">{archivoSeleccionado.name}</span>
                  </p>
                )}

                {fotoMensaje && (
                  <p
                    className={`text-[12.5px] font-medium mt-1 ${
                      fotoMensaje.startsWith("✓") ? "text-[#c6f135]" : "text-red-400"
                    }`}
                  >
                    {fotoMensaje}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. SECCIÓN DATOS (Nombre y Descripción) */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 mb-3">
              Información general
            </p>

            <form onSubmit={handleGuardarDatos} className="flex flex-col gap-3">
              <div>
                <label className="block text-white/40 text-[11px] uppercase tracking-wider mb-1.5 font-medium">
                  Nombre del producto
                </label>
                <input
                  name="nombre"
                  defaultValue={producto.nombre}
                  required
                  placeholder="Ej: Pizza Napolitana Especial"
                  className="w-full bg-white/[0.06] rounded-xl px-3.5 py-2.5 text-white text-[15px] outline-none border border-white/[0.08] focus:border-[#c6f135]/60 focus:bg-white/[0.08] transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/40 text-[11px] uppercase tracking-wider mb-1.5 font-medium">
                  Descripción
                </label>
                <input
                  name="descripcion"
                  defaultValue={producto.descripcion ?? ""}
                  placeholder="Ingredientes o detalle del producto (opcional)"
                  className="w-full bg-white/[0.06] rounded-xl px-3.5 py-2.5 text-white text-[15px] outline-none border border-white/[0.08] focus:border-[#c6f135]/60 focus:bg-white/[0.08] transition-colors placeholder:text-white/20"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {datosMensaje ? (
                  <p
                    className={`text-[12.5px] font-medium ${
                      datosMensaje.startsWith("✓") ? "text-[#c6f135]" : "text-red-400"
                    }`}
                  >
                    {datosMensaje}
                  </p>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={guardandoDatos}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {guardandoDatos ? "Guardando..." : "Guardar datos"}
                </button>
              </div>
            </form>
          </div>

          {/* 3. SECCIÓN PRECIOS */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 mb-3">
              Precios y Tamaños
            </p>

            {producto.tieneTamanios ? (
              <form onSubmit={handleGuardarPreciosPizza} className="flex flex-col gap-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {["xl", "media_xl", "clasica", "media_clasica"].map((tam) => {
                    const precioActual =
                      producto.precios.find((p) => p.tamanio === tam)?.precio ?? "";
                    return (
                      <div
                        key={tam}
                        className="flex items-center gap-2 bg-white/[0.04] p-2 rounded-xl border border-white/[0.05]"
                      >
                        <span className="text-[12.5px] text-white/60 font-medium w-28 shrink-0">
                          {LABELS[tam]}
                        </span>
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-[13px]">
                            $
                          </span>
                          <input
                            type="number"
                            name={`precio_${tam}`}
                            defaultValue={precioActual}
                            placeholder="0"
                            className="w-full bg-white/[0.06] rounded-lg pl-6 pr-2.5 py-1.5 text-white text-[15px] font-semibold outline-none border border-white/[0.08] focus:border-[#c6f135]/60 transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {preciosMensaje ? (
                    <p
                      className={`text-[12.5px] font-medium ${
                        preciosMensaje.startsWith("✓") ? "text-[#c6f135]" : "text-red-400"
                      }`}
                    >
                      {preciosMensaje}
                    </p>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    disabled={guardandoPrecios}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {guardandoPrecios ? "Guardando..." : "Guardar precios"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleGuardarPrecioUnico} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-[15px]">
                      $
                    </span>
                    <input
                      type="number"
                      name="precio"
                      defaultValue={producto.precios[0]?.precio ?? ""}
                      placeholder="Precio en pesos"
                      required
                      className="w-full bg-white/[0.06] rounded-xl pl-8 pr-3.5 py-2.5 text-white text-[16px] font-semibold outline-none border border-white/[0.08] focus:border-[#c6f135]/60 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={guardandoPrecios}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer active:scale-95"
                  >
                    {guardandoPrecios ? "Guardando..." : "Guardar precio"}
                  </button>
                </div>

                {preciosMensaje && (
                  <p
                    className={`text-[12.5px] font-medium ${
                      preciosMensaje.startsWith("✓") ? "text-[#c6f135]" : "text-red-400"
                    }`}
                  >
                    {preciosMensaje}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end bg-[#141210]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-xl text-[14px] font-bold transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
