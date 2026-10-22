import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useAuth } from "@/lib/auth";
import { MediaUploader } from "@/components/MediaUploader";

export default function AppointmentsPage() {
  useDocumentTitle("Appointments — Car Care Ally");
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("appointments").select("*").order("scheduled_for", { ascending: true }).then(({ data }) => setAppts(data ?? []));
  }, []);

  const cancel = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    setAppts((a) => a.map((x) => x.id === id ? { ...x, status: "cancelled" } : x));
  };

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
          {appts.map((a) => {
            const isOpen = openId === a.id;
            return (
              <div key={a.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{a.service_type ?? "Service"} · {a.vehicle_summary ?? ""}</p>
                    <p className="text-sm text-muted-foreground mt-1">{new Date(a.scheduled_for).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
                    <p className="text-xs uppercase font-semibold text-primary mt-2">{a.status}</p>
                    {a.issue_summary && <p className="text-sm text-muted-foreground mt-2">{a.issue_summary}</p>}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {a.status !== "cancelled" && a.status !== "completed" && (
                      <Button size="sm" variant="outline" onClick={() => cancel(a.id)}>Cancel</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setOpenId(isOpen ? null : a.id)}>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} Attachments
                    </Button>
                  </div>
                </div>
                {isOpen && user && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pre-appointment (you send to specialist)</p>
                      <MediaUploader uploaderId={user.id} uploaderRole="customer" context="appointment_pre" appointmentId={a.id} showContexts={["appointment_pre"]} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Specialist proof of work</p>
                      <MediaUploader uploaderId={user.id} uploaderRole="customer" context="appointment_post" appointmentId={a.id} readOnly showContexts={["appointment_during", "appointment_post"]} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
