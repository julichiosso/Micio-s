"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { productos } from "@/db/schema";
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

  // Nombre único: id del producto + timestamp, para evitar pisar archivos
  // y para que el navegador no cachee la foto vieja al reemplazarla.
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