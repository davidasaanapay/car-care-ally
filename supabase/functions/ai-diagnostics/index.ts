// AI Diagnostics edge function — calls Lovable AI Gateway.
// Activated automatically; super admin can also disable via platform_settings.
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { vehicle, category, symptoms, errorCode, notes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return Response.json({ error: "AI not configured" }, { status: 503, headers: corsHeaders });
    }

    const prompt = `You are a master automotive diagnostic AI. A driver describes:
- Vehicle: ${vehicle?.year} ${vehicle?.make} ${vehicle?.model}
- Category: ${category}
- Symptoms: ${(symptoms ?? []).join(", ")}
- OBD-II code: ${errorCode || "none"}
- Notes: ${notes || "none"}

Return STRICT JSON: { "assessment": "2-3 sentence plain-English diagnosis", "low": <usd integer>, "high": <usd integer>, "action": "1 sentence next step" }. Use realistic US repair pricing.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an automotive diagnostic AI that always replies with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("AI gateway error", r.status, t);
      return Response.json({ error: "AI gateway error" }, { status: 502, headers: corsHeaders });
    }

    const json = await r.json();
    const text = json.choices?.[0]?.message?.content ?? "{}";
    const cleaned = text.replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Response.json(parsed, { headers: corsHeaders });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: e.message ?? "unknown" }, { status: 500, headers: corsHeaders });
  }
});
