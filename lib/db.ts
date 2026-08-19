import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// Si DATABASE_URL todavía no está en process.env (por ejemplo, cuando este
// archivo se importa desde un script suelto con tsx, fuera de Next.js),
// lo cargamos a mano desde .env.local
if (!process.env.DATABASE_URL) {
  const dotenv = require("dotenv");
  dotenv.config({ path: ".env.local" });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta DATABASE_URL en el .env.local");
}

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });