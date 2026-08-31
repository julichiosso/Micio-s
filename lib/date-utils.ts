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
// Por defecto: 20:00 a 23:00 (12 turnos)
export function generarSlotsHorarios(
  horaDesde: string = "20:00",
  horaHasta: string = "23:00",
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

// Calcula una descripción amigable de la demora estimada para el cliente
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
  // Estimamos un tiempo de preparación base de 15-20 min sumado a la diferencia de turnos
  const minEstimados = diffMin <= 0 ? 15 : diffMin + 15;

  let textoDemora = "";
  if (minEstimados <= 15) {
    textoDemora = "Preparación inmediata (~15-20 min)";
  } else {
    textoDemora = `Turno de las ${horaInicioTurno} hs (~${minEstimados} min de espera)`;
  }

  return {
    minutosEspera: minEstimados,
    textoDemora,
  };
}
