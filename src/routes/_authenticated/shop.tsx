import { useDocumentTitle } from "@/lib/use-document-title";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Store, Calendar, Package, FileText, Plus, Users, Trash2, X } from "lucide-react";
import { MediaUploader } from "@/components/MediaUploader";

function ShopDashboard() {
  useDocumentTitle("Shop Dashboard — Car Care Ally");
  const { user, loading } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "appointments" | "marketplace" | "invoices" | "team">("overview");
  const [appts, setAppts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("*").eq("owner_id", user.id).maybeSingle().then(({ data }) => setShop(data));
  }, [user?.id]);

  useEffect(() => {
    if (!shop?.id) return;
    supabase.from("appointments").select("*").eq("shop_id", shop.id).order("scheduled_for", { ascending: false }).then(({ data }) => setAppts(data ?? []));
    supabase.from("marketplace_items").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
    supabase.from("invoices").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setInvoices(data ?? []));
    supabase.from("team_members").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setTeam(data ?? []));
  }, [shop?.id]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!shop) return (
    <div className="rounded-xl border bg-card p-10 text-center">
      <Store className="h-10 w-10 mx-auto text-muted-foreground/40" />
      <p className="mt-3 font-semibold text-foreground">No shop linked to your account</p>
      <p className="mt-1 text-sm text-muted-foreground">A super admin must onboard your shop first. Email <a href="mailto:partners@carcareally.com" className="text-primary">partners@carcareally.com</a>.</p>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Store },
    { id: "appointments", label: `Appointments (${appts.length})`, icon: Calendar },
    { id: "marketplace", label: `Parts (${items.length})`, icon: Package },
    { id: "invoices", label: `Invoices (${invoices.length})`, icon: FileText },
    { id: "team", label: `Team (${team.length})`, icon: Users },
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground">{shop.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{[shop.city, shop.state].filter(Boolean).join(", ")} · Status: {shop.status}</p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Open appointments", value: appts.filter((a) => a.status !== "completed" && a.status !== "cancelled").length },
              { label: "Active parts", value: items.filter((i) => i.active).length },
              { label: "Outstanding invoices", value: invoices.filter((i) => i.status !== "paid").length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-card p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "appointments" && <ApptsList userId={user!.id} shopId={shop.id} appts={appts} setAppts={setAppts} onInvoiceCreated={() => supabase.from("invoices").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setInvoices(data ?? []))} />}
        {tab === "marketplace" && <MarketplaceMgr shopId={shop.id} items={items} setItems={setItems} />}
        {tab === "invoices" && <InvoicesList invoices={invoices} setInvoices={setInvoices} />}
        {tab === "team" && <TeamMgr shopId={shop.id} team={team} setTeam={setTeam} />}
      </div>
    </div>
  );
}

function ApptsList({ userId, shopId, appts, setAppts, onInvoiceCreated }: any) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [invoiceFor, setInvoiceFor] = useState<any | null>(null);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setAppts((a: any[]) => a.map((x) => x.id === id ? { ...x, status } : x));
  };

  if (appts.length === 0) return <p className="text-muted-foreground">No appointments yet.</p>;
  return (
    <>
      <div className="space-y-2">
        {appts.map((a: any) => (
          <div key={a.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{a.service_type || "Service"} · {a.vehicle_summary || "—"}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.scheduled_for).toLocaleString()} · {a.guest_name || "Customer"} · {a.guest_email || ""}</p>
                {a.issue_summary && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.issue_summary}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select value={a.status} onChange={(e) => update(a.id, e.target.value)}
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                  {["requested", "confirmed", "in_progress", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button size="sm" variant="outline" onClick={() => setOpenId(openId === a.id ? null : a.id)}>Media</Button>
                <Button size="sm" onClick={() => setInvoiceFor(a)}><FileText className="h-3.5 w-3.5 mr-1" /> Invoice</Button>
              </div>
            </div>
            {openId === a.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Customer pre-appointment</p>
                  <MediaUploader uploaderId={userId} uploaderRole="specialist" appointmentId={a.id} readOnly showContexts={["appointment_pre", "diagnostics"]} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your proof of work (during/after)</p>
                  <MediaUploader uploaderId={userId} uploaderRole="specialist" context="appointment_post" appointmentId={a.id} showContexts={["appointment_during", "appointment_post"]} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {invoiceFor && <InvoiceComposer shopId={shopId} appt={invoiceFor} onClose={() => setInvoiceFor(null)} onCreated={() => { setInvoiceFor(null); onInvoiceCreated(); }} />}
    </>
  );
}

function InvoiceComposer({ shopId, appt, onClose, onCreated }: any) {
  const [items, setItems] = useState<{ kind: string; description: string; quantity: number; unit_price: number }[]>([
    { kind: "service", description: appt.service_type || "Service", quantity: 1, unit_price: 0 },
  ]);
  const [taxPct, setTaxPct] = useState(0);
  const [feeUsd, setFeeUsd] = useState(29);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

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
    toast.success(`Invoice #${inv.id.slice(0, 8)} created`);
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
          <label className="text-xs"><span className="text-muted-foreground">Platform fee ($)</span><input type="number" step="0.01" value={feeUsd} onChange={(e) => setFeeUsd(parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs" /></label>
        </div>
        <textarea placeholder="Notes for customer" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-3 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs min-h-[60px]" />
        <div className="mt-4 rounded-lg bg-secondary p-3 text-sm space-y-1">
          <p className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></p>
          <p className="flex justify-between text-muted-foreground"><span>Tax</span><span>${tax.toFixed(2)}</span></p>
          <p className="flex justify-between text-muted-foreground"><span>Platform fee</span><span>${Number(feeUsd).toFixed(2)}</span></p>
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

function InvoicesList({ invoices, setInvoices }: any) {
  if (invoices.length === 0) return <p className="text-muted-foreground">No invoices yet. Open an appointment and click "Invoice" to create one.</p>;
  const markPaid = async (id: string) => {
    const { error } = await supabase.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    setInvoices((arr: any[]) => arr.map((x) => x.id === id ? { ...x, status: "paid" } : x));
  };
  return (
    <div className="space-y-2">
      {invoices.map((i: any) => (
        <div key={i.id} className="rounded-lg border bg-card p-4 flex justify-between items-center">
          <div>
            <p className="font-semibold text-foreground">${Number(i.total).toFixed(2)} {i.currency}</p>
            <p className="text-xs text-muted-foreground">#{i.id.slice(0, 8)} · {new Date(i.created_at).toLocaleDateString()} · {i.status}</p>
          </div>
          {i.status !== "paid" && <Button size="sm" variant="outline" onClick={() => markPaid(i.id)}>Mark paid</Button>}
        </div>
      ))}
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
