import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductoPorId } from "@/lib/queries/productos";
import AgregarAlCarrito from "./agregar-al-carrito";

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

  // Orden fijo para que XL siempre aparezca primero, etc.
  const ordenTamanios = ["xl", "media_xl", "clasica", "media_clasica", "unico"];
  const preciosOrdenados = [...producto.precios].sort(
    (a, b) => ordenTamanios.indexOf(a.tamanio) - ordenTamanios.indexOf(b.tamanio)
  );

  return (
    <main className="min-h-screen bg-[#dcccaa] px-5 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href={`/${producto.seccion.nombre.toLowerCase()}`}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-[#dcccaa] shrink-0"
          aria-label="Volver"
        >
          ←
        </Link>
      </div>

      {/* Foto */}
      <div className="w-full aspect-square rounded-2xl bg-black/10 relative overflow-hidden mb-5">
        {producto.fotoUrl ? (
          <Image
            src={producto.fotoUrl}
            alt={producto.nombre}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/30 text-sm">
            Sin foto todavía
          </div>
        )}
      </div>

      {/* Info */}
      <h1 className="text-2xl font-bold text-black mb-1">{producto.nombre}</h1>
      {producto.descripcion && (
        <p className="text-black/60 mb-5">{producto.descripcion}</p>
      )}

      {/* Selector de tamaño + agregar al carrito (client component) */}
      <AgregarAlCarrito
        producto={{
          id: producto.id,
          nombre: producto.nombre,
        }}
        opciones={preciosOrdenados.map((p) => ({
          tamanio: p.tamanio,
          label: LABELS_TAMANIO[p.tamanio] ?? p.tamanio,
          precio: p.precio,
        }))}
      />
    </main>
  );
}