import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";

/**
 * Gated admin shell.
 *
 * The login page lives at app/admin/login and is deliberately outside this route
 * group, so it isn't caught by the requireAdmin() gate below.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-ivory lg:flex">
      <AdminNav email={session.email} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
