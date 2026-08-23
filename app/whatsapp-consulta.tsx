import { NUMERO_WHATSAPP_LOCAL } from "@/lib/whatsapp";

const MENSAJE_CONSULTA = encodeURIComponent(
  "¡Hola! Tengo una consulta antes de hacer mi pedido."
);

export default function WhatsappConsulta() {
  return (
    <a
      href={`https://wa.me/${NUMERO_WHATSAPP_LOCAL}?text=${MENSAJE_CONSULTA}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] py-3.5 text-white/70 text-[13.5px] font-medium mb-10 active:opacity-70 transition-opacity"
    >
      ¿Tenés dudas? Escribinos por WhatsApp
    </a>
  );
}