"use client";

import { useState, useRef } from "react";
import { IconImage } from "@/app/icons";

type Categoria = { id: number; nombre: string };

type ProductoCreado = {
    id: number;
    [key: string]: unknown;
};

function normalizar(t: string) {
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Sugerencias de nombre según la categoría elegida
const SUGERENCIAS_POR_CATEGORIA: Record<
    string,
    { placeholder: string; placeholderDescripcion: string; opciones?: string[] }
> = {
    pizzas: {
        placeholder: "Nombre del producto (ej: Pizza Napolitana)",
        placeholderDescripcion: "Ej: Muzzarella, tomate, jamón, orégano...",
    },
    bebidas: {
        placeholder: "Nombre del producto (ej: Coca-Cola 500ml)",
        placeholderDescripcion: "Ej: Bien fría, botella descartable",
    },
    postres: {
        placeholder: "Nombre del producto (ej: Tiramisú)",
        placeholderDescripcion: "Ej: Porción individual, con cacao",
        opciones: ["Tiramisú", "Chocolina", "Mousse de chocolate", "Cheese cake"],
    },
};

export function NuevoProductoForm({
    seccionesList,
    actionCrearProducto,
    actionSubirFoto,
}: {
    seccionesList: Categoria[];
    actionCrearProducto: (datos: {
        seccionId: number;
        nombre: string;
        descripcion?: string;
        tieneTamanios: boolean;
    }) => Promise<ProductoCreado>;
    actionSubirFoto: (id: number, fd: FormData) => Promise<unknown>;
}) {
    const [archivo, setArchivo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [seccionId, setSeccionId] = useState<number | null>(
        seccionesList[0]?.id ?? null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const seccionNombre = normalizar(
        seccionesList.find((s) => s.id === seccionId)?.nombre ?? ""
    );
    const sugerencia =
        SUGERENCIAS_POR_CATEGORIA[seccionNombre] ??
        { placeholder: "Nombre del producto", placeholderDescripcion: "Descripción (opcional)" };

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setArchivo(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setEnviando(true);
        setMensaje(null);

        try {
            const fd = new FormData(e.currentTarget);
            const nuevo = await actionCrearProducto({
                seccionId: Number(fd.get("seccionId")),
                nombre: fd.get("nombre") as string,
                descripcion: (fd.get("descripcion") as string) || undefined,
                tieneTamanios: fd.get("tieneTamanios") === "on",
            });

            if (archivo && nuevo?.id) {
                const fotoFd = new FormData();
                fotoFd.append("foto", archivo);
                await actionSubirFoto(nuevo.id, fotoFd);
            }

            setMensaje("✓ Producto creado con éxito");
            formRef.current?.reset();
            setArchivo(null);
            setPreviewUrl(null);
            window.location.reload();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Error al crear el producto";
            if (errorMsg.includes("NEXT_REDIRECT")) {
                window.location.reload();
            } else {
                setMensaje(`❌ ${errorMsg}`);
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <select
                name="seccionId"
                required
                value={seccionId ?? ""}
                onChange={(e) => setSeccionId(Number(e.target.value))}
                className="w-full bg-white/[0.06] rounded-xl px-3 py-3 text-white text-[16px] outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
            >
                {seccionesList.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1a1814]">
                        {s.nombre}
                    </option>
                ))}
            </select>

            <input
                type="text"
                name="nombre"
                placeholder={sugerencia.placeholder}
                list={sugerencia.opciones ? "sugerencias-nombre-mobile" : undefined}
                required
                className="w-full bg-white/[0.06] rounded-xl px-3 py-3 text-white text-[16px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
            />
            {sugerencia.opciones && (
                <datalist id="sugerencias-nombre-mobile">
                    {sugerencia.opciones.map((op) => (
                        <option key={op} value={op} />
                    ))}
                </datalist>
            )}

            <input
                type="text"
                name="descripcion"
                placeholder={sugerencia.placeholderDescripcion}
                className="w-full bg-white/[0.06] rounded-xl px-3 py-3 text-white text-[16px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
            />

            {/* Campo de foto */}
            <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
                <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/[0.1] relative overflow-hidden shrink-0 flex items-center justify-center">
                    {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <IconImage size={20} className="text-white/20" />
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-3 py-2.5 bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer active:scale-95"
                >
                    {archivo ? "Cambiar foto" : "Agregar foto (opcional)"}
                </button>
            </div>

            <label className="flex items-center gap-2.5 px-1 text-white/60 text-[13px] cursor-pointer leading-snug">
                <input
                    type="checkbox"
                    name="tieneTamanios"
                    className="w-4 h-4 rounded accent-[#c6f135] shrink-0"
                />
                Se vende en varios tamaños (como pizzas: XL, 1/2 XL, etc.). Dejalo sin marcar si tiene un solo precio.
            </label>

            {mensaje && (
                <p
                    className={`text-[12.5px] font-semibold ${mensaje.startsWith("✓") ? "text-[#c6f135]" : "text-red-400"
                        }`}
                >
                    {mensaje}
                </p>
            )}

            <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#c6f135] text-[#141210] rounded-xl py-3 font-bold text-[15px] active:opacity-80 transition-opacity mt-1 cursor-pointer disabled:opacity-50"
            >
                {enviando ? "Creando..." : "Crear producto"}
            </button>
        </form>
    );
}