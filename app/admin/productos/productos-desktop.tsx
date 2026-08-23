"use client";

import { useState,useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IconStar, IconTrash, IconImage } from "@/app/icons";
import { ModalEditarProducto } from "./modal-editar-producto";
import { subirFotoProducto } from "@/lib/actions-storage";
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

function precioMin(precios: Precio[]) {
  if (!precios.length) return null;
  return Math.min(...precios.map((p) => p.precio));
}

function normalizar(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Sugerencias de nombre según la categoría elegida en "Nuevo producto"
// Catálogo real de pizzas de Micio's, para autocompletar nombre + descripción
const MENU_PIZZAS: { nombre: string; descripcion: string }[] = [
  { nombre: "Ananá y Jamón Crudo", descripcion: "Muzzarella, ananá, jamón crudo, reducción de aceto" },
  { nombre: "Anchoas", descripcion: "Muzzarella, anchoas, aceite de oliva" },
  { nombre: "Champiñón", descripcion: "Muzzarella, champiñones, cebolla de verdeo, panceta ahumada" },
  { nombre: "Especial", descripcion: "Muzzarella, jamón cocido, pimientos asados, aceitunas, orégano" },
  { nombre: "Fugazza", descripcion: "Muzzarella, cebolla, orégano" },
  { nombre: "Mediterránea", descripcion: "Muzzarella, berenjenas asadas, tomates cherry, pesto de albahaca" },
  { nombre: "Muzzarella", descripcion: "Muzzarella, aceitunas, orégano, aceite de oliva" },
  { nombre: "Napolitana", descripcion: "Muzzarella, tomates, ajo, albahaca" },
  { nombre: "Palmitos", descripcion: "Muzzarella, palmitos, salsa golf y orégano" },
  { nombre: "Pepperoni", descripcion: "Muzzarella, salami pepperoni" },
  { nombre: "Roquefort", descripcion: "Muzzarella, roquefort, orégano" },
  { nombre: "Rúcula y Jamón Crudo", descripcion: "Muzzarella, rúcula, jamón crudo, reducción de aceto" },
  { nombre: "BBQ Pulled Pork", descripcion: "Muzzarella, bondiola de cerdo braseada, salsa barbacoa, romero" },
  { nombre: "Onion, Cheddar y Bacon", descripcion: "Muzzarella, cebollas caramelizadas, cheddar, panceta ahumada" },
  { nombre: "Chicken Ranch", descripcion: "Muzzarella, pollo, cebolla morada, salsa ranch" },
  { nombre: "Provoleta", descripcion: "Muzzarella, provoleta parrillera, pimentón, tomate fresco, chimichurri" },
];

const SUGERENCIAS_POR_CATEGORIA: Record<
  string,
  { placeholder: string; placeholderDescripcion: string; opciones?: string[] }
> = {
  pizzas: {
    placeholder: "Elegí una pizza del menú o escribí una nueva",
    placeholderDescripcion: "Se completa sola al elegir una pizza del menú",
    opciones: MENU_PIZZAS.map((p) => p.nombre),
  },
  bebidas: {
    placeholder: "Ej: Coca-Cola 500ml",
    placeholderDescripcion: "Ej: Bien fría, botella descartable",
    opciones: [
      "Coca/Fanta/Sprite",
      "Santa Fe",
      "Santa Fe Pilsen",
      "Imperial",
      "Grolsch",
      "Guinness",
      "Heineken/Stella",
      "Heineken/Stella Latón",
      "Corona",
      "Miller Latón",
    ],
  },
  postres: {
    placeholder: "Ej: Tiramisú",
    placeholderDescripcion: "Ej: Porción individual, con cacao",
    opciones: ["Tiramisú", "Chocolina", "Mousse de chocolate", "Cheese cake"],
  },
};

// ─── Modal de confirmación de borrado ────────────────────────────────
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancelar}
      />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-gray-900 font-bold text-[16px] mb-2">{titulo}</h3>
        <p className="text-gray-500 text-[13.5px] leading-relaxed mb-6">{mensaje}</p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Eliminar definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

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
  actionCrearProducto: (datos: {
    seccionId: number;
    nombre: string;
    descripcion?: string;
    tieneTamanios: boolean;
    precios?: { tamanio: string; precio: number }[];
  }) => Promise<{ id: number }>;
  actionAumentoMasivo: (fd: FormData) => Promise<void>;
  actionToggleDestacado: (id: number, valor: boolean) => Promise<void>;
  actionDesactivar: (id: number) => Promise<void>;
  actionReactivar: (id: number) => Promise<void>;
  actionEliminarDefinitivo: (id: number) => Promise<void>;
  actionEditarProducto: (id: number, nombre: string, descripcion: string) => Promise<void>;
  actionSubirFoto: (id: number, fd: FormData) => Promise<unknown>;
  actionActualizarPrecioUnico: (id: number, precio: number) => Promise<void>;
  actionActualizarPreciosPizza: (id: number, map: Record<string, number>) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [mostrarAumento, setMostrarAumento] = useState(false);
  const [seccionNuevoProducto, setSeccionNuevoProducto] = useState<number | null>(
    seccionesList[0]?.id ?? null
  );
  const [tieneTamaniosNuevo, setTieneTamaniosNuevo] = useState(false);
  const [creandoProducto, setCreandoProducto] = useState(false);
  const [mensajeCrear, setMensajeCrear] = useState<string | null>(null);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);
  const [previewNuevo, setPreviewNuevo] = useState<string | null>(null);
  const fileInputNuevoRef = useRef<HTMLInputElement>(null);

  const seccionSeleccionadaNombre = normalizar(
    seccionesList.find((s) => s.id === seccionNuevoProducto)?.nombre ?? ""
  );
  const sugerencia =
    SUGERENCIAS_POR_CATEGORIA[seccionSeleccionadaNombre] ??
    { placeholder: "Ej: nombre del producto", placeholderDescripcion: "Detalle del producto..." };

  // Modal de edición y modal de borrado
  const [productoParaEditar, setProductoParaEditar] = useState<Producto | null>(null);
  const [productoParaEliminar, setProductoParaEliminar] = useState<Producto | null>(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Filtrado reactivo
  const productosFiltrados = useMemo(() => {
    let lista = productosList;

    if (categoriaFiltro !== "todas") {
      const secId = Number(categoriaFiltro);
      lista = lista.filter((p) => p.seccion.id === secId);
    }

    if (!query.trim()) return lista;
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return lista.filter((p) =>
      p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q) ||
      p.seccion.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
    );
  }, [query, categoriaFiltro, productosList]);

  // Total de páginas
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
  const paginaValida = Math.min(paginaActual, totalPaginas);

  // Items de la página actual
  const itemsPaginados = useMemo(() => {
    const inicio = (paginaValida - 1) * itemsPorPagina;
    return productosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [productosFiltrados, paginaValida]);

  return (
    <div className="p-6 max-w-[1280px]">
      {/* ─── Modal de Edición de Producto ─── */}
      {productoParaEditar && (
        <ModalEditarProducto
          producto={productoParaEditar}
          categorias={seccionesList}
          onClose={() => setProductoParaEditar(null)}
          actionEditarProducto={actionEditarProducto}
          actionSubirFoto={actionSubirFoto}
          actionActualizarPrecioUnico={actionActualizarPrecioUnico}
          actionActualizarPreciosPizza={actionActualizarPreciosPizza}
        />
      )}

      {/* ─── Modal de Borrado ─── */}
      {productoParaEliminar && (
        <ConfirmDialog
          titulo="Eliminar producto"
          mensaje={
            <>
              Se eliminará <strong>{productoParaEliminar.nombre}</strong> de forma permanente del catálogo. Esta acción no se puede deshacer.
            </>
          }
          onCancelar={() => setProductoParaEliminar(null)}
          onConfirmar={async () => {
            const id = productoParaEliminar.id;
            setProductoParaEliminar(null);
            await actionEliminarDefinitivo(id);
          }}
        />
      )}

      {/* ─── Stats Rápidas ─── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total productos", value: stats.totalProductos, color: "text-gray-900" },
          { label: "Sin foto cargada", value: stats.sinFoto, color: stats.sinFoto > 0 ? "text-amber-600" : "text-gray-400" },
          { label: "Productos inactivos", value: stats.inactivos, color: stats.inactivos > 0 ? "text-gray-500" : "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-[11.5px] text-gray-400 uppercase tracking-wider font-semibold mb-1">{s.label}</p>
            <p className={`text-[28px] font-black leading-none ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Barra de Herramientas y Filtros ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Buscador */}
          <div className="flex-1 max-w-sm relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar producto o categoría..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-[13.5px] text-gray-800 bg-white outline-none focus:border-[#c6f135] focus:ring-2 focus:ring-[#c6f135]/25 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Filtro por Categoría */}
          <div className="relative">
            <select
              value={categoriaFiltro}
              onChange={(e) => {
                setCategoriaFiltro(e.target.value);
                setPaginaActual(1);
              }}
              className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] focus:ring-2 focus:ring-[#c6f135]/25 transition-all cursor-pointer font-semibold"
            >
              <option value="todas">Todas las categorías ({seccionesList.length})</option>
              {seccionesList.map((s) => {
                const cant = productosList.filter((p) => p.seccion.id === s.id).length;
                return (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({cant})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {/* Aumento Masivo */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setMostrarAumento(!mostrarAumento); setMostrarNuevo(false); }}
              className="text-[13px] px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-semibold cursor-pointer"
            >
              Aumento masivo %
            </button>
            {mostrarAumento && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl p-4.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                <p className="text-[13px] font-bold text-gray-800 mb-1">Ajustar precios masivos</p>
                <p className="text-[11.5px] text-gray-500 mb-3">Aumenta o disminuye el % de una categoría entera.</p>
                <form action={actionAumentoMasivo} className="flex flex-col gap-2.5">
                  <select
                    name="seccionId"
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors"
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
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-4 py-2 bg-gray-900 text-white rounded-xl text-[13px] font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Nuevo Producto */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setMostrarNuevo(!mostrarNuevo); setMostrarAumento(false); }}
              className="text-[13px] px-4.5 py-2.5 rounded-xl bg-[#c6f135] text-[#141210] font-black hover:bg-[#d4ff3d] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo producto
            </button>
            {mostrarNuevo && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl p-5 z-20 animate-in fade-in zoom-in-95 duration-100">
                <p className="text-[14px] font-bold text-gray-900 mb-3">Agregar producto</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCreandoProducto(true);
                    setMensajeCrear(null);
                    const fd = new FormData(e.currentTarget);

                    const listaPrecios: { tamanio: string; precio: number }[] = [];
                    if (tieneTamaniosNuevo) {
                      for (const tam of ["xl", "media_xl", "clasica", "media_clasica"]) {
                        const val = Number(fd.get(`precio_${tam}`));
                        if (val > 0) listaPrecios.push({ tamanio: tam, precio: val });
                      }
                    } else {
                      const val = Number(fd.get("precio_unico"));
                      if (val > 0) listaPrecios.push({ tamanio: "unico", precio: val });
                    }

                                        try {
                      const nuevoProducto = await actionCrearProducto({
                        seccionId: Number(fd.get("seccionId")),
                        nombre: fd.get("nombre") as string,
                        descripcion: (fd.get("descripcion") as string) || undefined,
                        tieneTamanios: tieneTamaniosNuevo,
                        precios: listaPrecios,
                      });

                      if (archivoNuevo && nuevoProducto?.id) {
                        const fdFoto = new FormData();
                        fdFoto.append("foto", archivoNuevo);
                        await subirFotoProducto(nuevoProducto.id, fdFoto);
                      }

                      setMostrarNuevo(false);
                      setTieneTamaniosNuevo(false);
                      setNombreNuevo("");
                      setDescripcionNueva("");
                      setArchivoNuevo(null);
                      setPreviewNuevo(null);
                      router.refresh();
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : "Error al crear el producto";
                      if (msg.includes("NEXT_REDIRECT")) {
                        setMostrarNuevo(false);
                        router.refresh();
                      } else {
                        setMensajeCrear(`❌ ${msg}`);
                      }
                    } finally {
                      setCreandoProducto(false);
                    }
                  }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <label className="block text-gray-400 text-[11px] uppercase font-semibold mb-1">Categoría</label>
                    <select
                      name="seccionId"
                      required
                      value={seccionNuevoProducto ?? ""}
                      onChange={(e) => setSeccionNuevoProducto(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors"
                    >
                      {seccionesList.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] uppercase font-semibold mb-1">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={nombreNuevo}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setNombreNuevo(valor);
                        const match = MENU_PIZZAS.find(
                          (p) => normalizar(p.nombre) === normalizar(valor)
                        );
                        if (match) setDescripcionNueva(match.descripcion);
                      }}
                      placeholder={sugerencia.placeholder}
                      list={sugerencia.opciones ? "sugerencias-nombre-desktop" : undefined}
                      required
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors placeholder:text-gray-400"
                    />
                    {sugerencia.opciones && (
                      <datalist id="sugerencias-nombre-desktop">
                        {sugerencia.opciones.map((op) => (
                          <option key={op} value={op} />
                        ))}
                      </datalist>
                    )}
                  </div>
                                    <div>
                    <label className="block text-gray-400 text-[11px] uppercase font-semibold mb-1">Descripción (opcional)</label>
                    <input
                      type="text"
                      name="descripcion"
                      value={descripcionNueva}
                      onChange={(e) => setDescripcionNueva(e.target.value)}
                      placeholder={sugerencia.placeholderDescripcion}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[11px] uppercase font-semibold mb-1">Foto del producto (opcional)</label>
                    <input
                      ref={fileInputNuevoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setArchivoNuevo(file);
                        setPreviewNuevo(file ? URL.createObjectURL(file) : null);
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 relative overflow-hidden shrink-0 flex items-center justify-center">
                        {previewNuevo ? (
                          <img src={previewNuevo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-gray-300 text-center px-1">Sin foto</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputNuevoRef.current?.click()}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-[12.5px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {archivoNuevo ? "Cambiar imagen" : "Seleccionar imagen"}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-[12.5px] text-gray-700 cursor-pointer pt-1 leading-snug">
                    <input
                      type="checkbox"
                      checked={tieneTamaniosNuevo}
                      onChange={(e) => setTieneTamaniosNuevo(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#7fa800] shrink-0 mt-0.5"
                    />
                    Se vende en varios tamaños con precios distintos (ej: pizzas). Dejalo sin marcar si es un solo precio.
                  </label>

                  {/* Precios: 4 campos si tiene tamaños, 1 solo si no */}
                  <div>
                    <label className="block text-gray-400 text-[11px] uppercase font-semibold mb-1.5">
                      {tieneTamaniosNuevo ? "Precios por tamaño" : "Precio"}
                    </label>
                    {tieneTamaniosNuevo ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: "xl", label: "XL" },
                          { key: "media_xl", label: "1/2 XL" },
                          { key: "clasica", label: "Clásica" },
                          { key: "media_clasica", label: "Clásica 1/2" },
                        ].map((t) => (
                          <div key={t.key} className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]">$</span>
                            <input
                              type="number"
                              name={`precio_${t.key}`}
                              placeholder={t.label}
                              className="w-full border border-gray-200 rounded-lg pl-6 pr-2 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">$</span>
                        <input
                          type="number"
                          name="precio_unico"
                          placeholder="Precio en pesos"
                          className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {mensajeCrear && (
                    <p className="text-[12px] font-semibold text-red-600">{mensajeCrear}</p>
                  )}

                  <button
                    type="submit"
                    disabled={creandoProducto}
                    className="w-full bg-[#c6f135] text-[#141210] rounded-xl py-2.5 font-bold text-[13.5px] hover:bg-[#d4ff3d] transition-colors mt-1 cursor-pointer disabled:opacity-50"
                  >
                    {creandoProducto ? "Creando..." : "Crear producto"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Tabla de Productos ─── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="pl-5 py-3 w-20 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Foto</th>
              <th className="py-3 pr-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nombre y Detalle</th>
              <th className="py-3 pr-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Categoría</th>
              <th className="py-3 pr-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="py-3 pr-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="py-3 pr-3 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">Destacado</th>
              <th className="py-3 pr-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {itemsPaginados.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-[14px] text-gray-400">
                  {query ? `Sin resultados para "${query}"` : "No hay productos cargados en esta categoría."}
                </td>
              </tr>
            ) : (
              itemsPaginados.map((p) => {
                const minP = precioMin(p.precios);
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50/60 transition-colors ${!p.activo ? "opacity-60 bg-gray-50/30" : ""}`}
                  >
                    {/* Foto grande y clara (w-16 h-16 = 64px) */}
                    <td className="pl-5 py-3.5">
                      <div
                        onClick={() => setProductoParaEditar(p)}
                        className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0 cursor-pointer group"
                        title="Tocar para editar foto"
                      >
                        {p.fotoUrl ? (
                          <Image
                            src={p.fotoUrl}
                            alt={p.nombre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 group-hover:text-gray-400">
                            <IconImage size={20} />
                            <span className="text-[9px] mt-0.5 font-medium">Sin foto</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Nombre y Descripción */}
                    <td className="py-3.5 pr-3">
                      <p
                        onClick={() => setProductoParaEditar(p)}
                        className="text-[14px] font-bold text-gray-900 hover:text-[#4a5c00] cursor-pointer transition-colors leading-tight"
                      >
                        {p.nombre}
                      </p>
                      {p.descripcion ? (
                        <p className="text-[12px] text-gray-400 line-clamp-1 mt-0.5 max-w-xs">{p.descripcion}</p>
                      ) : (
                        <p className="text-[11.5px] text-gray-300 italic mt-0.5">Sin descripción</p>
                      )}
                    </td>

                    {/* Categoría */}
                    <td className="py-3.5 pr-3">
                      <span className="inline-block bg-gray-100 text-gray-700 text-[12px] font-semibold px-2.5 py-1 rounded-lg">
                        {p.seccion.nombre}
                      </span>
                    </td>

                    {/* Precios */}
                    <td className="py-3.5 pr-3">
                      <p className="text-[13.5px] text-gray-900 font-bold tabular-nums">
                        {minP != null
                          ? `${p.tieneTamanios ? "Desde " : ""}$${minP.toLocaleString("es-AR")}`
                          : "—"
                        }
                      </p>
                      {p.tieneTamanios && (
                        <span className="text-[10.5px] text-gray-400 font-medium">4 tamaños</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 pr-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.activo
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    {/* Destacado */}
                    <td className="py-3.5 pr-3 text-center">
                      <button
                        type="button"
                        onClick={() => actionToggleDestacado(p.id, !p.destacado)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors mx-auto cursor-pointer ${
                          p.destacado
                            ? "text-[#7fa800] bg-[#c6f135]/25 hover:bg-[#c6f135]/35"
                            : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                        title={p.destacado ? "Producto destacado en la portada" : "Marcar como destacado"}
                      >
                        <IconStar size={15} filled={p.destacado} />
                      </button>
                    </td>

                    {/* Botones de Acciones */}
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botón Editar Producto (Abre Modal) */}
                        <button
                          type="button"
                          onClick={() => setProductoParaEditar(p)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          Editar
                        </button>

                        {/* Desactivar / Reactivar */}
                        {p.activo ? (
                          <button
                            type="button"
                            onClick={() => actionDesactivar(p.id)}
                            className="text-[11.5px] px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                            title="Ocultar del menú público"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => actionReactivar(p.id)}
                            className="text-[11.5px] px-2.5 py-1.5 rounded-lg border border-[#c6f135]/50 bg-[#c6f135]/15 text-[#4a5c00] hover:bg-[#c6f135]/25 transition-colors font-bold cursor-pointer"
                            title="Volver a mostrar en el menú público"
                          >
                            Reactivar
                          </button>
                        )}

                        {/* Borrar definitivo */}
                        <button
                          type="button"
                          onClick={() => setProductoParaEliminar(p)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Eliminar de la base de datos"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ─── Paginación ─── */}
        <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[12.5px] text-gray-500 font-medium">
            Mostrando <span className="font-bold text-gray-800">{itemsPaginados.length > 0 ? (paginaValida - 1) * itemsPorPagina + 1 : 0}</span> a{" "}
            <span className="font-bold text-gray-800">{Math.min(paginaValida * itemsPorPagina, productosFiltrados.length)}</span> de{" "}
            <span className="font-bold text-gray-800">{productosFiltrados.length}</span> productos
          </p>

          {totalPaginas > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={paginaValida <= 1}
                onClick={() => setPaginaActual(paginaValida - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[12px] font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ‹ Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPaginaActual(num)}
                  className={`w-8 h-8 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer ${
                    num === paginaValida
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                disabled={paginaValida >= totalPaginas}
                onClick={() => setPaginaActual(paginaValida + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[12px] font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Siguiente ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}