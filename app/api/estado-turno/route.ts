import { NextResponse } from "next/server";
import { getTurnoEstimadoActual } from "@/lib/queries/turnos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getTurnoEstimadoActual();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener estado de turnos:", error);
    return NextResponse.json(
      {
        turno: null,
        minutosEspera: 15,
        textoDemora: "Preparación inmediata (~15-20 min)",
        abierto: true,
        mensajePersonalizado: null,
      },
      { status: 200 }
    );
  }
}
