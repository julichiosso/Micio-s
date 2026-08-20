import { getSeccionesAdmin } from "@/lib/queries/admin";
import {
  crearSeccion,
  editarSeccion,
  eliminarSeccion,
  reactivarSeccion,
  borrarSeccionDefinitiva,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import { SeccionCard } from "./seccion-card";
import { SeccionesDesktopView } from "./secciones-desktop";

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

  const sharedActions = {
    actionEditar: actionEditarSeccion,
    actionDesactivar: actionDesactivarSeccion,
    actionReactivar: actionReactivarSeccion,
    actionEliminarDefinitivo: actionEliminarSeccionDefinitivo,
  };

  return (
    <>
      {/* ─── DESKTOP VIEW (md+) ─── */}
      <div className="hidden md:block">
        <SeccionesDesktopView
          seccionesList={seccionesList}
          actionCrearSeccion={actionCrearSeccion}
          {...sharedActions}
        />
      </div>

      {/* ─── MOBILE VIEW (diseño original dark, sin cambios) ─── */}
      <div className="md:hidden min-h-screen bg-[#141210] pb-16">
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

          {/* Listado */}
          <div className="flex flex-col gap-3">
            <p className="text-white/35 text-[11px] font-medium uppercase tracking-[0.12em] px-1">
              Secciones existentes ({seccionesList.length})
            </p>
            {seccionesList.map((s) => (
              <SeccionCard key={s.id} seccion={s} {...sharedActions} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}