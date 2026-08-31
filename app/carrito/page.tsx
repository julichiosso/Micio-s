"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconMinus,
  IconPlus,
  IconCarrito,
} from "@/app/icons";
import {
  getCarrito,
  actualizarCantidad,
  vaciarCarrito,
  getTotalCarrito,
  ItemCarrito,
} from "@/lib/carrito";
import { armarLinkWhatsapp } from "@/lib/whatsapp";
import { crearPedidoConAsignacionTurno } from "@/lib/actions-turnos";
import FooterInfo from "@/app/footer-info";

type EstadoTurnoResponse = {
  turno: {
    id: number;
    horaInicio: string;
    horaFin: string;
  } | null;
  minutosEspera: number;
  textoDemora: string;
  abierto: boolean;
  mensajePersonalizado: string | null;
};

export default function CarritoPage() {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [hora, setHora] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Estado en vivo y turno estimado
  const [estadoTurno, setEstadoTurno] = useState<EstadoTurnoResponse>({
    turno: null,
    minutosEspera: 15,
    textoDemora: "Preparación estimada (~15-20 min)",
    abierto: true,
    mensajePersonalizado: null,
  });

  useEffect(() => {
    function cargar() {
      setItems(getCarrito());
      setCargando(false);
    }
    cargar();
    window.addEventListener("carrito-actualizado", cargar);
    return () => window.removeEventListener("carrito-actualizado", cargar);
  }, []);

  // Polling de estado y turnos cada 20s
  useEffect(() => {
    let montado = true;
    async function consultarEstado() {
      try {
        const res = await fetch("/api/estado-turno");
        if (res.ok) {
          const data = await res.json();
          if (montado) setEstadoTurno(data);
        }
      } catch (err) {
        console.error("Error al consultar estado de turnos:", err);
      }
    }
    consultarEstado();
    const interval = setInterval(consultarEstado, 20000);
    return () => {
      montado = false;
      clearInterval(interval);
    };
  }, []);

  const total = getTotalCarrito(items);

  async function handleConfirmar() {
    if (procesando || !estadoTurno.abierto) return;

    setErrorEnvio(null);
    setProcesando(true);

    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`.trim();
    const detallesPedido = items
      .map(
        (it) =>
          `${it.cantidad}x ${it.nombre} (${it.label}) - $${it.precio * it.cantidad}`
      )
      .join(" | ");

    try {
      // 1. Asignación atómica del pedido al turno en la base de datos
      const res = await crearPedidoConAsignacionTurno({
        clienteNombre: nombreCompleto,
        horaRetiroDeseada: hora || undefined,
        total,
        detalles: detallesPedido,
      });

      if (!res.exito) {
        setErrorEnvio(res.error || "No se pudo procesar el pedido. Por favor intentá nuevamente.");
        setProcesando(false);
        return;
      }

      // 2. Armar texto de WhatsApp con el turno asignado
      const textoTurno = res.turnoHoraInicio
        ? `Turno asignado: ${res.turnoHoraInicio} hs (${res.textoDemora || "~15-20 min de espera"})`
        : undefined;

      const link = armarLinkWhatsapp({
        items,
        nombre: nombreCompleto,
        total,
        turnoAsignado: textoTurno,
        horaRetiroDeseada: hora || undefined,
        pedidoId: res.pedidoId,
      });

      // 3. Vaciar carrito y abrir WhatsApp
      vaciarCarrito();
      window.location.href = link;
    } catch (err: any) {
      console.error("Error al confirmar pedido:", err);
      setErrorEnvio("Ocurrió un error inesperado al enviar el pedido.");
      setProcesando(false);
    }
  }

  if (cargando) return null;

  return (
    <main className="min-h-screen bg-[#141210]">
      {/* Header */}
      <div className="bg-[#141210] px-5 pt-6 pb-6 flex items-center gap-3">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white shrink-0 active:opacity-60 transition-opacity"
          aria-label="Volver al inicio"
        >
          <IconArrowLeft size={18} />
        </Link>
        <h1
          className="text-white text-[24px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Tu pedido
        </h1>
      </div>

      <div className="bg-[#f7f3ea] rounded-t-[28px] px-4 pt-6 pb-12 min-h-[60vh]">
        {items.length === 0 ? (
          <div className="text-center pt-16">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
              <IconCarrito size={26} className="text-black/30" />
            </div>
            <p className="text-black/50 text-[14px] mb-6">
              Todavía no agregaste nada.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#141210] text-white rounded-full px-6 py-3 font-semibold text-[14px] active:scale-[0.98] transition-transform"
            >
              Ver el menú
            </Link>
          </div>
        ) : (
          <>
            {/* Aviso si el local está cerrado */}
            {!estadoTurno.abierto && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <span className="text-[18px] shrink-0">⚠️</span>
                <div>
                  <p className="font-bold text-[14px]">Local cerrado en este momento</p>
                  <p className="text-[12.5px] text-red-700 mt-0.5">
                    {estadoTurno.mensajePersonalizado ||
                      "No estamos recibiendo pedidos en este horario. Podés consultar nuestro menú y volver en el horario de atención."}
                  </p>
                </div>
              </div>
            )}

            {/* Aviso o mensaje de alta demanda si el local está abierto */}
            {estadoTurno.abierto && estadoTurno.mensajePersonalizado && (
              <div className="bg-[#fff9e6] border border-[#f0df95] text-[#634e00] rounded-2xl p-3.5 mb-5 flex items-center gap-2.5">
                <span className="text-[16px] shrink-0">📢</span>
                <p className="text-[12.5px] font-semibold leading-snug">
                  {estadoTurno.mensajePersonalizado}
                </p>
              </div>
            )}

            {/* Tarjeta de Turno Estimado en Tiempo Real */}
            {estadoTurno.abierto && (
              <div className="bg-white rounded-2xl p-4 border border-black/[0.06] mb-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#c6f135]/20 text-[#3e4d00] flex items-center justify-center font-bold text-[14px]">
                      🕒
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-black/40">
                        Tiempo estimado de preparación
                      </span>
                      <p className="text-[14px] font-black text-black">
                        {estadoTurno.textoDemora}
                      </p>
                    </div>
                  </div>
                  {estadoTurno.turno && (
                    <span className="bg-[#c6f135]/25 text-[#3e4d00] border border-[#c6f135] text-[12px] font-black px-2.5 py-1 rounded-lg shrink-0">
                      {estadoTurno.turno.horaInicio} hs
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Listado de items del carrito */}
            <div className="flex flex-col gap-3 mb-6">
              {items.map((item) => (
                <div
                  key={`${item.productoId}-${item.tamanio}`}
                  className="flex items-center justify-between bg-white rounded-2xl p-4 border border-black/[0.04]"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-bold text-black text-[15px] truncate">
                      {item.nombre}
                    </p>
                    <p className="text-[13px] text-black/45 mt-0.5">
                      {item.label} · ${item.precio.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() =>
                        actualizarCantidad(
                          item.productoId,
                          item.tamanio,
                          item.cantidad - 1
                        )
                      }
                      className="w-8 h-8 rounded-full bg-[#141210] text-white flex items-center justify-center active:opacity-70 transition-opacity cursor-pointer"
                      aria-label="Restar"
                    >
                      <IconMinus size={14} />
                    </button>
                    <span className="w-5 text-center font-bold text-black text-[14px]">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() =>
                        actualizarCantidad(
                          item.productoId,
                          item.tamanio,
                          item.cantidad + 1
                        )
                      }
                      className="w-8 h-8 rounded-full bg-[#141210] text-white flex items-center justify-center active:opacity-70 transition-opacity cursor-pointer"
                      aria-label="Sumar"
                    >
                      <IconPlus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/buscar"
              className="flex items-center justify-center gap-2 border border-dashed border-black/20 text-black/60 rounded-2xl py-3.5 font-semibold text-[14px] mb-6 active:opacity-70 transition-opacity"
            >
              <IconPlus size={16} />
              ¿Querés agregar algo más?
            </Link>

            {/* Formulario de cliente */}
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <label className="block text-[11px] uppercase tracking-wider text-black/40 mb-1.5 font-bold">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre"
                    className="w-full bg-white rounded-xl px-4 py-3.5 text-black placeholder:text-black/35 outline-none text-[15px] border border-black/[0.06]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] uppercase tracking-wider text-black/40 mb-1.5 font-bold">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Apellido"
                    className="w-full bg-white rounded-xl px-4 py-3.5 text-black placeholder:text-black/35 outline-none text-[15px] border border-black/[0.06]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-black/40 mb-1.5 font-bold">
                  ¿A qué hora preferís retirarlo? (Opcional)
                </label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-white rounded-xl px-4 py-3.5 text-black placeholder:text-black/35 outline-none text-[15px] border border-black/[0.06]"
                />
              </div>
            </div>

            {errorEnvio && (
              <div className="bg-red-50 text-red-600 border border-red-200 text-[13px] rounded-xl p-3 mb-4">
                {errorEnvio}
              </div>
            )}

            {/* Barra fija inferior de confirmación */}
            <div
              className="fixed bottom-0 left-0 right-0 bg-[#f7f3ea] border-t border-black/[0.08] px-4 pt-4 z-20"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
            >
              <div className="flex items-center justify-between mb-1 max-w-lg mx-auto">
                <span className="text-black/60 font-medium text-[14px]">
                  Total
                </span>
                <span className="text-[22px] font-black text-black">
                  ${total.toLocaleString("es-AR")}
                </span>
              </div>
              <p className="text-black/35 text-[11.5px] mb-3 max-w-lg mx-auto">
                Revisá que esté todo bien antes de enviar
              </p>
              <div className="max-w-lg mx-auto">
                <button
                  onClick={handleConfirmar}
                  disabled={
                    !nombre.trim() ||
                    !apellido.trim() ||
                    !estadoTurno.abierto ||
                    procesando
                  }
                  className="w-full bg-[#141210] text-white rounded-full py-3.5 font-bold text-[15px] disabled:opacity-35 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {procesando ? (
                    <span>Procesando pedido...</span>
                  ) : !estadoTurno.abierto ? (
                    <span>Local Cerrado</span>
                  ) : (
                    <span>Confirmar por WhatsApp</span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="pb-28">
        <FooterInfo />
      </div>
    </main>
  );
}