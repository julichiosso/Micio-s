import { db } from "@/lib/db";
import { productos } from "@/db/schema";
import { asc } from "drizzle-orm";

// A diferencia de lib/queries/productos.ts (que es para el catálogo público
// y solo trae activos), acá el admin necesita ver TODO: activos e inactivos,
// para poder reactivar algo que se desactivó por error.

export async function getSeccionesAdmin() {
  return db.query.secciones.findMany({
    orderBy: (secciones, { asc }) => [asc(secciones.orden)],
  });
}

export async function getProductosAdmin() {
  return db.query.productos.findMany({
    orderBy: [asc(productos.seccionId), asc(productos.orden)],
    with: {
      precios: true,
      seccion: true,
    },
  });
}