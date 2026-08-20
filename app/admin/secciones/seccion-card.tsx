"use client";

import { useState } from "react";
import { IconTrash } from "@/app/icons";

type Seccion = {
  id: number;
  nombre: string;
  activo: boolean;
};

// Modal de confirmación senior, limpio, sin estilos genéricos de IA
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
      {/* Backdrop oscuro con blur sutil */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onCancelar}
      />
      {/* Dialog */}
      <div className="relative w-full max-w-sm bg-[#1a1814] border border-white/[0.12] rounded-2xl p-6 shadow-2xl">
        <h3 className="text-white font-bold text-[17px] tracking-tight mb-2">
          Eliminar sección
        </h3>
        <p className="text-white/60 text-[14px] leading-relaxed mb-6">
          Se eliminará la sección <span className="text-white font-semibold">{nombre}</span> y todos los productos que pertenezcan a ella de forma permanente. Esta acción no se puede deshacer.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2.5 rounded-xl border border-white/15 text-white/80 hover:text-white hover:bg-white/[0.06] text-[13px] font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2.5 rounded-xl bg-[#c62828] hover:bg-[#b71c1c] text-white text-[13px] font-semibold transition-colors active:scale-[0.98]"
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
}: {
  seccion: Seccion;
  actionEditar: (id: number, nombre: string) => Promise<void>;
  actionDesactivar: (id: number) => Promise<void>;
  actionReactivar: (id: number) => Promise<void>;
  actionEliminarDefinitivo: (id: number) => Promise<void>;
}) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(seccion.nombre);

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

      <div className="border border-white/[0.08] bg-[#1a1814] rounded-2xl p-4 transition-colors">
        {/* Cabecera de la sección */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-white font-semibold text-[16px] tracking-tight">
            {seccion.nombre}
          </span>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
              seccion.activo
                ? "bg-white/[0.08] text-white/70"
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
            setEditando(false);
          }}
          className="flex gap-2 mb-3"
        >
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la sección"
            className="flex-1 bg-white/[0.05] rounded-xl px-3.5 py-2 text-white text-[13px] placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors"
          />
          <button
            type="submit"
            className="bg-white/[0.08] hover:bg-white/[0.12] text-white/80 hover:text-white rounded-xl px-3.5 py-2 text-[12px] font-medium active:opacity-60 transition-colors shrink-0"
          >
            Guardar
          </button>
        </form>

        {/* Barra de acciones inferiores */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          {/* Activar / Desactivar */}
          {seccion.activo ? (
            <button
              type="button"
              onClick={() => actionDesactivar(seccion.id)}
              className="text-white/40 hover:text-white/70 text-[12px] font-medium transition-colors"
            >
              Desactivar sección
            </button>
          ) : (
            <button
              type="button"
              onClick={() => actionReactivar(seccion.id)}
              className="text-[#c6f135] bg-[#c6f135]/10 hover:bg-[#c6f135]/20 text-[12px] font-semibold px-3 py-1 rounded-lg transition-colors"
            >
              Reactivar sección
            </button>
          )}

          {/* Eliminar definitivo con confirmación */}
          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-1.5 text-white/35 hover:text-red-400 text-[12px] font-medium transition-colors px-2 py-1 rounded-lg"
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
