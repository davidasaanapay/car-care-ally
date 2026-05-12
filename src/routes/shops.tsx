import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Star, ShieldCheck, Search } from "lucide-react";

export const Route = createFileRoute("/shops")({
  head: () => ({
    meta: [
      { title: "Find an Accredited Auto-Repair Shop — Car Care Ally" },
      { name: "description", content: "Browse vetted auto-repair shops across all 50 US states. Filter by location, specialty, and ratings." },
    ],
  }),
  component: ShopsPage,
});

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  phone: string | null;
}

function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("shops").select("id,name,slug,description,city,state,rating,phone").eq("status", "active").then(({ data }) => {
      setShops((data ?? []) as Shop[]);
      setLoading(false);
    });
  }, []);

  const filtered = shops.filter((s) =>
    !q || [s.name, s.city, s.state].filter(Boolean).join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PageShell>
      <section className="bg-subtle-gradient py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">The network</p>
          <h1 className="mt-2 font-display text-5xl font-bold text-foreground">Accredited shops near you</h1>
          <p className="mt-4 text-muted-foreground">Every partner is vetted by Car Care Ally. Browse, compare, book.</p>
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-3 max-w-xl mx-auto shadow-card">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by city, state, or shop name"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading shops…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="mt-4 text-foreground font-semibold">No active shops yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">The Car Care Ally team is onboarding partners across all 50 states. Check back soon.</p>
            <Button asChild className="mt-6"><Link to="/contact">Refer a shop</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-card p-6 hover:shadow-elegant transition">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-foreground">{s.name}</h3>
                  {s.rating ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground"><Star className="h-3.5 w-3.5 fill-accent text-accent" /> {s.rating}</span>
                  ) : null}
                </div>
                {s.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {(s.city || s.state) && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {[s.city, s.state].filter(Boolean).join(", ")}</div>}
                  {s.phone && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {s.phone}</div>}
                </div>
                <Button asChild size="sm" className="mt-5 w-full"><Link to="/book" search={{ shop: s.slug } as never}>Book at this shop</Link></Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
