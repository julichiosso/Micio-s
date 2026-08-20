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
      <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden mt-3">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/45 to-[#141210]/10" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 flex flex-col items-start">
          <span className="bg-[#c6f135] text-[#141210] text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            Take away
          </span>
          <h1
            className="text-white text-[32px] leading-[0.92] tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pizza a la piedra,
            <br />
            hecha como se debe.
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

        {/* Secciones con foto de fondo */}
        <p className="text-white/40 text-[11px] font-medium uppercase tracking-[0.12em] mb-3">
          Elegí qué pedir
        </p>
        <div className="flex flex-col gap-3 mb-9">
          {secciones.map((s) => {
            const slug = s.nombre.toLowerCase();
            return (
              <Link
                key={s.id}
                href={`/${slug}`}
                className="group relative h-24 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
              >
                {s.fotoUrl ? (
                  <Image
                    src={s.fotoUrl}
                    alt={s.nombre}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#1c1a17]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/90 via-[#141210]/60 to-transparent" />
                <div className="absolute inset-0 flex items-center px-5">
                  <div>
                    <p className="text-white font-semibold text-[18px] leading-none">
                      {s.nombre}
                    </p>
                    <p className="text-white/45 text-[12.5px] mt-1 font-normal">
                      Ver el menú
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Destacadas — solo productos con destacado=true y foto real */}
        {destacados.length > 0 && (
          <>
            <p className="text-white/40 text-[11px] font-medium uppercase tracking-[0.12em] mb-3">
              Destacadas
            </p>
            <div className="flex flex-col gap-4 mb-8">
              {destacados.map((producto) => {
                const desde = producto.precios.length
                  ? Math.min(...producto.precios.map((p) => p.precio))
                  : null;
                return (
                  <Link
                    key={producto.id}
                    href={`/producto/${producto.id}`}
                    className="block bg-white/[0.04] rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
                  >
                    <div className="relative h-44 w-full">
                      {/* Siempre tiene foto (filtrado en la query) */}
                      <Image
                        src={producto.fotoUrl!}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-[#141210]/60 backdrop-blur-md text-white/85 text-[10.5px] font-medium tracking-wide px-2.5 py-1 rounded-full">
                        {producto.seccion.nombre}
                      </span>
                      {desde !== null && (
                        <span className="absolute top-3 right-3 bg-[#c6f135] text-[#141210] text-[12.5px] font-semibold px-2.5 py-1 rounded-full">
                          {producto.tieneTamanios ? "Desde " : ""}$
                          {desde.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-white font-semibold text-[16px] leading-none mb-1.5">
                        {producto.nombre}
                      </p>
                      {producto.descripcion && (
                        <p className="text-white/40 text-[13px] font-normal line-clamp-2 mb-3">
                          {producto.descripcion}
                        </p>
                      )}
                      <span className="inline-block bg-white/[0.06] text-white/80 text-[13px] font-medium px-4 py-2.5 rounded-full">
                        Ver producto
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Info de retiro */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] px-4 py-3.5 mb-8">
          <IconPin size={17} className="text-white/35 shrink-0" />
          <p className="text-[12.5px] text-white/40 font-normal leading-snug">
            Pedís acá, confirmás por WhatsApp, retirás y pagás en el local.
          </p>
        </div>

        {/* Footer — Atribución Webya */}
        <footer className="pb-6 text-center">
          <a
            href="https://instagram.com/webya.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/25 text-[11px] tracking-wide hover:text-white/40 transition-colors"
          >
            Impulsado por <span className="font-semibold">Webya</span>
          </a>
        </footer>
      </div>
    </main>
  );
}