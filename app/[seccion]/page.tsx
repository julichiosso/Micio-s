import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSeccionConProductos, getSecciones } from "@/lib/queries/productos";
import { IconArrowLeft, IconSearch, IconImage } from "@/app/icons";

export default async function SeccionPage({
  params,
}: {
  params: Promise<{ seccion: string }>;
}) {
  const { seccion: slug } = await params;
  const data = await getSeccionConProductos(slug);
  const todasLasSecciones = await getSecciones();

  if (!data) notFound();

  const { seccion, productos } = data;

  return (
    <main className="min-h-screen bg-[#141210] pb-36">
      {/* Header */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0"
          aria-label="Volver al inicio"
        >
          <IconArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1
            className="text-white text-[28px] leading-none"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {seccion.nombre}
          </h1>
          <p className="text-white/40 text-[13px] mt-1">
            {productos.length}{" "}
            {productos.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <Link
          href="/buscar"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0"
          aria-label="Buscar"
        >
          <IconSearch size={17} />
        </Link>
      </div>

      {/* Tabs de navegación entre secciones */}
      <div className="flex gap-2 px-5 pb-5 overflow-x-auto scrollbar-none">
        {todasLasSecciones.map((s) => {
          const slugSeccion = s.nombre.toLowerCase();
          const activa = slugSeccion === slug.toLowerCase();
          return (
            <Link
              key={s.id}
              href={`/${slugSeccion}`}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                activa
                  ? "bg-[#c6f135] text-[#141210]"
                  : "bg-white/[0.08] text-white/60"
              }`}
            >
              {s.nombre}
            </Link>
          );
        })}
      </div>

      {/* Panel claro con el listado
          pb-32 garantiza que el último producto nunca quede tapado
          por el botón flotante "Ver pedido" (72px de altura + margen) */}
      <div className="bg-[#f7f3ea] rounded-t-[28px] min-h-[calc(100vh-180px)] px-4 pt-6 pb-32">
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
                  {/* Imagen o fallback visual coherente */}
                  <div className="w-20 h-20 rounded-xl bg-[#f0ebe0] shrink-0 relative overflow-hidden">
                    {producto.fotoUrl ? (
                      <Image
                        src={producto.fotoUrl}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      // Fallback: cuadrado neutro con ícono tenue — sin texto "Sin foto"
                      <div className="w-full h-full flex items-center justify-center">
                        <IconImage size={24} className="text-black/15" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black text-[16px] truncate">
                      {producto.nombre}
                    </p>
                    {producto.descripcion && (
                      <p className="text-[13px] text-black/50 truncate mt-0.5">
                        {producto.descripcion}
                      </p>
                    )}
                    {desde !== null && (
                      <p className="text-[14px] font-bold text-black mt-1.5">
                        {producto.tieneTamanios && (
                          <span className="text-black/40 font-normal text-[12px]">
                            Desde{" "}
                          </span>
                        )}
                        ${desde.toLocaleString("es-AR")}
                      </p>
                    )}
                  </div>

                  <span className="text-black/20 text-2xl shrink-0">›</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}