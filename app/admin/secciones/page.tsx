import { getSeccionesAdmin } from "@/lib/queries/admin";
import { crearSeccion, editarSeccion, eliminarSeccion } from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@/app/icons";

async function actionCrearSeccion(formData: FormData) {
  "use server";
  const nombre = formData.get("nombre") as string;
  await crearSeccion(nombre);
  redirect("/admin/secciones");
}

async function actionEditarSeccion(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const nombre = formData.get("nombre") as string;
  await editarSeccion(id, nombre);
  redirect("/admin/secciones");
}

async function actionEliminarSeccion(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await eliminarSeccion(id);
  redirect("/admin/secciones");
}

export default async function SeccionesAdminPage() {
  const seccionesList = await getSeccionesAdmin();

  return (
    <main className="min-h-screen bg-[#141210] pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#141210]/95 backdrop-blur-sm border-b border-white/[0.07] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="w-8 h-8 rounded-full bg-white/10 text-white/70 flex items-center justify-center active:opacity-60 transition-opacity"
            aria-label="Volver a productos"
          >
            <IconArrowLeft size={16} />
          </Link>
          <div>
            <h1
              className="text-white text-[20px] tracking-wide leading-none"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              SECCIONES
            </h1>
            <p className="text-white/35 text-[12px] mt-0.5">Micio&apos;s Pizzería</p>
          </div>
        </div>
        <Link
          href="/admin/productos"
          className="text-white/40 text-[13px] border border-white/[0.1] px-3 py-1.5 rounded-lg active:opacity-60 transition-opacity"
        >
          Productos
        </Link>
      </div>

      <div className="px-4 pt-5 max-w-lg mx-auto flex flex-col gap-6">
        {/* Crear nueva sección */}
        <div className="border border-white/[0.1] rounded-2xl p-5 bg-[#1a1814]">
          <p className="text-white font-semibold text-[15px] mb-3">Nueva sección</p>
          <form action={actionCrearSeccion} className="flex gap-2">
            <input
              type="text"
              name="nombre"
              placeholder="Ej: Empanadas, Postres..."
              required
              className="flex-1 bg-white/[0.06] rounded-xl px-3.5 py-2.5 text-white text-[14px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
            />
            <button
              type="submit"
              className="bg-[#c6f135] text-[#141210] rounded-xl px-4 py-2.5 font-bold text-[14px] active:opacity-80 transition-opacity shrink-0"
            >
              Crear
            </button>
          </form>
        </div>

        {/* Listado de secciones */}
        <div className="flex flex-col gap-3">
          <p className="text-white/35 text-[11px] font-medium uppercase tracking-[0.12em] px-1">
            Secciones existentes ({seccionesList.length})
          </p>

          {seccionesList.map((s) => (
            <div
              key={s.id}
              className={`border rounded-2xl p-4 bg-[#1a1814] ${
                s.activo ? "border-white/[0.1]" : "border-white/[0.05] opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold text-[15px]">{s.nombre}</span>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-medium ${
                    s.activo
                      ? "bg-white/[0.06] text-white/50"
                      : "bg-red-950/40 text-red-400 border border-red-800/30"
                  }`}
                >
                  {s.activo ? "Activa" : "Inactiva"}
                </span>
              </div>

              <form action={actionEditarSeccion} className="flex gap-2 mb-2">
                <input type="hidden" name="id" value={s.id} />
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nuevo nombre"
                  defaultValue={s.nombre}
                  className="flex-1 bg-white/[0.05] rounded-xl px-3 py-2 text-white text-[13px] placeholder:text-white/25 outline-none border border-white/[0.06] focus:border-white/20"
                />
                <button
                  type="submit"
                  className="bg-white/[0.08] text-white/70 rounded-xl px-3 py-2 text-[12px] font-medium active:opacity-60 transition-opacity shrink-0"
                >
                  Renombrar
                </button>
              </form>

              {s.activo && (
                <form action={actionEliminarSeccion} className="text-right mt-1">
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="text-white/35 text-[12px] hover:text-red-400 transition-colors"
                  >
                    Desactivar sección
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}