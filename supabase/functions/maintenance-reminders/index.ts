// Maintenance reminder cron — runs daily via pg_cron.
// Finds vehicles with upcoming service or tag renewals (within 14 days) and logs reminders.
// Sends email if Resend is configured (otherwise just logs).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const today = new Date();
    const horizon = new Date(today.getTime() + 14 * 86_400_000).toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, owner_id, year, make, model, nickname, next_service_due, tags_renewal_date")
      .or(`next_service_due.gte.${todayStr},tags_renewal_date.gte.${todayStr}`);

    let sent = 0;
    for (const v of vehicles ?? []) {
      const checks: Array<{ kind: string; due: string | null }> = [
        { kind: "service", due: v.next_service_due as any },
        { kind: "tags", due: v.tags_renewal_date as any },
      ];
      for (const c of checks) {
        if (!c.due) continue;
        if (c.due < todayStr || c.due > horizon) continue;

        const { data: existing } = await supabase
          .from("maintenance_reminders")
          .select("id")
          .eq("vehicle_id", v.id).eq("reminder_type", c.kind).eq("due_date", c.due).maybeSingle();
        if (existing) continue;

        await supabase.from("maintenance_reminders").insert({
          vehicle_id: v.id, owner_id: v.owner_id, reminder_type: c.kind, due_date: c.due,
        });

        if (RESEND_API_KEY) {
          const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", v.owner_id).maybeSingle();
          if (profile?.email) {
            const label = c.kind === "service" ? "Service due" : "Tag renewal due";
            const car = v.nickname || `${v.year} ${v.make} ${v.model}`;
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Car Care Ally <reminders@carcareally.com>",
                to: [profile.email],
                subject: `${label}: ${car} — ${c.due}`,
                html: `<p>Hi ${profile.full_name || ""},</p><p>Your ${car} has a ${label.toLowerCase()} on <strong>${c.due}</strong>.</p><p><a href="https://carcareally.com/book">Book an appointment</a></p>`,
              }),
            }).catch(() => {});
            sent++;
          }
        }
      }
    }
    return Response.json({ ok: true, vehicles_scanned: vehicles?.length ?? 0, emails_sent: sent }, { headers: corsHeaders });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "unknown" }, { status: 500, headers: corsHeaders });
  }
});
