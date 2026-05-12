import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({ meta: [{ title: "Appointments — Car Care Ally" }] }),
  component: () => {
    const [list, setList] = useState<any[]>([]);
    useEffect(() => {
      supabase.from("appointments").select("*").order("scheduled_for", { ascending: false }).then(({ data }) => setList(data ?? []));
    }, []);
    return (
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Appointments</h1>
        {list.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="mt-3 font-semibold text-foreground">No appointments yet</p>
            <Button asChild className="mt-4"><Link to="/book">Book your first service</Link></Button>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {list.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{a.service_type ?? "Service"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(a.scheduled_for).toLocaleString()}</p>
                </div>
                <span className="text-xs uppercase tracking-wider font-semibold text-primary">{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
