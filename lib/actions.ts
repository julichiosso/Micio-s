"use server";

import { db } from "@/lib/db";
import { secciones, productos, precios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Todas las acciones de acá abajo son solo para el panel admin.
// Esta función chequea que haya sesión antes de dejar hacer nada.
async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  return user;
}

// ---------- SECCIONES ----------

export async function crearSeccion(nombre: string) {
  await requireAuth();
  const [nueva] = await db.insert(secciones).values({ nombre }).returning();
  revalidatePath("/admin/secciones");
  return nueva;
}

export async function editarSeccion(id: number, nombre: string) {
  await requireAuth();
  await db.update(secciones).set({ nombre }).where(eq(secciones.id, id));
  revalidatePath("/admin/secciones");
}

export async function eliminarSeccion(id: number) {
  await requireAuth();
  // Borrado lógico: la desactivamos en vez de borrarla
  await db.update(secciones).set({ activo: false }).where(eq(secciones.id, id));
  revalidatePath("/admin/secciones");
  revalidatePath("/", "layout");
}

export async function reactivarSeccion(id: number) {
  await requireAuth();
  await db.update(secciones).set({ activo: true }).where(eq(secciones.id, id));
  revalidatePath("/admin/secciones");
  revalidatePath("/", "layout");
}

export async function borrarSeccionDefinitiva(id: number) {
  await requireAuth();
  // Traer productos de la sección para limpiar precios asociados
  const prods = await db.query.productos.findMany({
    where: eq(productos.seccionId, id),
  });
  for (const p of prods) {
    await db.delete(precios).where(eq(precios.productoId, p.id));
  }
  await db.delete(productos).where(eq(productos.seccionId, id));
  await db.delete(secciones).where(eq(secciones.id, id));
  revalidatePath("/admin/secciones");
  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}

// ---------- PRODUCTOS ----------

export async function crearProducto(datos: {
  seccionId: number;
  nombre: string;
  descripcion?: string;
  tieneTamanios: boolean;
  fotoUrl?: string;
  // Precios opcionales: si vienen, se cargan en la misma operación de
  // crear el producto (así el empleado no tiene que volver a "Editar"
  // después solo para poner el precio).
  precios?: { tamanio: string; precio: number }[];
}) {
  await requireAuth();
  const [nuevo] = await db
    .insert(productos)
    .values({
      seccionId: datos.seccionId,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      tieneTamanios: datos.tieneTamanios,
      fotoUrl: datos.fotoUrl,
    })
    .returning();

  if (datos.precios && datos.precios.length > 0) {
    for (const p of datos.precios) {
      if (!p.precio || p.precio <= 0) continue;
      const tamanio = p.tamanio as
        | "xl"
        | "media_xl"
        | "clasica"
        | "media_clasica"
        | "unico";
      await db.insert(precios).values({
        productoId: nuevo.id,
        tamanio,
        precio: p.precio,
      });
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
  return nuevo;
}

export async function editarProducto(
  id: number,
  datos: Partial<{
    nombre: string;
    descripcion: string;
    fotoUrl: string;
    seccionId: number;
    tieneTamanios: boolean;
    destacado: boolean;
  }>
) {
  await requireAuth();
  await db.update(productos).set(datos).where(eq(productos.id, id));
  revalidatePath("/admin/productos");
}

export async function eliminarProducto(id: number) {
  await requireAuth();
  // Borrado lógico también acá: se desactiva, no desaparece del historial.
  await db.update(productos).set({ activo: false }).where(eq(productos.id, id));
  revalidatePath("/admin/productos");
}

export async function toggleDestacado(id: number, valor: boolean) {
  await requireAuth();
  await db.update(productos).set({ destacado: valor }).where(eq(productos.id, id));
  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}

export async function borrarProductoDefinitivo(id: number) {
  await requireAuth();
  // Borrado real e irreversible de la base de datos.
  await db.delete(precios).where(eq(precios.productoId, id));
  await db.delete(productos).where(eq(productos.id, id));
  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}

export async function reactivarProducto(id: number) {
  await requireAuth();
  await db.update(productos).set({ activo: true }).where(eq(productos.id, id));
  revalidatePath("/admin/productos");
}

// ---------- PRECIOS ----------

export async function actualizarPrecios(
  productoId: number,
  listaPrecios: { tamanio: string; precio: number }[]
) {
  await requireAuth();

  if (listaPrecios.length === 0) {
    revalidatePath("/admin/productos");
    return;
  }

  for (const p of listaPrecios) {
    const tamanio = p.tamanio as
      | "xl"
      | "media_xl"
      | "clasica"
      | "media_clasica"
      | "unico";

    await db
      .insert(precios)
      .values({ productoId, tamanio, precio: p.precio })
      .onConflictDoUpdate({
        target: [precios.productoId, precios.tamanio],
        set: { precio: p.precio },
      });
  }

  // Si algún tamaño que antes tenía precio ya no viene en la lista nueva,
  // lo borramos (ej: el producto pasa de "varios tamaños" a "precio único").
  const tamaniosNuevos = listaPrecios.map((p) => p.tamanio);
  const preciosActuales = await db.query.precios.findMany({
    where: eq(precios.productoId, productoId),
  });
  for (const precioActual of preciosActuales) {
    if (!tamaniosNuevos.includes(precioActual.tamanio)) {
      await db.delete(precios).where(eq(precios.id, precioActual.id));
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}

// Aumento masivo: sube (o baja) un % a todos los precios de una sección.
export async function aumentoMasivo(seccionId: number, porcentaje: number) {
  await requireAuth();

  const productosDeSeccion = await db.query.productos.findMany({
    where: eq(productos.seccionId, seccionId),
    with: { precios: true },
  });

  for (const producto of productosDeSeccion) {
    for (const precio of producto.precios) {
      const nuevoPrecio = Math.round(
        precio.precio * (1 + porcentaje / 100)
      );
      await db
        .update(precios)
        .set({ precio: nuevoPrecio })
        .where(eq(precios.id, precio.id));
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}