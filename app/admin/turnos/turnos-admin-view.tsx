"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EstadoLocalData } from "@/lib/queries/estado";
import { TurnoConConteo } from "@/lib/queries/turnos";
import {
  actualizarEstadoLocal,
  actualizarCapacidadTurno,
  toggleBloqueoTurno,
} from "@/lib/actions-turnos";
import { IconChevronDown } from "@/app/icons";

type Props = {
  estadoInicial: EstadoLocalData;
  turnosIniciales: TurnoConConteo[];
};

// Sugerencias adaptadas a Take Away (retiro y pago en el local)
const SUGERENCIAS_AVISOS = [
  "Demora de 25-30 min por alta demanda",
  "Solo retiro y pago en mostrador",
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

  // Horario configurable
  const [horaApertura, setHoraApertura] = useState(estadoInicial.horaApertura || "20:00");
  const [horaCierre, setHoraCierre] = useState(estadoInicial.horaCierre || "23:00");
  const [guardandoHorario, setGuardandoHorario] = useState(false);
  const [horarioGuardadoOk, setHorarioGuardadoOk] = useState(false);

  // Estados colapsables por franja horaria (dinámico para cualquier hora)
  const [bloquesAbiertos, setBloquesAbiertos] = useState<Record<string, boolean>>({});

  function toggleBloque(horaStr: string) {
    setBloquesAbiertos((prev) => {
      const estadoActual = prev[horaStr] !== false;
      return { ...prev, [horaStr]: !estadoActual };
    });
  }

  useEffect(() => {
    setAbierto(estadoInicial.abierto);
    setMensaje(estadoInicial.mensajePersonalizado || "");
    setTurnos(turnosIniciales);
    setHoraApertura(estadoInicial.horaApertura || "20:00");
    setHoraCierre(estadoInicial.horaCierre || "23:00");
  }, [estadoInicial, turnosIniciales]);

  // Polling automático cada 20 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => { router.refresh(); });
    }, 20000);
    return () => clearInterval(interval);
  }, [router]);

  async function handleToggleAbierto() {
    const nuevoEstado = !abierto;
    setAbierto(nuevoEstado);
    startTransition(async () => {
      await actualizarEstadoLocal({
        abierto: nuevoEstado,
        mensajePersonalizado: mensaje,
        horaApertura,
        horaCierre,
      });
      router.refresh();
    });
  }

  async function handleGuardarMensaje(nuevoTexto?: string) {
    const texto = nuevoTexto !== undefined ? nuevoTexto : mensaje;
    setGuardandoMensaje(true);
    startTransition(async () => {
      await actualizarEstadoLocal({
        abierto,
        mensajePersonalizado: texto,
        horaApertura,
        horaCierre,
      });
      setGuardandoMensaje(false);
      setMensajeGuardadoOk(true);
      setTimeout(() => setMensajeGuardadoOk(false), 2000);
      router.refresh();
    });
  }

  async function handleGuardarHorario() {
    setGuardandoHorario(true);
    startTransition(async () => {
      await actualizarEstadoLocal({
        abierto,
        mensajePersonalizado: mensaje,
        horaApertura,
        horaCierre,
      });
      setGuardandoHorario(false);
      setHorarioGuardadoOk(true);
      setTimeout(() => setHorarioGuardadoOk(false), 2500);
      router.refresh();
    });
  }

  async function handleCambiarCapacidad(turnoId: number, delta: number) {
    const turno = turnos.find((t) => t.id === turnoId);
    if (!turno) return;
    const nuevaCapacidad = Math.max(1, turno.capacidad + delta);

    setTurnos((prev) =>
      prev.map((t) => (t.id === turnoId ? { ...t, capacidad: nuevaCapacidad } : t))
    );

    startTransition(async () => {
      await actualizarCapacidadTurno(turnoId, nuevaCapacidad);
      router.refresh();
    });
  }

  async function handleToggleBloqueo(turnoId: number, bloqueadoActual: boolean) {
    const nuevoBloqueo = !bloqueadoActual;
    setTurnos((prev) =>
      prev.map((t) => (t.id === turnoId ? { ...t, bloqueado: nuevoBloqueo } : t))
    );
    startTransition(async () => {
      await toggleBloqueoTurno(turnoId, nuevoBloqueo);
      router.refresh();
    });
  }

  const totalPedidosHoy = turnos.reduce((acc, t) => acc + t.pedidosCount, 0);
  const horariosConLugar = turnos.filter((t) => t.disponible).length;

  const gruposPorHora = useMemo(() => {
    const grupos: Record<string, TurnoConConteo[]> = {};
    for (const t of turnos) {
      const hora = t.horaInicio.split(":")[0];
      if (!grupos[hora]) grupos[hora] = [];
      grupos[hora].push(t);
    }
    return Object.entries(grupos).map(([hora, lista]) => ({
      hora,
      pedidosEnHora: lista.reduce((acc, it) => acc + it.pedidosCount, 0),
      turnos: lista,
    }));
  }, [turnos]);

  // ─── Componente de tarjeta de turno (reutilizado en mobile y desktop) ─────
  function TarjetaTurno({ t, modo }: { t: TurnoConConteo; modo: "mobile" | "desktop" }) {
    const esLleno = t.pedidosCount >= t.capacidad;
    const esCasiLleno = !esLleno && t.ocupacionPct >= 70;

    if (modo === "mobile") {
      let estadoTexto = "Con lugar";
      let badgeStyle = "bg-[#c6f135]/20 text-[#c6f135] border-[#c6f135]/30";
      if (t.pasado) { estadoTexto = "Pasado"; badgeStyle = "bg-white/[0.04] text-white/30 border-white/[0.06]"; }
      else if (t.bloqueado) { estadoTexto = "Pausado"; badgeStyle = "bg-red-500/20 text-red-300 border-red-500/30"; }
      else if (esLleno) { estadoTexto = "Lleno"; badgeStyle = "bg-red-500/25 text-red-300 border-red-500/40"; }
      else if (esCasiLleno) { estadoTexto = "Casi lleno"; badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/30"; }

      return (
        <div className={`rounded-2xl border p-4 transition-all ${
          t.pasado ? "bg-[#171513] border-white/[0.04] opacity-50"
          : t.bloqueado ? "bg-[#201515] border-red-500/20"
          : esLleno ? "bg-[#1f1616] border-red-500/30"
          : "bg-[#1a1814] border-white/[0.08]"
        }`}>
          {/* Fila 1: Hora + Estado + Botón Pausar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[15.5px] font-black text-white tracking-tight">
                {t.horaInicio} a {t.horaFin} hs
              </span>
              <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                {estadoTexto}
              </span>
            </div>
            {!t.pasado && (
              <button
                type="button"
                onClick={() => handleToggleBloqueo(t.id, t.bloqueado)}
                className={`text-[11.5px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer active:scale-95 ${
                  t.bloqueado
                    ? "bg-white/[0.12] border-white/25 text-white"
                    : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-red-400"
                }`}
              >
                {t.bloqueado ? "Habilitar" : "Pausar"}
              </button>
            )}
          </div>

          {/* Fila 2: Barra de ocupación y texto */}
          <div className="my-2.5">
            <div className="flex justify-between text-[12px] font-medium text-white/60 mb-1.5">
              <span>Entraron: <b className="text-white font-bold">{t.pedidosCount}</b> de {t.capacidad} pedidos</span>
              <span className="font-bold">{t.ocupacionPct}%</span>
            </div>
            <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  t.pasado ? "bg-white/20" : esLleno ? "bg-red-500" : esCasiLleno ? "bg-amber-400" : "bg-[#c6f135]"
                }`}
                style={{ width: `${t.ocupacionPct}%` }}
              />
            </div>
          </div>

          {/* Fila 3: Control de límite con botones táctiles grandes */}
          {!t.pasado && (
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/[0.06]">
              <span className="text-white/60 text-[12.5px] font-medium">Límite de pedidos:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCambiarCapacidad(t.id, -1)}
                  disabled={t.capacidad <= 1 || isPending}
                  className="w-9 h-9 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] active:scale-90 text-white font-black flex items-center justify-center transition-all disabled:opacity-25 cursor-pointer text-[17px]"
                  aria-label="Disminuir límite"
                >
                  -
                </button>
                <span className="w-7 text-center font-black text-white text-[15px]">{t.capacidad}</span>
                <button
                  type="button"
                  onClick={() => handleCambiarCapacidad(t.id, 1)}
                  disabled={isPending}
                  className="w-9 h-9 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] active:scale-90 text-white font-black flex items-center justify-center transition-all cursor-pointer text-[17px]"
                  aria-label="Aumentar límite"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Desktop
    let estadoTexto = "Con lugar";
    let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (t.pasado) { estadoTexto = "Horario pasado"; badgeBg = "bg-gray-100 text-gray-400 border-gray-200"; }
    else if (t.bloqueado) { estadoTexto = "Pausado"; badgeBg = "bg-red-50 text-red-600 border-red-200"; }
    else if (esLleno) { estadoTexto = "Lleno"; badgeBg = "bg-red-50 text-red-700 border-red-200"; }
    else if (esCasiLleno) { estadoTexto = "Casi lleno"; badgeBg = "bg-amber-50 text-amber-700 border-amber-200"; }

    return (
      <div className={`rounded-2xl border p-5 transition-all ${
        t.pasado ? "bg-gray-50/70 border-gray-200 opacity-60"
        : t.bloqueado ? "bg-red-50/30 border-red-100"
        : esLleno ? "bg-white border-red-200 shadow-sm"
        : "bg-white border-gray-200 shadow-sm hover:shadow-md"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[16.5px] font-black text-gray-900">{t.horaInicio} a {t.horaFin} hs</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeBg}`}>{estadoTexto}</span>
          </div>
          {!t.pasado && (
            <button type="button" onClick={() => handleToggleBloqueo(t.id, t.bloqueado)}
              className={`text-[11.5px] font-bold px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                t.bloqueado ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200"
              }`}>
              {t.bloqueado ? "Habilitar" : "Pausar"}
            </button>
          )}
        </div>
        <div className="my-3">
          <div className="flex justify-between text-[12.5px] font-medium text-gray-600 mb-1.5">
            <span>Entraron: <b className="text-gray-900">{t.pedidosCount}</b> de {t.capacidad} pedidos</span>
            <span>{t.ocupacionPct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${
              t.pasado ? "bg-gray-300" : esLleno ? "bg-red-500" : esCasiLleno ? "bg-amber-400" : "bg-[#7fa800]"
            }`} style={{ width: `${t.ocupacionPct}%` }} />
          </div>
        </div>
        {!t.pasado && (
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[12.5px]">
            <span className="text-gray-500 font-medium">Límite de pedidos:</span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => handleCambiarCapacidad(t.id, -1)} disabled={t.capacidad <= 1 || isPending}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer">-</button>
              <span className="w-6 text-center font-bold text-gray-900 text-[13.5px]">{t.capacidad}</span>
              <button type="button" onClick={() => handleCambiarCapacidad(t.id, 1)} disabled={isPending}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold flex items-center justify-center transition-colors cursor-pointer">+</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════
          VISTA MOBILE — CÓMODA, ESPACIOSA Y TÁCTIL
      ═══════════════════════════════════════════════ */}
      <div className="md:hidden px-4 pt-4 pb-28 flex flex-col gap-6 max-w-lg mx-auto">

        {/* Tarjeta 1: Control Principal del Local */}
        <div className="bg-[#1a1814] border border-white/[0.1] rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 block mb-1">
              Control Principal
            </span>
            <h2 className="text-[20px] font-black text-white leading-tight">Estado del Local</h2>
            <p className="text-[12.5px] text-white/55 mt-1 leading-normal">
              Si está cerrado, se bloquea el botón de enviar pedidos en el carrito.
            </p>
          </div>

          {/* Switch táctil grande */}
          <button
            type="button"
            onClick={handleToggleAbierto}
            disabled={isPending}
            className={`w-full py-4 rounded-2xl font-black text-[15.5px] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md active:scale-98 ${
              abierto ? "bg-[#c6f135] text-[#141210] active:bg-[#b8e32c]" : "bg-red-600 text-white active:bg-red-700"
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${abierto ? "bg-[#141210] animate-pulse" : "bg-white"}`} />
            <span>{abierto ? "LOCAL ABIERTO" : "LOCAL CERRADO"}</span>
          </button>

          {/* Horario configurable - Mobile */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white/90 text-[13px]">Horario de atención</span>
              {horarioGuardadoOk && (
                <span className="text-[#c6f135] text-[11.5px] font-bold">✓ Guardado</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">
                  Abre
                </label>
                <input
                  type="time"
                  value={horaApertura}
                  onChange={(e) => setHoraApertura(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-3 py-3 text-[15px] text-white outline-none focus:border-[#c6f135]/60 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10.5px] text-white/40 uppercase tracking-wider font-bold mb-1.5 block">
                  Cierra
                </label>
                <input
                  type="time"
                  value={horaCierre}
                  onChange={(e) => setHoraCierre(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-3 py-3 text-[15px] text-white outline-none focus:border-[#c6f135]/60 transition-colors"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGuardarHorario}
              disabled={guardandoHorario || isPending}
              className="w-full bg-white/[0.08] hover:bg-white/[0.14] active:bg-[#c6f135] active:text-[#141210] text-white border border-white/10 rounded-xl py-3 text-[13px] font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {guardandoHorario ? "Guardando..." : "Guardar horario"}
            </button>
            <p className="text-[11px] text-white/35 leading-tight">
              Aplica a partir de mañana para los pedidos del día. El indicador de abierto/cerrado cambia de inmediato.
            </p>
          </div>

          {/* Aviso o demora para clientes - Mobile */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white/90 text-[13px]">Aviso o demora para clientes</span>
              {mensajeGuardadoOk && (
                <span className="text-[#c6f135] text-[11.5px] font-bold">✓ Guardado</span>
              )}
            </div>

            {/* Input de texto amplio a ancho completo */}
            <textarea
              rows={2}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej: Demora de 25-30 min por alta demanda..."
              className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl p-3 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[#c6f135]/60 transition-colors resize-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleGuardarMensaje()}
                disabled={guardandoMensaje || isPending}
                className="flex-1 bg-[#c6f135] text-[#141210] rounded-xl py-3 text-[13px] font-bold hover:opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {guardandoMensaje ? "Guardando..." : "Guardar aviso"}
              </button>
              {mensaje && (
                <button
                  type="button"
                  onClick={() => { setMensaje(""); handleGuardarMensaje(""); }}
                  className="bg-white/[0.08] text-white/60 hover:text-white rounded-xl px-4 py-3 text-[12.5px] font-bold transition-colors cursor-pointer"
                >
                  Borrar
                </button>
              )}
            </div>

            {/* Sugerencias rápidas */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10.5px] uppercase font-bold text-white/40 tracking-wider">
                Sugerencias rápidas:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGERENCIAS_AVISOS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => { setMensaje(sug); handleGuardarMensaje(sug); }}
                    className="text-[12px] bg-white/[0.05] hover:bg-white/[0.1] text-white/75 active:text-white p-2.5 rounded-xl border border-white/[0.06] transition-colors cursor-pointer text-left flex items-center gap-2"
                  >
                    <span className="text-[#c6f135] font-bold">+</span>
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Horarios del día agrupados por hora */}
        <div className="flex flex-col gap-3.5">
          <div className="px-1">
            <h3 className="text-[19px] font-black text-white leading-tight">Pedidos por Horario (Hoy)</h3>
            <p className="text-[12.5px] text-white/55 mt-0.5 leading-normal">
              Tocá cada bloque de 1 hora para abrir o cerrar sus horarios de 15 min.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-white/[0.08] text-white/90 text-[12px] font-bold px-3.5 py-1.5 rounded-xl border border-white/[0.08]">
                Total pedidos: <b>{totalPedidosHoy}</b>
              </span>
              <span className="bg-[#c6f135]/15 text-[#c6f135] text-[12px] font-bold px-3.5 py-1.5 rounded-xl border border-[#c6f135]/30">
                {horariosConLugar} horarios libres
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {gruposPorHora.map((grupo) => {
              const estaAbierto = bloquesAbiertos[grupo.hora] !== false;
              return (
                <div key={grupo.hora} className="border border-white/[0.1] rounded-2xl bg-[#1a1814] overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleBloque(grupo.hora)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer active:bg-white/[0.03] transition-colors select-none"
                    aria-expanded={estaAbierto}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-white font-black text-[15.5px] tracking-tight">
                        {grupo.hora}:00 a {Number(grupo.hora) + 1}:00 hs
                      </span>
                      <span className="bg-white/[0.08] text-white/70 text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                        {grupo.pedidosEnHora} {grupo.pedidosEnHora === 1 ? "pedido" : "pedidos"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] text-white/40 font-medium">
                        {estaAbierto ? "Minimizar" : "Ver"}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center transition-transform duration-200 ${
                          estaAbierto ? "rotate-0 text-[#c6f135]" : "-rotate-90 text-white/40"
                        }`}
                      >
                        <IconChevronDown size={13} strokeWidth={2.2} />
                      </div>
                    </div>
                  </button>

                  {estaAbierto && (
                    <div className="p-3.5 pt-1 flex flex-col gap-2.5 border-t border-white/[0.06] bg-[#141210]/40 animate-in fade-in duration-150">
                      {grupo.turnos.map((t) => (
                        <TarjetaTurno key={t.id} t={t} modo="mobile" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 pt-2 text-center">
          <p className="text-white/20 text-[11.5px] font-medium">Panel de administración · Micio&apos;s Pizzería</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          VISTA DESKTOP — ESPACIOSA Y SEPARADA
      ═══════════════════════════════════════════════ */}
      <div className="hidden md:block px-10 pt-10 pb-12 lg:px-14 lg:pt-12 max-w-5xl mx-auto">
        <div className="flex flex-col gap-8">

          {/* Tarjeta 1: Estado del local */}
          <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-start justify-between pb-6 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Control Principal</span>
                <h2 className="text-[24px] font-black text-gray-900 mt-0.5">Estado del Local</h2>
                <p className="text-[13.5px] text-gray-500 mt-1">
                  Si está cerrado, los clientes no podrán confirmar pedidos por WhatsApp en la web.
                </p>
              </div>

              <button type="button" onClick={handleToggleAbierto} disabled={isPending}
                className={`px-7 py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm active:scale-98 shrink-0 ml-6 ${
                  abierto ? "bg-[#c6f135] text-[#141210] hover:bg-[#b8e32c]" : "bg-red-600 text-white hover:bg-red-700"
                }`}>
                <span className={`w-3 h-3 rounded-full ${abierto ? "bg-[#141210] animate-pulse" : "bg-white"}`} />
                <span>{abierto ? "LOCAL ABIERTO" : "LOCAL CERRADO"}</span>
              </button>
            </div>

            {/* Horario configurable - desktop */}
            <div className="pt-6 pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[12.5px] font-bold text-gray-700">
                  Horario de atención
                </label>
                {horarioGuardadoOk && (
                  <span className="text-emerald-600 text-[12px] font-semibold">✓ Horario guardado</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Abre</label>
                  <input type="time" value={horaApertura} onChange={(e) => setHoraApertura(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14.5px] text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-all" />
                </div>
                <span className="text-gray-400 font-bold mt-5">a</span>
                <div>
                  <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Cierra</label>
                  <input type="time" value={horaCierre} onChange={(e) => setHoraCierre(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14.5px] text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-all" />
                </div>
                <button type="button" onClick={handleGuardarHorario} disabled={guardandoHorario || isPending}
                  className="mt-5 bg-gray-900 text-white rounded-xl px-5 py-3 text-[13.5px] font-bold hover:bg-black transition-colors disabled:opacity-50 cursor-pointer">
                  {guardandoHorario ? "Guardando..." : "Guardar horario"}
                </button>
                <p className="text-[12px] text-gray-400 mt-5 leading-snug max-w-xs">
                  El cambio aplica a partir de mañana para los pedidos. El indicador de abierto/cerrado cambia de inmediato.
                </p>
              </div>
            </div>

            {/* Aviso / demora */}
            <div className="pt-6 flex flex-col gap-3">
              <label className="text-[12.5px] font-bold text-gray-700 flex items-center justify-between">
                <span>Aviso o demora para clientes (opcional)</span>
                {mensajeGuardadoOk && (
                  <span className="text-emerald-600 text-[12px] font-semibold">✓ Guardado correctamente</span>
                )}
              </label>
              <div className="flex gap-2.5">
                <input type="text" value={mensaje} onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Ej: Demora de 25-30 min por alta demanda..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14.5px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-all" />
                <button type="button" onClick={() => handleGuardarMensaje()} disabled={guardandoMensaje || isPending}
                  className="bg-gray-900 text-white rounded-xl px-5 py-3 text-[13.5px] font-bold hover:bg-black transition-colors shrink-0 disabled:opacity-50 cursor-pointer">
                  {guardandoMensaje ? "Guardando..." : "Guardar"}
                </button>
                {mensaje && (
                  <button type="button" onClick={() => { setMensaje(""); handleGuardarMensaje(""); }}
                    className="bg-gray-100 text-gray-600 hover:text-red-600 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-colors cursor-pointer" title="Borrar aviso">✕</button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1.5">
                {SUGERENCIAS_AVISOS.map((sug) => (
                  <button key={sug} type="button" onClick={() => { setMensaje(sug); handleGuardarMensaje(sug); }}
                    className="text-[12px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Tarjeta 2: Horarios del día */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-[20px] font-black text-gray-900">Pedidos por Horario (Hoy)</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Los pedidos se van acomodando automáticamente cada 15 min. Si un horario se llena, el sistema le avisa la demora al siguiente cliente.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 ml-6">
                <span className="bg-gray-100 text-gray-700 text-[12.5px] font-bold px-3.5 py-2 rounded-xl border border-gray-200">
                  Total pedidos: <b>{totalPedidosHoy}</b>
                </span>
                <span className="bg-[#c6f135]/20 text-[#3e4d00] text-[12.5px] font-bold px-3.5 py-2 rounded-xl border border-[#c6f135]/40">
                  {horariosConLugar} libres
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {gruposPorHora.map((grupo) => (
                <div key={grupo.hora} className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2.5">
                    <span className="text-[13px] font-extrabold uppercase tracking-wider text-gray-400">
                      {grupo.hora}:00 a {Number(grupo.hora) + 1}:00 hs
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {grupo.pedidosEnHora} {grupo.pedidosEnHora === 1 ? "pedido" : "pedidos"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    {grupo.turnos.map((t) => (
                      <TarjetaTurno key={t.id} t={t} modo="desktop" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
