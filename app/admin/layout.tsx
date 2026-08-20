import { headers } from "next/headers";
import { AdminSidebar, AdminMobileHeader } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const esLogin = pathname.startsWith("/admin/login") || pathname === "/admin/login";

  // La página de login no necesita sidebar ni header de admin
  if (esLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Mobile header: only visible below md */}
      <AdminMobileHeader />

      <div className="md:flex">
        {/* Desktop sidebar — sticky, 224px de ancho */}
        <AdminSidebar />

        {/* Área de contenido principal */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
