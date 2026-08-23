"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { productos, secciones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function subirFotoProducto(productoId: number, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const archivo = formData.get("foto") as File;
  if (!archivo || archivo.size === 0) {
    throw new Error("No se seleccionó ningún archivo");
  }

  const extension = archivo.name.split(".").pop();
  const nombreArchivo = `${productoId}-${Date.now()}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from("productos")
    .upload(nombreArchivo, archivo, {
      cacheControl: "3600",
      upsert: false,
    });

  if (errorSubida) {
    throw new Error(`Error al subir la foto: ${errorSubida.message}`);
  }

  const { data: urlPublica } = supabase.storage
    .from("productos")
    .getPublicUrl(nombreArchivo);

  await db
    .update(productos)
    .set({ fotoUrl: urlPublica.publicUrl })
    .where(eq(productos.id, productoId));

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}

export async function subirFotoSeccion(seccionId: number, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const archivo = formData.get("foto") as File;
  if (!archivo || archivo.size === 0) {
    throw new Error("No se seleccionó ningún archivo");
  }

  const extension = archivo.name.split(".").pop();
  // Prefijo "seccion-" para no chocar nunca con nombres de fotos de productos
  // en el mismo bucket.
  const nombreArchivo = `seccion-${seccionId}-${Date.now()}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from("productos")
    .upload(nombreArchivo, archivo, {
      cacheControl: "3600",
      upsert: false,
    });

  if (errorSubida) {
    throw new Error(`Error al subir la foto: ${errorSubida.message}`);
  }

  const { data: urlPublica } = supabase.storage
    .from("productos")
    .getPublicUrl(nombreArchivo);

  await db
    .update(secciones)
    .set({ fotoUrl: urlPublica.publicUrl })
    .where(eq(secciones.id, seccionId));

  revalidatePath("/admin/secciones");
  revalidatePath("/", "layout");
}