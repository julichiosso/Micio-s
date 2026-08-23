"use client";

import { useState } from "react";
import Image from "next/image";
import { IconTrash } from "@/app/icons";

type Seccion = { id: number; nombre: string; activo: boolean; fotoUrl: string | null };

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
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-gray-900 font-bold text-[16px] mb-2">Eliminar categoría</h3>
        <p className="text-gray-500 text-[13.5px] leading-relaxed mb-6">
          Se eliminará la categoría <strong className="text-gray-800">{nombre}</strong> y todos sus productos de forma permanente. Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors cursor-pointer"
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
  actionSubirFoto,
  onEliminarClick,
}: {
  seccion: Seccion;
  actionEditar: (id: number, nombre: string) => Promise<void>;
  actionDesactivar: (id: number) => Promise<void>;
  actionReactivar: (id: number) => Promise<void>;
  actionSubirFoto: (seccionId: number, formData: FormData) => Promise<void>;
  onEliminarClick: () => void;
}) {
  const [nombre, setNombre] = useState(seccion.nombre);
  const [subiendo, setSubiendo] = useState(false);

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50/60 transition-colors ${!seccion.activo ? "opacity-55" : ""}`}>
      {/* Foto */}
      <td className="py-3 pl-5 pr-3">
        <div className="w-11 h-11 rounded-lg bg-gray-100 relative overflow-hidden border border-gray-200 shrink-0">
          {seccion.fotoUrl ? (
            <Image src={seccion.fotoUrl} alt={seccion.nombre} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[8px] text-center">
              Sin foto
            </div>
          )}
        </div>
      </td>

      {/* Nombre editable */}
      <td className="py-3 pr-3">
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
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-[13.5px] font-semibold text-gray-800 bg-white outline-none focus:border-[#c6f135] focus:ring-2 focus:ring-[#c6f135]/25 transition-all w-48 shadow-sm"
          />
          {nombre !== seccion.nombre && (
            <button
              type="submit"
              className="text-[12px] px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-bold shrink-0 cursor-pointer"
            >
              Guardar
            </button>
          )}
        </form>
      </td>

      {/* Subir foto */}
      <td className="py-3 pr-3">
        <form
          action={async (formData) => {
            setSubiendo(true);
            await actionSubirFoto(seccion.id, formData);
            setSubiendo(false);
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="file"
            name="foto"
            accept="image/*"
            required
            className="w-40 text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-gray-100 file:text-gray-700 cursor-pointer"
          />
          <button
            type="submit"
            disabled={subiendo}
            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {subiendo ? "..." : "Subir"}
          </button>
        </form>
      </td>

      {/* Estado */}
      <td className="py-3 pr-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
            seccion.activo ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}
        >
          {seccion.activo ? "Activa" : "Inactiva"}
        </span>
      </td>

      {/* Acciones */}
      <td className="py-3 pr-5 text-right">
        <div className="flex items-center justify-end gap-2">
          {seccion.activo ? (
            <button
              type="button"
              onClick={() => actionDesactivar(seccion.id)}
              className="text-[12px] px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer font-medium"
            >
              Desactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => actionReactivar(seccion.id)}
              className="text-[12px] px-3 py-1.5 rounded-lg border border-[#c6f135]/50 bg-[#c6f135]/15 text-[#4a5c00] hover:bg-[#c6f135]/25 transition-colors font-bold cursor-pointer"
            >
              Reactivar
            </button>
          )}
          <button
            type="button"
            onClick={onEliminarClick}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
            title="Eliminar definitivamente"
          >
            <IconTrash size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function SeccionesDesktopView({
  seccionesList,
  actionCrearSeccion,
  actionEditar,
  actionDesactivar,
  actionReactivar,
  actionEliminarDefinitivo,
  actionSubirFoto,
}: {
  seccionesList: Seccion[];
  actionCrearSeccion: (fd: FormData) => Promise<void>;
  actionEditar: (id: number, nombre: string) => Promise<void>;
  actionDesactivar: (id: number) => Promise<void>;
  actionReactivar: (id: number) => Promise<void>;
  actionEliminarDefinitivo: (id: number) => Promise<void>;
  actionSubirFoto: (seccionId: number, formData: FormData) => Promise<void>;
}) {
  const [categoriaParaEliminar, setCategoriaParaEliminar] = useState<Seccion | null>(null);

  const activas = seccionesList.filter((s) => s.activo).length;
  const inactivas = seccionesList.length - activas;

  return (
    <div className="p-6 max-w-4xl">
      {categoriaParaEliminar && (
        <ConfirmDialog
          nombre={categoriaParaEliminar.nombre}
          onCancelar={() => setCategoriaParaEliminar(null)}
          onConfirmar={async () => {
            const id = categoriaParaEliminar.id;
            setCategoriaParaEliminar(null);
            await actionEliminarDefinitivo(id);
          }}
        />
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total categorías", value: seccionesList.length, color: "text-gray-900" },
          { label: "Activas", value: activas, color: "text-green-700" },
          { label: "Inactivas", value: inactivas, color: inactivas > 0 ? "text-gray-500" : "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <p className="text-[11.5px] text-gray-400 uppercase tracking-wider font-semibold mb-1">{s.label}</p>
            <p className={`text-[28px] font-black leading-none ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <p className="text-[14px] font-bold text-gray-900 mb-2">Crear nueva categoría</p>
        <form action={actionCrearSeccion} className="flex gap-2.5">
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Empanadas, Bebidas, Postres..."
            required
            className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-gray-800 bg-white outline-none focus:border-[#c6f135] focus:ring-2 focus:ring-[#c6f135]/25 transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="shrink-0 bg-[#c6f135] text-[#141210] rounded-xl px-5 py-2.5 text-[13.5px] font-bold hover:bg-[#d4ff3d] transition-colors cursor-pointer"
          >
            Crear categoría
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="pl-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Foto</th>
              <th className="py-3 pr-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
              <th className="py-3 pr-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Subir foto</th>
              <th className="py-3 pr-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="py-3 pr-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {seccionesList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-[14px] text-gray-400">
                  No hay categorías creadas todavía.
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
                  actionSubirFoto={actionSubirFoto}
                  onEliminarClick={() => setCategoriaParaEliminar(s)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-gray-400 mt-4 text-center font-medium">
        {seccionesList.length} categorías registradas — Micio&apos;s Pizzería
      </p>
    </div>
  );
}