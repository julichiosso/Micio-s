import { ItemCarrito } from "@/lib/carrito";

export const NUMERO_WHATSAPP_LOCAL = "5493406423772";

export function armarLinkWhatsapp({
  items,
  nombre,
  total,
  demoraEstimada,
  pedidoId,
}: {
  items: ItemCarrito[];
  nombre: string;
  total: number;
  demoraEstimada?: string;
  turnoAsignado?: string; // retrocompatibilidad
  horaRetiroDeseada?: string;
  pedidoId?: number;
}) {
  const lineas = items.map(
    (item) =>
      `• ${item.cantidad}x ${item.nombre} (${item.label}) - $${(
        item.precio * item.cantidad
      ).toLocaleString("es-AR")}`
  );

  const detalleDemora = demoraEstimada || "";

  const mensaje = [
    `¡Hola! Quiero hacer este pedido:`,
    "",
    ...lineas,
    "",
    `Total: $${total.toLocaleString("es-AR")}`,
    `Nombre: ${nombre}`,
    ...(detalleDemora ? [`Retiro en el local (${detalleDemora})`] : [`Retiro en el local`]),
  ].join("\n");

  const mensajeCodificado = encodeURIComponent(mensaje);

  return `https://wa.me/${NUMERO_WHATSAPP_LOCAL}?text=${mensajeCodificado}`;
}