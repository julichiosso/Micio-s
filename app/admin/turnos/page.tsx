import { getEstadoLocal } from "@/lib/queries/estado";
import { getTurnosConConteo } from "@/lib/queries/turnos";
import { TurnosAdminView } from "./turnos-admin-view";

export const revalidate = 0;

export default async function AdminTurnosPage() {
  const [estado, turnos] = await Promise.all([
    getEstadoLocal(),
    getTurnosConConteo(),
  ]);

  return (
    <div className="min-h-screen bg-[#141210] md:bg-gray-50 pb-16">
      <TurnosAdminView estadoInicial={estado} turnosIniciales={turnos} />
    </div>
  );
}
