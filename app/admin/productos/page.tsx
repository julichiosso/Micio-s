import { getSeccionesAdmin, getProductosAdmin } from "@/lib/queries/admin";
import {
  crearProducto,
  editarProducto,
  eliminarProducto,
  reactivarProducto,
  borrarProductoDefinitivo,
  toggleDestacado,
  actualizarPrecios,
  aumentoMasivo,
} from "@/lib/actions";
import { subirFotoProducto } from "@/lib/actions-storage";
import { redirect } from "next/navigation";
import { ProductoCard } from "./producto-card";
import { ProductosDesktopView } from "./productos-desktop";
import { NuevoProductoForm } from "./nuevo-producto-form";
// -------- Server Actions (firmas sin cambios) --------

async function actionCrearProducto(datos: {
  seccionId: number;
  nombre: string;
  descripcion?: string;
  tieneTamanios: boolean;
}) {
  "use server";
  return await crearProducto(datos);
}

async function actionCrearProductoConFoto(datos: {
  seccionId: number;
  nombre: string;
  descripcion?: string;
  tieneTamanios: boolean;
}) {
  "use server";
  return await crearProducto(datos);
}

async function actionToggleDestacado(id: number, valor: boolean) {
  "use server";
  await toggleDestacado(id, valor);
}

async function actionDesactivar(id: number) {
  "use server";
  await eliminarProducto(id);
  redirect("/admin/productos");
}

async function actionReactivar(id: number) {
  "use server";
  await reactivarProducto(id);
  redirect("/admin/productos");
}

async function actionEliminarDefinitivo(id: number) {
  "use server";
  await borrarProductoDefinitivo(id);
  redirect("/admin/productos");
}

async function actionEditarProducto(id: number, nombre: string, descripcion: string) {
  "use server";
  await editarProducto(id, { nombre, descripcion: descripcion || undefined });
}

async function actionSubirFoto(productoId: number, formData: FormData) {
  "use server";
  const res = await subirFotoProducto(productoId, formData);
  return res;
}

async function actionActualizarPrecioUnico(productoId: number, precio: number) {
  "use server";
  await actualizarPrecios(productoId, [{ tamanio: "unico", precio }]);
}

async function actionActualizarPreciosPizza(
  productoId: number,
  preciosMap: Record<string, number>
) {
  "use server";
  const lista = Object.entries(preciosMap).map(([tamanio, precio]) => ({ tamanio, precio }));
  await actualizarPrecios(productoId, lista);
}

async function actionAumentoMasivo(formData: FormData) {
  "use server";
  const seccionId = Number(formData.get("seccionId"));
  const porcentaje = Number(formData.get("porcentaje"));
  await aumentoMasivo(seccionId, porcentaje);
  redirect("/admin/productos");
}

// -------- Page --------

export default async function ProductosAdminPage() {
  const seccionesList = await getSeccionesAdmin();
  const productosList = await getProductosAdmin();

  const porSeccion = seccionesList.map((s) => ({
    ...s,
    productos: productosList.filter((p) => p.seccion.id === s.id),
  }));

  // Stats calculados del mismo array, sin queries extra
  const totalProductos = productosList.length;
  const sinFoto = productosList.filter((p) => !p.fotoUrl).length;
  const inactivos = productosList.filter((p) => !p.activo).length;

  const sharedActions = {
    actionToggleDestacado,
    actionDesactivar,
    actionReactivar,
    actionEliminarDefinitivo,
    actionEditarProducto,
    actionSubirFoto,
    actionActualizarPrecioUnico,
    actionActualizarPreciosPizza,
  };

  return (
    <>
      {/* ─── DESKTOP VIEW (md+) ─── */}
      <div className="hidden md:block">
        <ProductosDesktopView
          seccionesList={seccionesList}
          productosList={productosList}
          stats={{ totalProductos, sinFoto, inactivos }}
          actionCrearProducto={actionCrearProducto}
          actionAumentoMasivo={actionAumentoMasivo}
          {...sharedActions}
        />
      </div>

      {/* ─── MOBILE VIEW (sin cambios del diseño original) ─── */}
      <div className="md:hidden min-h-screen bg-[#141210] pb-16">

        <div className="px-4 pt-5 flex flex-col gap-6">

          {/* Crear producto nuevo */}
          <details className="group border border-white/[0.1] rounded-2xl overflow-hidden bg-[#1a1814]">
            <summary className="px-5 py-4 cursor-pointer text-white font-semibold text-[15px] flex items-center justify-between select-none">
              Nuevo producto
              <span className="text-white/30 text-[22px] font-light group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="border-t border-white/[0.07] p-5">
              <NuevoProductoForm
            seccionesList={seccionesList}
            actionCrearProducto={actionCrearProductoConFoto}
            actionSubirFoto={actionSubirFoto}
          />
            </div>
          </details>

          {/* Aumento masivo */}
          <details className="group border border-white/[0.1] rounded-2xl overflow-hidden bg-[#1a1814]">
            <summary className="px-5 py-4 cursor-pointer text-white/60 font-medium text-[14px] flex items-center justify-between select-none">
              Aumento masivo de precios
              <span className="text-white/20 text-[20px] font-light group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="border-t border-white/[0.07] p-5">
              <form action={actionAumentoMasivo} className="flex flex-col gap-3">
                <select
                  name="seccionId"
                  required
                  className="w-full bg-white/[0.06] rounded-xl px-3 py-3 text-white text-[16px] outline-none border border-white/[0.08]"
                >
                  {seccionesList.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1a1814]">
                      {s.nombre}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="porcentaje"
                    placeholder="% (ej: 10 o -5)"
                    required
                    className="flex-1 bg-white/[0.06] rounded-xl px-3.5 py-3 text-white text-[16px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
                  />
                  <button
                    type="submit"
                    className="shrink-0 bg-white/[0.08] text-white/70 rounded-xl px-5 py-3 font-semibold text-[14px] active:opacity-60 transition-opacity cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </form>
            </div>
          </details>

          {/* Listado por categoría colapsable */}
          {porSeccion.map((seccion) => (
            <SeccionAcordeon
              key={seccion.id}
              nombre={seccion.nombre}
              cantidad={seccion.productos.length}
            >
              {seccion.productos.length === 0 ? (
                <p className="text-white/25 text-[13px] px-1 py-2">Sin productos en esta categoría.</p>
              ) : (
                seccion.productos.map((p) => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    secciones={seccionesList}
                    {...sharedActions}
                  />
                ))
              )}
            </SeccionAcordeon>
          ))}
        </div>

        <div className="px-5 pt-10 pb-4 text-center">
          <p className="text-white/20 text-[12px] font-medium">Panel de administración — Micio&apos;s Pizzería</p>
        </div>
      </div>
    </>
  );
}