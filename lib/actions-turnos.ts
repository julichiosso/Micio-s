"use server";

import { db } from "@/lib/db";
import { estadoLocal, turnos, pedidos } from "@/db/schema";
import { eq, asc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getFechaHoyArgentina,
  isTurnoPasado,
  formatearDemoraEstimada,
} from "@/lib/date-utils";
import { asegurarTurnosDelDia } from "@/lib/queries/turnos";

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  return user;
}

// ---------- ACCIONES ADMIN (requieren autenticación) ----------

export async function actualizarEstadoLocal(datos: {
  abierto: boolean;
  mensajePersonalizado?: string | null;
  capacidadDefaultTurno?: number;
}) {
  await requireAuth();

  await db
    .insert(estadoLocal)
    .values({
      id: 1,
      abierto: datos.abierto,
      mensajePersonalizado: datos.mensajePersonalizado?.trim() || null,
      capacidadDefaultTurno: datos.capacidadDefaultTurno || 7,
      actualizadoEn: new Date(),
    })
    .onConflictDoUpdate({
      target: [estadoLocal.id],
      set: {
        abierto: datos.abierto,
        mensajePersonalizado: datos.mensajePersonalizado !== undefined
          ? (datos.mensajePersonalizado?.trim() || null)
          : undefined,
        capacidadDefaultTurno: datos.capacidadDefaultTurno !== undefined
          ? datos.capacidadDefaultTurno
          : undefined,
        actualizadoEn: new Date(),
      },
    });

  revalidatePath("/admin/turnos");
  revalidatePath("/");
  revalidatePath("/carrito");
}

export async function actualizarCapacidadTurno(turnoId: number, capacidad: number) {
  await requireAuth();

  if (capacidad < 1) capacidad = 1;
  await db
    .update(turnos)
    .set({ capacidad })
    .where(eq(turnos.id, turnoId));

  revalidatePath("/admin/turnos");
  revalidatePath("/carrito");
}

export async function toggleBloqueoTurno(turnoId: number, bloqueado: boolean) {
  await requireAuth();

  await db
    .update(turnos)
    .set({ bloqueado })
    .where(eq(turnos.id, turnoId));

  revalidatePath("/admin/turnos");
  revalidatePath("/carrito");
}

// ---------- ACCIÓN PÚBLICA / CLIENTE (Transacción atómica con lock) ----------

export async function crearPedidoConAsignacionTurno(datos: {
  clienteNombre: string;
  clienteTelefono?: string;
  horaRetiroDeseada?: string;
  total: number;
  detalles: string;
}): Promise<{
  exito: boolean;
  pedidoId?: number;
  turnoHoraInicio?: string;
  turnoHoraFin?: string;
  textoDemora?: string;
  error?: string;
}> {
  try {
    const fechaHoy = getFechaHoyArgentina();

    // Aseguramos primero fuera de la tx que existan los turnos del día si aún no se crearon
    await asegurarTurnosDelDia(fechaHoy);

    // Transacción atómica en PostgreSQL con SELECT ... FOR UPDATE
    const resultado = await db.transaction(async (tx) => {
      // 1. Validar estado del local
      const [estado] = await tx
        .select()
        .from(estadoLocal)
        .where(eq(estadoLocal.id, 1));

      if (estado && !estado.abierto) {
        throw new Error("El local se encuentra cerrado en este momento.");
      }

      // 2. Lock de los turnos de hoy para serializar la asignación bajo concurrencia
      const turnosHoy = await tx
        .select()
        .from(turnos)
        .where(eq(turnos.fecha, fechaHoy))
        .orderBy(asc(turnos.horaInicio))
        .for("update");

      let turnoSeleccionado: typeof turnos.$inferSelect | null = null;

      // 3. Buscar el primer turno disponible (no pasado, no bloqueado y con cupo)
      for (const t of turnosHoy) {
        if (isTurnoPasado(t.horaFin, t.fecha) || t.bloqueado) {
          continue;
        }

        const [conteoResult] = await tx
          .select({ count: count() })
          .from(pedidos)
          .where(eq(pedidos.turnoId, t.id));

        const pedidosActuales = Number(conteoResult?.count || 0);

        if (pedidosActuales < t.capacidad) {
          turnoSeleccionado = t;
          break;
        }
      }

      // Si todos los turnos no-pasados están al 100% de capacidad, asignamos al último turno activo
      if (!turnoSeleccionado) {
        const turnosNoPasados = turnosHoy.filter((t) => !isTurnoPasado(t.horaFin, t.fecha) && !t.bloqueado);
        turnoSeleccionado = turnosNoPasados[turnosNoPasados.length - 1] || turnosHoy[turnosHoy.length - 1] || null;
      }

      // 4. Insertar el pedido vinculado al turno asignado
      const [nuevoPedido] = await tx
        .insert(pedidos)
        .values({
          turnoId: turnoSeleccionado ? turnoSeleccionado.id : null,
          fecha: fechaHoy,
          clienteNombre: datos.clienteNombre.trim(),
          clienteTelefono: datos.clienteTelefono?.trim() || null,
          horaRetiroDeseada: datos.horaRetiroDeseada?.trim() || null,
          total: datos.total,
          detalles: datos.detalles,
        })
        .returning();

      return {
        pedidoId: nuevoPedido.id,
        turnoHoraInicio: turnoSeleccionado?.horaInicio,
        turnoHoraFin: turnoSeleccionado?.horaFin,
      };
    });

    const demora = resultado.turnoHoraInicio
      ? formatearDemoraEstimada(resultado.turnoHoraInicio)
      : { textoDemora: "Preparación inmediata" };

    revalidatePath("/admin/turnos");

    return {
      exito: true,
      pedidoId: resultado.pedidoId,
      turnoHoraInicio: resultado.turnoHoraInicio,
      turnoHoraFin: resultado.turnoHoraFin,
      textoDemora: demora.textoDemora,
    };
  } catch (error: any) {
    console.error("Error al registrar pedido con turno:", error);
    return {
      exito: false,
      error: error?.message || "Ocurrió un error al procesar el pedido.",
    };
  }
}
