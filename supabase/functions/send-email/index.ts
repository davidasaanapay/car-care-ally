// Transactional email via Resend — deferred. Activates when RESEND_API_KEY is set.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return Response.json(
        { error: "Email not configured. Super admin must add RESEND_API_KEY in backend secrets." },
        { status: 503, headers: corsHeaders },
      );
    }

    const { to, subject, html, text, from } = await req.json();
    if (!to || !subject || (!html && !text)) {
      return Response.json({ error: "to, subject, and html or text are required" }, { status: 400, headers: corsHeaders });
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: from ?? "Car Care Ally <notifications@carcareally.com>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });
    const json = await r.json();
    if (!r.ok) return Response.json({ error: json.message ?? "resend error" }, { status: 502, headers: corsHeaders });
    return Response.json({ id: json.id }, { headers: corsHeaders });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "unknown" }, { status: 500, headers: corsHeaders });
  }
});
