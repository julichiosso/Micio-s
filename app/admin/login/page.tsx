"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setCargando(false);

    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#dcccaa] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-black mb-1 text-center">
          Panel de Micio&apos;s
        </h1>
        <p className="text-black/60 text-sm text-center mb-8">
          Ingresá para administrar el catálogo
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="w-full bg-white/60 rounded-xl px-4 py-3 text-black placeholder:text-black/40 outline-none"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-white/60 rounded-xl px-4 py-3 text-black placeholder:text-black/40 outline-none"
          />

          {error && (
            <p className="text-red-700 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-black text-[#dcccaa] rounded-full py-3.5 font-bold mt-2 disabled:opacity-50"
          >
            {cargando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}