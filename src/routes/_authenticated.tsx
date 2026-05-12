import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Car, Calendar, FileText, User, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading, isSuperAdmin } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>
      </PageShell>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const links = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/vehicles", label: "My Garage", icon: Car },
    { to: "/appointments", label: "Appointments", icon: Calendar },
    { to: "/invoices", label: "Invoices", icon: FileText },
    { to: "/profile", label: "Profile", icon: User },
  ];
  if (isSuperAdmin) links.push({ to: "/admin", label: "Admin", icon: ShieldCheck });

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          {links.map((l) => {
            const active = loc.pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            );
          })}
        </aside>
        <Outlet />
      </div>
    </PageShell>
  );
}
