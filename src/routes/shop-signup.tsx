import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Plus, Trash2 } from "lucide-react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const TZS = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"];
const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ShopSignupPage() {
  useDocumentTitle("Become a Partner — Car Care Ally", "Auto-repair shops and independent specialists: create your Car Care Ally business profile.");
  const { user, refreshRoles } = useAuth();
  const nav = useNavigate();

  // inline email-code account step
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const [plan, setPlan] = useState<"starter" | "pro">("starter");
  const [f, setF] = useState({
    name: "", business_type: "shop", phone: "", email: "", address: "", city: "", state: "", zip: "",
    timezone: "America/New_York", description: "", website: "",
  });
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(
    Object.fromEntries(DAYS.map((d) => [d, { open: "08:00", close: "18:00", closed: d === "sun" }])),
  );
  const [services, setServices] = useState([{ name: "Diagnostic inspection", price_usd: "89", duration_minutes: "60" }]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("We emailed you a 6-digit code.");
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return toast.error(error.message);
    setF((x) => ({ ...x, email }));
    toast.success("Email verified. Now tell us about your business.");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: shopId, error } = await supabase.rpc("register_shop", {
      _name: f.name, _business_type: f.business_type, _plan: plan, _phone: f.phone, _email: f.email || user?.email || "",
      _address: f.address, _city: f.city, _state: f.state.toUpperCase(), _zip: f.zip, _timezone: f.timezone,
      _description: f.description, _hours: hours as any, _website: f.website,
    });
    if (error || !shopId) { setBusy(false); return toast.error(error?.message ?? "Could not create profile"); }
    const rows = services.filter((s) => s.name.trim()).map((s) => ({
      shop_id: shopId as string, name: s.name.trim(), price_usd: Number(s.price_usd) || 0, duration_minutes: Number(s.duration_minutes) || 60,
    }));
    if (rows.length) await supabase.from("shop_services").insert(rows);
    await refreshRoles();
    setBusy(false);
    toast.success("Your business profile is live.");
    nav("/shop");
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Become a Car Care Ally partner</h1>
        <p className="mt-3 text-muted-foreground">For auto-repair shops and independent auto specialists. Keep 100% of what your customers pay you.</p>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {[
            { id: "starter", name: "Starter", price: "$99/mo", pts: ["$9 per appointment booked, billed monthly", "Customers pay you directly (cash, Zelle, card…)", "Live job board, e-invoices, audit trail"] },
            { id: "pro", name: "Pro", price: "$199/mo", pts: ["Everything in Starter", "Your own parts marketplace", "Add parts to customer orders & invoices"] },
          ].map((p) => (
            <button type="button" key={p.id} onClick={() => setPlan(p.id as any)}
              className={`text-left rounded-xl border-2 p-5 transition ${plan === p.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <p className="font-semibold text-foreground">{p.name} <span className="text-primary">{p.price}</span></p>
              <ul className="mt-2 space-y-1">{p.pts.map((t) => <li key={t} className="text-xs text-muted-foreground flex gap-1.5"><Check className="h-3.5 w-3.5 text-success shrink-0" />{t}</li>)}</ul>
            </button>
          ))}
        </div>

        {!user ? (
          <div className="mt-8 rounded-xl border bg-card p-6">
            <h2 className="font-semibold text-foreground">Step 1 — Verify your email</h2>
            {!sent ? (
              <form onSubmit={sendCode} className="mt-4 flex gap-2">
                <input type="email" required placeholder="you@yourshop.com" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
                <Button disabled={busy}>{busy ? "Sending…" : "Send code"}</Button>
              </form>
            ) : (
              <form onSubmit={verify} className="mt-4 flex gap-2">
                <input required inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} className={input} />
                <Button disabled={busy}>{busy ? "Verifying…" : "Verify"}</Button>
              </form>
            )}
            <p className="mt-3 text-xs text-muted-foreground">Already have an account? <Link to="/login" className="text-primary">Sign in</Link>, then come back to this page.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 rounded-xl border bg-card p-6 space-y-6">
            <div>
              <h2 className="font-semibold text-foreground">Business details</h2>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <input required placeholder="Business name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} />
                <select value={f.business_type} onChange={(e) => setF({ ...f, business_type: e.target.value })} className={input}>
                  <option value="shop">Auto-repair shop</option>
                  <option value="independent">Independent specialist / mobile mechanic</option>
                </select>
                <input required placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input} />
                <input type="email" placeholder="Business email" value={f.email || user.email || ""} onChange={(e) => setF({ ...f, email: e.target.value })} className={input} />
                <input required placeholder="Street address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className={`${input} sm:col-span-2`} />
                <input required placeholder="City" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={input} />
                <div className="grid grid-cols-2 gap-3">
                  <input required maxLength={2} placeholder="State (TX)" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} className={input} />
                  <input required placeholder="ZIP" value={f.zip} onChange={(e) => setF({ ...f, zip: e.target.value })} className={input} />
                </div>
                <select value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} className={input}>
                  {TZS.map((t) => <option key={t} value={t}>{t.replace("America/", "").replace("_", " ")}</option>)}
                </select>
                <input placeholder="Website (optional)" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} className={input} />
                <textarea placeholder="Short description, certifications (ASE, etc.)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={`${input} sm:col-span-2 min-h-[80px]`} />
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-foreground">Opening hours</h2>
              <div className="mt-3 space-y-2">
                {DAYS.map((d) => (
                  <div key={d} className="flex items-center gap-3 text-sm">
                    <span className="w-10 uppercase text-xs font-semibold text-muted-foreground">{d}</span>
                    <input type="time" disabled={hours[d].closed} value={hours[d].open} onChange={(e) => setHours({ ...hours, [d]: { ...hours[d], open: e.target.value } })} className="rounded-md border border-input bg-background px-2 py-1 text-xs" />
                    <span className="text-muted-foreground">–</span>
                    <input type="time" disabled={hours[d].closed} value={hours[d].close} onChange={(e) => setHours({ ...hours, [d]: { ...hours[d], close: e.target.value } })} className="rounded-md border border-input bg-background px-2 py-1 text-xs" />
                    <label className="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" checked={hours[d].closed} onChange={(e) => setHours({ ...hours, [d]: { ...hours[d], closed: e.target.checked } })} /> Closed</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-foreground">Services & pricing</h2>
              <p className="text-xs text-muted-foreground">You can change these any time. Every change is recorded in your audit log.</p>
              <div className="mt-3 space-y-2">
                {services.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <input placeholder="Service" value={s.name} onChange={(e) => setServices(services.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} className={`${input} col-span-6`} />
                    <input type="number" step="0.01" placeholder="Price $" value={s.price_usd} onChange={(e) => setServices(services.map((x, j) => j === i ? { ...x, price_usd: e.target.value } : x))} className={`${input} col-span-3`} />
                    <input type="number" placeholder="Minutes" value={s.duration_minutes} onChange={(e) => setServices(services.map((x, j) => j === i ? { ...x, duration_minutes: e.target.value } : x))} className={`${input} col-span-2`} />
                    <button type="button" onClick={() => setServices(services.filter((_, j) => j !== i))} className="col-span-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={() => setServices([...services, { name: "", price_usd: "", duration_minutes: "60" }])}><Plus className="h-3.5 w-3.5 mr-1" /> Add service</Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-xs text-muted-foreground">Plan: <strong className="text-foreground">{plan === "pro" ? "Pro · $199/mo" : "Starter · $99/mo"}</strong> + $9 per appointment booked</p>
              <Button disabled={busy}>{busy ? "Creating…" : "Create business profile"}</Button>
            </div>
          </form>
        )}
      </section>
    </PageShell>
  );
}
