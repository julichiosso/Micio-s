import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSeccionConProductos, getSecciones } from "@/lib/queries/productos";
import { IconArrowLeft, IconSearch, IconImage } from "@/app/icons";
import FooterInfo from "../footer-info";
import StickyTopbar from "./sticky-topbar";

// Mapeo de sección → video de fondo (puede expandirse con más secciones)
const SECCION_VIDEO: Record<string, string> = {
  pizzas: "/seccionPizzas.mp4",
};

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

  const videoSrc = SECCION_VIDEO[slug.toLowerCase()] ?? null;

  return (
    <main className="min-h-screen bg-[#141210] pb-36">
      <StickyTopbar nombreSeccion={seccion.nombre} />
      {/* ── Hero / Header con video de fondo ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ minHeight: "220px", height: "36vh" }}
      >
        {/* Video de fondo (si existe para esta sección) */}
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          /* Fallback: gradiente oscuro puro */
          <div className="absolute inset-0 bg-[#1a1814]" />
        )}

        {/* Gradiente encima del video para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/60 to-[#141210]/20" />


        {/* Nombre de la sección centrado-abajo */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 z-10">
          <h1
            className="text-white text-[34px] leading-none font-black drop-shadow-lg"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {seccion.nombre}
          </h1>
          <p className="text-white/55 text-[13px] mt-1 font-medium">
            {productos.length}{" "}
            {productos.length === 1 ? "producto" : "productos"}
          </p>
        </div>
      </div>

      {/* Tabs de navegación entre secciones */}
      <div className="flex gap-2 px-5 py-4 overflow-x-auto scrollbar-none relative z-10">
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

      {/* Panel claro con listado — watermark de fondo */}
      <div
        className="relative bg-[#f7f3ea] rounded-t-[28px] min-h-[calc(100vh-220px)] px-4 pt-6 pb-32 overflow-hidden"
      >
        {/* Watermark: logo tenue de fondo */}
        <div
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.04]"
          aria-hidden="true"
        >
          <Image
            src="/logo.png"
            alt=""
            width={280}
            height={280}
            className="object-contain"
          />
        </div>

        {/* Contenido encima del watermark */}
        <div className="relative z-10">
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

      </div>
      <FooterInfo />
    </main>
  );
}