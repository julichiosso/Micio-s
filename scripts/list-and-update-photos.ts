import { db } from "../lib/db";
import { productos, secciones } from "../db/schema";
import fs from "fs";
import path from "path";

async function main() {
  const prods = await db.query.productos.findMany({
    with: { seccion: true },
  });

  console.log("=== PRODUCTOS EN DB ===");
  for (const p of prods) {
    console.log(`ID: ${p.id} | Nombre: "${p.nombre}" | Seccion: "${p.seccion?.nombre}" | FotoUrl: "${p.fotoUrl}" | Destacado: ${p.destacado}`);
  }

  const publicFiles = fs.readdirSync(path.join(process.cwd(), "public"));
  console.log("\n=== ARCHIVOS EN PUBLIC ===");
  console.log(publicFiles);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
