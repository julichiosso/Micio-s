import { db } from "@/lib/db";
import { secciones, productos, precios } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Trae todas las secciones activas, ordenadas.
 */
export async function getSecciones() {
  return db.query.secciones.findMany({
    where: eq(secciones.activo, true),
    orderBy: (secciones, { asc }) => [asc(secciones.orden)],
  });
}

/**
 * Trae una sección por su slug/nombre (normalizado) junto con sus
 * productos activos y los precios de cada uno.
 */
export async function getSeccionConProductos(slug: string) {
  // El slug viene de la URL en minúsculas (ej: "pizzas"), y el nombre
  // en la base está con mayúscula ("Pizzas"), así que comparamos normalizado.
  const todasLasSecciones = await getSecciones();
  const seccion = todasLasSecciones.find(
    (s) => normalizar(s.nombre) === normalizar(slug)
  );

  if (!seccion) return null;

  const productosDeSeccion = await db.query.productos.findMany({
    where: and(
      eq(productos.seccionId, seccion.id),
      eq(productos.activo, true)
    ),
    orderBy: (productos, { asc }) => [asc(productos.orden)],
    with: {
      precios: true,
    },
  });

  return { seccion, productos: productosDeSeccion };
}

/**
 * Trae un producto puntual con sus precios y su sección.
 */
export async function getProductoPorId(id: number) {
  return db.query.productos.findFirst({
    where: eq(productos.id, id),
    with: {
      precios: true,
      seccion: true,
    },
  });
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // saca acentos
}