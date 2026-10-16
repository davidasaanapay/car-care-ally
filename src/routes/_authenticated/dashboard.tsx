import { useDocumentTitle } from "@/lib/use-document-title";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Cpu, Calendar, Car, FileText, MessageSquare, Truck } from "lucide-react";
import { STAGES, stageIndex, stageLabel, fmtInTz, money } from "@/lib/workflow";

function Dashboard() {
  useDocumentTitle("Dashboard — Car Care Ally");
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const [appts, setAppts] = useState<any[]>([]);
  const [shops, setShops] = useState<Record<string, any>>({});
  const [invoices, setInvoices] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("appointments").select("*").eq("customer_id", user.id).order("scheduled_for", { ascending: false });
    setAppts(data ?? []);
    const ids = [...new Set((data ?? []).map((a) => a.shop_id).filter(Boolean))] as string[];
    if (ids.length) {
      const { data: s } = await supabase.from("shops").select("id,name,timezone,phone").in("id", ids);
      setShops(Object.fromEntries((s ?? []).map((x) => [x.id, x])));
    }
    const { data: inv } = await supabase.from("invoices").select("*").eq("customer_id", user.id);
    setInvoices(inv ?? []);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel(`cust-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `customer_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const active = appts.filter((a) => !["appointment_closed", "cancelled"].includes(a.status));
  const past = appts.filter((a) => ["appointment_closed", "cancelled"].includes(a.status) || invoices.some((i) => i.appointment_id === a.id && i.status === "paid"));

  const setStage = async (id: string, stage: string) => {
    const { error } = await supabase.rpc("customer_set_stage", { _appt: id, _stage: stage });
    if (error) return toast.error(error.message);
    toast.success(stageLabel(stage)); load();
  };

  const tiles = [
    { to: "/diagnostics", icon: Cpu, title: "Run Diagnostics", desc: "Identify a vehicle issue in 60 seconds." },
    { to: "/chat", icon: MessageSquare, title: "Chat with CCA Ally", desc: "Ask anything — symptoms, maintenance, prices." },
    { to: "/book", icon: Calendar, title: "Book a Service", desc: "Schedule with an accredited specialist." },
    { to: "/vehicles", icon: Car, title: "My Garage", desc: "Manage your vehicles & reminders." },
    { to: "/invoices", icon: FileText, title: "Invoices & payments", desc: "Review, approve and record payments." },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground">Welcome back, {name}.</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track your vehicles in real time and see every past visit.</p>

      <h2 className="mt-8 font-semibold text-foreground">Active jobs</h2>
      {active.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No active jobs. <Link to="/book" className="text-primary">Book a service</Link>.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {active.map((a) => {
            const shop = shops[a.shop_id] ?? {};
            const pct = Math.round((Math.max(0, stageIndex(a.status)) / (STAGES.length - 2)) * 100);
            const remaining = STAGES.slice(Math.max(0, stageIndex(a.status)) + 1, -2).slice(0, 3);
            return (
              <div key={a.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{a.vehicle_summary || "Vehicle"} · {a.service_type || "Service"}</p>
                    <p className="text-xs text-muted-foreground">{shop.name || "Specialist"} · {fmtInTz(a.scheduled_for, shop.timezone)}</p>
                  </div>
                  <div className="flex gap-2">
                    {["requested", "confirmed"].includes(a.status) && <Button size="sm" onClick={() => setStage(a.id, "en_route")}><Truck className="h-3.5 w-3.5 mr-1" /> I'm on my way</Button>}
                    {["ready_for_pickup", "out_for_delivery"].includes(a.status) && <Button size="sm" onClick={() => setStage(a.id, "picked_up")}>I've got my car</Button>}
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
                <p className="mt-2 text-sm text-foreground"><strong>Now:</strong> {stageLabel(a.status)}</p>
                {remaining.length > 0 && <p className="text-xs text-muted-foreground">Next: {remaining.map((r) => r.label).join(" → ")}</p>}
                {a.eta && <p className="text-xs text-muted-foreground">Expected completion: {fmtInTz(a.eta, shop.timezone)}</p>}
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mt-10 font-semibold text-foreground">Visit history</h2>
      {past.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Your completed visits will appear here.</p> : (
        <div className="mt-3 rounded-xl border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Specialist</th><th className="p-3 text-left">Issue / work</th><th className="p-3 text-right">Charged</th><th className="p-3 text-left">Paid via</th><th className="p-3 text-left">Paid on</th></tr></thead>
            <tbody>
              {past.map((a) => {
                const inv = invoices.find((i) => i.appointment_id === a.id);
                return (
                  <tr key={a.id} className="border-t">
                    <td className="p-3">{new Date(a.scheduled_for).toLocaleDateString()}</td>
                    <td className="p-3">{shops[a.shop_id]?.name || "—"}</td>
                    <td className="p-3">{a.issue_summary || a.service_type || "—"}{inv?.work_summary ? ` · ${inv.work_summary}` : ""}</td>
                    <td className="p-3 text-right">{inv ? money(inv.total) : "—"}</td>
                    <td className="p-3">{inv?.payment_channel || "—"}</td>
                    <td className="p-3">{inv?.payment_date || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="rounded-xl border border-border bg-card p-5 hover:shadow-elegant hover:border-primary/30 transition">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><t.icon className="h-4 w-4" /></div>
            <h3 className="mt-3 font-semibold text-foreground">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
