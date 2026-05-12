import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Store, Calendar, Package, FileText, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shop")({
  head: () => ({ meta: [{ title: "Shop Dashboard — Car Care Ally" }, { name: "robots", content: "noindex" }] }),
  component: ShopDashboard,
});

function ShopDashboard() {
  const { user, loading } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "appointments" | "marketplace" | "invoices">("overview");
  const [appts, setAppts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("*").eq("owner_id", user.id).maybeSingle().then(({ data }) => setShop(data));
  }, [user?.id]);

  useEffect(() => {
    if (!shop?.id) return;
    supabase.from("appointments").select("*").eq("shop_id", shop.id).order("scheduled_for", { ascending: false }).then(({ data }) => setAppts(data ?? []));
    supabase.from("marketplace_items").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
    supabase.from("invoices").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }).then(({ data }) => setInvoices(data ?? []));
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
        {tab === "appointments" && <ApptsList appts={appts} onUpdate={async (id, status) => {
          const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
          if (error) toast.error(error.message); else { toast.success("Updated"); setAppts((a) => a.map((x) => x.id === id ? { ...x, status } : x)); }
        }} />}
        {tab === "marketplace" && <MarketplaceMgr shopId={shop.id} items={items} setItems={setItems} />}
        {tab === "invoices" && <InvoicesList invoices={invoices} />}
      </div>
    </div>
  );
}

function ApptsList({ appts, onUpdate }: any) {
  if (appts.length === 0) return <p className="text-muted-foreground">No appointments yet.</p>;
  return (
    <div className="space-y-2">
      {appts.map((a: any) => (
        <div key={a.id} className="rounded-lg border bg-card p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{a.service_type || "Service"} · {a.vehicle_summary || "—"}</p>
            <p className="text-xs text-muted-foreground">{new Date(a.scheduled_for).toLocaleString()} · {a.guest_name || "Customer"} · {a.guest_email || ""}</p>
            {a.issue_summary && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.issue_summary}</p>}
          </div>
          <select value={a.status} onChange={(e) => onUpdate(a.id, e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
            {["requested","confirmed","in_progress","completed","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ))}
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
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input required type="number" step="0.01" placeholder="Price (USD)" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="sm:col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" />
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

function InvoicesList({ invoices }: any) {
  if (invoices.length === 0) return <p className="text-muted-foreground">No invoices yet.</p>;
  return (
    <div className="space-y-2">
      {invoices.map((i: any) => (
        <div key={i.id} className="rounded-lg border bg-card p-4 flex justify-between items-center">
          <div>
            <p className="font-semibold text-foreground">${Number(i.total).toFixed(2)} {i.currency}</p>
            <p className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()} · {i.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
