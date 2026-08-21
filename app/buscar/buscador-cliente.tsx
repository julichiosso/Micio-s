"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { IconSearch, IconArrowLeft, IconClose, IconImage } from "@/app/icons";
import FooterInfo from "@/app/footer-info";

type Item = {
  id: number;
  nombre: string;
  descripcion: string | null;
  fotoUrl: string | null;
  seccion: string;
  seccionId: number;
  tieneTamanios: boolean;
  desde: number | null;
};

type SeccionInfo = {
  id: number;
  nombre: string;
  fotoUrl: string | null;
  cantidad: number;
};

export default function BuscadorCliente({
  items,
  secciones,
}: {
  items: Item[];
  secciones: SeccionInfo[];
}) {
  const [query, setQuery] = useState("");
  const [seccionSeleccionada, setSeccionSeleccionada] =
    useState<string>("todas");

  // Filtrado reactivo por texto y sección
  const resultados = useMemo(() => {
    let lista = items;

    // Filtro por sección seleccionada
    if (seccionSeleccionada !== "todas") {
      lista = lista.filter(
        (item) => normalizar(item.seccion) === normalizar(seccionSeleccionada)
      );
    }

    // Filtro por término de búsqueda
    if (query.trim()) {
      const q = normalizar(query);

      lista = lista.filter(
        (item) =>
          normalizar(item.nombre).includes(q) ||
          normalizar(item.descripcion ?? "").includes(q) ||
          normalizar(item.seccion).includes(q)
      );
    }

    return lista;
  }, [query, seccionSeleccionada, items]);

  // Agrupar items por sección para cuando se navega sin búsqueda específica
  const itemsPorSeccion = useMemo(() => {
    if (seccionSeleccionada !== "todas") {
      return [
        {
          nombre: seccionSeleccionada,
          items: resultados,
        },
      ];
    }

    // Mostrar agrupado por todas las secciones existentes
    return secciones
      .map((sec) => ({
        nombre: sec.nombre,
        items: resultados.filter(
          (i) => normalizar(i.seccion) === normalizar(sec.nombre)
        ),
      }))
      .filter((grupo) => grupo.items.length > 0);
  }, [resultados, seccionSeleccionada, secciones]);

  return (
    <main className="min-h-screen bg-[#f7f3ea] pb-32">
      {/* ─── Header Oscuro con Buscador ─── */}
      <div className="bg-[#141210] px-4 pt-5 pb-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0 active:scale-95 transition-transform"
            aria-label="Volver al inicio"
          >
            <IconArrowLeft size={19} />
          </Link>

          <div className="flex-1 flex items-center gap-3 bg-white/[0.09] rounded-full px-4 py-2.5 border border-white/[0.08] focus-within:border-white/25 focus-within:bg-white/[0.12] transition-colors">
            <IconSearch size={18} className="text-white/40 shrink-0" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué se te antoja?"
              className="flex-1 bg-transparent text-white placeholder:text-white/35 text-[16px] outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/15 text-white/70 active:opacity-60 transition-opacity"
                aria-label="Limpiar búsqueda"
              >
                <IconClose size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* ─── Píldoras / Filtros rápidos de secciones ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar -mx-4 px-4">
          <button
            type="button"
            onClick={() => setSeccionSeleccionada("todas")}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer select-none active:scale-95 ${
              seccionSeleccionada === "todas"
                ? "bg-[#c6f135] text-[#141210]"
                : "bg-white/[0.08] text-white/70 hover:bg-white/[0.12] hover:text-white"
            }`}
          >
            Todas ({items.length})
          </button>

          {secciones.map((sec) => {
            const activa =
              normalizar(seccionSeleccionada) === normalizar(sec.nombre);

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSeccionSeleccionada(sec.nombre)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1.5 ${
                  activa
                    ? "bg-[#c6f135] text-[#141210] shadow-sm shadow-[#c6f135]/20"
                    : "bg-white/[0.08] text-white/70 hover:bg-white/[0.12] hover:text-white"
                }`}
              >
                <span>{sec.nombre}</span>

                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-medium ${
                    activa
                      ? "bg-[#141210]/15 text-[#141210]"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {sec.cantidad}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Contenido Principal ─── */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {/* Banner de acceso rápido a las secciones con foto (cuando no hay búsqueda escrita) */}
        {!query.trim() && seccionSeleccionada === "todas" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-black/40 text-[11px] font-bold uppercase tracking-[0.14em]">
                Categorías del menú
              </p>

              <Link
                href="/"
                className="text-[12px] font-semibold text-black/60 hover:text-black transition-colors"
              >
                Ver menú completo →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {secciones.map((sec) => {
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSeccionSeleccionada(sec.nombre)}
                    className="group relative h-20 rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform border border-black/[0.06] shadow-sm"
                  >
                    {sec.fotoUrl ? (
                      <Image
                        src={sec.fotoUrl}
                        alt={sec.nombre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#1c1a17]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                    <div className="absolute inset-x-3 bottom-2.5 z-10 flex items-end justify-between">
                      <div>
                        <p className="text-white font-bold text-[14px] leading-tight drop-shadow-sm">
                          {sec.nombre}
                        </p>

                        <p className="text-white/60 text-[11px] font-medium">
                          {sec.cantidad}{" "}
                          {sec.cantidad === 1 ? "opción" : "opciones"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Indicador de sección activa / resultados */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-black/40 text-[11px] font-bold uppercase tracking-[0.14em]">
            {query.trim()
              ? `Resultados para "${query}" (${resultados.length})`
              : seccionSeleccionada !== "todas"
              ? `${seccionSeleccionada.toUpperCase()} (${resultados.length})`
              : "Todos los productos disponibles"}
          </p>

          {seccionSeleccionada !== "todas" && (
            <button
              type="button"
              onClick={() => setSeccionSeleccionada("todas")}
              className="text-[12px] font-medium text-black/50 hover:text-black underline underline-offset-2"
            >
              Ver todas
            </button>
          )}
        </div>

        {/* Sin resultados */}
        {resultados.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl p-6 border border-black/[0.04] shadow-sm">
            <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
              <IconSearch size={24} className="text-black/30" />
            </div>

            <p className="font-bold text-black text-[16px] mb-1">
              No encontramos resultados
            </p>

            <p className="text-black/50 text-[13px] max-w-xs mx-auto mb-5">
              Probá buscando con otras palabras o explorá las categorías
              disponibles.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSeccionSeleccionada("todas");
                }}
                className="bg-[#141210] text-white rounded-full px-5 py-2.5 text-[13px] font-semibold active:scale-95 transition-transform"
              >
                Limpiar filtros
              </button>

              <Link
                href="/"
                className="bg-black/5 text-black rounded-full px-5 py-2.5 text-[13px] font-semibold active:scale-95 transition-transform"
              >
                Ir a la portada
              </Link>
            </div>
          </div>
        )}

        {/* Listado de Productos */}
        {resultados.length > 0 && (
          <div className="flex flex-col gap-6">
            {itemsPorSeccion.map((grupo) => (
              <div key={grupo.nombre}>
                {seccionSeleccionada === "todas" && !query.trim() && (
                  <div className="flex items-center justify-between mb-2.5 px-1 pt-2">
                    <h2
                      className="text-black text-[18px] tracking-wide"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {grupo.nombre}
                    </h2>

                    <span className="text-black/35 text-[12px] font-medium">
                      {grupo.items.length}{" "}
                      {grupo.items.length === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  {grupo.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/producto/${item.id}`}
                      className="flex items-center gap-3.5 bg-white rounded-2xl p-3 active:scale-[0.98] transition-transform border border-black/[0.04] shadow-sm hover:shadow-md"
                    >
                      {/* Imagen */}
                      <div className="w-[76px] h-[76px] rounded-xl bg-[#f0ebe0] shrink-0 relative overflow-hidden">
                        {item.fotoUrl ? (
                          <Image
                            src={item.fotoUrl}
                            alt={item.nombre}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/[0.03]">
                            <IconImage
                              size={22}
                              className="text-black/15"
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-black/40 bg-black/[0.04] px-2 py-0.5 rounded-md mb-1">
                          {item.seccion}
                        </span>

                        <p className="font-bold text-black text-[15px] leading-tight truncate">
                          {item.nombre}
                        </p>

                        {item.descripcion && (
                          <p className="text-[12px] text-black/45 line-clamp-1 mt-0.5 font-normal">
                            {item.descripcion}
                          </p>
                        )}

                        {item.desde !== null && (
                          <p className="text-[13.5px] font-black text-black mt-1">
                            {item.tieneTamanios && (
                              <span className="text-black/40 font-normal text-[12px]">
                                Desde{" "}
                              </span>
                            )}
                            ${item.desde.toLocaleString("es-AR")}
                          </p>
                        )}
                      </div>

                      {/* Botón agregar / flecha */}
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#141210]/5 flex items-center justify-center text-black/40">
                        <span className="text-lg leading-none select-none font-light">
                          ›
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterInfo />
    </main>
  );
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}