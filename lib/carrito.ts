export type ItemCarrito = {
  productoId: number;
  nombre: string;
  tamanio: string;
  label: string;
  precio: number;
  cantidad: number;
  // Presente solo si es una pizza combinada (mitad + mitad de otro sabor)
  combo?: {
    productoId: number;
    nombre: string;
  };
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
  window.dispatchEvent(new Event("carrito-actualizado"));
}

export function agregarItemAlCarrito(nuevoItem: ItemCarrito) {
  const items = getCarrito();

  // Si ya existe el mismo producto+tamaño+combo, sumamos cantidad en vez de duplicar
  const existente = items.find(
    (i) =>
      i.productoId === nuevoItem.productoId &&
      i.tamanio === nuevoItem.tamanio &&
      i.combo?.productoId === nuevoItem.combo?.productoId
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
  cantidad: number,
  comboProductoId?: number
) {
  let items = getCarrito();

  if (cantidad <= 0) {
    items = items.filter(
      (i) =>
        !(
          i.productoId === productoId &&
          i.tamanio === tamanio &&
          i.combo?.productoId === comboProductoId
        )
    );
  } else {
    const item = items.find(
      (i) =>
        i.productoId === productoId &&
        i.tamanio === tamanio &&
        i.combo?.productoId === comboProductoId
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