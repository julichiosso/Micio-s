import Link from "next/link";
import Image from "next/image";

const secciones = [
  {
    slug: "pizzas",
    nombre: "Pizzas",
    descripcion: "Clásicas y de autor, al molde",
  },
  {
    slug: "postres",
    nombre: "Postres",
    descripcion: "Para cerrar la noche",
  },
  {
    slug: "bebidas",
    nombre: "Bebidas",
    descripcion: "Bien frías",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#141210]">
      {/* Header de marca */}
      <div className="bg-[#141210] pt-10 pb-8 px-6 flex flex-col items-center">
        <div className="w-24 h-24 relative mb-4">
          <Image
            src="/logo.png"
            alt="Micio's Pizzería"
            fill
            priority
            className="object-contain"
          />
        </div>
        <p className="text-[#dcccaa]/50 text-[13px] tracking-[0.2em] uppercase">
          Pizzería a la piedra
        </p>
      </div>

      {/* Panel claro con horario + accesos */}
      <div className="bg-[#f7f3ea] rounded-t-[28px] min-h-[calc(100vh-220px)] px-5 pt-6 pb-10">
        <div className="flex items-center justify-between mb-7 px-1">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-black/40 mb-0.5">
              Abierto
            </p>
            <p className="text-[15px] font-semibold text-black">
              Jueves a domingos · 20 a 23 hs
            </p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#c6f135] shrink-0" />
        </div>

        <p className="text-[11px] uppercase tracking-wider text-black/40 mb-3 px-1">
          Menú
        </p>

        <div className="flex flex-col gap-3">
          {secciones.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="group flex items-center justify-between bg-[#141210] rounded-2xl pl-5 pr-4 py-5 active:scale-[0.98] transition-transform"
            >
              <div>
                <p className="text-white font-bold text-[19px] leading-tight">
                  {s.nombre}
                </p>
                <p className="text-white/45 text-[13px] mt-0.5">
                  {s.descripcion}
                </p>
              </div>
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0 group-active:bg-white/20">
                →
              </span>
            </Link>
          ))}
        </div>

        <p className="text-center text-[12px] text-black/35 mt-10">
          Retirás y pagás en el local · Pedido por WhatsApp
        </p>
      </div>
    </main>
  );
}