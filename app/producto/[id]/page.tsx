import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductoPorId } from "@/lib/queries/productos";
import AgregarAlCarrito from "./agregar-al-carrito";
import { IconArrowLeft, IconImage } from "@/app/icons";
import FooterInfo from "@/app/footer-info";
import CarritoIconoFlotante from "./carrito-icono-flotante";

const LABELS_TAMANIO: Record<string, string> = {
  xl: "XL",
  media_xl: "1/2 XL",
  clasica: "Clásica",
  media_clasica: "Clásica 1/2",
  unico: "Único",
};

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const producto = await getProductoPorId(Number(id));

  if (!producto) notFound();

  const ordenTamanios = ["xl", "media_xl", "clasica", "media_clasica", "unico"];

  // Protección extra: si por algún motivo quedaron precios duplicados del
  // mismo tamaño, nos quedamos con uno solo por tamaño antes de renderizar.
  const preciosUnicos = Array.from(
    new Map(producto.precios.map((p) => [p.tamanio, p])).values()
  );

  const preciosOrdenados = preciosUnicos.sort(
    (a, b) => ordenTamanios.indexOf(a.tamanio) - ordenTamanios.indexOf(b.tamanio)
  );

  return (
    <main className="min-h-screen bg-[#141210]">
      <div className="bg-[#f7f3ea] pb-10">
        {/* Foto grande — contenedor portrait = llena sin barras */}
        <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
          {producto.fotoUrl ? (
            <Image
              src={producto.fotoUrl}
              alt={producto.nombre}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f0ebe0]">
              <IconImage size={48} className="text-black/15" />
            </div>
          )}

          <div className="fixed top-0 inset-x-0 pt-6 px-5 flex items-center justify-between z-30">
  <Link
  href={`/${producto.seccion.nombre.toLowerCase()}`}
  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-[#141210] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
  aria-label="Volver"
>
  <IconArrowLeft size={18} />
</Link>
  <CarritoIconoFlotante />
</div>
        </div>

        {/* Info */}
        <div className="px-5 pt-5">
          <p className="text-[11px] uppercase tracking-wider text-black/35 mb-1">
            {producto.seccion.nombre}
          </p>
          <h1
            className="text-[26px] leading-[0.95] text-black mb-1.5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {producto.nombre}
          </h1>
          {producto.descripcion && (
            <p className="text-black/55 text-[14px] leading-snug mb-6">
              {producto.descripcion}
            </p>
          )}
          {!producto.descripcion && <div className="mb-6" />}

          <AgregarAlCarrito
            producto={{ id: producto.id, nombre: producto.nombre }}
            opciones={preciosOrdenados.map((p) => ({
              tamanio: p.tamanio,
              label: LABELS_TAMANIO[p.tamanio] ?? p.tamanio,
              precio: p.precio,
            }))}
          />
        </div>
      </div>

      {/* Footer al pie en fondo oscuro */}
      <div className="pb-24">
        <FooterInfo />
      </div>
    </main>
  );
}