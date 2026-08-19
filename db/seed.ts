import { db } from "../lib/db";
import { secciones, productos, precios } from "./schema";

async function seed() {
  console.log("Insertando sección Pizzas...");

  const [seccionPizzas] = await db
    .insert(secciones)
    .values({ nombre: "Pizzas", orden: 1 })
    .returning();

  // Datos tomados directo del PDF: nombre, XL, 1/2 XL, Clásica, Clásica 1/2
  const pizzas = [
    { nombre: "Ananá y J. Crudo", xl: 26500, mediaXl: 13500, clasica: 16300, mediaClasica: 8200 },
    { nombre: "Anchoas", xl: 25200, mediaXl: 12800, clasica: 15600, mediaClasica: 7900 },
    { nombre: "Champiñón", xl: 26500, mediaXl: 13500, clasica: 16300, mediaClasica: 8200 },
    { nombre: "Especial", xl: 24400, mediaXl: 12400, clasica: 15200, mediaClasica: 7700 },
    { nombre: "Fugazza", xl: 23500, mediaXl: 12000, clasica: 14500, mediaClasica: 7400 },
    { nombre: "Mediterránea", xl: 24400, mediaXl: 12400, clasica: 15200, mediaClasica: 7700 },
    { nombre: "Muzzarella", xl: 23000, mediaXl: 11700, clasica: 14000, mediaClasica: 7200 },
    { nombre: "Napolitana", xl: 24400, mediaXl: 12400, clasica: 15200, mediaClasica: 7700 },
    { nombre: "Palmitos", xl: 25200, mediaXl: 12800, clasica: 15600, mediaClasica: 7900 },
    { nombre: "Provoleta", xl: 25600, mediaXl: 13000, clasica: 15900, mediaClasica: 8000 },
    { nombre: "Pepperoni", xl: 25600, mediaXl: 13000, clasica: 15900, mediaClasica: 8000 },
    { nombre: "Roquefort", xl: 25600, mediaXl: 13000, clasica: 15900, mediaClasica: 8000 },
    { nombre: "Rúcula y J. Crudo", xl: 26500, mediaXl: 13500, clasica: 16300, mediaClasica: 8200 },
    { nombre: "BBQ Pulled Pork", xl: 27300, mediaXl: 13900, clasica: 16700, mediaClasica: 8500 },
    { nombre: "Chicken Ranch", xl: 27300, mediaXl: 13900, clasica: 16700, mediaClasica: 8500 },
    { nombre: "Onion, Chedar y Bacon", xl: 27300, mediaXl: 13900, clasica: 16700, mediaClasica: 8500 },
  ];

  console.log(`Insertando ${pizzas.length} pizzas...`);

  for (let i = 0; i < pizzas.length; i++) {
    const p = pizzas[i];

    const [producto] = await db
      .insert(productos)
      .values({
        seccionId: seccionPizzas.id,
        nombre: p.nombre,
        tieneTamanios: true,
        orden: i + 1,
      })
      .returning();

    await db.insert(precios).values([
      { productoId: producto.id, tamanio: "xl", precio: p.xl },
      { productoId: producto.id, tamanio: "media_xl", precio: p.mediaXl },
      { productoId: producto.id, tamanio: "clasica", precio: p.clasica },
      { productoId: producto.id, tamanio: "media_clasica", precio: p.mediaClasica },
    ]);
  }

  console.log("Listo! Seed completado.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en el seed:", err);
  process.exit(1);
});