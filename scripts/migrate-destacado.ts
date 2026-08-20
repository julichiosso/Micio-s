// Script para agregar la columna 'destacado' a la tabla productos via SQL directo
// Ejecutar con: npx tsx scripts/migrate-destacado.ts

import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: Falta DATABASE_URL en .env.local");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function main() {
  console.log("Aplicando migración: columna destacado en productos...");
  try {
    await sql`ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT false`;
    console.log("✓ Columna 'destacado' agregada correctamente (o ya existía).");
  } catch (error) {
    console.error("Error al migrar:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
