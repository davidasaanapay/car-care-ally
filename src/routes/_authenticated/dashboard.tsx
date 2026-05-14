import { useDocumentTitle } from "@/lib/use-document-title";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Cpu, Calendar, Car, FileText, MessageSquare } from "lucide-react";
function Dashboard() {
  useDocumentTitle("Dashboard — Car Care Ally");
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const tiles = [
    { to: "/diagnostics", icon: Cpu, title: "Run AI Diagnostics", desc: "Identify a vehicle issue in 60 seconds." },
    { to: "/chat", icon: MessageSquare, title: "Chat with CCA Ally", desc: "Ask anything — symptoms, maintenance, prices." },
    { to: "/book", icon: Calendar, title: "Book a Service", desc: "Schedule with an accredited shop." },
    { to: "/vehicles", icon: Car, title: "My Garage", desc: "Manage your vehicles & reminders." },
    { to: "/invoices", icon: FileText, title: "Invoices", desc: "Review work and pay securely." },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground">Welcome back, {name}.</h1>
      <p className="mt-1 text-sm text-muted-foreground">Here's everything you need to keep your vehicles in shape.</p>
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="rounded-xl border border-border bg-card p-6 hover:shadow-elegant hover:border-primary/30 transition">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><t.icon className="h-5 w-5" /></div>
            <h3 className="mt-3 font-semibold text-foreground">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">Quick actions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm"><Link to="/diagnostics">Diagnose a problem</Link></Button>
          <Button asChild size="sm" variant="outline"><Link to="/vehicles">Add a vehicle</Link></Button>
        </div>
      </div>
    </div>
    </>
  );
}

export default Dashboard;
