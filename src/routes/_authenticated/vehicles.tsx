import { useDocumentTitle } from "@/lib/use-document-title";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Trash2, Car } from "lucide-react";

interface V { id: string; year: number; make: string; model: string; trim: string | null; license_plate: string | null; nickname: string | null; mileage: number | null; }

function VehiclesPage() {
  useDocumentTitle("My Garage — Car Care Ally");
  const { user } = useAuth();
  const [list, setList] = useState<V[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ year: "", make: "", model: "", trim: "", license_plate: "", nickname: "", mileage: "" });

  const load = async () => {
    const { data } = await supabase.from("vehicles").select("id,year,make,model,trim,license_plate,nickname,mileage").order("created_at", { ascending: false });
    setList((data ?? []) as V[]);
  };

  useEffect(() => { if (user) load(); }, [user]);

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
    await supabase.from("vehicles").delete().eq("id", id);
    toast.success("Removed"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Garage</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track every vehicle you own.</p>
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
              <input
                required={!!req}
                value={(form as Record<string,string>)[key as string]}
                onChange={(e) => setForm({ ...form, [key as string]: e.target.value })}
                placeholder={ph as string}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
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
          </div>
        ))}
      </div>
    </div>

  );
}

export default VehiclesPage;
