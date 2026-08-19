import { getSeccionesAdmin } from "@/lib/queries/admin";
import { crearSeccion, editarSeccion, eliminarSeccion } from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <main style={{ padding: 20, maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold" }}>Secciones</h1>
        <Link href="/admin/productos" style={{ fontSize: 14, color: "#555" }}>
          ← Volver a productos
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {seccionesList.map((s) => (
          <div key={s.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10, opacity: s.activo ? 1 : 0.5 }}>
            <strong>{s.nombre}</strong>{" "}
            <span style={{ fontSize: 12, color: "#888" }}>
              {s.activo ? "activa" : "inactiva"}
            </span>

            <form action={actionEditarSeccion} style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input type="hidden" name="id" value={s.id} />
              <input type="text" name="nombre" placeholder="Nuevo nombre" style={{ flex: 1 }} />
              <button type="submit">Renombrar</button>
            </form>

            {s.activo && (
              <form action={actionEliminarSeccion} style={{ marginTop: 8 }}>
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" style={{ color: "#b00" }}>Desactivar</button>
              </form>
            )}
          </div>
        ))}
      </div>

      <form action={actionCrearSeccion} style={{ display: "flex", gap: 6 }}>
        <input type="text" name="nombre" placeholder="Nombre de sección nueva" required style={{ flex: 1 }} />
        <button type="submit">Crear</button>
      </form>
    </main>
  );
}