import { db } from "@/lib/db";
import { turnos, pedidos } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  getFechaHoyArgentina,
  generarSlotsHorarios,
  isTurnoPasado,
  formatearDemoraEstimada,
} from "@/lib/date-utils";
import { getEstadoLocal } from "./estado";

export type TurnoConConteo = {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidad: number;
  bloqueado: boolean;
  pedidosCount: number;
  ocupacionPct: number;
  pasado: boolean;
  disponible: boolean;
};

// Asegura que existan los turnos del día en la BD con ON CONFLICT DO NOTHING
export async function asegurarTurnosDelDia(fechaDeseada?: string): Promise<void> {
  const fecha = fechaDeseada || getFechaHoyArgentina();
  const estado = await getEstadoLocal();
  const slots = generarSlotsHorarios("15:30", "23:30", 15);

  const filas = slots.map((slot) => ({
    fecha,
    horaInicio: slot.horaInicio,
    horaFin: slot.horaFin,
    capacidad: estado.capacidadDefaultTurno || 7,
    bloqueado: false,
  }));

  // Insert múltiple con ON CONFLICT DO NOTHING para evitar race conditions
  await db
    .insert(turnos)
    .values(filas)
    .onConflictDoNothing({
      target: [turnos.fecha, turnos.horaInicio],
    });
}

// Obtiene todos los turnos del día con su conteo de pedidos y estado
export async function getTurnosConConteo(fechaDeseada?: string): Promise<TurnoConConteo[]> {
  const fecha = fechaDeseada || getFechaHoyArgentina();

  // Aseguramos que existan primero
  await asegurarTurnosDelDia(fecha);

  const turnosList = await db.query.turnos.findMany({
    where: eq(turnos.fecha, fecha),
    orderBy: [asc(turnos.horaInicio)],
    with: {
      pedidos: true,
    },
  });

  return turnosList.map((t) => {
    const pedidosCount = t.pedidos?.length ?? 0;
    const pasado = isTurnoPasado(t.horaFin, t.fecha);
    const disponible = !pasado && !t.bloqueado && pedidosCount < t.capacidad;
    const ocupacionPct = Math.min(100, Math.round((pedidosCount / Math.max(1, t.capacidad)) * 100));

    return {
      id: t.id,
      fecha: t.fecha,
      horaInicio: t.horaInicio,
      horaFin: t.horaFin,
      capacidad: t.capacidad,
      bloqueado: t.bloqueado,
      pedidosCount,
      ocupacionPct,
      pasado,
      disponible,
    };
  });
}

// Obtiene el turno estimado disponible para un cliente en este momento
export async function getTurnoEstimadoActual(): Promise<{
  turno: TurnoConConteo | null;
  minutosEspera: number;
  textoDemora: string;
  abierto: boolean;
  mensajePersonalizado: string | null;
}> {
  const estado = await getEstadoLocal();
  if (!estado.abierto) {
    return {
      turno: null,
      minutosEspera: 0,
      textoDemora: "Local cerrado",
      abierto: false,
      mensajePersonalizado: estado.mensajePersonalizado,
    };
  }

  const turnosHoy = await getTurnosConConteo();

  // Buscamos el primer turno que no haya pasado, no esté bloqueado y tenga cupo
  const turnoLibre = turnosHoy.find((t) => t.disponible);

  if (turnoLibre) {
    const demora = formatearDemoraEstimada(turnoLibre.horaInicio);
    return {
      turno: turnoLibre,
      minutosEspera: demora.minutosEspera,
      textoDemora: demora.textoDemora,
      abierto: true,
      mensajePersonalizado: estado.mensajePersonalizado,
    };
  }

  // Si todos los turnos están llenos o pasados pero el local sigue abierto,
  // tomamos el último turno del día o avisamos demora extendida
  const ultimoTurno = turnosHoy[turnosHoy.length - 1];
  return {
    turno: ultimoTurno ?? null,
    minutosEspera: 45,
    textoDemora: "Alta demanda: demora aproximada ~45-60 min",
    abierto: true,
    mensajePersonalizado: estado.mensajePersonalizado,
  };
}
