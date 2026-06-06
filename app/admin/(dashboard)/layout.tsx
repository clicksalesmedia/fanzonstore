import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "./admin-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r border-white/10 bg-neutral-900/40 lg:block">
        <div className="sticky top-0 h-screen">
          <AdminNav email={session.user.email} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="border-b border-white/10 bg-neutral-900/40 lg:hidden">
        <AdminNav email={session.user.email} />
      </div>

      <main className="min-w-0 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
