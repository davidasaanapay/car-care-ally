import { useDocumentTitle } from "@/lib/use-document-title";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, Store, Users, KeyRound, Settings, Plus } from "lucide-react";
function AdminPage() {
  useDocumentTitle("Admin — Car Care Ally");
  const { isSuperAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"shops" | "users" | "settings" | "keys">("shops");

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!isSuperAdmin) return (
    <div className="rounded-xl border bg-card p-10 text-center">
      <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground/40" />
      <p className="mt-3 font-semibold text-foreground">Restricted area</p>
      <p className="mt-1 text-sm text-muted-foreground">Super admin access required.</p>
    </div>
  );

  const tabs = [
    { id: "shops", label: "Shops & Specialists", icon: Store },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Platform Settings", icon: Settings },
    { id: "keys", label: "API Keys & Integrations", icon: KeyRound },
  ] as const;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground">Platform Administration</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage the Car Care Ally network.</p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "shops" && <ShopsAdmin />}
        {tab === "users" && <UsersAdmin />}
        {tab === "settings" && <SettingsAdmin />}
        {tab === "keys" && <KeysAdmin />}
      </div>
    </div>
  );
}

function ShopsAdmin() {
  const [shops, setShops] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", city: "", state: "", phone: "", email: "" });

  const load = () => supabase.from("shops").select("*").order("created_at", { ascending: false }).then(({ data }) => setShops(data ?? []));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("shops").insert({ ...form, status: "active" });
    if (error) return toast.error(error.message);
    toast.success("Shop added");
    setForm({ name: "", slug: "", city: "", state: "", phone: "", email: "" });
    setOpen(false); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{shops.length} shops on the platform</p>
        <Button size="sm" onClick={() => setOpen(!open)}><Plus className="mr-1 h-3.5 w-3.5" /> Add shop</Button>
      </div>
      {open && (
        <form onSubmit={create} className="rounded-xl border bg-card p-5 grid sm:grid-cols-2 gap-3 mb-6">
          {(["name","slug","city","state","phone","email"] as const).map((k) => (
            <input key={k} required={k === "name" || k === "slug"} placeholder={k} value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          ))}
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {shops.map((s) => (
          <div key={s.id} className="rounded-lg border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{[s.city, s.state].filter(Boolean).join(", ")} · {s.status}</p>
            </div>
            <span className="text-xs text-muted-foreground">{Number(s.marketplace_fee_pct)}% mkt fee</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});

  const load = async () => {
    const { data: profs } = await supabase.from("profiles").select("id,email,full_name,city,state,created_at").order("created_at", { ascending: false });
    const { data: rs } = await supabase.from("user_roles").select("user_id,role");
    const map: Record<string, string[]> = {};
    (rs ?? []).forEach((r: any) => { (map[r.user_id] = map[r.user_id] || []).push(r.role); });
    setUsers(profs ?? []); setRoles(map);
  };
  useEffect(() => { load(); }, []);

  const grant = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    if (error) return toast.error(error.message);
    toast.success(`Granted ${role}`); load();
  };
  const revoke = async (userId: string, role: string) => {
    if (role === "super_admin" && !confirm("Revoke super admin?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (error) return toast.error(error.message);
    toast.success(`Revoked ${role}`); load();
  };

  return (
    <div className="space-y-2">
      {users.map((u) => {
        const ur = roles[u.id] || [];
        return (
          <div key={u.id} className="rounded-lg border bg-card p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{u.full_name || u.email}</p>
              <p className="text-xs text-muted-foreground truncate">{u.email} · {[u.city, u.state].filter(Boolean).join(", ") || "—"}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {ur.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                {ur.map((r) => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1">
                    {r} <button onClick={() => revoke(u.id, r)} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            </div>
            <select onChange={(e) => { if (e.target.value) { grant(u.id, e.target.value); e.target.value = ""; } }} defaultValue=""
              className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
              <option value="" disabled>Grant role…</option>
              {["customer", "shop_owner", "specialist", "super_admin"].filter((r) => !ur.includes(r)).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function SettingsAdmin() {
  const [settings, setSettings] = useState<any[]>([]);
  useEffect(() => { supabase.from("platform_settings").select("*").then(({ data }) => setSettings(data ?? [])); }, []);
  const update = async (key: string, value: string) => {
    let v: any = value;
    try { v = JSON.parse(value); } catch {}
    const { error } = await supabase.from("platform_settings").update({ value: v }).eq("key", key);
    if (error) toast.error(error.message); else toast.success(`Updated ${key}`);
  };
  return (
    <div className="space-y-3">
      {settings.map((s) => (
        <div key={s.key} className="rounded-lg border bg-card p-4 grid sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div>
            <p className="font-semibold text-foreground">{s.key}</p>
            <p className="text-xs text-muted-foreground">Current: {JSON.stringify(s.value)}</p>
          </div>
          <input defaultValue={JSON.stringify(s.value)} onBlur={(e) => update(s.key, e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
      ))}
    </div>
  );
}

function KeysAdmin() {
  const [creds, setCreds] = useState<any[]>([]);
  useEffect(() => { supabase.from("integration_credentials").select("*").then(({ data }) => setCreds(data ?? [])); }, []);
  return (
    <div>
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 mb-6">
        <p className="text-sm text-foreground">
          <strong>Security:</strong> Provider secrets are stored encrypted on the server (.env / Lovable Cloud secrets).
          They are never sent to the browser and never stored in the database. Use the Lovable backend secrets panel to add or rotate API keys for payments, email, parts pricing, and other integrations.
        </p>
      </div>
      <div className="space-y-2">
        {creds.map((c) => (
          <div key={c.provider} className="rounded-lg border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground capitalize">{c.provider}</p>
              <p className="text-xs text-muted-foreground">{c.is_configured ? "Configured" : "Not configured"}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${c.is_configured ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              {c.is_configured ? "Active" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>

  );
}

export default AdminPage;
