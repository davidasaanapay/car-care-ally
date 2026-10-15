import { useDocumentTitle } from "@/lib/use-document-title";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Store, Calendar, Package, FileText, Plus, Users, Trash2, X, Activity, Tag, Receipt, ScrollText, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { STAGES, stageLabel, stageIndex, notifyCustomer, fmtInTz, money } from "@/lib/workflow";
import { PaymentProofDialog } from "@/components/PaymentProofDialog";
import { MediaUploader } from "@/components/MediaUploader";

function ShopDashboard() {
  useDocumentTitle("Specialist Dashboard — Car Care Ally");
  const { user, loading } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [shopLoaded, setShopLoaded] = useState(false);
  const [tab, setTab] = useState<string>("board");
  const [appts, setAppts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("*").eq("owner_id", user.id).maybeSingle().then(({ data }) => { setShop(data); setShopLoaded(true); });
  }, [user?.id]);

  const loadAppts = () => shop?.id && supabase.from("appointments").select("*").eq("shop_id", shop.id).order("scheduled_for", { ascending: true }).then(({ data }) => setAppts(data ?? []));
  const loadInvoices = () => shop?.id && supabase.from("invoices").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setInvoices(data ?? []));

  useEffect(() => {
    if (!shop?.id) return;
    loadAppts(); loadInvoices();
    supabase.from("marketplace_items").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
    supabase.from("team_members").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setTeam(data ?? []));
    const ch = supabase.channel(`shop-${shop.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `shop_id=eq.${shop.id}` }, () => loadAppts())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [shop?.id]);

  if (loading || (user && !shopLoaded)) return <p className="text-muted-foreground">Loading…</p>;
  if (!shop) return (
    <div className="rounded-xl border bg-card p-10 text-center">
      <Store className="h-10 w-10 mx-auto text-muted-foreground/40" />
      <p className="mt-3 font-semibold text-foreground">No business profile yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Create your shop or independent specialist profile in a few minutes.</p>
      <Button asChild className="mt-4"><Link to="/shop-signup">Create business profile</Link></Button>
    </div>
  );

  const isPro = shop.plan === "pro";
  const tabs = [
    { id: "board", label: "Live job board", icon: Activity },
    { id: "appointments", label: `Appointments (${appts.length})`, icon: Calendar },
    { id: "invoices", label: `Invoices (${invoices.length})`, icon: FileText },
    { id: "services", label: "Services & pricing", icon: Tag },
    ...(isPro ? [{ id: "marketplace", label: `Marketplace (${items.length})`, icon: Package }] : []),
    { id: "team", label: `Team (${team.length})`, icon: Users },
    { id: "billing", label: "Platform billing", icon: Receipt },
    { id: "audit", label: "Audit log", icon: ScrollText },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{shop.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{[shop.city, shop.state].filter(Boolean).join(", ")} · {shop.plan === "pro" ? "Pro" : "Starter"} plan · {shop.status}</p>
        </div>
        {!isPro && <p className="text-xs rounded-full bg-accent/10 text-accent px-3 py-1">Upgrade to Pro ($199/mo) to sell parts — contact support</p>}
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "board" && <LiveBoard shop={shop} appts={appts} invoices={invoices} onChanged={() => { loadAppts(); loadInvoices(); }} />}
        {tab === "appointments" && <ApptsList userId={user!.id} shopId={shop.id} appts={appts} isPro={isPro} items={items} onInvoiceCreated={loadInvoices} />}
        {tab === "invoices" && <InvoicesList userId={user!.id} invoices={invoices} reload={loadInvoices} />}
        {tab === "services" && <ServicesMgr shopId={shop.id} />}
        {tab === "marketplace" && isPro && <MarketplaceMgr shopId={shop.id} items={items} setItems={setItems} />}
        {tab === "team" && <TeamMgr shopId={shop.id} team={team} setTeam={setTeam} />}
        {tab === "billing" && <BillingView shopId={shop.id} />}
        {tab === "audit" && <AuditView shopId={shop.id} />}
      </div>
    </div>
  );
}

function LiveBoard({ shop, appts, invoices, onChanged }: any) {
  const open = appts.filter((a: any) => !["appointment_closed", "cancelled"].includes(a.status));
  const enRoute = open.filter((a: any) => a.status === "en_route");
  const setStage = async (a: any, status: string, eta?: string) => {
    const patch: any = { status, updated_at: new Date().toISOString() };
    if (eta !== undefined) patch.eta = eta ? new Date(eta).toISOString() : null;
    const { error } = await supabase.from("appointments").update(patch).eq("id", a.id);
    if (error) return toast.error(error.message);
    notifyCustomer(a.guest_email, `Update on your ${a.service_type || "service"}: ${stageLabel(status)}`,
      `<p>Your vehicle (${a.vehicle_summary || ""}) is now at stage: <strong>${stageLabel(status)}</strong>.</p>${patch.eta ? `<p>Expected completion: ${fmtInTz(patch.eta, shop.timezone)}</p>` : ""}<p>— ${shop.name} via Car Care Ally</p>`);
    onChanged();
  };
  const close = async (a: any) => {
    const { error } = await supabase.rpc("close_appointment", { _appt: a.id });
    if (error) return toast.error(error.message);
    toast.success("Appointment closed"); onChanged();
  };
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-3">
        {[
          { l: "Open jobs", v: open.length },
          { l: "Vehicles en route", v: enRoute.length },
          { l: "Today", v: open.filter((a: any) => new Date(a.scheduled_for).toDateString() === new Date().toDateString()).length },
          { l: "Awaiting payment", v: invoices.filter((i: any) => i.status !== "paid").length },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{s.l}</p><p className="mt-1 text-2xl font-bold text-foreground">{s.v}</p></div>
        ))}
      </div>
      {open.length === 0 ? <p className="text-muted-foreground">No open jobs. New bookings appear here instantly.</p> : (
        <div className="space-y-3">
          {open.map((a: any) => {
            const idx = Math.max(0, stageIndex(a.status));
            const pct = Math.round((idx / (STAGES.length - 2)) * 100);
            const paid = invoices.some((i: any) => i.appointment_id === a.id && i.status === "paid" && i.proof_path);
            return (
              <div key={a.id} className={`rounded-xl border bg-card p-4 ${a.status === "en_route" ? "border-accent" : ""}`}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{a.vehicle_summary || "Vehicle"} · {a.service_type || "Service"}</p>
                    <p className="text-xs text-muted-foreground">{a.guest_name || "Customer"} · {fmtInTz(a.scheduled_for, shop.timezone)}</p>
                    {a.status === "en_route" && <p className="mt-1 text-xs font-semibold text-accent flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Customer is on the way</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={a.status} onChange={(e) => setStage(a, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                      {STAGES.filter((s) => s.id !== "appointment_closed").map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">ETA
                      <input type="datetime-local" defaultValue={a.eta ? new Date(a.eta).toISOString().slice(0, 16) : ""} onBlur={(e) => e.target.value && setStage(a, a.status, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-xs" />
                    </label>
                    <Button size="sm" variant="outline" disabled={!paid} title={paid ? "" : "Needs a paid invoice with proof of payment"} onClick={() => close(a)}>Close</Button>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
                <p className="mt-1 text-xs text-muted-foreground">{stageLabel(a.status)}{a.eta ? ` · ETA ${fmtInTz(a.eta, shop.timezone)}` : ""}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ApptsList({ userId, shopId, appts, isPro, items, onInvoiceCreated }: any) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [invoiceFor, setInvoiceFor] = useState<any | null>(null);

  if (appts.length === 0) return <p className="text-muted-foreground">No appointments yet.</p>;
  return (
    <>
      <div className="space-y-2">
        {appts.map((a: any) => (
          <div key={a.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{a.service_type || "Service"} · {a.vehicle_summary || "—"}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.scheduled_for).toLocaleString()} · {a.guest_name || "Customer"} · {a.guest_email || ""} · {stageLabel(a.status)}</p>
                {a.issue_summary && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.issue_summary}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setOpenId(openId === a.id ? null : a.id)}>Details</Button>
                <Button size="sm" onClick={() => setInvoiceFor(a)}><FileText className="h-3.5 w-3.5 mr-1" /> Invoice</Button>
              </div>
            </div>
            {openId === a.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {isPro && <PartsForAppt appt={a} shopId={shopId} items={items} />}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Customer pre-appointment</p>
                  <MediaUploader uploaderId={userId} uploaderRole="specialist" appointmentId={a.id} readOnly showContexts={["appointment_pre", "diagnostics"]} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your proof of work (during/after)</p>
                  <MediaUploader uploaderId={userId} uploaderRole="specialist" context="appointment_post" appointmentId={a.id} showContexts={["appointment_during", "appointment_post"]} />
                </div>
                <ApptTimeline apptId={a.id} />
              </div>
            )}
          </div>
        ))}
      </div>
      {invoiceFor && <InvoiceComposer shopId={shopId} appt={invoiceFor} onClose={() => setInvoiceFor(null)} onCreated={() => { setInvoiceFor(null); onInvoiceCreated(); }} />}
    </>
  );
}

function PartsForAppt({ appt, shopId, items }: any) {
  const [parts, setParts] = useState<any[]>([]);
  const [pick, setPick] = useState("");
  const [qty, setQty] = useState("1");
  const [verified, setVerified] = useState("human");
  const load = () => supabase.from("appointment_parts").select("*").eq("appointment_id", appt.id).then(({ data }) => setParts(data ?? []));
  useEffect(() => { load(); }, [appt.id]);
  const add = async () => {
    const it = items.find((i: any) => i.id === pick);
    if (!it) return;
    const { error } = await supabase.from("appointment_parts").insert({ appointment_id: appt.id, shop_id: shopId, marketplace_item_id: it.id, title: it.title, quantity: Number(qty) || 1, unit_price: it.price_usd, verified_by: verified });
    if (error) return toast.error(error.message);
    setPick(""); load();
  };
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Parts required (added to invoice)</p>
      {parts.map((p) => <p key={p.id} className="text-sm text-foreground">{p.quantity} × {p.title} · {money(p.unit_price)} <span className="text-xs text-muted-foreground">({p.verified_by === "ai" ? "AI diagnostics" : "verified by specialist"})</span></p>)}
      <div className="mt-2 flex flex-wrap gap-2">
        <select value={pick} onChange={(e) => setPick(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
          <option value="">Choose a part…</option>
          {items.filter((i: any) => i.active).map((i: any) => <option key={i.id} value={i.id}>{i.title} — {money(i.price_usd)}</option>)}
        </select>
        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
        <select value={verified} onChange={(e) => setVerified(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
          <option value="human">Confirmed by specialist</option><option value="ai">Confirmed by AI diagnostics</option>
        </select>
        <Button size="sm" variant="outline" onClick={add}>Add part</Button>
      </div>
    </div>
  );
}

export function ApptTimeline({ apptId }: { apptId: string }) {
  const [ev, setEv] = useState<any[]>([]);
  useEffect(() => { supabase.from("audit_log").select("*").eq("appointment_id", apptId).order("created_at").then(({ data }) => setEv(data ?? [])); }, [apptId]);
  if (!ev.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Timeline</p>
      <ol className="border-l border-border pl-4 space-y-1.5">
        {ev.map((e) => <li key={e.id} className="text-xs"><span className="font-medium text-foreground">{stageLabel(e.event_type)}</span> <span className="text-muted-foreground">· {new Date(e.created_at).toLocaleString()}</span></li>)}
      </ol>
    </div>
  );
}

function ServicesMgr({ shopId }: { shopId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [n, setN] = useState({ name: "", price_usd: "", duration_minutes: "60" });
  const load = () => supabase.from("shop_services").select("*").eq("shop_id", shopId).order("created_at").then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, [shopId]);
  const save = async (r: any, patch: any) => {
    const { error } = await supabase.from("shop_services").update(patch).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Saved — recorded in audit log"); load();
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("shop_services").insert({ shop_id: shopId, name: n.name, price_usd: Number(n.price_usd) || 0, duration_minutes: Number(n.duration_minutes) || 60 });
    if (error) return toast.error(error.message);
    setN({ name: "", price_usd: "", duration_minutes: "60" }); load();
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Update your prices any time. Every change is permanently recorded in the audit log, visible only to you and Car Care Ally support.</p>
      {rows.map((r) => (
        <div key={r.id} className="rounded-lg border bg-card p-3 flex flex-wrap items-center gap-3">
          <p className="flex-1 font-medium text-foreground">{r.name}</p>
          <input type="number" step="0.01" defaultValue={r.price_usd} onBlur={(e) => Number(e.target.value) !== Number(r.price_usd) && save(r, { price_usd: Number(e.target.value) })} className="w-28 rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
          <span className="text-xs text-muted-foreground">{r.duration_minutes} min</span>
          <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={r.active} onChange={(e) => save(r, { active: e.target.checked })} /> Active</label>
        </div>
      ))}
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input required placeholder="New service" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <input required type="number" step="0.01" placeholder="Price $" value={n.price_usd} onChange={(e) => setN({ ...n, price_usd: e.target.value })} className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <input type="number" placeholder="Min" value={n.duration_minutes} onChange={(e) => setN({ ...n, duration_minutes: e.target.value })} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
      </form>
    </div>
  );
}

export function BillingView({ shopId }: { shopId?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [pays, setPays] = useState<any[]>([]);
  useEffect(() => {
    let q = supabase.from("shop_fee_ledger").select("*").order("period", { ascending: false });
    if (shopId) q = q.eq("shop_id", shopId);
    q.then(({ data }) => setRows(data ?? []));
    let p = supabase.from("shop_fee_payments").select("*").order("created_at", { ascending: false });
    if (shopId) p = p.eq("shop_id", shopId);
    p.then(({ data }) => setPays(data ?? []));
  }, [shopId]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Monthly plan + $9 per appointment booked. Amounts are calculated automatically from your bookings.</p>
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr>{!shopId && <th className="p-3 text-left">Business</th>}<th className="p-3 text-left">Month</th><th className="p-3 text-right">Appointments</th><th className="p-3 text-right">Appt fees</th><th className="p-3 text-right">Plan</th><th className="p-3 text-right">Total due</th><th className="p-3 text-right">Paid</th><th className="p-3 text-right">Balance</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} className="p-4 text-muted-foreground">No bookings yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.shop_id + r.period} className="border-t">
                {!shopId && <td className="p-3">{r.shop_name}</td>}
                <td className="p-3">{r.period}</td><td className="p-3 text-right">{r.appointments_booked}</td>
                <td className="p-3 text-right">{money(r.appointment_fees_usd)}</td><td className="p-3 text-right">{money(r.subscription_usd)}</td>
                <td className="p-3 text-right font-semibold">{money(r.total_due_usd)}</td><td className="p-3 text-right">{money(r.paid_usd)}</td>
                <td className="p-3 text-right">{money(Number(r.total_due_usd) - Number(r.paid_usd))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pays.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payments received by Car Care Ally</p>
          {pays.map((p) => <p key={p.id} className="text-sm">{p.period} · {money(p.amount_usd)} · {p.method || "—"} {p.reference ? `· ${p.reference}` : ""} · {new Date(p.created_at).toLocaleDateString()}</p>)}
        </div>
      )}
    </div>
  );
}

export function AuditView({ shopId }: { shopId?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    let q = supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(500);
    if (shopId) q = q.eq("shop_id", shopId);
    q.then(({ data }) => setRows(data ?? []));
  }, [shopId]);
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">Permanent record of every action. Entries can never be edited or deleted.</p>
      <div className="rounded-xl border bg-card divide-y">
        {rows.length === 0 && <p className="p-4 text-muted-foreground text-sm">No events yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="p-3 text-sm flex flex-wrap justify-between gap-2">
            <span className="font-medium text-foreground">{stageLabel(r.event_type)}</span>
            <span className="text-xs text-muted-foreground truncate max-w-md">{Object.entries(r.details || {}).filter(([, v]) => v !== null).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`).join(" · ")}</span>
            <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoiceComposer({ shopId, appt, onClose, onCreated }: any) {
  const [items, setItems] = useState<{ kind: string; description: string; quantity: number; unit_price: number }[]>([
    { kind: "service", description: appt.service_type || "Service", quantity: 1, unit_price: 0 },
  ]);
  const [taxPct, setTaxPct] = useState(0);
  const [feeUsd, setFeeUsd] = useState(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("appointment_parts").select("*").eq("appointment_id", appt.id).then(({ data }) => {
      if (data?.length) setItems((cur) => [...cur, ...data.map((p: any) => ({ kind: "part", description: p.title, quantity: Number(p.quantity), unit_price: Number(p.unit_price) }))]);
    });
  }, [appt.id]);
  const addRow = () => setItems([...items, { kind: "service", description: "", quantity: 1, unit_price: 0 }]);
  const removeRow = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, value: any) => setItems(items.map((row, idx) => idx === i ? { ...row, [key]: value } : row));

  const subtotal = items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0), 0);
  const tax = subtotal * (taxPct / 100);
  const total = subtotal + tax + Number(feeUsd || 0);

  const submit = async () => {
    setBusy(true);
    const { data: inv, error } = await supabase.from("invoices").insert({
      shop_id: shopId, appointment_id: appt.id, customer_id: appt.customer_id,
      subtotal, tax, appointment_fee: feeUsd, total, status: "sent", notes,
    }).select().single();
    if (error || !inv) { setBusy(false); return toast.error(error?.message ?? "Failed"); }
    if (items.length > 0) {
      const rows = items.map((it) => ({
        invoice_id: inv.id, kind: it.kind, description: it.description,
        quantity: it.quantity, unit_price: it.unit_price, total: it.quantity * it.unit_price,
      }));
      await supabase.from("invoice_items").insert(rows);
    }
    setBusy(false);
    notifyCustomer(appt.guest_email, "Your invoice is ready for review", `<p>Your invoice of $${total.toFixed(2)} is ready. Sign in to Car Care Ally to approve or dispute it.</p>`);
    toast.success(`Invoice #${inv.id.slice(0, 8)} sent`);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-elegant max-w-2xl w-full p-6 my-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">New invoice</h3>
            <p className="text-xs text-muted-foreground">For {appt.guest_name || "customer"} · {appt.service_type}</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <select value={it.kind} onChange={(e) => update(i, "kind", e.target.value)} className="col-span-2 rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                <option value="service">Service</option><option value="part">Part</option><option value="labor">Labor</option><option value="other">Other</option>
              </select>
              <input placeholder="Description" value={it.description} onChange={(e) => update(i, "description", e.target.value)} className="col-span-5 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
              <input type="number" step="0.01" value={it.quantity} onChange={(e) => update(i, "quantity", parseFloat(e.target.value))} className="col-span-2 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
              <input type="number" step="0.01" value={it.unit_price} onChange={(e) => update(i, "unit_price", parseFloat(e.target.value))} className="col-span-2 rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
              <button onClick={() => removeRow(i)} className="col-span-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addRow}><Plus className="h-3.5 w-3.5 mr-1" /> Add line</Button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <label className="text-xs"><span className="text-muted-foreground">Tax %</span><input type="number" step="0.01" value={taxPct} onChange={(e) => setTaxPct(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs" /></label>
          <label className="text-xs"><span className="text-muted-foreground">Appointment deposit credit ($)</span><input type="number" step="0.01" value={feeUsd} onChange={(e) => setFeeUsd(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs" /></label>
        </div>
        <textarea placeholder="Notes for customer" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-3 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs min-h-[60px]" />
        <div className="mt-4 rounded-lg bg-secondary p-3 text-sm space-y-1">
          <p className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></p>
          <p className="flex justify-between text-muted-foreground"><span>Tax</span><span>${tax.toFixed(2)}</span></p>
          <p className="flex justify-between text-muted-foreground"><span>Appointment fee</span><span>${Number(feeUsd).toFixed(2)}</span></p>
          <p className="flex justify-between font-bold text-foreground border-t pt-1 mt-1"><span>Total</span><span>${total.toFixed(2)}</span></p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy || total <= 0}>{busy ? "Creating…" : "Send invoice"}</Button>
        </div>
      </div>
    </div>
  );
}

function MarketplaceMgr({ shopId, items, setItems }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price_usd: "", stock: "0", category: "" });
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from("marketplace_items").insert({
      shop_id: shopId, title: form.title, description: form.description,
      price_usd: Number(form.price_usd), stock: Number(form.stock), category: form.category,
    }).select().single();
    if (error) return toast.error(error.message);
    toast.success("Part listed");
    setItems([data, ...items]);
    setForm({ title: "", description: "", price_usd: "", stock: "0", category: "" });
    setOpen(false);
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{items.length} parts listed</p>
        <Button size="sm" onClick={() => setOpen(!open)}><Plus className="mr-1 h-3.5 w-3.5" /> Add part</Button>
      </div>
      {open && (
        <form onSubmit={create} className="rounded-xl border bg-card p-5 grid sm:grid-cols-2 gap-3 mb-6">
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required type="number" step="0.01" placeholder="Price (USD)" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">List part</Button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {items.map((i: any) => (
          <div key={i.id} className="rounded-lg border bg-card p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-foreground">{i.title}</p>
              <p className="text-xs text-muted-foreground">${Number(i.price_usd).toFixed(2)} · stock {i.stock}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${i.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{i.active ? "Active" : "Inactive"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoicesList({ userId, invoices, reload }: any) {
  const [payFor, setPayFor] = useState<any | null>(null);
  if (invoices.length === 0) return <p className="text-muted-foreground">No invoices yet. Open an appointment and click "Invoice" to create one.</p>;
  return (
    <div className="space-y-2">
      {invoices.map((i: any) => (
        <div key={i.id} className="rounded-lg border bg-card p-4 flex flex-wrap justify-between items-center gap-3">
          <div>
            <p className="font-semibold text-foreground">{money(i.total)} {i.currency}</p>
            <p className="text-xs text-muted-foreground">#{i.id.slice(0, 8)} · {new Date(i.created_at).toLocaleDateString()} · {i.status}{i.payment_channel ? ` · ${i.payment_channel} on ${i.payment_date}` : ""}</p>
            {i.status === "disputed" && <p className="text-xs text-destructive mt-1">Customer dispute: {i.dispute_reason}</p>}
          </div>
          <div className="flex gap-2">
            {i.status === "disputed" && <Button size="sm" variant="outline" onClick={async () => { await supabase.from("invoices").update({ status: "sent" }).eq("id", i.id); reload(); }}>Re-send after fixing</Button>}
            {i.status !== "paid" && <Button size="sm" onClick={() => setPayFor(i)}>Record payment</Button>}
          </div>
        </div>
      ))}
      {payFor && <PaymentProofDialog userId={userId} invoice={payFor} onClose={() => setPayFor(null)} onDone={() => { setPayFor(null); reload(); }} />}
    </div>
  );
}

function TeamMgr({ shopId, team, setTeam }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", role: "specialist" });
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from("team_members").insert({ shop_id: shopId, ...form }).select().single();
    if (error) return toast.error(error.message);
    toast.success("Team member added");
    setTeam([data, ...team]);
    setForm({ full_name: "", email: "", phone: "", role: "specialist" });
    setOpen(false);
  };
  const remove = async (id: string) => {
    if (!confirm("Remove team member?")) return;
    await supabase.from("team_members").delete().eq("id", id);
    setTeam(team.filter((t: any) => t.id !== id));
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{team.length} team members. Each can use the platform under your shop.</p>
        <Button size="sm" onClick={() => setOpen(!open)}><Plus className="h-3.5 w-3.5 mr-1" /> Add member</Button>
      </div>
      {open && (
        <form onSubmit={create} className="rounded-xl border bg-card p-5 grid sm:grid-cols-2 gap-3 mb-6">
          <input required placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="specialist">Specialist (technician)</option>
            <option value="advisor">Service Advisor</option>
            <option value="manager">Shop Manager</option>
          </select>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add member</Button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {team.map((t: any) => (
          <div key={t.id} className="rounded-lg border bg-card p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-foreground">{t.full_name}</p>
              <p className="text-xs text-muted-foreground">{t.role} · {t.email || t.phone || "—"} · {t.status}</p>
            </div>
            <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopDashboard;
