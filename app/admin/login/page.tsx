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
    <main className="min-h-screen bg-[#141210] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1
          className="text-white text-[28px] tracking-wide mb-1 text-center"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          MICIO&apos;S ADMIN
        </h1>
        <p className="text-white/40 text-sm text-center mb-8">
          Ingresá para administrar el catálogo
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="w-full bg-white/[0.06] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors text-[15px]"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-white/[0.06] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 outline-none border border-white/[0.08] focus:border-white/20 transition-colors text-[15px]"
          />

          {error && (
            <p className="text-red-400 text-sm text-center mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#c6f135] text-[#141210] rounded-xl py-3.5 font-bold text-[15px] mt-2 disabled:opacity-50 active:opacity-80 transition-opacity"
          >
            {cargando ? "Entrando..." : "Entrar al panel"}
          </button>
        </form>
      </div>
    </main>
  );
}