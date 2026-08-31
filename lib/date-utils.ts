// Utilidades de fecha y hora explícitas para Argentina (America/Argentina/Buenos_Aires)

export const TIMEZONE_ARGENTINA = "America/Argentina/Buenos_Aires";

// Obtener fecha actual en Argentina en formato YYYY-MM-DD
export function getFechaHoyArgentina(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_ARGENTINA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // Retorna "YYYY-MM-DD"
}

// Obtener hora actual en Argentina en formato HH:MM (24 horas)
export function getHoraActualArgentina(): string {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE_ARGENTINA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date()); // Retorna "HH:MM"
}

// Genera los slots de turnos de 15 min entre horaInicio y horaFin
// Rango activo: 15:30 a 23:30 (slots de 15 min para pruebas y servicio)
export function generarSlotsHorarios(
  horaDesde: string = "15:30",
  horaHasta: string = "23:30",
  intervaloMinutos: number = 15
): { horaInicio: string; horaFin: string }[] {
  const slots: { horaInicio: string; horaFin: string }[] = [];

  const [hDesde, mDesde] = horaDesde.split(":").map(Number);
  const [hHasta, mHasta] = horaHasta.split(":").map(Number);

  let inicioMin = hDesde * 60 + mDesde;
  const finMin = hHasta * 60 + mHasta;

  while (inicioMin < finMin) {
    const siguienteMin = inicioMin + intervaloMinutos;
    const h1 = String(Math.floor(inicioMin / 60)).padStart(2, "0");
    const m1 = String(inicioMin % 60).padStart(2, "0");
    const h2 = String(Math.floor(siguienteMin / 60)).padStart(2, "0");
    const m2 = String(siguienteMin % 60).padStart(2, "0");

    slots.push({
      horaInicio: `${h1}:${m1}`,
      horaFin: `${h2}:${m2}`,
    });

    inicioMin = siguienteMin;
  }

  return slots;
}

// Determina si un turno ya pasó para la fecha dada (o hoy si no se especifica)
export function isTurnoPasado(horaFin: string, fechaTurno?: string): boolean {
  const fechaHoy = getFechaHoyArgentina();
  const fecha = fechaTurno || fechaHoy;

  if (fecha < fechaHoy) return true;
  if (fecha > fechaHoy) return false;

  const horaActual = getHoraActualArgentina();
  return horaActual >= horaFin;
}

// Formatear demora estimada de forma natural e inteligente para el cliente (Take Away)
export function formatearDemoraEstimada(horaInicioTurno: string): {
  minutosEspera: number;
  textoDemora: string;
} {
  const horaActual = getHoraActualArgentina();
  const [hAct, mAct] = horaActual.split(":").map(Number);
  const [hTurno, mTurno] = horaInicioTurno.split(":").map(Number);

  const actTotalMin = hAct * 60 + mAct;
  const turnoTotalMin = hTurno * 60 + mTurno;

  const diffMin = Math.max(0, turnoTotalMin - actTotalMin);

  // Si el turno asignado es el actual o inicia en breves minutos
  if (diffMin <= 5) {
    return {
      minutosEspera: 15,
      textoDemora: `Preparación estimada: ~15 a 20 min (${horaInicioTurno} hs)`,
    };
  }

  // Si el turno actual está lleno y pasa a un turno posterior
  const esperaAprox = diffMin + 15;
  return {
    minutosEspera: esperaAprox,
    textoDemora: `Horario asignado: ${horaInicioTurno} hs (~${esperaAprox} min de espera)`,
  };
}
