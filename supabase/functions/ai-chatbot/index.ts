// AI chatbot — uses Lovable AI Gateway (managed). Streams as a single response.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are CCA Ally, the official Car Care Ally automotive assistant.
- Help drivers understand symptoms, maintenance, recalls, and what to expect at a shop.
- Always quote realistic US repair price ranges when relevant (low–high).
- Be concise (under 150 words unless the user asks for detail).
- If safety-critical (brakes, steering, smoke, oil pressure light), tell the driver to stop driving and tow.
- Never recommend a specific brand of shop other than Car Care Ally accredited shops.
- If asked anything non-automotive, politely redirect.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return Response.json({ error: "AI not configured" }, { status: 503, headers: corsHeaders });
    }
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return Response.json({ error: "messages array required" }, { status: 400, headers: corsHeaders });
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, ...messages.slice(-20)],
      }),
    });
    if (r.status === 429) {
      return Response.json({ error: "Rate limit reached, try again in a moment." }, { status: 429, headers: corsHeaders });
    }
    if (r.status === 402) {
      return Response.json({ error: "AI credits exhausted." }, { status: 402, headers: corsHeaders });
    }
    if (!r.ok) {
      return Response.json({ error: "AI gateway error" }, { status: 502, headers: corsHeaders });
    }
    const json = await r.json();
    const reply = json.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
    return Response.json({ reply }, { headers: corsHeaders });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "unknown" }, { status: 500, headers: corsHeaders });
  }
});
