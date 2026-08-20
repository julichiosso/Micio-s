"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowLeft } from "lucide-react";

type Item = {
  id: number;
  nombre: string;
  descripcion: string | null;
  fotoUrl: string | null;
  seccion: string;
  tieneTamanios: boolean;
  desde: number | null;
};

export default function BuscadorCliente({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");

  const resultados = useMemo(() => {
    if (!query.trim()) return [];
    const q = normalizar(query);
    return items.filter(
      (item) =>
        normalizar(item.nombre).includes(q) ||
        normalizar(item.descripcion ?? "").includes(q) ||
        normalizar(item.seccion).includes(q)
    );
  }, [query, items]);

  return (
    <main className="min-h-screen bg-[#f7f3ea]">
      {/* Header con buscador */}
      <div className="bg-[#141210] px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0"
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 flex items-center gap-3 bg-white/[0.08] rounded-full px-4 py-3">
            <Search size={18} className="text-white/40 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pizza, postre, bebida..."
              className="flex-1 bg-transparent text-white placeholder:text-white/35 text-[15px] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="px-4 pt-5 pb-10">
        {query.trim() === "" && (
          <p className="text-center text-black/40 text-[14px] pt-10">
            Escribí para buscar en todo el menú.
          </p>
        )}

        {query.trim() !== "" && resultados.length === 0 && (
          <p className="text-center text-black/40 text-[14px] pt-10">
            No encontramos nada con &quot;{query}&quot;.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {resultados.map((item) => (
            <Link
              key={item.id}
              href={`/producto/${item.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl p-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-[72px] h-[72px] rounded-xl bg-black/5 shrink-0 relative overflow-hidden">
                {item.fotoUrl ? (
                  <Image
                    src={item.fotoUrl}
                    alt={item.nombre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/25 text-[10px] text-center px-1">
                    Sin foto
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-black/35 mb-0.5">
                  {item.seccion}
                </p>
                <p className="font-bold text-black text-[15px] truncate">
                  {item.nombre}
                </p>
                {item.desde !== null && (
                  <p className="text-[13px] font-semibold text-black/80 mt-1">
                    {item.tieneTamanios && (
                      <span className="text-black/40 font-normal">
                        Desde{" "}
                      </span>
                    )}
                    ${item.desde.toLocaleString("es-AR")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}