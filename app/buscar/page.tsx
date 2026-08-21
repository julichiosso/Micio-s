import { getTodosLosProductos, getSeccionesConFoto } from "@/lib/queries/productos";
import BuscadorCliente from "./buscador-cliente";

export default async function BuscarPage() {
  const [productos, secciones] = await Promise.all([
    getTodosLosProductos(),
    getSeccionesConFoto(),
  ]);

  const items = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    fotoUrl: p.fotoUrl,
    seccion: p.seccion.nombre,
    seccionId: p.seccion.id,
    tieneTamanios: p.tieneTamanios,
    desde: p.precios.length
      ? Math.min(...p.precios.map((pr) => pr.precio))
      : null,
  }));

  const seccionesData = secciones.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    fotoUrl: s.fotoUrl,
    cantidad: items.filter((i) => i.seccion === s.nombre).length,
  }));

  return <BuscadorCliente items={items} secciones={seccionesData} />;
}