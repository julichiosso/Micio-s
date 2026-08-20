import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { db } from "../lib/db";
import { productos } from "./schema";
import { eq } from "drizzle-orm";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
  );
  process.exit(1);
}

// Cliente con permisos totales (service role) — solo para este script,
// nunca se usa este cliente del lado del navegador.
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CARPETA_PUBLIC = path.join(process.cwd(), "public");
const EXTENSIONES_VALIDAS = [".jpg", ".jpeg", ".png", ".webp"];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca acentos
    .replace(/[^a-z0-9]/g, ""); // saca espacios, puntos, comas, etc.
}

async function subirFotos() {
  // 1. Traer todos los productos de la base
  const todosLosProductos = await db.select().from(productos);
  console.log(`Encontrados ${todosLosProductos.length} productos en la base.`);

  // 2. Listar archivos de imagen disponibles en /public
  const archivos = fs
    .readdirSync(CARPETA_PUBLIC)
    .filter((archivo) =>
      EXTENSIONES_VALIDAS.includes(path.extname(archivo).toLowerCase())
    );
  console.log(`Encontrados ${archivos.length} archivos de imagen en /public.`);

  let subidas = 0;
  let sinMatch = 0;

  for (const producto of todosLosProductos) {
    const nombreNormalizado = normalizar(producto.nombre);

    // Buscar un archivo cuyo nombre (sin extensión, normalizado) coincida
    const archivoEncontrado = archivos.find((archivo) => {
      const nombreArchivo = normalizar(path.basename(archivo, path.extname(archivo)));
      return (
        nombreArchivo === nombreNormalizado ||
        nombreArchivo.includes(nombreNormalizado) ||
        nombreNormalizado.includes(nombreArchivo)
      );
    });

    if (!archivoEncontrado) {
      console.log(`⚠️  Sin foto para "${producto.nombre}" — se omite.`);
      sinMatch++;
      continue;
    }

    // Leer el archivo y subirlo a Storage
    const rutaCompleta = path.join(CARPETA_PUBLIC, archivoEncontrado);
    const buffer = fs.readFileSync(rutaCompleta);
    const extension = path.extname(archivoEncontrado).slice(1);
    const nombreEnStorage = `${producto.id}-${Date.now()}.${extension}`;

    const { error: errorSubida } = await supabase.storage
      .from("productos")
      .upload(nombreEnStorage, buffer, {
        contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
        upsert: false,
      });

    if (errorSubida) {
      console.error(
        `❌ Error subiendo "${archivoEncontrado}" para "${producto.nombre}": ${errorSubida.message}`
      );
      continue;
    }

    const { data: urlPublica } = supabase.storage
      .from("productos")
      .getPublicUrl(nombreEnStorage);

    await db
      .update(productos)
      .set({ fotoUrl: urlPublica.publicUrl })
      .where(eq(productos.id, producto.id));

    console.log(`✅ "${producto.nombre}" ← ${archivoEncontrado}`);
    subidas++;
  }

  console.log(`\nListo. ${subidas} fotos subidas, ${sinMatch} productos sin foto encontrada.`);
  process.exit(0);
}

subirFotos().catch((err) => {
  console.error("Error en el script:", err);
  process.exit(1);
});