import { db } from "@/lib/db";
import { turnos, pedidos } from "@/db/schema";
import { eq, asc, and, or, gt, isNull } from "drizzle-orm";
import {
  getFechaHoyArgentina,
  getHoraActualArgentina,
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
// Lee horaApertura/horaCierre desde estado_local (fuente única de verdad)
export async function asegurarTurnosDelDia(fechaDeseada?: string): Promise<void> {
  const fecha = fechaDeseada || getFechaHoyArgentina();
  const estado = await getEstadoLocal();

  // Usar los horarios configurados por el dueño desde el admin
  const horaDesde = estado.horaApertura || "20:00";
  const horaHasta = estado.horaCierre || "23:00";

  const slots = generarSlotsHorarios(horaDesde, horaHasta, 15);

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

// Cuenta pedidos vigentes de un turno:
// - estado = 'confirmado', O
// - estado = 'pendiente' Y expira_en > NOW() (reserva aún válida)
async function contarPedidosVigentes(turnoId: number): Promise<number> {
  const ahora = new Date();

  const resultado = await db
    .select()
    .from(pedidos)
    .where(
      and(
        eq(pedidos.turnoId, turnoId),
        or(
          eq(pedidos.estado, "confirmado"),
          and(
            eq(pedidos.estado, "pendiente"),
            gt(pedidos.expiraEn, ahora)
          )
        )
      )
    );

  return resultado.length;
}

// Obtiene todos los turnos del día con su conteo de pedidos vigentes y estado
export async function getTurnosConConteo(fechaDeseada?: string): Promise<TurnoConConteo[]> {
  const fecha = fechaDeseada || getFechaHoyArgentina();

  // Aseguramos que existan primero
  await asegurarTurnosDelDia(fecha);

  const turnosList = await db.query.turnos.findMany({
    where: eq(turnos.fecha, fecha),
    orderBy: [asc(turnos.horaInicio)],
  });

  // Contar pedidos vigentes por turno (confirmados + pendientes no vencidos)
  const turnosConConteo = await Promise.all(
    turnosList.map(async (t) => {
      const pedidosCount = await contarPedidosVigentes(t.id);
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
    })
  );

  return turnosConConteo;
}

// Calcula si el local está abierto considerando horario configurado + switch manual
// Lógica: abierto_efectivo = switch_manual_ON AND horaActual >= horaApertura AND horaActual < horaCierre
export function calcularAbiertoEfectivo(
  switchManualOn: boolean,
  horaApertura: string,
  horaCierre: string
): boolean {
  if (!switchManualOn) return false; // Switch manual apagado = cerrado inmediatamente

  const horaActual = getHoraActualArgentina();
  return horaActual >= horaApertura && horaActual < horaCierre;
}

// Obtiene el turno estimado disponible para un cliente en este momento
export async function getTurnoEstimadoActual(): Promise<{
  turno: TurnoConConteo | null;
  minutosEspera: number;
  textoDemora: string;
  abierto: boolean;
  mensajePersonalizado: string | null;
  horaApertura: string;
  horaCierre: string;
}> {
  const estado = await getEstadoLocal();

  // Verificar si está abierto efectivamente (switch + horario)
  const abiertoEfectivo = calcularAbiertoEfectivo(
    estado.abierto,
    estado.horaApertura,
    estado.horaCierre
  );

  if (!abiertoEfectivo) {
    return {
      turno: null,
      minutosEspera: 0,
      textoDemora: "Local cerrado",
      abierto: false,
      mensajePersonalizado: estado.mensajePersonalizado,
      horaApertura: estado.horaApertura,
      horaCierre: estado.horaCierre,
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
      horaApertura: estado.horaApertura,
      horaCierre: estado.horaCierre,
    };
  }

  // Si todos los turnos están llenos o pasados pero el local sigue abierto
  const ultimoTurno = turnosHoy[turnosHoy.length - 1];
  return {
    turno: ultimoTurno ?? null,
    minutosEspera: 45,
    textoDemora: "Alta demanda: demora aproximada ~45-60 min",
    abierto: true,
    mensajePersonalizado: estado.mensajePersonalizado,
    horaApertura: estado.horaApertura,
    horaCierre: estado.horaCierre,
  };
}
