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
  console.log("Limpiando duplicados de la tabla precios...");
  try {
    const res = await sql`
      DELETE FROM precios a USING precios b
      WHERE a.id > b.id
      AND a.producto_id = b.producto_id
      AND a.tamanio = b.tamanio;
    `;
    console.log("✓ Duplicados eliminados correctamente.");

    // Aplicar constraint unique en postgres por seguridad
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'precio_producto_tamanio_unico'
        ) THEN
          ALTER TABLE precios ADD CONSTRAINT precio_producto_tamanio_unico UNIQUE (producto_id, tamanio);
        END IF;
      END $$;
    `;
    console.log("✓ Constraint precio_producto_tamanio_unico verificada/aplicada en DB.");
  } catch (error) {
    console.error("Error al limpiar duplicados:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
