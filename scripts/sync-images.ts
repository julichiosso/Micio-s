import { db } from "../lib/db";
import { productos } from "../db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Mapeo entre nombres de productos y archivos en /public
const MAPEO_IMAGENES: Record<string, string> = {
  "Ananá y J. Crudo": "/AnanaJcrudo.jpg.jpeg",
  "Anchoas": "/Anchoas.jpg.jpeg",
  "Champiñón": "/Champiñones.jpg.jpeg",
  "Especial": "/Especial.jpg.jpeg",
  "Fugazza": "/Fugazeta.jpg.jpeg",
  "Mediterránea": "/Mediterranea.jpg.jpeg",
  "Muzzarella": "/Muzzarella.jpg.jpeg",
  "Napolitana": "/Napolitana.jpg.jpeg",
  "Palmitos": "/Palmitos.jpg.jpeg",
  "Pepperoni": "/Pepperoni.jpg.jpeg",
  "Roquefort": "/Roquefort.jpg.jpeg",
  "BBQ Pulled Pork": "/BbqPulledPork.jpg.jpeg",
  "Chicken Ranch": "/ChickenRanch.jpg.jpeg",
  "Onion, Chedar y Bacon": "/OnionCyB.jpg.jpeg",
};

async function sync() {
  console.log("Iniciando sincronización de imágenes...");

  // 1. Corregir producto ID 2 si tiene nombre vacío
  await db.update(productos)
    .set({ nombre: "Anchoas" })
    .where(eq(productos.id, 2));

  // 2. Traer todos los productos
  const todos = await db.query.productos.findMany();

  for (const prod of todos) {
    const nombreNormalizado = prod.nombre.trim();
    const imagen = MAPEO_IMAGENES[nombreNormalizado];

    if (imagen) {
      // Verificar que el archivo existe en public
      const rutaPublica = path.join(process.cwd(), "public", imagen.replace(/^\//, ""));
      if (fs.existsSync(rutaPublica)) {
        console.log(`Asignando imagen a "${prod.nombre}" (ID: ${prod.id}) -> ${imagen}`);
        await db.update(productos)
          .set({ 
            fotoUrl: imagen,
            // Ponemos como destacados algunas pizzas populares para que la home se vea increíble
            destacado: ["Muzzarella", "Especial", "Napolitana", "Pepperoni", "BBQ Pulled Pork"].includes(nombreNormalizado)
          })
          .where(eq(productos.id, prod.id));
      } else {
        console.warn(`Archivo no encontrado: ${rutaPublica}`);
      }
    }
  }

  console.log("Sincronización completada.");
  process.exit(0);
}

sync().catch(err => {
  console.error("Error al sincronizar:", err);
  process.exit(1);
});
