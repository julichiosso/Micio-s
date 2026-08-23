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
  media_xl: "1/2 Pizza XL",
  clasica: "Pizza Clásica",
  media_clasica: "1/2 Pizza Clásica",
  unico: "Precio Único",
};

// Mini-diálogo de "¿salir sin guardar?"
function ConfirmSalirSinGuardar({
  onDescartar,
  onSeguirEditando,
}: {
  onDescartar: () => void;
  onSeguirEditando: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onSeguirEditando}
      />
      <div className="relative bg-[#1a1814] border border-white/[0.15] rounded-2xl p-6 max-w-sm w-full z-10 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-white font-bold text-[16px] mb-2">
          Tenés cambios sin guardar
        </h3>
        <p className="text-white/60 text-[13.5px] leading-relaxed mb-6">
          Si salís ahora vas a perder los datos que modificaste y todavía no
          guardaste. ¿Qué querés hacer?
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onSeguirEditando}
            className="w-full px-4 py-2.5 rounded-xl bg-[#c6f135] text-[#141210] text-[13.5px] font-bold hover:bg-[#d6ff47] transition-colors cursor-pointer"
          >
            Seguir editando
          </button>
          <button
            type="button"
            onClick={onDescartar}
            className="w-full px-4 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/[0.06] text-[13px] font-medium transition-colors cursor-pointer"
          >
            Descartar cambios y salir
          </button>
        </div>
      </div>
    </div>
  );
}

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
  actionSubirFoto: (id: number, fd: FormData) => Promise<unknown>;
  actionActualizarPrecioUnico: (id: number, precio: number) => Promise<void>;
  actionActualizarPreciosPizza: (id: number, map: Record<string, number>) => Promise<void>;
}) {
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoMensaje, setFotoMensaje] = useState<string | null>(null);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [datosMensaje, setDatosMensaje] = useState<string | null>(null);
  const [guardandoPrecios, setGuardandoPrecios] = useState(false);
  const [preciosMensaje, setPreciosMensaje] = useState<string | null>(null);
  const [mostrarConfirmSalir, setMostrarConfirmSalir] = useState(false);

  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(producto.fotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Tracking de cambios sin guardar por sección ──
  const [nombreValor, setNombreValor] = useState(producto.nombre);
  const [descripcionValor, setDescripcionValor] = useState(producto.descripcion ?? "");
  const [nombreGuardado, setNombreGuardado] = useState(producto.nombre);
  const [descripcionGuardada, setDescripcionGuardada] = useState(producto.descripcion ?? "");

  const precioUnicoInicial = producto.precios[0]?.precio ?? "";
  const [precioUnicoValor, setPrecioUnicoValor] = useState<string | number>(precioUnicoInicial);
  const [precioUnicoGuardado, setPrecioUnicoGuardado] = useState<string | number>(precioUnicoInicial);

  const preciosPizzaIniciales: Record<string, string | number> = {};
  for (const tam of ["xl", "media_xl", "clasica", "media_clasica"]) {
    preciosPizzaIniciales[tam] = producto.precios.find((p) => p.tamanio === tam)?.precio ?? "";
  }
  const [preciosPizzaValor, setPreciosPizzaValor] = useState(preciosPizzaIniciales);
  const [preciosPizzaGuardado, setPreciosPizzaGuardado] = useState(preciosPizzaIniciales);

  const datosPendientes = nombreValor !== nombreGuardado || descripcionValor !== descripcionGuardada;
  const fotoPendiente = archivoSeleccionado !== null;
  const precioUnicoPendiente = !producto.tieneTamanios && precioUnicoValor !== precioUnicoGuardado;
  const preciosPizzaPendientes =
    producto.tieneTamanios &&
    JSON.stringify(preciosPizzaValor) !== JSON.stringify(preciosPizzaGuardado);

  const hayCambiosSinGuardar =
    datosPendientes || fotoPendiente || precioUnicoPendiente || preciosPizzaPendientes;

  function pedirCierre() {
    if (hayCambiosSinGuardar) {
      setMostrarConfirmSalir(true);
    } else {
      onClose();
    }
  }

async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  setFotoMensaje(null);

  try {
    const comprimido = await imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });
    setArchivoSeleccionado(comprimido);
    setPreviewUrl(URL.createObjectURL(comprimido));
  } catch (err) {
    console.error("Error comprimiendo imagen", err);
    setArchivoSeleccionado(file);
    setPreviewUrl(URL.createObjectURL(file));
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
      const res = await actionSubirFoto(producto.id, fd);
      if (res && typeof res === "object" && "publicUrl" in res && typeof res.publicUrl === "string") {
        setPreviewUrl(res.publicUrl);
      }
      setFotoMensaje("✓ ¡Foto actualizada con éxito!");
      setArchivoSeleccionado(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al subir la foto";
      if (errorMsg.includes("NEXT_REDIRECT")) {
        setFotoMensaje("✓ ¡Foto actualizada con éxito!");
        setArchivoSeleccionado(null);
      } else {
        setFotoMensaje(`❌ ${errorMsg}`);
      }
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function handleGuardarDatos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardandoDatos(true);
    setDatosMensaje(null);

    try {
      await actionEditarProducto(producto.id, nombreValor, descripcionValor);
      setDatosMensaje("✓ Datos guardados con éxito");
      setNombreGuardado(nombreValor);
      setDescripcionGuardada(descripcionValor);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar datos";
      if (errorMsg.includes("NEXT_REDIRECT")) {
        setDatosMensaje("✓ Datos guardados con éxito");
        setNombreGuardado(nombreValor);
        setDescripcionGuardada(descripcionValor);
      } else {
        setDatosMensaje(`❌ ${errorMsg}`);
      }
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function handleGuardarPreciosPizza(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardandoPrecios(true);
    setPreciosMensaje(null);

    try {
      const map: Record<string, number> = {};
      for (const tam of ["xl", "media_xl", "clasica", "media_clasica"]) {
        const val = Number(preciosPizzaValor[tam]);
        if (val > 0) map[tam] = val;
      }
      await actionActualizarPreciosPizza(producto.id, map);
      setPreciosMensaje("✓ Precios actualizados");
      setPreciosPizzaGuardado(preciosPizzaValor);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar precios";
      if (errorMsg.includes("NEXT_REDIRECT")) {
        setPreciosMensaje("✓ Precios actualizados");
        setPreciosPizzaGuardado(preciosPizzaValor);
      } else {
        setPreciosMensaje(`❌ ${errorMsg}`);
      }
    } finally {
      setGuardandoPrecios(false);
    }
  }

  async function handleGuardarPrecioUnico(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardandoPrecios(true);
    setPreciosMensaje(null);

    try {
      const precio = Number(precioUnicoValor);
      if (precio > 0) {
        await actionActualizarPrecioUnico(producto.id, precio);
        setPreciosMensaje("✓ Precio actualizado");
        setPrecioUnicoGuardado(precioUnicoValor);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar precio";
      if (errorMsg.includes("NEXT_REDIRECT")) {
        setPreciosMensaje("✓ Precio actualizado");
        setPrecioUnicoGuardado(precioUnicoValor);
      } else {
        setPreciosMensaje(`❌ ${errorMsg}`);
      }
    } finally {
      setGuardandoPrecios(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {mostrarConfirmSalir && (
        <ConfirmSalirSinGuardar
          onSeguirEditando={() => setMostrarConfirmSalir(false)}
          onDescartar={onClose}
        />
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={pedirCierre}
      />

      {/* Modal Container: Blanco en Desktop, Oscuro en Mobile */}
      <div className="relative bg-[#1a1814] md:bg-white text-white md:text-gray-900 border border-white/[0.12] md:border-gray-200 rounded-3xl w-full max-w-2xl my-8 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-white/[0.08] md:border-gray-100 flex items-center justify-between bg-[#141210] md:bg-gray-50/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#c6f135]/20 md:bg-[#c6f135]/30 text-[#c6f135] md:text-[#3e4d00] px-2.5 py-0.5 rounded-full">
                {producto.seccion.nombre}
              </span>
              {!producto.activo && (
                <span className="text-[10.5px] uppercase font-semibold bg-white/10 md:bg-gray-200 text-white/50 md:text-gray-600 px-2 py-0.5 rounded-full">
                  Inactivo
                </span>
              )}
              {hayCambiosSinGuardar && (
                <span className="text-[10.5px] uppercase font-semibold bg-amber-500/15 text-amber-400 md:text-amber-700 md:bg-amber-100 px-2 py-0.5 rounded-full">
                  Cambios sin guardar
                </span>
              )}
            </div>
            <h2 className="text-[18px] font-bold text-white md:text-gray-900 leading-tight">
              Editar: {producto.nombre}
            </h2>
          </div>

          <button
            type="button"
            onClick={pedirCierre}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] md:bg-gray-100 hover:bg-white/10 md:hover:bg-gray-200 text-white/60 md:text-gray-500 hover:text-white md:hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {/* 1. SECCIÓN FOTO */}
          <div className="bg-white/[0.03] md:bg-gray-50/70 border border-white/[0.06] md:border-gray-200 rounded-2xl p-4.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 md:text-gray-400 mb-3">
              Foto del producto
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview de la foto */}
              <div className="w-24 h-24 rounded-2xl bg-white/[0.05] md:bg-white border border-white/[0.1] md:border-gray-200 relative overflow-hidden shrink-0 flex items-center justify-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={producto.nombre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/20 md:text-gray-300">
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
                    className="px-4 py-2.5 bg-white/10 md:bg-white md:border md:border-gray-200 hover:bg-white/15 md:hover:bg-gray-50 text-white md:text-gray-800 text-[13px] font-semibold rounded-xl transition-colors cursor-pointer active:scale-95"
                  >
                    {archivoSeleccionado ? "Cambiar archivo" : "Seleccionar foto"}
                  </button>

                  {archivoSeleccionado && (
                    <button
                      type="button"
                      onClick={handleSubirFoto}
                      disabled={subiendoFoto}
                      className="px-4 py-2.5 bg-[#c6f135] hover:bg-[#d6ff47] text-[#141210] text-[13px] font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      {subiendoFoto ? "Subiendo archivo..." : "Subir y Guardar Foto"}
                    </button>
                  )}
                </div>

                {archivoSeleccionado && (
                  <p className="text-[12px] text-white/50 md:text-gray-500 truncate">
                    Archivo listo: <span className="text-white md:text-gray-900 font-medium">{archivoSeleccionado.name}</span>
                  </p>
                )}

                {fotoMensaje && (
                  <p
                    className={`text-[12.5px] font-semibold mt-1 ${
                      fotoMensaje.startsWith("✓") ? "text-[#c6f135] md:text-green-700" : "text-red-400 md:text-red-600"
                    }`}
                  >
                    {fotoMensaje}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. SECCIÓN DATOS (Nombre y Descripción) */}
          <div className="bg-white/[0.03] md:bg-gray-50/70 border border-white/[0.06] md:border-gray-200 rounded-2xl p-4.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 md:text-gray-400 mb-3">
              Información general
            </p>

            <form onSubmit={handleGuardarDatos} className="flex flex-col gap-3">
              <div>
                <label className="block text-white/40 md:text-gray-500 text-[11px] uppercase tracking-wider mb-1.5 font-bold">
                  Nombre del producto
                </label>
                <input
                  name="nombre"
                  value={nombreValor}
                  onChange={(e) => setNombreValor(e.target.value)}
                  required
                  placeholder="Ej: Pizza Napolitana Especial"
                  className="w-full bg-white/[0.06] md:bg-white rounded-xl px-3.5 py-2.5 text-white md:text-gray-900 text-[15px] font-medium outline-none border border-white/[0.08] md:border-gray-200 focus:border-[#c6f135] md:focus:ring-2 md:focus:ring-[#c6f135]/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-white/40 md:text-gray-500 text-[11px] uppercase tracking-wider mb-1.5 font-bold">
                  Descripción
                </label>
                <input
                  name="descripcion"
                  value={descripcionValor}
                  onChange={(e) => setDescripcionValor(e.target.value)}
                  placeholder="Ingredientes o detalle del producto (opcional)"
                  className="w-full bg-white/[0.06] md:bg-white rounded-xl px-3.5 py-2.5 text-white md:text-gray-900 text-[15px] outline-none border border-white/[0.08] md:border-gray-200 focus:border-[#c6f135] md:focus:ring-2 md:focus:ring-[#c6f135]/25 transition-all placeholder:text-white/20 md:placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {datosMensaje ? (
                  <p
                    className={`text-[12.5px] font-semibold ${
                      datosMensaje.startsWith("✓") ? "text-[#c6f135] md:text-green-700" : "text-red-400 md:text-red-600"
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
                  className="px-4 py-2 bg-white/10 md:bg-gray-900 hover:bg-white/15 md:hover:bg-gray-800 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {guardandoDatos ? "Guardando..." : "Guardar datos"}
                </button>
              </div>
            </form>
          </div>

          {/* 3. SECCIÓN PRECIOS */}
          <div className="bg-white/[0.03] md:bg-gray-50/70 border border-white/[0.06] md:border-gray-200 rounded-2xl p-4.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 md:text-gray-400 mb-3">
              Precios y Tamaños
            </p>

            {producto.tieneTamanios ? (
              <form onSubmit={handleGuardarPreciosPizza} className="flex flex-col gap-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {["xl", "media_xl", "clasica", "media_clasica"].map((tam) => (
                    <div
                      key={tam}
                      className="flex items-center gap-2 bg-white/[0.04] md:bg-white p-2 rounded-xl border border-white/[0.05] md:border-gray-200"
                    >
                      <span className="text-[12.5px] text-white/60 md:text-gray-600 font-semibold w-28 shrink-0">
                        {LABELS[tam]}
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 md:text-gray-400 text-[13px]">
                          $
                        </span>
                        <input
                          type="number"
                          name={`precio_${tam}`}
                          value={preciosPizzaValor[tam]}
                          onChange={(e) =>
                            setPreciosPizzaValor((prev) => ({ ...prev, [tam]: e.target.value }))
                          }
                          placeholder="0"
                          className="w-full bg-white/[0.06] md:bg-gray-50 rounded-lg pl-6 pr-2.5 py-1.5 text-white md:text-gray-900 text-[15px] font-bold outline-none border border-white/[0.08] md:border-gray-200 focus:border-[#c6f135] transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {preciosMensaje ? (
                    <p
                      className={`text-[12.5px] font-semibold ${
                        preciosMensaje.startsWith("✓") ? "text-[#c6f135] md:text-green-700" : "text-red-400 md:text-red-600"
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
                    className="px-4 py-2 bg-white/10 md:bg-gray-900 hover:bg-white/15 md:hover:bg-gray-800 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {guardandoPrecios ? "Guardando..." : "Guardar precios"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleGuardarPrecioUnico} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 md:text-gray-400 text-[15px]">
                      $
                    </span>
                    <input
                      type="number"
                      name="precio"
                      value={precioUnicoValor}
                      onChange={(e) => setPrecioUnicoValor(e.target.value)}
                      placeholder="Precio en pesos"
                      required
                      className="w-full bg-white/[0.06] md:bg-white rounded-xl pl-8 pr-3.5 py-2.5 text-white md:text-gray-900 text-[16px] font-bold outline-none border border-white/[0.08] md:border-gray-200 focus:border-[#c6f135] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={guardandoPrecios}
                    className="px-4 py-2.5 bg-white/10 md:bg-gray-900 hover:bg-white/15 md:hover:bg-gray-800 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer active:scale-95"
                  >
                    {guardandoPrecios ? "Guardando..." : "Guardar precio"}
                  </button>
                </div>

                {preciosMensaje && (
                  <p
                    className={`text-[12.5px] font-semibold ${
                      preciosMensaje.startsWith("✓") ? "text-[#c6f135] md:text-green-700" : "text-red-400 md:text-red-600"
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
        <div className="px-6 py-4 border-t border-white/[0.08] md:border-gray-100 flex items-center justify-end bg-[#141210] md:bg-gray-50">
          <button
            type="button"
            onClick={pedirCierre}
            className="px-6 py-2.5 bg-white/15 md:bg-gray-900 hover:bg-white/20 md:hover:bg-gray-800 text-white rounded-xl text-[14px] font-bold transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}