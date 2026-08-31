"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EstadoLocalData } from "@/lib/queries/estado";
import { TurnoConConteo } from "@/lib/queries/turnos";
import {
  actualizarEstadoLocal,
  actualizarCapacidadTurno,
  toggleBloqueoTurno,
} from "@/lib/actions-turnos";

type Props = {
  estadoInicial: EstadoLocalData;
  turnosIniciales: TurnoConConteo[];
};

const SUGERENCIAS_AVISOS = [
  "Demora de 25-30 min por mucha demanda",
  "Demora de 40-50 min por lluvia",
  "Últimos pedidos de la noche",
  "Tomando pedidos con normalidad",
];

export function TurnosAdminView({ estadoInicial, turnosIniciales }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [abierto, setAbierto] = useState(estadoInicial.abierto);
  const [mensaje, setMensaje] = useState(estadoInicial.mensajePersonalizado || "");
  const [turnos, setTurnos] = useState<TurnoConConteo[]>(turnosIniciales);
  const [guardandoMensaje, setGuardandoMensaje] = useState(false);
  const [mensajeGuardadoOk, setMensajeGuardadoOk] = useState(false);

  // Sincronizar props del servidor
  useEffect(() => {
    setAbierto(estadoInicial.abierto);
    setMensaje(estadoInicial.mensajePersonalizado || "");
    setTurnos(turnosIniciales);
  }, [estadoInicial, turnosIniciales]);

  // Polling automático cada 20 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 20000);
    return () => clearInterval(interval);
  }, [router]);

  // Toggle Abierto / Cerrado
  async function handleToggleAbierto() {
    const nuevoEstado = !abierto;
    setAbierto(nuevoEstado);
    startTransition(async () => {
      await actualizarEstadoLocal({
        abierto: nuevoEstado,
        mensajePersonalizado: mensaje,
      });
      router.refresh();
    });
  }

  // Guardar mensaje de estado o aviso especial
  async function handleGuardarMensaje(nuevoTexto?: string) {
    const texto = nuevoTexto !== undefined ? nuevoTexto : mensaje;
    setGuardandoMensaje(true);
    startTransition(async () => {
      await actualizarEstadoLocal({
        abierto,
        mensajePersonalizado: texto,
      });
      setGuardandoMensaje(false);
      setMensajeGuardadoOk(true);
      setTimeout(() => setMensajeGuardadoOk(false), 2000);
      router.refresh();
    });
  }

  // Modificar límite de pedidos de un horario específico
  async function handleCambiarCapacidad(turnoId: number, delta: number) {
    const turno = turnos.find((t) => t.id === turnoId);
    if (!turno) return;
    const nuevaCapacidad = Math.max(1, turno.capacidad + delta);

    // Actualización optimista inmediata
    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoId ? { ...t, capacidad: nuevaCapacidad } : t
      )
    );

    startTransition(async () => {
      await actualizarCapacidadTurno(turnoId, nuevaCapacidad);
      router.refresh();
    });
  }

  // Pausar / Habilitar horario
  async function handleToggleBloqueo(turnoId: number, bloqueadoActual: boolean) {
    const nuevoBloqueo = !bloqueadoActual;

    // Actualización optimista inmediata
    setTurnos((prev) =>
      prev.map((t) =>
        t.id === turnoId ? { ...t, bloqueado: nuevoBloqueo } : t
      )
    );

    startTransition(async () => {
      await toggleBloqueoTurno(turnoId, nuevoBloqueo);
      router.refresh();
    });
  }

  const totalPedidosHoy = turnos.reduce((acc, t) => acc + t.pedidosCount, 0);
  const horariosConLugar = turnos.filter((t) => t.disponible).length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* ─── TARJETA 1: ESTADO DEL LOCAL ─── */}
      <section className="bg-[#1a1814] md:bg-white rounded-2xl border border-white/[0.1] md:border-gray-200 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] md:border-gray-100">
          <div>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/40 md:text-gray-400">
              Control Principal
            </span>
            <h2 className="text-[20px] md:text-[22px] font-black text-white md:text-gray-900 mt-0.5">
              Estado del Local
            </h2>
            <p className="text-[12.5px] md:text-[13px] text-white/60 md:text-gray-500 mt-0.5">
              Si está cerrado, los clientes no podrán confirmar pedidos por WhatsApp.
            </p>
          </div>

          {/* Switch táctil grande */}
          <button
            type="button"
            onClick={handleToggleAbierto}
            disabled={isPending}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-[15px] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm active:scale-98 ${
              abierto
                ? "bg-[#c6f135] text-[#141210] hover:bg-[#b8e32c]"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                abierto ? "bg-[#141210] animate-pulse" : "bg-white"
              }`}
            />
            <span>{abierto ? "LOCAL ABIERTO" : "LOCAL CERRADO"}</span>
          </button>
        </div>

        {/* Mensaje de aviso opcional */}
        <div className="pt-4 flex flex-col gap-3">
          <label className="text-[12px] font-bold text-white/80 md:text-gray-700 flex items-center justify-between">
            <span>Aviso para los clientes (opcional)</span>
            {mensajeGuardadoOk && (
              <span className="text-[#c6f135] md:text-emerald-600 text-[11.5px] font-semibold animate-fade-in">
                ✓ Guardado
              </span>
            )}
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej: Demora de 30 min por mucha demanda..."
              className="flex-1 bg-white/[0.06] md:bg-gray-50 border border-white/[0.1] md:border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-white md:text-gray-900 placeholder:text-white/30 md:placeholder:text-gray-400 outline-none focus:border-[#c6f135]/50 md:focus:border-gray-400 focus:bg-white/[0.09] md:focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => handleGuardarMensaje()}
              disabled={guardandoMensaje || isPending}
              className="bg-[#c6f135] text-[#141210] md:bg-gray-900 md:text-white rounded-xl px-4 py-2.5 text-[13px] font-bold hover:opacity-90 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {guardandoMensaje ? "Guardando..." : "Guardar"}
            </button>
            {mensaje && (
              <button
                type="button"
                onClick={() => {
                  setMensaje("");
                  handleGuardarMensaje("");
                }}
                className="bg-white/[0.08] md:bg-gray-100 text-white/60 md:text-gray-600 hover:text-red-400 rounded-xl px-3 py-2.5 text-[12px] font-medium transition-colors cursor-pointer"
                title="Borrar aviso"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sugerencias de un toque */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGERENCIAS_AVISOS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => {
                  setMensaje(sug);
                  handleGuardarMensaje(sug);
                }}
                className="text-[11.5px] bg-white/[0.06] md:bg-gray-100 hover:bg-white/[0.12] md:hover:bg-gray-200 text-white/70 md:text-gray-700 font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TARJETA 2: HORARIOS Y LÍMITES DE PEDIDOS ─── */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-[18px] font-black text-white md:text-gray-900">
              Pedidos por Horario (Hoy)
            </h3>
            <p className="text-[12.5px] text-white/60 md:text-gray-500">
              Los pedidos se van acomodando solos cada 15 min. Si un horario se llena, el sistema le avisa la demora al siguiente cliente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/[0.08] md:bg-gray-100 text-white/80 md:text-gray-700 text-[12px] font-bold px-3 py-1.5 rounded-xl border border-white/[0.08] md:border-gray-200">
              Total pedidos: <b>{totalPedidosHoy}</b>
            </span>
            <span className="bg-[#c6f135]/20 text-[#c6f135] md:text-[#3e4d00] text-[12px] font-bold px-3 py-1.5 rounded-xl border border-[#c6f135]/30 md:border-[#c6f135]/40">
              {horariosConLugar} horarios con lugar
            </span>
          </div>
        </div>

        {/* Grid de Horarios: Mobile 1 col, Desktop 2 col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {turnos.map((t) => {
            const esLleno = t.pedidosCount >= t.capacidad;
            const esCasiLleno = !esLleno && t.ocupacionPct >= 70;

            let estadoTexto = "Con lugar";
            let badgeStyle = "bg-[#c6f135]/20 text-[#c6f135] border-[#c6f135]/30 md:bg-emerald-50 md:text-emerald-700 md:border-emerald-200";

            if (t.pasado) {
              estadoTexto = "Horario pasado";
              badgeStyle = "bg-white/[0.04] text-white/30 border-white/[0.06] md:bg-gray-100 md:text-gray-400 md:border-gray-200";
            } else if (t.bloqueado) {
              estadoTexto = "Pausado";
              badgeStyle = "bg-red-500/20 text-red-300 border-red-500/30 md:bg-red-50 md:text-red-600 md:border-red-200";
            } else if (esLleno) {
              estadoTexto = "Lleno";
              badgeStyle = "bg-red-500/25 text-red-300 border-red-500/40 md:bg-red-50 md:text-red-700 md:border-red-200";
            } else if (esCasiLleno) {
              estadoTexto = "Casi lleno";
              badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/30 md:bg-amber-50 md:text-amber-700 md:border-amber-200";
            }

            return (
              <div
                key={t.id}
                className={`rounded-2xl border p-4 transition-all ${
                  t.pasado
                    ? "bg-[#161412] md:bg-gray-50/70 border-white/[0.05] md:border-gray-200 opacity-50"
                    : t.bloqueado
                    ? "bg-[#201515] md:bg-red-50/30 border-red-500/20 md:border-red-100"
                    : esLleno
                    ? "bg-[#1f1616] md:bg-white border-red-500/30 md:border-red-200 shadow-sm"
                    : "bg-[#1a1814] md:bg-white border-white/[0.1] md:border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-black text-white md:text-gray-900">
                      {t.horaInicio} a {t.horaFin} hs
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}
                    >
                      {estadoTexto}
                    </span>
                  </div>

                  {/* Botón pausar/habilitar horario */}
                  {!t.pasado && (
                    <button
                      type="button"
                      onClick={() => handleToggleBloqueo(t.id, t.bloqueado)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        t.bloqueado
                          ? "bg-white/[0.1] md:bg-white border-white/20 md:border-gray-300 text-white md:text-gray-700 hover:bg-white/[0.15]"
                          : "bg-white/[0.05] md:bg-gray-50 border-white/[0.08] md:border-gray-200 text-white/50 md:text-gray-500 hover:text-red-400 hover:border-red-400/30"
                      }`}
                    >
                      {t.bloqueado ? "Habilitar" : "Pausar"}
                    </button>
                  )}
                </div>

                {/* Barra de pedidos */}
                <div className="my-2.5">
                  <div className="flex justify-between text-[12px] font-medium text-white/60 md:text-gray-600 mb-1">
                    <span>
                      Entraron: <b className="text-white md:text-gray-900">{t.pedidosCount}</b> de {t.capacidad} pedidos
                    </span>
                    <span>{t.ocupacionPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.08] md:bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        t.pasado
                          ? "bg-white/20 md:bg-gray-300"
                          : esLleno
                          ? "bg-red-500"
                          : esCasiLleno
                          ? "bg-amber-400"
                          : "bg-[#c6f135] md:bg-[#7fa800]"
                      }`}
                      style={{ width: `${t.ocupacionPct}%` }}
                    />
                  </div>
                </div>

                {/* Ajuste de límite de pedidos */}
                {!t.pasado && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] md:border-gray-100 text-[12px]">
                    <span className="text-white/50 md:text-gray-500 font-medium">
                      Límite de pedidos:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCambiarCapacidad(t.id, -1)}
                        disabled={t.capacidad <= 1 || isPending}
                        className="w-8 h-8 rounded-lg bg-white/[0.08] md:bg-gray-100 hover:bg-white/[0.15] md:hover:bg-gray-200 active:scale-95 text-white md:text-gray-700 font-bold flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
                        aria-label="Restar límite"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-black text-white md:text-gray-900 text-[14px]">
                        {t.capacidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCambiarCapacidad(t.id, 1)}
                        disabled={isPending}
                        className="w-8 h-8 rounded-lg bg-white/[0.08] md:bg-gray-100 hover:bg-white/[0.15] md:hover:bg-gray-200 active:scale-95 text-white md:text-gray-700 font-bold flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Sumar límite"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
