import { ItemCarrito } from "@/lib/carrito";

export const NUMERO_WHATSAPP_LOCAL = "5493406423772";

export function armarLinkWhatsapp({
  items,
  nombre,
  total,
}: {
  items: ItemCarrito[];
  nombre: string;
  total: number;
}) {
  const lineas = items.map(
    (item) =>
      `- ${item.cantidad}x ${item.nombre} (${item.label}) - $${(
        item.precio * item.cantidad
      ).toLocaleString("es-AR")}`
  );

  const mensaje = [
    "¡Hola! Quiero hacer un pedido:",
    "",
    ...lineas,
    "",
    `Total: $${total.toLocaleString("es-AR")}`,
    `Nombre: ${nombre}`,
  ].join("\n");

  const mensajeCodificado = encodeURIComponent(mensaje);

  return `https://wa.me/${NUMERO_WHATSAPP_LOCAL}?text=${mensajeCodificado}`;
}