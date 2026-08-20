import { getSeccionesAdmin } from "@/lib/queries/admin";
import {
  crearSeccion,
  editarSeccion,
  eliminarSeccion,
  reactivarSeccion,
  borrarSeccionDefinitiva,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@/app/icons";
import { SeccionCard } from "./seccion-card";

async function actionCrearSeccion(formData: FormData) {
  "use server";
  const nombre = formData.get("nombre") as string;
  if (nombre?.trim()) {
    await crearSeccion(nombre.trim());
  }
  redirect("/admin/secciones");
}

async function actionEditarSeccion(id: number, nombre: string) {
  "use server";
  await editarSeccion(id, nombre);
  redirect("/admin/secciones");
}

async function actionDesactivarSeccion(id: number) {
  "use server";
  await eliminarSeccion(id);
  redirect("/admin/secciones");
}

async function actionReactivarSeccion(id: number) {
  "use server";
  await reactivarSeccion(id);
  redirect("/admin/secciones");
}

async function actionEliminarSeccionDefinitivo(id: number) {
  "use server";
  await borrarSeccionDefinitiva(id);
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
            <SeccionCard
              key={s.id}
              seccion={s}
              actionEditar={actionEditarSeccion}
              actionDesactivar={actionDesactivarSeccion}
              actionReactivar={actionReactivarSeccion}
              actionEliminarDefinitivo={actionEliminarSeccionDefinitivo}
            />
          ))}
        </div>
      </div>
    </main>
  );
}