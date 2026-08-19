import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta DATABASE_URL en el .env.local");
}

// prepare: false porque estamos usando el pooler de Supabase (modo transaction)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });