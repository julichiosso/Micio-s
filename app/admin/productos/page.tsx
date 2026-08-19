import { getSeccionesAdmin, getProductosAdmin } from "@/lib/queries/admin";
import {
  crearProducto,
  editarProducto,
  eliminarProducto,
  reactivarProducto,
  actualizarPrecios,
  aumentoMasivo,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

async function actionCrearProducto(formData: FormData) {
  "use server";
  await crearProducto({
    seccionId: Number(formData.get("seccionId")),
    nombre: formData.get("nombre") as string,
    descripcion: (formData.get("descripcion") as string) || undefined,
    tieneTamanios: formData.get("tieneTamanios") === "on",
  });
  redirect("/admin/productos");
}

async function actionEditarProducto(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await editarProducto(id, {
    nombre: formData.get("nombre") as string,
    descripcion: (formData.get("descripcion") as string) || undefined,
  });
  redirect("/admin/productos");
}

async function actionEliminarProducto(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await eliminarProducto(id);
  redirect("/admin/productos");
}

async function actionReactivarProducto(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await reactivarProducto(id);
  redirect("/admin/productos");
}

async function actionActualizarPrecioUnico(formData: FormData) {
  "use server";
  const productoId = Number(formData.get("productoId"));
  const precio = Number(formData.get("precio"));
  await actualizarPrecios(productoId, [{ tamanio: "unico", precio }]);
  redirect("/admin/productos");
}

async function actionActualizarPreciosPizza(formData: FormData) {
  "use server";
  const productoId = Number(formData.get("productoId"));
  const lista = ["xl", "media_xl", "clasica", "media_clasica"]
    .map((tamanio) => ({
      tamanio,
      precio: Number(formData.get(`precio_${tamanio}`)),
    }))
    .filter((p) => !isNaN(p.precio) && p.precio > 0);
  await actualizarPrecios(productoId, lista);
  redirect("/admin/productos");
}

async function actionAumentoMasivo(formData: FormData) {
  "use server";
  const seccionId = Number(formData.get("seccionId"));
  const porcentaje = Number(formData.get("porcentaje"));
  await aumentoMasivo(seccionId, porcentaje);
  redirect("/admin/productos");
}

const LABELS: Record<string, string> = {
  xl: "XL",
  media_xl: "1/2 XL",
  clasica: "Clásica",
  media_clasica: "Clásica 1/2",
  unico: "Único",
};

export default async function ProductosAdminPage() {
  const seccionesList = await getSeccionesAdmin();
  const productosList = await getProductosAdmin();

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold" }}>Productos</h1>
        <Link href="/admin/secciones" style={{ fontSize: 14, color: "#555" }}>
          Ir a secciones →
        </Link>
      </div>

      {/* Aumento masivo */}
      <details style={{ marginBottom: 20, border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <summary style={{ fontWeight: "bold", cursor: "pointer" }}>
          Aumentar precios por sección
        </summary>
        <form action={actionAumentoMasivo} style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <select name="seccionId" required style={{ flex: 1 }}>
            {seccionesList.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
          <input type="number" name="porcentaje" placeholder="% (ej: 10)" required style={{ width: 100 }} />
          <button type="submit">Aplicar</button>
        </form>
      </details>

      {/* Crear producto */}
      <details style={{ marginBottom: 24, border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <summary style={{ fontWeight: "bold", cursor: "pointer" }}>+ Cargar producto nuevo</summary>
        <form action={actionCrearProducto} style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <select name="seccionId" required>
            {seccionesList.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
          <input type="text" name="nombre" placeholder="Nombre del producto" required />
          <input type="text" name="descripcion" placeholder="Descripción (opcional)" />
          <label>
            <input type="checkbox" name="tieneTamanios" /> Tiene varios tamaños (como las pizzas)
          </label>
          <button type="submit">Crear</button>
        </form>
      </details>

      {/* Listado */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {productosList.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              opacity: p.activo ? 1 : 0.5,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{p.nombre}</strong>
              <span style={{ fontSize: 12, color: "#888" }}>{p.seccion.nombre}</span>
            </div>
            {p.descripcion && (
              <p style={{ fontSize: 13, color: "#666", margin: "4px 0" }}>{p.descripcion}</p>
            )}
            <p style={{ fontSize: 13, margin: "4px 0" }}>
              {p.precios.length
                ? p.precios
                    .map((pr) => `${LABELS[pr.tamanio] ?? pr.tamanio}: $${pr.precio.toLocaleString("es-AR")}`)
                    .join(" · ")
                : "Sin precios cargados"}
            </p>

            {/* Editar precios */}
            {p.tieneTamanios ? (
              <form action={actionActualizarPreciosPizza} style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <input type="hidden" name="productoId" value={p.id} />
                {["xl", "media_xl", "clasica", "media_clasica"].map((tam) => (
                  <input
                    key={tam}
                    type="number"
                    name={`precio_${tam}`}
                    placeholder={LABELS[tam]}
                    defaultValue={p.precios.find((pr) => pr.tamanio === tam)?.precio ?? ""}
                    style={{ width: 90 }}
                  />
                ))}
                <button type="submit">Guardar precios</button>
              </form>
            ) : (
              <form action={actionActualizarPrecioUnico} style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input type="hidden" name="productoId" value={p.id} />
                <input
                  type="number"
                  name="precio"
                  placeholder="Precio"
                  defaultValue={p.precios[0]?.precio ?? ""}
                  style={{ width: 100 }}
                />
                <button type="submit">Guardar precio</button>
              </form>
            )}

            {/* Editar datos */}
            <form action={actionEditarProducto} style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input type="hidden" name="id" value={p.id} />
              <input type="text" name="nombre" placeholder="Nuevo nombre" style={{ flex: 1 }} />
              <input type="text" name="descripcion" placeholder="Nueva descripción" style={{ flex: 1 }} />
              <button type="submit">Editar</button>
            </form>

            {/* Activar/desactivar */}
            {p.activo ? (
              <form action={actionEliminarProducto} style={{ marginTop: 8 }}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" style={{ color: "#b00" }}>Desactivar</button>
              </form>
            ) : (
              <form action={actionReactivarProducto} style={{ marginTop: 8 }}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" style={{ color: "#080" }}>Reactivar</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}