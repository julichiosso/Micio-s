/**
 * Migración: Horario configurable + Estado de pedidos
 *
 * Agrega:
 * - hora_apertura, hora_cierre a estado_local
 * - estado, expira_en a pedidos
 *
 * Idempotente: usa IF NOT EXISTS, seguro de re-ejecutar.
 *
 * Ejecutar con:
 *   npx tsx scripts/migrate-horario-configurable.ts
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🔄 Iniciando migración: horario configurable + estado de pedidos...");

  // 1. Agregar hora_apertura a estado_local
  await db.execute(sql`
    ALTER TABLE estado_local
    ADD COLUMN IF NOT EXISTS hora_apertura TEXT NOT NULL DEFAULT '20:00'
  `);
  console.log("✅ hora_apertura agregada a estado_local");

  // 2. Agregar hora_cierre a estado_local
  await db.execute(sql`
    ALTER TABLE estado_local
    ADD COLUMN IF NOT EXISTS hora_cierre TEXT NOT NULL DEFAULT '23:00'
  `);
  console.log("✅ hora_cierre agregada a estado_local");

  // 3. Agregar estado a pedidos
  // default 'confirmado' para que los pedidos existentes sin estado sean tratados como confirmados
  await db.execute(sql`
    ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'confirmado'
  `);
  console.log("✅ estado agregado a pedidos (default: 'confirmado')");

  // 4. Agregar expira_en a pedidos (nullable: pedidos confirmados/viejos no tienen expiración)
  await db.execute(sql`
    ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS expira_en TIMESTAMPTZ
  `);
  console.log("✅ expira_en agregado a pedidos");

  // 5. Asegurar que la fila singleton de estado_local tenga valores iniciales correctos
  await db.execute(sql`
    INSERT INTO estado_local (id, abierto, capacidad_default_turno, hora_apertura, hora_cierre, actualizado_en)
    VALUES (1, true, 7, '20:00', '23:00', NOW())
    ON CONFLICT (id) DO UPDATE SET
      hora_apertura = COALESCE(estado_local.hora_apertura, '20:00'),
      hora_cierre   = COALESCE(estado_local.hora_cierre, '23:00')
  `);
  console.log("✅ Fila singleton estado_local asegurada con horario 20:00-23:00");

  console.log("\n🎉 Migración completada exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error en la migración:", err);
  process.exit(1);
});
