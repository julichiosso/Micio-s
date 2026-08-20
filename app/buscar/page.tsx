import { getTodosLosProductos } from "@/lib/queries/productos";
import BuscadorCliente from "./buscador-cliente";

export default async function BuscarPage() {
  const productos = await getTodosLosProductos();

  const items = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    fotoUrl: p.fotoUrl,
    seccion: p.seccion.nombre,
    tieneTamanios: p.tieneTamanios,
    desde: p.precios.length
      ? Math.min(...p.precios.map((pr) => pr.precio))
      : null,
  }));

  return <BuscadorCliente items={items} />;
}