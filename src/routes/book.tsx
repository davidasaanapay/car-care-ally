import { useDocumentTitle } from "@/lib/use-document-title";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Calendar, CheckCircle2 } from "lucide-react";
const TIMEZONES: { label: string; value: string }[] = [
  { label: "Eastern (EST/EDT)", value: "America/New_York" },
  { label: "Central (CST/CDT)", value: "America/Chicago" },
  { label: "Mountain (MST/MDT)", value: "America/Denver" },
  { label: "Pacific (PST/PDT)", value: "America/Los_Angeles" },
  { label: "Alaska (AKST/AKDT)", value: "America/Anchorage" },
  { label: "Hawaii (HST)", value: "Pacific/Honolulu" },
];

function guessTz(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONES.find((t) => t.value === tz)) return tz;
  } catch {}
  return "America/New_York";
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function BookPage() {
  useDocumentTitle("Book a Service — Car Care Ally", "Book an accredited US auto-repair shop. Guest checkout — no account required.");
  const { user } = useAuth();
  const [shops, setShops] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [tz, setTz] = useState<string>(guessTz());
  const [form, setForm] = useState({
    guest_name: "", guest_email: "", guest_phone: "",
    vehicle_summary: "", shop_id: "", service_type: "Diagnostic", scheduled_for: "", issue_summary: "",
  });

  useEffect(() => { supabase.from("shops").select("id,name,city,state").eq("status", "active").then(({ data }) => setShops(data ?? [])); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scheduled_for) return toast.error("Please pick a date and time.");
    const payload: any = {
      shop_id: form.shop_id || null,
      vehicle_summary: form.vehicle_summary,
      service_type: form.service_type,
      // datetime-local has no tz info; treat the value as wall-clock in chosen tz.
      // For simplicity, pass as ISO using browser local; admin can normalize per shop.
      scheduled_for: new Date(form.scheduled_for).toISOString(),
      issue_summary: form.issue_summary,
      notes: `Timezone: ${tz}`,
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
        <p className="mt-2 text-xs text-muted-foreground"><span className="text-accent">*</span> indicates a required field.</p>

        <form onSubmit={submit} className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 grid gap-4 shadow-card">
          {!user && (
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Your name" required hint="Full legal name">
                <input required value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} placeholder="Alex Driver"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </Field>
              <Field label="Email" required hint="you@email.com">
                <input type="email" required value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} placeholder="you@email.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </Field>
              <Field label="Phone" hint="(555) 123-4567">
                <input type="tel" inputMode="tel" value={form.guest_phone}
                  onChange={(e) => setForm({ ...form, guest_phone: formatPhone(e.target.value) })}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </Field>
            </div>
          )}

          <Field label="Vehicle (Year Make Model)" required hint="e.g. 2021 Toyota Camry">
            <input required placeholder="2021 Toyota Camry" value={form.vehicle_summary}
              onChange={(e) => setForm({ ...form, vehicle_summary: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </Field>

          <Field label="Shop" hint="Leave blank for auto-match">
            <select value={form.shop_id} onChange={(e) => setForm({ ...form, shop_id: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm">
              <option value="">— Auto-match nearest accredited shop —</option>
              {shops.map((s) => <option key={s.id} value={s.id}>{s.name} {s.city ? `(${s.city}${s.state ? ", " + s.state : ""})` : ""}</option>)}
            </select>
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Service type" required>
              <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm">
                {["Diagnostic","Oil change","Brakes","Tires","A/C service","Full inspection","Other"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Timezone" required>
              <select value={tz} onChange={(e) => setTz(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm">
                {TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Preferred date & time" required hint="Format: mm/dd/yyyy, hh:mm — shown in selected timezone">
            <input type="datetime-local" required value={form.scheduled_for}
              onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </Field>

          <Field label="Describe the issue" hint="Optional — any noises, warning lights, recent changes">
            <textarea rows={4} value={form.issue_summary} onChange={(e) => setForm({ ...form, issue_summary: e.target.value })}
              placeholder="Brake squeal at low speeds, started about a week ago…"
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </Field>

          <Button type="submit" size="lg">Request appointment</Button>
          <p className="text-xs text-muted-foreground text-center">By booking, you agree to Car Care Ally's Terms. The base appointment fee is set by the platform and applied to your final invoice.</p>
        </form>
      </section>
    </PageShell>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required ? <span className="text-accent">*</span> : <span className="text-muted-foreground/60 normal-case">(optional)</span>}
      </span>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </label>
    </>
  );
}

export default BookPage;
