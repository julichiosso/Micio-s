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
    <main className="min-h-screen bg-[#141210]">
      {/* Header */}
      <div className="px-5 pt-6 pb-6 flex items-center gap-3">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0"
          aria-label="Volver al inicio"
        >
          ←
        </Link>
        <h1 className="text-white text-2xl font-bold">{seccion.nombre}</h1>
      </div>

      {/* Panel claro con el listado */}
      <div className="bg-[#f7f3ea] rounded-t-[28px] min-h-[calc(100vh-100px)] px-4 pt-6 pb-10">
        {productos.length === 0 ? (
          <p className="text-black/50 text-sm px-2">
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
                  className="flex items-center gap-4 bg-white rounded-2xl p-3 active:scale-[0.98] transition-transform"
                >
                  <div className="w-[72px] h-[72px] rounded-xl bg-black/5 shrink-0 relative overflow-hidden">
                    {producto.fotoUrl ? (
                      <Image
                        src={producto.fotoUrl}
                        alt={producto.nombre}
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
                    <p className="font-bold text-black text-[15px] truncate">
                      {producto.nombre}
                    </p>
                    {producto.descripcion && (
                      <p className="text-[13px] text-black/50 truncate mt-0.5">
                        {producto.descripcion}
                      </p>
                    )}
                    {desde !== null && (
                      <p className="text-[13px] font-semibold text-black/80 mt-1">
                        {producto.tieneTamanios && (
                          <span className="text-black/40 font-normal">
                            Desde{" "}
                          </span>
                        )}
                        ${desde.toLocaleString("es-AR")}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}