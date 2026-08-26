import { MetadataRoute } from "next";
import { getSecciones, getTodosLosProductos } from "@/lib/queries/productos";

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://pizzasmicios.vercel.app";

  const [secciones, productos] = await Promise.all([
    getSecciones(),
    getTodosLosProductos(),
  ]);

  const seccionesUrls: MetadataRoute.Sitemap = secciones.map((s) => ({
    url: `${baseUrl}/${s.nombre.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productosUrls: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${baseUrl}/producto/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...seccionesUrls,
    ...productosUrls,
  ];
}
