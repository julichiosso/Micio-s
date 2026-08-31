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

// Determina si un turno ya pasó para la fecha dada
export function isTurnoPasado(horaFin: string, fechaTurno?: string): boolean {
  const fechaHoy = getFechaHoyArgentina();
  const fecha = fechaTurno || fechaHoy;

  if (fecha < fechaHoy) return true;
  if (fecha > fechaHoy) return false;

  const horaActual = getHoraActualArgentina();
  return horaActual >= horaFin;
}

// Formatear demora estimada de forma natural, humana y clara (Pizzería Take Away)
// El cliente retira cuando la tanda termina (horaFin) o en ~15-20 min.
export function formatearDemoraEstimada(horaInicioTurno: string, horaFinTurno?: string): {
  minutosEspera: number;
  textoDemora: string;
  horaEstimadaRetiro: string;
} {
  const horaActual = getHoraActualArgentina();
  const [hAct, mAct] = horaActual.split(":").map(Number);
  const [hTurno, mTurno] = horaInicioTurno.split(":").map(Number);

  const actTotalMin = hAct * 60 + mAct;
  const turnoTotalMin = hTurno * 60 + mTurno;

  // Si no pasaron horaFin, calculamos 15 min después de horaInicio
  let horaFinCalculada = horaFinTurno;
  if (!horaFinCalculada) {
    const finMin = turnoTotalMin + 15;
    const hF = String(Math.floor(finMin / 60) % 24).padStart(2, "0");
    const mF = String(finMin % 60).padStart(2, "0");
    horaFinCalculada = `${hF}:${mF}`;
  }

  const [hFin, mFin] = horaFinCalculada.split(":").map(Number);
  const finTotalMin = hFin * 60 + mFin;
  const diffHastaFin = Math.max(15, finTotalMin - actTotalMin);

  // Caso 1: Turno actual inmediato (demora estándar de preparación ~15-20 min)
  if (turnoTotalMin <= actTotalMin + 5) {
    return {
      minutosEspera: 15,
      textoDemora: "Demora estimada: 15 a 20 min",
      horaEstimadaRetiro: horaFinCalculada,
    };
  }

  // Caso 2: Hay turnos anteriores llenos, se pasa a una tanda posterior
  const minutosCalculados = Math.round(diffHastaFin / 5) * 5; // redondeado a múltiplos de 5 min
  return {
    minutosEspera: minutosCalculados,
    textoDemora: `Demora estimada: ~${minutosCalculados} min`,
    horaEstimadaRetiro: horaFinCalculada,
  };
}
