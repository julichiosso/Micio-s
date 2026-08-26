import Link from "next/link";
import Image from "next/image";
import {
  getSeccionesConFoto,
  getProductosDestacados,
  getSecciones,
} from "@/lib/queries/productos";
import HorariosToggle from "./horarios-toggle";
import Header from "./header";
import { IconSearch, IconPin } from "./icons";
import FooterInfo from "./footer-info";
import BuscarFlotante from "./buscar-flotante";
import WhatsappConsulta from "./whatsapp-consulta";
import MapaLazy from "./mapa-lazy";

export const revalidate = 0;

export default async function HomePage() {
  const secciones = await getSeccionesConFoto();
  const todasLasSecciones = await getSecciones();
  const destacados = await getProductosDestacados(4);

  const nombresSecciones = todasLasSecciones.map((s) => s.nombre);

  return (
    <main className="min-h-screen bg-[#141210] pb-24">
      {/* Header con sidebar integrado */}
      <Header variante="oscura" secciones={nombresSecciones} />

      {/* Hero con video real del local */}
      <div className="relative h-[42vh] min-h-[300px] w-full mt-3">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/hero-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>

          {/* Scrim reforzado: garantiza contraste del texto sin importar
              qué haya de fondo en el video en ese instante */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/95 via-[#141210]/55 to-[#141210]/15" />
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 flex flex-col items-start z-10">
          <span className="bg-[#c6f135] text-[#141210] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            Take away
          </span>
          <h1
            className="text-white text-[32px] leading-[0.92] tracking-tight drop-shadow-lg"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Cuatro años
            <br />
            haciendo las mejores pizzas.
          </h1>
          <HorariosToggle />
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Buscador */}
        <Link
          href="/buscar"
          className="flex items-center gap-3 bg-white/[0.07] rounded-full px-4 py-3.5 mb-7 border border-white/[0.06]"
        >
          <IconSearch size={18} className="text-white/40 shrink-0" />
          <span className="text-white/40 text-[14px]">
            Buscar pizzas, postres, bebidas...
          </span>
        </Link>

        {/* Secciones — scroll horizontal con preview parcial de la siguiente */}
        <p className="text-white/40 text-[11px] font-medium uppercase tracking-[0.12em] mb-3">
          Elegí qué pedir
        </p>
        <div className="flex gap-3 mb-9 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-5 px-5">
          {secciones.map((s) => {
            const slug = s.nombre.toLowerCase();
            return (
              <Link
                key={s.id}
                href={`/${slug}`}
                className="group relative h-32 w-[78%] shrink-0 snap-start rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
              >
                {s.fotoUrl ? (
                  <Image
                    src={s.fotoUrl}
                    alt={s.nombre}
                    fill
                    sizes="78vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#1c1a17]" />
                )}
                {/* Scrim reforzado — mismo criterio que el hero */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/90 via-[#141210]/40 to-transparent" />
                <div className="absolute inset-0 flex items-end px-5 pb-4">
                  <div>
                    <p className="text-white font-semibold text-[18px] leading-none drop-shadow">
                      {s.nombre}
                    </p>
                    <p className="text-white/70 text-[12.5px] mt-1 font-normal">
                      Ver el menú
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Destacadas */}
        {destacados.length > 0 && (
          <>
            <p className="text-white/40 text-[11px] font-medium uppercase tracking-[0.12em] mb-3">
              Destacadas
            </p>
            <div className="mb-8">
              {destacados.map((producto) => {
                const desde = producto.precios.length
                  ? Math.min(...producto.precios.map((p) => p.precio))
                  : null;
                return (
                  <div key={producto.id} className="pb-4">
                    <Link
                      href={`/producto/${producto.id}`}
                      className="block bg-[#141210] rounded-2xl overflow-hidden active:scale-[0.98] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                    >
                      <div className="relative h-64 w-full">
                        <Image
                          src={producto.fotoUrl!}
                          alt={producto.nombre}
                          fill
                          sizes="(max-width: 640px) 90vw, 600px"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/10 to-transparent" />

                        <span className="absolute top-3 left-3 bg-[#141210]/60 backdrop-blur-md text-white/85 text-[10.5px] font-medium tracking-wide px-2.5 py-1 rounded-full">
                          {producto.seccion.nombre}
                        </span>
                        {desde !== null && (
                          <span className="absolute top-3 right-3 bg-[#c6f135] text-[#141210] text-[12.5px] font-semibold px-2.5 py-1 rounded-full">
                            {producto.tieneTamanios ? "Desde " : ""}$
                            {desde.toLocaleString("es-AR")}
                          </span>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-[17px] leading-none tracking-tight mb-1.5 truncate">
                              {producto.nombre}
                            </p>
                            {producto.descripcion && (
                              <p className="text-white/60 text-[13px] font-normal line-clamp-1">
                                {producto.descripcion}
                              </p>
                            )}
                          </div>

                          <span className="shrink-0 w-9 h-9 rounded-full bg-[#c6f135] flex items-center justify-center text-[#141210]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M5 12h14M13 6l6 6-6 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Info de retiro */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] px-4 py-3.5 mb-10">
          <IconPin size={17} className="text-white/35 shrink-0" />
          <p className="text-[12.5px] text-white/40 font-normal leading-snug">
            Pedís acá, confirmás por WhatsApp, retirás y pagás en el local.
          </p>
        </div>

        {/* ── Encontranos (Panel Blanquito) ── */}
        <section id="encontranos" className="bg-[#f7f3ea] rounded-3xl p-5 mb-6 text-black">
          <p className="text-black/40 text-[11px] font-bold uppercase tracking-[0.12em] mb-3">
            Encontranos
          </p>
          <div
            className="rounded-2xl overflow-hidden border border-black/[0.08]"
            style={{ height: "200px" }}
          >
            <MapaLazy />
          </div>
          <p className="text-black/60 text-[12.5px] font-medium mt-3 text-center">
            📍 Mendoza 1480, San Jorge, Santa Fe
          </p>
        </section>

        {/* ── Footer Compartido ── */}
        <FooterInfo />
      </div>
      <BuscarFlotante />
    </main>
  );
}