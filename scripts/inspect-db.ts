import { db } from "../lib/db";
import { productos, secciones, precios } from "../db/schema";

async function main() {
  const secs = await db.query.secciones.findMany();
  console.log("=== SECCIONES ===");
  console.log(secs);

  const prods = await db.query.productos.findMany({
    with: { precios: true, seccion: true }
  });
  console.log("=== DETALLE PRODUCTOS ===");
  console.log(JSON.stringify(prods, null, 2));

  process.exit(0);
}

main().catch(console.error);
