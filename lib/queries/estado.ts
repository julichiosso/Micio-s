import { db } from "@/lib/db";
import { estadoLocal } from "@/db/schema";
import { eq } from "drizzle-orm";

export type EstadoLocalData = {
  id: number;
  abierto: boolean;
  mensajePersonalizado: string | null;
  capacidadDefaultTurno: number;
  horaApertura: string;
  horaCierre: string;
  actualizadoEn: Date;
};

// Trae el estado singleton del local (id = 1)
export async function getEstadoLocal(): Promise<EstadoLocalData> {
  const estado = await db.query.estadoLocal.findFirst({
    where: eq(estadoLocal.id, 1),
  });

  if (estado) {
    return {
      ...estado,
      horaApertura: estado.horaApertura ?? "20:00",
      horaCierre: estado.horaCierre ?? "23:00",
    };
  }

  // Fallback si no estuviera creado aún
  const [nuevo] = await db
    .insert(estadoLocal)
    .values({
      id: 1,
      abierto: true,
      capacidadDefaultTurno: 7,
      horaApertura: "20:00",
      horaCierre: "23:00",
    })
    .onConflictDoNothing()
    .returning();

  return (
    nuevo ?? {
      id: 1,
      abierto: true,
      mensajePersonalizado: null,
      capacidadDefaultTurno: 7,
      horaApertura: "20:00",
      horaCierre: "23:00",
      actualizadoEn: new Date(),
    }
  );
}
