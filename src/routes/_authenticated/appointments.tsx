import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";

export default function AppointmentsPage() {
  useDocumentTitle("Appointments — Car Care Ally");
  const [appts, setAppts] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("appointments").select("*").order("scheduled_for", { ascending: true }).then(({ data }) => setAppts(data ?? []));
  }, []);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Appointments</h1>
        <Button asChild><Link to="/book">Book service</Link></Button>
      </div>
      {appts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
          <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-foreground">No appointments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Book your first service to see it here.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {appts.map((a) => (
            <div key={a.id} className="rounded-xl border bg-card p-5">
              <p className="font-semibold text-foreground">{a.service_type ?? "Service"}</p>
              <p className="text-sm text-muted-foreground mt-1">{new Date(a.scheduled_for).toLocaleString("en-US")}</p>
              <p className="text-xs uppercase font-semibold text-primary mt-2">{a.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
