import { useDocumentTitle } from "@/lib/use-document-title";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Trash2, Car, Wrench, ChevronDown, ChevronUp } from "lucide-react";

interface V { id: string; year: number; make: string; model: string; trim: string | null; license_plate: string | null; nickname: string | null; mileage: number | null; }
interface SC { code: string; name: string; }
interface VS { id: string; service_code: string; performed_on: string; mileage_at_service: number | null; cost_usd: number | null; next_due_date: string | null; next_due_mileage: number | null; notes: string | null; }

function VehiclesPage() {
  useDocumentTitle("My Garage — Car Care Ally");
  const { user } = useAuth();
  const [list, setList] = useState<V[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ year: "", make: "", model: "", trim: "", license_plate: "", nickname: "", mileage: "" });
  const [catalog, setCatalog] = useState<SC[]>([]);
  const [openHist, setOpenHist] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("vehicles").select("id,year,make,model,trim,license_plate,nickname,mileage").order("created_at", { ascending: false });
    setList((data ?? []) as V[]);
  };

  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => { supabase.from("service_catalog").select("code,name").eq("active", true).then(({ data }) => setCatalog((data ?? []) as SC[])); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("vehicles").insert({
      owner_id: user.id, year: parseInt(form.year), make: form.make, model: form.model,
      trim: form.trim || null, license_plate: form.license_plate || null, nickname: form.nickname || null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Vehicle added");
    setForm({ year: "", make: "", model: "", trim: "", license_plate: "", nickname: "", mileage: "" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this vehicle?")) return;
    await supabase.from("vehicles").delete().eq("id", id);
    toast.success("Removed"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Garage</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track every vehicle and get smart maintenance reminders.</p>
        </div>
        <Button onClick={() => setOpen(!open)}><Plus className="mr-1 h-4 w-4" /> Add vehicle</Button>
      </div>

      {open && (
        <form onSubmit={add} className="mt-6 rounded-xl border border-border bg-card p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ["Year", "year", "2021", true], ["Make", "make", "Toyota", true], ["Model", "model", "Camry", true],
            ["Trim", "trim", "XLE", false], ["License plate", "license_plate", "ABC-1234", false],
            ["Nickname", "nickname", "Daily driver", false], ["Mileage", "mileage", "42000", false],
          ].map(([label, key, ph, req]) => (
            <label key={key as string} className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}{req ? " *" : ""}</span>
              <input required={!!req} value={(form as Record<string, string>)[key as string]}
                onChange={(e) => setForm({ ...form, [key as string]: e.target.value })} placeholder={ph as string}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
          ))}
          <div className="sm:col-span-2 lg:col-span-3 flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save vehicle</Button>
          </div>
        </form>
      )}

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {list.length === 0 ? (
          <div className="sm:col-span-2 rounded-xl border border-dashed border-border p-10 text-center">
            <Car className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 font-semibold text-foreground">No vehicles yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first vehicle to start receiving reminders and AI insights.</p>
          </div>
        ) : list.map((v) => (
          <div key={v.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{v.year} {v.make} {v.model} {v.trim ?? ""}</h3>
                {v.nickname && <p className="text-xs text-muted-foreground">"{v.nickname}"</p>}
              </div>
              <button onClick={() => remove(v.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {v.license_plate && <span>Plate: {v.license_plate}</span>}
              {v.mileage && <span>{v.mileage.toLocaleString()} mi</span>}
            </div>
            <button onClick={() => setOpenHist(openHist === v.id ? null : v.id)} className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5" /> Service history & reminders {openHist === v.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {openHist === v.id && user && <ServiceHistory vehicleId={v.id} ownerId={user.id} catalog={catalog} currentMileage={v.mileage} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceHistory({ vehicleId, ownerId, catalog, currentMileage }: { vehicleId: string; ownerId: string; catalog: SC[]; currentMileage: number | null }) {
  const [hist, setHist] = useState<VS[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ service_code: "oil_change", performed_on: new Date().toISOString().slice(0, 10), mileage_at_service: "", cost_usd: "", notes: "" });

  const load = () => supabase.from("vehicle_services").select("*").eq("vehicle_id", vehicleId).order("performed_on", { ascending: false }).then(({ data }) => setHist((data ?? []) as VS[]));
  useEffect(() => { load(); }, [vehicleId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("vehicle_services").insert({
      vehicle_id: vehicleId, owner_id: ownerId,
      service_code: form.service_code, performed_on: form.performed_on,
      mileage_at_service: form.mileage_at_service ? parseInt(form.mileage_at_service) : null,
      cost_usd: form.cost_usd ? parseFloat(form.cost_usd) : null, notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Service logged. Reminder scheduled.");
    setForm({ service_code: "oil_change", performed_on: new Date().toISOString().slice(0, 10), mileage_at_service: "", cost_usd: "", notes: "" });
    setAdding(false); load();
  };

  const codeName = (c: string) => catalog.find((x) => x.code === c)?.name || c;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = hist.filter((h) => (h.next_due_date && h.next_due_date <= new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)) || (h.next_due_mileage && currentMileage && currentMileage >= h.next_due_mileage - 500));

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3">
      {upcoming.length > 0 && (
        <div className="rounded-md bg-accent/10 border border-accent/30 p-3 text-xs">
          <p className="font-semibold text-foreground mb-1">Due soon:</p>
          {upcoming.map((u) => (
            <p key={u.id} className="text-muted-foreground">{codeName(u.service_code)} — {u.next_due_date ? `by ${u.next_due_date}` : ""} {u.next_due_mileage ? `at ${u.next_due_mileage.toLocaleString()} mi` : ""}</p>
          ))}
        </div>
      )}
      {hist.length === 0 ? (
        <p className="text-xs text-muted-foreground">No service history yet.</p>
      ) : (
        <ul className="text-xs space-y-1.5">
          {hist.map((h) => (
            <li key={h.id} className="flex justify-between text-muted-foreground">
              <span>{codeName(h.service_code)} · {h.performed_on}</span>
              <span>{h.mileage_at_service ? `${h.mileage_at_service.toLocaleString()} mi` : ""} {h.cost_usd ? ` · $${h.cost_usd}` : ""}</span>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <form onSubmit={add} className="space-y-2 rounded-md bg-secondary/50 p-3">
          <select value={form.service_code} onChange={(e) => setForm({ ...form, service_code: e.target.value })} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs">
            {catalog.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" max={today} required value={form.performed_on} onChange={(e) => setForm({ ...form, performed_on: e.target.value })} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
            <input type="number" placeholder="Mileage" value={form.mileage_at_service} onChange={(e) => setForm({ ...form, mileage_at_service: e.target.value })} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
            <input type="number" step="0.01" placeholder="Cost ($)" value={form.cost_usd} onChange={(e) => setForm({ ...form, cost_usd: e.target.value })} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-md border border-input bg-background px-2 py-1.5 text-xs" />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" type="submit">Log service</Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Log service</Button>
      )}
    </div>
  );
}

export default VehiclesPage;
