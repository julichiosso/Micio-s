import Link from "next/link";
import Image from "next/image";
import { IconImage } from "@/app/icons";

type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  fotoUrl: string | null;
  tieneTamanios: boolean;
  precios: { precio: number }[];
};

export default function ProductosLista({ productos }: { productos: Producto[] }) {
  if (productos.length === 0) {
    return (
      <p className="text-black/50 text-sm px-2">
        Todavía no hay productos cargados en esta sección.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {productos.map((producto, index) => {
        const desde = producto.precios.length
          ? Math.min(...producto.precios.map((p) => p.precio))
          : null;

        return (
          <div
            key={producto.id}
            className="animate-item-fade"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <Link
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
                    sizes="80px"
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
          </div>
        );
      })}
    </div>
  );
}