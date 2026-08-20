import { db } from "../lib/db";
import { secciones } from "../db/schema";

async function main() {
  const existentes = await db.query.secciones.findMany();
  const nombres = existentes.map(s => s.nombre.toLowerCase());

  if (!nombres.includes("bebidas")) {
    await db.insert(secciones).values({ nombre: "Bebidas", orden: 2 });
    console.log("Sección Bebidas creada.");
  }
  if (!nombres.includes("postres")) {
    await db.insert(secciones).values({ nombre: "Postres", orden: 3 });
    console.log("Sección Postres creada.");
  }

  process.exit(0);
}

main().catch(console.error);
