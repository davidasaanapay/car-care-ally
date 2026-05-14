import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, Calendar, FileText, User, ShieldCheck, MessagesSquare, Store } from "lucide-react";

import HomePage from "./routes/index";
import AboutPage from "./routes/about";
import FeaturesPage from "./routes/features";
import PricingPage from "./routes/pricing";
import ContactPage from "./routes/contact";
import PrivacyPage from "./routes/privacy";
import TermsPage from "./routes/terms";
import ShopsPage from "./routes/shops";
import ShopSignupPage from "./routes/shop-signup";
import DiagnosticsPage from "./routes/diagnostics";
import BookPage from "./routes/book";
import LoginPage from "./routes/login";
import SignupPage from "./routes/signup";
import SuperAdminPage from "./routes/super-admin";

import DashboardPage from "./routes/_authenticated/dashboard";
import VehiclesPage from "./routes/_authenticated/vehicles";
import AppointmentsPage from "./routes/_authenticated/appointments";
import InvoicesPage from "./routes/_authenticated/invoices";
import ChatPage from "./routes/_authenticated/chat";
import ProfilePage from "./routes/_authenticated/profile";
import ShopDashboardPage from "./routes/_authenticated/shop";
import AdminPage from "./routes/_authenticated/admin";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Off the road</h2>
        <p className="mt-2 text-sm text-muted-foreground">That page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Back to Car Care Ally
        </Link>
      </div>
    </div>
  );
}

function AuthLayout() {
  const { user, loading, isSuperAdmin, isShopOwner } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>
      </PageShell>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const links = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/vehicles", label: "My Garage", icon: Car },
    { to: "/appointments", label: "Appointments", icon: Calendar },
    { to: "/invoices", label: "Invoices", icon: FileText },
    { to: "/chat", label: "AI Assistant", icon: MessagesSquare },
    { to: "/profile", label: "Profile", icon: User },
  ];
  if (isShopOwner) links.push({ to: "/shop", label: "Shop Dashboard", icon: Store });
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/shops" element={<ShopsPage />} />
      <Route path="/shop-signup" element={<ShopSignupPage />} />
      <Route path="/diagnostics" element={<DiagnosticsPage />} />
      <Route path="/book" element={<BookPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/super-admin" element={<SuperAdminPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/shop" element={<ShopDashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
