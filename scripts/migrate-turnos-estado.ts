// Script para crear las tablas estado_local, turnos y pedidos
// Ejecutar con: npx tsx scripts/migrate-turnos-estado.ts

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
  console.log("Aplicando migración: tablas estado_local, turnos y pedidos...");
  try {
    // 1. Tabla estado_local (singleton)
    await sql`
      CREATE TABLE IF NOT EXISTS estado_local (
        id SERIAL PRIMARY KEY,
        abierto BOOLEAN NOT NULL DEFAULT true,
        mensaje_personalizado TEXT,
        capacidad_default_turno INTEGER NOT NULL DEFAULT 7,
        actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Asegurar registro inicial (singleton id=1)
    await sql`
      INSERT INTO estado_local (id, abierto, capacidad_default_turno)
      VALUES (1, true, 7)
      ON CONFLICT (id) DO NOTHING;
    `;

    // 2. Tabla turnos
    await sql`
      CREATE TABLE IF NOT EXISTS turnos (
        id SERIAL PRIMARY KEY,
        fecha TEXT NOT NULL,
        hora_inicio TEXT NOT NULL,
        hora_fin TEXT NOT NULL,
        capacidad INTEGER NOT NULL DEFAULT 7,
        bloqueado BOOLEAN NOT NULL DEFAULT false,
        creado_en TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Unique constraint para evitar duplicados en misma fecha y hora
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'turno_fecha_hora_inicio_unico'
        ) THEN
          ALTER TABLE turnos ADD CONSTRAINT turno_fecha_hora_inicio_unico UNIQUE (fecha, hora_inicio);
        END IF;
      END $$;
    `;

    // 3. Tabla pedidos
    await sql`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        turno_id INTEGER REFERENCES turnos(id) ON DELETE SET NULL,
        fecha TEXT NOT NULL,
        cliente_nombre TEXT NOT NULL,
        cliente_telefono TEXT,
        hora_retiro_deseada TEXT,
        total INTEGER NOT NULL,
        detalles TEXT NOT NULL,
        creado_en TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    console.log("✓ Tablas 'estado_local', 'turnos' y 'pedidos' migradas exitosamente.");
  } catch (error) {
    console.error("Error al migrar tablas de turnos y estado:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
