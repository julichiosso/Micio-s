"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { IconStar, IconTrash } from "@/app/icons";

// ─── Tipos ───────────────────────────────────────────────────────────
type Precio = { id: number; tamanio: string; precio: number };
type Seccion = { id: number; nombre: string };
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
  xl: "XL", media_xl: "½ XL", clasica: "Clásica",
  media_clasica: "Clás ½", unico: "—",
};

const ORDEN = ["xl", "media_xl", "clasica", "media_clasica", "unico"];

function precioMin(precios: Precio[]) {
  if (!precios.length) return null;
  return Math.min(...precios.map((p) => p.precio));
}

// ─── Modal de confirmación genérico (desktop) ────────────────────────
function ConfirmDialog({
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  mensaje: React.ReactNode;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancelar}
      />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-gray-900 font-bold text-[16px] mb-2">{titulo}</h3>
        <p className="text-gray-500 text-[13.5px] leading-relaxed mb-6">{mensaje}</p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors"
          >
            Eliminar definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fila expandible de producto (desktop) ───────────────────────────
function ProductoFila({
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
  actionSubirFoto: (id: number, fd: FormData) => Promise<void>;
  actionActualizarPrecioUnico: (id: number, precio: number) => Promise<void>;
  actionActualizarPreciosPizza: (id: number, map: Record<string, number>) => Promise<void>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [modal, setModal] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const minPrecio = precioMin(producto.precios);
  const preciosOrdenados = [...producto.precios].sort(
    (a, b) => ORDEN.indexOf(a.tamanio) - ORDEN.indexOf(b.tamanio)
  );

  return (
    <>
      {modal && (
        <ConfirmDialog
          titulo="Eliminar producto"
          mensaje={
            <>
              Se eliminará <strong>{producto.nombre}</strong> de forma permanente. Esta acción no se puede deshacer.
            </>
          }
          onCancelar={() => setModal(false)}
          onConfirmar={async () => {
            setModal(false);
            await actionEliminarDefinitivo(producto.id);
          }}
        />
      )}

      {/* Fila principal */}
      <tr
        className={`border-b border-gray-100 hover:bg-gray-50/70 cursor-pointer transition-colors ${
          !producto.activo ? "opacity-50" : ""
        }`}
        onClick={() => setAbierto(!abierto)}
      >
        {/* Foto */}
        <td className="w-12 pl-4 py-2.5">
          <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
            {producto.fotoUrl ? (
              <Image src={producto.fotoUrl} alt={producto.nombre} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
        </td>

        {/* Nombre */}
        <td className="py-2.5 pr-3">
          <p className="text-[13.5px] font-semibold text-gray-900 truncate max-w-[180px]">
            {producto.nombre || <span className="text-gray-300 italic">Sin nombre</span>}
          </p>
          {producto.descripcion && (
            <p className="text-[11.5px] text-gray-400 truncate max-w-[180px]">{producto.descripcion}</p>
          )}
        </td>

        {/* Sección */}
        <td className="py-2.5 pr-3 text-[12.5px] text-gray-500">{producto.seccion.nombre}</td>

        {/* Precio */}
        <td className="py-2.5 pr-3 text-[12.5px] text-gray-700 font-medium tabular-nums">
          {minPrecio != null
            ? `${producto.tieneTamanios ? "Desde " : ""}$${minPrecio.toLocaleString("es-AR")}`
            : <span className="text-gray-300">—</span>
          }
        </td>

        {/* Estado */}
        <td className="py-2.5 pr-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
              producto.activo
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {producto.activo ? "Activo" : "Inactivo"}
          </span>
        </td>

        {/* Destacado */}
        <td className="py-2.5 pr-3 text-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              actionToggleDestacado(producto.id, !producto.destacado);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors mx-auto ${
              producto.destacado
                ? "text-[#7fa800] bg-[#c6f135]/20"
                : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
            }`}
            title={producto.destacado ? "Quitar de destacados" : "Marcar como destacado"}
          >
            <IconStar size={14} filled={producto.destacado} />
          </button>
        </td>

        {/* Acciones rápidas */}
        <td className="py-2.5 pr-4 text-right">
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {producto.activo ? (
              <button
                type="button"
                onClick={() => actionDesactivar(producto.id)}
                className="text-[11.5px] px-2.5 py-1 rounded border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
              >
                Desactivar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => actionReactivar(producto.id)}
                className="text-[11.5px] px-2.5 py-1 rounded border border-[#c6f135]/40 bg-[#c6f135]/10 text-[#4a5c00] hover:bg-[#c6f135]/20 transition-colors font-medium"
              >
                Reactivar
              </button>
            )}
            <button
              type="button"
              onClick={() => setModal(true)}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-300 hover:text-red-400 hover:border-red-200 transition-colors"
              title="Eliminar definitivamente"
            >
              <IconTrash size={12} />
            </button>
          </div>
        </td>
      </tr>

      {/* Fila expandible de edición */}
      {abierto && (
        <tr>
          <td colSpan={7} className="bg-gray-50/80 border-b border-gray-200">
            <div className="px-6 py-5 grid grid-cols-3 gap-6">

              {/* Columna 1: Nombre y descripción */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Datos</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    await actionEditarProducto(
                      producto.id,
                      fd.get("nombre") as string,
                      fd.get("descripcion") as string
                    );
                  }}
                  className="flex flex-col gap-2"
                >
                  <input
                    name="nombre"
                    defaultValue={producto.nombre}
                    placeholder="Nombre"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135]/30 transition-colors"
                  />
                  <input
                    name="descripcion"
                    defaultValue={producto.descripcion ?? ""}
                    placeholder="Descripción (opcional)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135]/30 transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="text-[12px] px-3.5 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium"
                    >
                      Guardar datos
                    </button>
                  </div>
                </form>
              </div>

              {/* Columna 2: Precios */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Precios</p>
                {producto.tieneTamanios ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const map: Record<string, number> = {};
                      for (const tam of ["xl", "media_xl", "clasica", "media_clasica"]) {
                        const v = Number(fd.get(`precio_${tam}`));
                        if (v > 0) map[tam] = v;
                      }
                      await actionActualizarPreciosPizza(producto.id, map);
                    }}
                    className="flex flex-col gap-1.5"
                  >
                    {["xl", "media_xl", "clasica", "media_clasica"].map((tam) => (
                      <div key={tam} className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-400 w-20 shrink-0">{LABELS[tam]}</span>
                        <input
                          type="number"
                          name={`precio_${tam}`}
                          placeholder="$"
                          defaultValue={producto.precios.find((p) => p.tamanio === tam)?.precio ?? ""}
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] text-gray-800 bg-white outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135]/30 transition-colors"
                        />
                      </div>
                    ))}
                    <div className="flex justify-end mt-1">
                      <button
                        type="submit"
                        className="text-[12px] px-3.5 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium"
                      >
                        Guardar precios
                      </button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const precio = Number(fd.get("precio"));
                      if (precio > 0) await actionActualizarPrecioUnico(producto.id, precio);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="number"
                      name="precio"
                      placeholder="Precio"
                      defaultValue={producto.precios[0]?.precio ?? ""}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-[#c6f135] transition-colors"
                    />
                    <button
                      type="submit"
                      className="text-[12px] px-3.5 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium shrink-0"
                    >
                      Guardar
                    </button>
                  </form>
                )}
              </div>

              {/* Columna 3: Foto */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Foto</p>
                {producto.fotoUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative mb-2 border border-gray-200">
                    <Image src={producto.fotoUrl} alt={producto.nombre} fill className="object-cover" />
                  </div>
                )}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector<HTMLInputElement>("input[type=file]");
                    if (!input?.files?.[0]) return;
                    setSubiendo(true);
                    const fd = new FormData();
                    fd.append("foto", input.files[0]);
                    await actionSubirFoto(producto.id, fd);
                    setSubiendo(false);
                  }}
                  className="flex flex-col gap-2"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-[12px] text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 file:mr-2 file:bg-gray-100 file:border-0 file:text-gray-600 file:text-[11px] file:rounded file:px-2 file:py-0.5"
                  />
                  <button
                    type="submit"
                    disabled={subiendo}
                    className="text-[12px] px-3.5 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium disabled:opacity-40 self-start"
                  >
                    {subiendo ? "Subiendo..." : "Subir foto"}
                  </button>
                </form>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Tabla principal (desktop) ───────────────────────────────────────
export function ProductosDesktopView({
  seccionesList,
  productosList,
  stats,
  actionCrearProducto,
  actionAumentoMasivo,
  actionToggleDestacado,
  actionDesactivar,
  actionReactivar,
  actionEliminarDefinitivo,
  actionEditarProducto,
  actionSubirFoto,
  actionActualizarPrecioUnico,
  actionActualizarPreciosPizza,
}: {
  seccionesList: Seccion[];
  productosList: Producto[];
  stats: { totalProductos: number; sinFoto: number; inactivos: number };
  actionCrearProducto: (fd: FormData) => Promise<void>;
  actionAumentoMasivo: (fd: FormData) => Promise<void>;
  actionToggleDestacado: (id: number, valor: boolean) => Promise<void>;
  actionDesactivar: (id: number) => Promise<void>;
  actionReactivar: (id: number) => Promise<void>;
  actionEliminarDefinitivo: (id: number) => Promise<void>;
  actionEditarProducto: (id: number, nombre: string, descripcion: string) => Promise<void>;
  actionSubirFoto: (id: number, fd: FormData) => Promise<void>;
  actionActualizarPrecioUnico: (id: number, precio: number) => Promise<void>;
  actionActualizarPreciosPizza: (id: number, map: Record<string, number>) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [mostrarAumento, setMostrarAumento] = useState(false);

  const productosFiltrados = useMemo(() => {
    if (!query.trim()) return productosList;
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return productosList.filter((p) =>
      p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
      p.seccion.nombre.toLowerCase().includes(q)
    );
  }, [query, productosList]);

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total productos", value: stats.totalProductos, color: "text-gray-900" },
          { label: "Sin foto", value: stats.sinFoto, color: stats.sinFoto > 0 ? "text-amber-600" : "text-gray-400" },
          { label: "Inactivos", value: stats.inactivos, color: stats.inactivos > 0 ? "text-gray-500" : "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
            <p className="text-[11.5px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{s.label}</p>
            <p className={`text-[26px] font-black leading-none ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center gap-3 mb-4">
        {/* Buscador */}
        <div className="flex-1 max-w-xs relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar producto o sección..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135]/30 transition-colors placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Aumento masivo */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setMostrarAumento(!mostrarAumento); setMostrarNuevo(false); }}
              className="text-[13px] px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              Aumento masivo %
            </button>
            {mostrarAumento && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-20">
                <p className="text-[12px] font-semibold text-gray-700 mb-3">Ajustar precios por sección</p>
                <form action={actionAumentoMasivo} className="flex flex-col gap-2">
                  <select
                    name="seccionId"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors"
                  >
                    {seccionesList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="porcentaje"
                      placeholder="% (ej: 10 o -5)"
                      required
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-3 py-2 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Nuevo producto */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setMostrarNuevo(!mostrarNuevo); setMostrarAumento(false); }}
              className="text-[13px] px-4 py-2 rounded-lg bg-[#c6f135] text-[#1a2500] font-bold hover:bg-[#d4ff3d] transition-colors flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo producto
            </button>
            {mostrarNuevo && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-20">
                <p className="text-[12px] font-semibold text-gray-700 mb-3">Agregar producto</p>
                <form action={actionCrearProducto} className="flex flex-col gap-2.5">
                  <select
                    name="seccionId"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors"
                  >
                    {seccionesList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre del producto"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135]/30 transition-colors placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    name="descripcion"
                    placeholder="Descripción (opcional)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135]/30 transition-colors placeholder:text-gray-400"
                  />
                  <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer">
                    <input type="checkbox" name="tieneTamanios" className="rounded accent-[#7fa800]" />
                    Tiene varios tamaños (pizzas)
                  </label>
                  <button
                    type="submit"
                    className="w-full bg-[#c6f135] text-[#1a2500] rounded-lg py-2 font-bold text-[13px] hover:bg-[#d4ff3d] transition-colors mt-0.5"
                  >
                    Crear producto
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="pl-4 py-2.5 w-12" />
              <th className="py-2.5 pr-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
              <th className="py-2.5 pr-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sección</th>
              <th className="py-2.5 pr-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="py-2.5 pr-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="py-2.5 pr-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Dest.</th>
              <th className="py-2.5 pr-4 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[13px] text-gray-400">
                  {query ? `Sin resultados para "${query}"` : "No hay productos cargados aún."}
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p) => (
                <ProductoFila
                  key={p.id}
                  producto={p}
                  secciones={seccionesList}
                  actionToggleDestacado={actionToggleDestacado}
                  actionDesactivar={actionDesactivar}
                  actionReactivar={actionReactivar}
                  actionEliminarDefinitivo={actionEliminarDefinitivo}
                  actionEditarProducto={actionEditarProducto}
                  actionSubirFoto={actionSubirFoto}
                  actionActualizarPrecioUnico={actionActualizarPrecioUnico}
                  actionActualizarPreciosPizza={actionActualizarPreciosPizza}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-gray-300 mt-5 text-center">
        {productosFiltrados.length} de {productosList.length} productos — Micio&apos;s Pizzería
      </p>
    </div>
  );
}
