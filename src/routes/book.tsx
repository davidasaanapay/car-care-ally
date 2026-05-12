import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Calendar, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Service — Car Care Ally" },
      { name: "description", content: "Book an accredited US auto-repair shop. Guest checkout — no account required." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    guest_name: "", guest_email: "", guest_phone: "",
    vehicle_summary: "", shop_id: "", service_type: "Diagnostic", scheduled_for: "", issue_summary: "",
  });

  useEffect(() => { supabase.from("shops").select("id,name,city,state").eq("status", "active").then(({ data }) => setShops(data ?? [])); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      shop_id: form.shop_id || null,
      vehicle_summary: form.vehicle_summary,
      service_type: form.service_type,
      scheduled_for: new Date(form.scheduled_for).toISOString(),
      issue_summary: form.issue_summary,
      status: "requested",
    };
    if (user) payload.customer_id = user.id;
    else { payload.guest_name = form.guest_name; payload.guest_email = form.guest_email; payload.guest_phone = form.guest_phone; }
    const { error } = await supabase.from("appointments").insert(payload);
    if (error) return toast.error(error.message);
    setSuccess(true);
  };

  if (success) {
    return (
      <PageShell>
        <section className="container mx-auto px-4 py-20 max-w-md text-center">
          <CheckCircle2 className="h-14 w-14 mx-auto text-success" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Appointment requested!</h1>
          <p className="mt-2 text-muted-foreground">We'll confirm shortly via email. A provisional invoice will be issued before your appointment.</p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button asChild><Link to={user ? "/appointments" : "/"}>{user ? "View appointments" : "Back home"}</Link></Button>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-14 max-w-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary"><Calendar className="h-4 w-4" /> Book a service</div>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Schedule with a trusted shop.</h1>
        <p className="mt-2 text-sm text-muted-foreground">{user ? "Logged in — your account is linked." : "No account needed. We'll email confirmation."}</p>

        <form onSubmit={submit} className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 grid gap-4 shadow-card">
          {!user && (
            <div className="grid sm:grid-cols-3 gap-3">
              <Input label="Your name" required value={form.guest_name} onChange={(v) => setForm({ ...form, guest_name: v })} />
              <Input label="Email" type="email" required value={form.guest_email} onChange={(v) => setForm({ ...form, guest_email: v })} />
              <Input label="Phone" value={form.guest_phone} onChange={(v) => setForm({ ...form, guest_phone: v })} />
            </div>
          )}
          <Input label="Vehicle (Year Make Model)" required placeholder="2021 Toyota Camry" value={form.vehicle_summary} onChange={(v) => setForm({ ...form, vehicle_summary: v })} />

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shop</span>
            <select value={form.shop_id} onChange={(e) => setForm({ ...form, shop_id: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm">
              <option value="">— Auto-match nearest accredited shop —</option>
              {shops.map((s) => <option key={s.id} value={s.id}>{s.name} {s.city ? `(${s.city}${s.state ? ", " + s.state : ""})` : ""}</option>)}
            </select>
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service type</span>
              <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm">
                {["Diagnostic","Oil change","Brakes","Tires","A/C service","Full inspection","Other"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <Input label="Preferred date & time" type="datetime-local" required value={form.scheduled_for} onChange={(v) => setForm({ ...form, scheduled_for: v })} />
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Describe the issue</span>
            <textarea rows={4} value={form.issue_summary} onChange={(e) => setForm({ ...form, issue_summary: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>

          <Button type="submit" size="lg">Request appointment</Button>
          <p className="text-xs text-muted-foreground text-center">By booking, you agree to Car Care Ally's Terms. The base appointment fee is set by the platform and applied to your final invoice.</p>
        </form>
      </section>
    </PageShell>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} required={required} placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </label>
  );
}
