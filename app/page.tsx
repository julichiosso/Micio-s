import Link from "next/link";
import Image from "next/image";

const secciones = [
  { slug: "pizzas", nombre: "Pizzas", descripcion: "Clásicas y especiales" },
  { slug: "postres", nombre: "Postres", descripcion: "Para cerrar bien" },
  { slug: "bebidas", nombre: "Bebidas", descripcion: "Frías, para acompañar" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#dcccaa] flex flex-col items-center px-6 pt-12 pb-8">
      {/* Logo */}
      <div className="w-40 h-40 relative mb-6">
        <Image
          src="/logo.png"
          alt="Micio's Pizzería"
          fill
          priority
          className="object-contain"
        />
      </div>

      {/* Horario */}
      <div className="bg-black text-[#dcccaa] rounded-full px-5 py-2 mb-10 text-sm font-medium tracking-wide">
        Jueves a domingos · 20 a 23 hs
      </div>

      {/* Secciones */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {secciones.map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="flex items-center justify-between bg-black text-[#dcccaa] rounded-2xl px-6 py-5 active:scale-[0.98] transition-transform"
          >
            <div>
              <p className="text-lg font-bold uppercase tracking-wide">
                {s.nombre}
              </p>
              <p className="text-sm opacity-70">{s.descripcion}</p>
            </div>
            <span className="text-2xl">→</span>
          </Link>
        ))}
      </div>

      {/* Pie */}
      <p className="mt-auto pt-12 text-xs text-black/50 text-center">
        Pedidos para retirar en el local. Pago en el local.
      </p>
    </main>
  );
}