"use client";

import { useState } from "react";
import { IconTrash } from "@/app/icons";

type Seccion = { id: number; nombre: string; activo: boolean };

function ConfirmDialog({
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancelar}
      />
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-gray-900 font-bold text-[16px] mb-2">Eliminar sección</h3>
        <p className="text-gray-500 text-[13.5px] leading-relaxed mb-6">
          Se eliminará la sección <strong className="text-gray-800">{nombre}</strong> y todos sus productos de forma permanente. Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors"
          >
            Eliminar definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}

function SeccionFila({
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
  const [modal, setModal] = useState(false);
  const [nombre, setNombre] = useState(seccion.nombre);

  return (
    <>
      {modal && (
        <ConfirmDialog
          nombre={seccion.nombre}
          onCancelar={() => setModal(false)}
          onConfirmar={async () => {
            setModal(false);
            await actionEliminarDefinitivo(seccion.id);
          }}
        />
      )}
      <tr className={`border-b border-gray-100 hover:bg-gray-50/60 transition-colors ${!seccion.activo ? "opacity-55" : ""}`}>
        {/* Nombre editable */}
        <td className="py-2.5 pl-5 pr-3">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!nombre.trim()) return;
              await actionEditar(seccion.id, nombre.trim());
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 bg-white outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135]/30 transition-colors w-48"
            />
            {nombre !== seccion.nombre && (
              <button
                type="submit"
                className="text-[11.5px] px-2.5 py-1 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium shrink-0"
              >
                Guardar
              </button>
            )}
          </form>
        </td>

        {/* Estado */}
        <td className="py-2.5 pr-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
              seccion.activo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
            }`}
          >
            {seccion.activo ? "Activa" : "Inactiva"}
          </span>
        </td>

        {/* Acciones */}
        <td className="py-2.5 pr-5 text-right">
          <div className="flex items-center justify-end gap-2">
            {seccion.activo ? (
              <button
                type="button"
                onClick={() => actionDesactivar(seccion.id)}
                className="text-[11.5px] px-2.5 py-1 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
              >
                Desactivar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => actionReactivar(seccion.id)}
                className="text-[11.5px] px-2.5 py-1 rounded-lg border border-[#c6f135]/40 bg-[#c6f135]/10 text-[#4a5c00] hover:bg-[#c6f135]/20 transition-colors font-medium"
              >
                Reactivar
              </button>
            )}
            <button
              type="button"
              onClick={() => setModal(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:text-red-400 hover:border-red-200 transition-colors"
              title="Eliminar definitivamente"
            >
              <IconTrash size={12} />
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}

export function SeccionesDesktopView({
  seccionesList,
  actionCrearSeccion,
  actionEditar,
  actionDesactivar,
  actionReactivar,
  actionEliminarDefinitivo,
}: {
  seccionesList: Seccion[];
  actionCrearSeccion: (fd: FormData) => Promise<void>;
  actionEditar: (id: number, nombre: string) => Promise<void>;
  actionDesactivar: (id: number) => Promise<void>;
  actionReactivar: (id: number) => Promise<void>;
  actionEliminarDefinitivo: (id: number) => Promise<void>;
}) {
  const activas = seccionesList.filter((s) => s.activo).length;
  const inactivas = seccionesList.length - activas;

  return (
    <div className="p-6 max-w-3xl">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total secciones", value: seccionesList.length, color: "text-gray-900" },
          { label: "Activas", value: activas, color: "text-green-700" },
          { label: "Inactivas", value: inactivas, color: inactivas > 0 ? "text-gray-500" : "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
            <p className="text-[11.5px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{s.label}</p>
            <p className={`text-[26px] font-black leading-none ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Formulario nueva sección */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-3">
        <p className="text-[13px] font-semibold text-gray-700 shrink-0">Nueva sección</p>
        <form action={actionCrearSeccion} className="flex gap-2 flex-1">
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Empanadas, Postres..."
            required
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135]/30 transition-colors placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="shrink-0 bg-[#c6f135] text-[#1a2500] rounded-lg px-4 py-2 text-[13px] font-bold hover:bg-[#d4ff3d] transition-colors"
          >
            Crear
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="pl-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
              <th className="py-2.5 pr-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="py-2.5 pr-5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {seccionesList.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-[13px] text-gray-400">
                  No hay secciones creadas.
                </td>
              </tr>
            ) : (
              seccionesList.map((s) => (
                <SeccionFila
                  key={s.id}
                  seccion={s}
                  actionEditar={actionEditar}
                  actionDesactivar={actionDesactivar}
                  actionReactivar={actionReactivar}
                  actionEliminarDefinitivo={actionEliminarDefinitivo}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-gray-300 mt-4 text-center">
        {seccionesList.length} secciones — Micio&apos;s Pizzería
      </p>
    </div>
  );
}
