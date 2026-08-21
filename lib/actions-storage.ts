"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
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

  // Nombre único: id del producto + timestamp
  const extension = archivo.name.split(".").pop() || "jpg";
  const nombreArchivo = `${productoId}-${Date.now()}.${extension}`;

  // Usar service role si está disponible para evitar bloqueos de RLS en storage
  const storageClient = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabase(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : supabase;

  const arrayBuffer = await archivo.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let { error: errorSubida } = await storageClient.storage
    .from("productos")
    .upload(nombreArchivo, buffer, {
      contentType: archivo.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
      cacheControl: "3600",
      upsert: true,
    });

  // Si da error de bucket no encontrado, intentar crearlo automáticamente
  if (errorSubida && (errorSubida.message?.toLowerCase().includes("not found") || (errorSubida as { statusCode?: string }).statusCode === "404")) {
    try {
      await storageClient.storage.createBucket("productos", { public: true });
      const retry = await storageClient.storage
        .from("productos")
        .upload(nombreArchivo, buffer, {
          contentType: archivo.type || `image/${extension === "jpg" ? "jpeg" : extension}`,
          cacheControl: "3600",
          upsert: true,
        });
      errorSubida = retry.error;
    } catch {
      // mantener errorSubida original si falla
    }
  }

  if (errorSubida) {
    throw new Error(`Error al subir la foto: ${errorSubida.message}`);
  }

  const { data: urlPublica } = storageClient.storage
    .from("productos")
    .getPublicUrl(nombreArchivo);

  await db
    .update(productos)
    .set({ fotoUrl: urlPublica.publicUrl })
    .where(eq(productos.id, productoId));

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
}