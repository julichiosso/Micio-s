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

  // Guardar mensaje de aviso
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

  // Modificar límite de pedidos
  async function handleCambiarCapacidad(turnoId: number, delta: number) {
    const turno = turnos.find((t) => t.id === turnoId);
    if (!turno) return;
    const nuevaCapacidad = Math.max(1, turno.capacidad + delta);

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
    <>
      {/* ═══════════════════════════════════════════════
          VISTA MOBILE (md:hidden) — 100% TEMA OSCURO
      ═══════════════════════════════════════════════ */}
      <div className="md:hidden px-4 pt-5 pb-16 flex flex-col gap-6">
        {/* Tarjeta 1: Estado del local */}
        <div className="bg-[#1a1814] border border-white/[0.1] rounded-2xl p-5">
          <p className="text-[10.5px] font-bold uppercase tracking-widest text-white/40 mb-0.5">
            Control Principal
          </p>
          <h2 className="text-[20px] font-black text-white leading-tight">
            Estado de la Pizzería
          </h2>
          <p className="text-[12.5px] text-white/55 mt-1 mb-4 leading-normal">
            Si cerrás el local, el botón de confirmar pedidos por WhatsApp queda deshabilitado en la web.
          </p>

          {/* Switch táctil grande */}
          <button
            type="button"
            onClick={handleToggleAbierto}
            disabled={isPending}
            className={`w-full py-3.5 rounded-xl font-black text-[15px] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md active:scale-98 ${
              abierto
                ? "bg-[#c6f135] text-[#141210] active:bg-[#b8e32c]"
                : "bg-red-600 text-white active:bg-red-700"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                abierto ? "bg-[#141210] animate-pulse" : "bg-white"
              }`}
            />
            <span>{abierto ? "LOCAL ABIERTO" : "LOCAL CERRADO"}</span>
          </button>

          {/* Mensaje o aviso opcional */}
          <div className="pt-5 mt-5 border-t border-white/[0.08] flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-white/80">
                Aviso o demora para clientes
              </span>
              {mensajeGuardadoOk && (
                <span className="text-[#c6f135] text-[11.5px] font-bold animate-fade-in">
                  ✓ Guardado
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Ej: Demora de 30 min por alta demanda..."
                className="flex-1 min-w-0 bg-white/[0.06] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[#c6f135]/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleGuardarMensaje()}
                disabled={guardandoMensaje || isPending}
                className="bg-[#c6f135] text-[#141210] rounded-xl px-4 py-2.5 text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {guardandoMensaje ? "..." : "Guardar"}
              </button>
              {mensaje && (
                <button
                  type="button"
                  onClick={() => {
                    setMensaje("");
                    handleGuardarMensaje("");
                  }}
                  className="bg-white/[0.08] text-white/60 hover:text-white rounded-xl px-3 py-2.5 text-[12px] font-bold transition-colors cursor-pointer"
                  title="Borrar aviso"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Chips de sugerencia rápida */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGERENCIAS_AVISOS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setMensaje(sug);
                    handleGuardarMensaje(sug);
                  }}
                  className="text-[11px] bg-white/[0.06] text-white/70 hover:text-white active:bg-white/[0.12] font-medium px-2.5 py-1.5 rounded-lg border border-white/[0.06] transition-colors cursor-pointer text-left"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Horarios y pedidos del día */}
        <div className="flex flex-col gap-3">
          <div className="px-1">
            <h3 className="text-[18px] font-black text-white leading-tight">
              Pedidos por Horario (Hoy)
            </h3>
            <p className="text-[12px] text-white/55 mt-0.5 leading-normal">
              El sistema acomoda automáticamente los pedidos cada 15 min. Si un horario se llena, le avisa la demora al cliente.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-white/[0.08] text-white/80 text-[11.5px] font-bold px-3 py-1.5 rounded-xl border border-white/[0.08]">
                Total pedidos: <b>{totalPedidosHoy}</b>
              </span>
              <span className="bg-[#c6f135]/15 text-[#c6f135] text-[11.5px] font-bold px-3 py-1.5 rounded-xl border border-[#c6f135]/30">
                {horariosConLugar} con lugar
              </span>
            </div>
          </div>

          {/* Listado de slots */}
          <div className="flex flex-col gap-3">
            {turnos.map((t) => {
              const esLleno = t.pedidosCount >= t.capacidad;
              const esCasiLleno = !esLleno && t.ocupacionPct >= 70;

              let estadoTexto = "Con lugar";
              let badgeStyle = "bg-[#c6f135]/20 text-[#c6f135] border-[#c6f135]/30";

              if (t.pasado) {
                estadoTexto = "Horario pasado";
                badgeStyle = "bg-white/[0.04] text-white/30 border-white/[0.06]";
              } else if (t.bloqueado) {
                estadoTexto = "Pausado";
                badgeStyle = "bg-red-500/20 text-red-300 border-red-500/30";
              } else if (esLleno) {
                estadoTexto = "Lleno";
                badgeStyle = "bg-red-500/25 text-red-300 border-red-500/40";
              } else if (esCasiLleno) {
                estadoTexto = "Casi lleno";
                badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/30";
              }

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    t.pasado
                      ? "bg-[#161412] border-white/[0.05] opacity-50"
                      : t.bloqueado
                      ? "bg-[#201515] border-red-500/25"
                      : esLleno
                      ? "bg-[#1f1616] border-red-500/35"
                      : "bg-[#1a1814] border-white/[0.1]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-black text-white tracking-tight">
                        {t.horaInicio} a {t.horaFin} hs
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}
                      >
                        {estadoTexto}
                      </span>
                    </div>

                    {!t.pasado && (
                      <button
                        type="button"
                        onClick={() => handleToggleBloqueo(t.id, t.bloqueado)}
                        className={`text-[11.5px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer active:opacity-70 ${
                          t.bloqueado
                            ? "bg-white/[0.1] border-white/20 text-white hover:bg-white/[0.15]"
                            : "bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-red-400"
                        }`}
                      >
                        {t.bloqueado ? "Habilitar" : "Pausar"}
                      </button>
                    )}
                  </div>

                  {/* Barra de pedidos */}
                  <div className="my-2.5">
                    <div className="flex justify-between text-[12.5px] font-medium text-white/60 mb-1">
                      <span>
                        Entraron: <b className="text-white">{t.pedidosCount}</b> de {t.capacidad} pedidos
                      </span>
                      <span>{t.ocupacionPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          t.pasado
                            ? "bg-white/20"
                            : esLleno
                            ? "bg-red-500"
                            : esCasiLleno
                            ? "bg-amber-400"
                            : "bg-[#c6f135]"
                        }`}
                        style={{ width: `${t.ocupacionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Ajuste de límite de pedidos */}
                  {!t.pasado && (
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/[0.06] text-[12.5px]">
                      <span className="text-white/60 font-medium">
                        Límite de pedidos:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCambiarCapacidad(t.id, -1)}
                          disabled={t.capacidad <= 1 || isPending}
                          className="w-8 h-8 rounded-lg bg-white/[0.1] hover:bg-white/[0.18] active:scale-95 text-white font-bold flex items-center justify-center transition-all disabled:opacity-25 cursor-pointer text-[15px]"
                          aria-label="Restar límite"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-black text-white text-[15px]">
                          {t.capacidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCambiarCapacidad(t.id, 1)}
                          disabled={isPending}
                          className="w-8 h-8 rounded-lg bg-white/[0.1] hover:bg-white/[0.18] active:scale-95 text-white font-bold flex items-center justify-center transition-all cursor-pointer text-[15px]"
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
        </div>

        <div className="px-5 pt-6 pb-2 text-center">
          <p className="text-white/20 text-[12px] font-medium">
            Panel de administración — Micio&apos;s Pizzería
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          VISTA DESKTOP (hidden md:block) — TEMA CLARO
      ═══════════════════════════════════════════════ */}
      <div className="hidden md:block p-8 max-w-5xl mx-auto flex flex-col gap-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Control Principal
              </span>
              <h2 className="text-[22px] font-black text-gray-900 mt-0.5">
                Estado del Local
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Si está cerrado, los clientes no podrán confirmar pedidos por WhatsApp en la web.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleAbierto}
              disabled={isPending}
              className={`px-6 py-3.5 rounded-2xl font-black text-[15px] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm active:scale-98 ${
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

          <div className="pt-4 flex flex-col gap-3">
            <label className="text-[12px] font-bold text-gray-700 flex items-center justify-between">
              <span>Aviso o demora para clientes (opcional)</span>
              {mensajeGuardadoOk && (
                <span className="text-emerald-600 text-[11.5px] font-semibold">
                  ✓ Guardado
                </span>
              )}
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Ej: Demora de 30 min por alta demanda..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => handleGuardarMensaje()}
                disabled={guardandoMensaje || isPending}
                className="bg-gray-900 text-white rounded-xl px-4 py-2.5 text-[13px] font-bold hover:bg-black transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
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
                  className="bg-gray-100 text-gray-600 hover:text-red-600 rounded-xl px-3 py-2.5 text-[12px] font-medium transition-colors cursor-pointer"
                  title="Borrar aviso"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGERENCIAS_AVISOS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setMensaje(sug);
                    handleGuardarMensaje(sug);
                  }}
                  className="text-[11.5px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-[18px] font-black text-gray-900">
                Pedidos por Horario (Hoy)
              </h3>
              <p className="text-[12.5px] text-gray-500">
                Los pedidos se van acomodando automáticamente cada 15 min. Si un horario se llena, el sistema le avisa la demora al siguiente cliente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 text-gray-700 text-[12px] font-bold px-3 py-1.5 rounded-xl border border-gray-200">
                Total pedidos: <b>{totalPedidosHoy}</b>
              </span>
              <span className="bg-[#c6f135]/20 text-[#3e4d00] text-[12px] font-bold px-3 py-1.5 rounded-xl border border-[#c6f135]/40">
                {horariosConLugar} con lugar
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {turnos.map((t) => {
              const esLleno = t.pedidosCount >= t.capacidad;
              const esCasiLleno = !esLleno && t.ocupacionPct >= 70;

              let estadoTexto = "Con lugar";
              let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";

              if (t.pasado) {
                estadoTexto = "Horario pasado";
                badgeBg = "bg-gray-100 text-gray-400 border-gray-200";
              } else if (t.bloqueado) {
                estadoTexto = "Pausado";
                badgeBg = "bg-red-50 text-red-600 border-red-200";
              } else if (esLleno) {
                estadoTexto = "Lleno";
                badgeBg = "bg-red-50 text-red-700 border-red-200";
              } else if (esCasiLleno) {
                estadoTexto = "Casi lleno";
                badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
              }

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    t.pasado
                      ? "bg-gray-50/70 border-gray-200 opacity-60"
                      : t.bloqueado
                      ? "bg-red-50/30 border-red-100"
                      : esLleno
                      ? "bg-white border-red-200 shadow-sm"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-black text-gray-900">
                        {t.horaInicio} a {t.horaFin} hs
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeBg}`}
                      >
                        {estadoTexto}
                      </span>
                    </div>

                    {!t.pasado && (
                      <button
                        type="button"
                        onClick={() => handleToggleBloqueo(t.id, t.bloqueado)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          t.bloqueado
                            ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200"
                        }`}
                      >
                        {t.bloqueado ? "Habilitar" : "Pausar"}
                      </button>
                    )}
                  </div>

                  <div className="my-2.5">
                    <div className="flex justify-between text-[12px] font-medium text-gray-600 mb-1">
                      <span>
                        Entraron: <b>{t.pedidosCount}</b> de {t.capacidad} pedidos
                      </span>
                      <span>{t.ocupacionPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          t.pasado
                            ? "bg-gray-300"
                            : esLleno
                            ? "bg-red-500"
                            : esCasiLleno
                            ? "bg-amber-400"
                            : "bg-[#7fa800]"
                        }`}
                        style={{ width: `${t.ocupacionPct}%` }}
                      />
                    </div>
                  </div>

                  {!t.pasado && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[12px]">
                      <span className="text-gray-500 font-medium">
                        Límite de pedidos:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCambiarCapacidad(t.id, -1)}
                          disabled={t.capacidad <= 1 || isPending}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                          aria-label="Restar límite"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900 text-[13px]">
                          {t.capacidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCambiarCapacidad(t.id, 1)}
                          disabled={isPending}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
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
    </>

);
}
