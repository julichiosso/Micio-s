import { pgTable, serial, text, integer, boolean, timestamp, pgEnum, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum para los tamaños posibles de un producto
export const tamanioEnum = pgEnum("tamanio", [
  "xl",
  "media_xl",
  "clasica",
  "media_clasica",
  "unico",
]);

// Secciones: Pizzas, Postres, Bebidas, etc.
export const secciones = pgTable("secciones", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  fotoUrl: text("foto_url"),
  orden: integer("orden").notNull().default(0),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
});

// Productos: pizzas, postres, bebidas — todos viven acá
export const productos = pgTable("productos", {
  id: serial("id").primaryKey(),
  seccionId: integer("seccion_id")
    .notNull()
    .references(() => secciones.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  fotoUrl: text("foto_url"),
  tieneTamanios: boolean("tiene_tamanios").notNull().default(false),
  activo: boolean("activo").notNull().default(true),
  destacado: boolean("destacado").notNull().default(false),
  orden: integer("orden").notNull().default(0),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
});

// Precios: cada producto tiene 1 o varias filas acá según tieneTamanios
export const precios = pgTable(
  "precios",
  {
    id: serial("id").primaryKey(),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
    tamanio: tamanioEnum("tamanio").notNull(),
    precio: integer("precio").notNull(), // guardamos en pesos, sin decimales
  },
  (table) => [
    // Nunca puede haber 2 filas con el mismo producto+tamaño. Esto hace
    // que la duplicación de precios sea IMPOSIBLE a nivel de base de datos,
    // sin importar qué pase del lado de la aplicación (doble clic, lag, etc.)
    unique("precio_producto_tamanio_unico").on(
      table.productoId,
      table.tamanio
    ),
  ]
);

// Relaciones (para que Drizzle pueda hacer queries anidadas tipo "traeme la seccion con sus productos y precios")
export const seccionesRelations = relations(secciones, ({ many }) => ({
  productos: many(productos),
}));

export const productosRelations = relations(productos, ({ one, many }) => ({
  seccion: one(secciones, {
    fields: [productos.seccionId],
    references: [secciones.id],
  }),
  precios: many(precios),
}));

export const preciosRelations = relations(precios, ({ one }) => ({
  producto: one(productos, {
    fields: [precios.productoId],
    references: [productos.id],
  }),
}));

// ==========================================
// ESTADO EN VIVO DEL LOCAL (Singleton: id = 1)
// ==========================================
export const estadoLocal = pgTable("estado_local", {
  id: serial("id").primaryKey(),
  abierto: boolean("abierto").notNull().default(true),
  mensajePersonalizado: text("mensaje_personalizado"), // Ej: "Demora de 30 min por alta demanda"
  capacidadDefaultTurno: integer("capacidad_default_turno").notNull().default(7),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
});

// ==========================================
// TURNOS DE 15 MINUTOS
// ==========================================
export const turnos = pgTable(
  "turnos",
  {
    id: serial("id").primaryKey(),
    fecha: text("fecha").notNull(), // Formato YYYY-MM-DD (hora Argentina)
    horaInicio: text("hora_inicio").notNull(), // Ej: "20:00"
    horaFin: text("hora_fin").notNull(), // Ej: "20:15"
    capacidad: integer("capacidad").notNull().default(7),
    bloqueado: boolean("bloqueado").notNull().default(false), // Bloqueo manual por el dueño
    creadoEn: timestamp("creado_en").notNull().defaultNow(),
  },
  (table) => [
    unique("turno_fecha_hora_inicio_unico").on(table.fecha, table.horaInicio),
  ]
);

// ==========================================
// PEDIDOS ASOCIADOS A TURNOS
// ==========================================
export const pedidos = pgTable("pedidos", {
  id: serial("id").primaryKey(),
  turnoId: integer("turno_id").references(() => turnos.id, {
    onDelete: "set null",
  }),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  clienteNombre: text("cliente_nombre").notNull(),
  clienteTelefono: text("cliente_telefono"),
  horaRetiroDeseada: text("hora_retiro_deseada"),
  total: integer("total").notNull(),
  detalles: text("detalles").notNull(), // JSON o resumen de items
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
});

// Relaciones para Turnos y Pedidos
export const turnosRelations = relations(turnos, ({ many }) => ({
  pedidos: many(pedidos),
}));

export const pedidosRelations = relations(pedidos, ({ one }) => ({
  turno: one(turnos, {
    fields: [pedidos.turnoId],
    references: [turnos.id],
  }),
}));


