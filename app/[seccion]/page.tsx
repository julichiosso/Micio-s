import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSeccionConProductos } from "@/lib/queries/productos";

export default async function SeccionPage({
  params,
}: {
  params: Promise<{ seccion: string }>;
}) {
  const { seccion: slug } = await params;
  const data = await getSeccionConProductos(slug);

  if (!data) notFound();

  const { seccion, productos } = data;

  return (
    <main className="min-h-screen bg-[#dcccaa] px-5 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-[#dcccaa] shrink-0"
          aria-label="Volver al inicio"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-black">
          {seccion.nombre}
        </h1>
      </div>

      {/* Listado */}
      {productos.length === 0 ? (
        <p className="text-black/60 text-sm">
          Todavía no hay productos cargados en esta sección.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {productos.map((producto) => {
            const desde = producto.precios.length
              ? Math.min(...producto.precios.map((p) => p.precio))
              : null;

            return (
              <Link
                key={producto.id}
                href={`/producto/${producto.id}`}
                className="flex items-center gap-4 bg-black/5 rounded-2xl p-3 active:scale-[0.98] transition-transform"
              >
                <div className="w-20 h-20 rounded-xl bg-black/10 shrink-0 relative overflow-hidden">
                  {producto.fotoUrl ? (
                    <Image
                      src={producto.fotoUrl}
                      alt={producto.nombre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/30 text-xs">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black truncate">
                    {producto.nombre}
                  </p>
                  {producto.descripcion && (
                    <p className="text-sm text-black/60 truncate">
                      {producto.descripcion}
                    </p>
                  )}
                  {desde !== null && (
                    <p className="text-sm text-black/80 mt-1">
                      {producto.tieneTamanios ? "Desde " : ""}$
                      {desde.toLocaleString("es-AR")}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}