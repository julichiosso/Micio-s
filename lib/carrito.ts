export type ItemCarrito = {
  productoId: number;
  nombre: string;
  tamanio: string;
  label: string;
  precio: number;
  cantidad: number;
};

const CLAVE_STORAGE = "micios_carrito";

export function getCarrito(): ItemCarrito[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CLAVE_STORAGE);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ItemCarrito[];
  } catch {
    return [];
  }
}

function guardarCarrito(items: ItemCarrito[]) {
  window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
  // Avisamos a otros componentes de la misma pestaña que el carrito cambió
  window.dispatchEvent(new Event("carrito-actualizado"));
}

export function agregarItemAlCarrito(nuevoItem: ItemCarrito) {
  const items = getCarrito();

  // Si ya existe el mismo producto+tamaño, sumamos cantidad en vez de duplicar
  const existente = items.find(
    (i) => i.productoId === nuevoItem.productoId && i.tamanio === nuevoItem.tamanio
  );

  if (existente) {
    existente.cantidad += nuevoItem.cantidad;
  } else {
    items.push(nuevoItem);
  }

  guardarCarrito(items);
}

export function actualizarCantidad(
  productoId: number,
  tamanio: string,
  cantidad: number
) {
  let items = getCarrito();

  if (cantidad <= 0) {
    items = items.filter(
      (i) => !(i.productoId === productoId && i.tamanio === tamanio)
    );
  } else {
    const item = items.find(
      (i) => i.productoId === productoId && i.tamanio === tamanio
    );
    if (item) item.cantidad = cantidad;
  }

  guardarCarrito(items);
}

export function vaciarCarrito() {
  guardarCarrito([]);
}

export function getTotalCarrito(items: ItemCarrito[]) {
  return items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
}