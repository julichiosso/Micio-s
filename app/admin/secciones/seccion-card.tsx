"use client";

import { useState } from "react";
import Image from "next/image";
import { IconTrash } from "@/app/icons";

type Seccion = {
  id: number;
  nombre: string;
  activo: boolean;
  fotoUrl: string | null;
};

// Modal de confirmación de borrado
function ModalConfirmacionSeccion({
  nombre,
  onConfirmar,
  onCancelar,
}: {
  nombre: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onCancelar}
      />
      <div className="relative w-full max-w-sm bg-[#1a1814] border border-white/[0.12] rounded-2xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-white font-bold text-[17px] tracking-tight mb-2">
          Eliminar categoría
        </h3>
        <p className="text-white/60 text-[14px] leading-relaxed mb-6">
          Se eliminará la categoría <span className="text-white font-semibold">{nombre}</span> y todos los productos que pertenezcan a ella de forma permanente. Esta acción no se puede deshacer.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2.5 rounded-xl border border-white/15 text-white/80 hover:text-white hover:bg-white/[0.06] text-[13px] font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2.5 rounded-xl bg-[#c62828] hover:bg-[#b71c1c] text-white text-[13px] font-semibold transition-colors active:scale-[0.98] cursor-pointer"
          >
            Eliminar definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

export function SeccionCard({
  seccion,
  actionEditar,
  actionDesactivar,
  actionReactivar,
  actionEliminarDefinitivo,
  actionSubirFoto,
}: {
  seccion: Seccion;
  actionEditar: (id: number, nombre: string) => Promise<void>;
  actionDesactivar: (id: number) => Promise<void>;
  actionReactivar: (id: number) => Promise<void>;
  actionEliminarDefinitivo: (id: number) => Promise<void>;
  actionSubirFoto: (seccionId: number, formData: FormData) => Promise<void>;
}) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState(seccion.nombre);
  const [guardado, setGuardado] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  return (
    <>
      {mostrarModal && (
        <ModalConfirmacionSeccion
          nombre={seccion.nombre}
          onCancelar={() => setMostrarModal(false)}
          onConfirmar={async () => {
            setMostrarModal(false);
            await actionEliminarDefinitivo(seccion.id);
          }}
        />
      )}

      <div className={`border rounded-2xl p-4 transition-all ${seccion.activo ? "border-white/[0.08] bg-[#1a1814]" : "border-white/[0.05] bg-[#161410] opacity-75"}`}>
        {/* Foto de la categoría */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl bg-white/[0.05] shrink-0 relative overflow-hidden border border-white/[0.08]">
            {seccion.fotoUrl ? (
              <Image
                src={seccion.fotoUrl}
                alt={seccion.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px] text-center px-1">
                Sin foto
              </div>
            )}
          </div>

          <form
            action={async (formData) => {
              setSubiendo(true);
              await actionSubirFoto(seccion.id, formData);
              setSubiendo(false);
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="file"
              name="foto"
              accept="image/*"
              required
              className="flex-1 text-[11px] text-white/40 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-white/10 file:text-white cursor-pointer"
            />
            <button
              type="submit"
              disabled={subiendo}
              className="shrink-0 bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {subiendo ? "Subiendo…" : "Subir"}
            </button>
          </form>
        </div>

        {/* Cabecera de la categoría */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-white font-bold text-[16px] tracking-tight">
            {seccion.nombre}
          </span>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${
              seccion.activo
                ? "bg-[#c6f135]/15 text-[#c6f135]"
                : "border border-white/15 text-white/40"
            }`}
          >
            {seccion.activo ? "Activa" : "Inactiva"}
          </span>
        </div>

        {/* Formulario para renombrar */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!nombre.trim()) return;
            await actionEditar(seccion.id, nombre.trim());
            setGuardado(true);
            setTimeout(() => setGuardado(false), 2500);
          }}
          className="flex gap-2 mb-3"
        >
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            className="flex-1 bg-white/[0.05] rounded-xl px-3.5 py-2.5 text-white text-[16px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-[#c6f135]/60 transition-colors"
          />
          <button
            type="submit"
            className="bg-white/10 hover:bg-white/15 text-white rounded-xl px-4 py-2.5 text-[13px] font-bold active:opacity-60 transition-colors shrink-0 cursor-pointer"
          >
            {guardado ? "✓ Listo" : "Guardar"}
          </button>
        </form>

        {/* Barra de acciones inferiores */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          {seccion.activo ? (
            <button
              type="button"
              onClick={() => actionDesactivar(seccion.id)}
              className="text-white/40 hover:text-white/80 text-[12px] font-medium transition-colors cursor-pointer"
            >
              Desactivar categoría
            </button>
          ) : (
            <button
              type="button"
              onClick={() => actionReactivar(seccion.id)}
              className="text-[#c6f135] bg-[#c6f135]/10 hover:bg-[#c6f135]/20 text-[12px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Reactivar categoría
            </button>
          )}

          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-1.5 text-red-400/60 hover:text-red-400 text-[12px] font-medium transition-colors px-2 py-1 rounded-lg cursor-pointer"
            title="Eliminar permanentemente"
          >
            <IconTrash size={13} />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </>
  );
}