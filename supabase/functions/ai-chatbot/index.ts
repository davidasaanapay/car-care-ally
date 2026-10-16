// CCA Ally chatbot. "Coming soon" until enabled by support admin.
// Knowledge base first; AI only when no relevant match, and every AI answer is saved back.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are CCA Ally, the official Car Care Ally automotive assistant.
- Help drivers understand symptoms, maintenance, recalls, and what to expect at a shop.
- Quote realistic US repair price ranges when relevant (low–high).
- Be concise (under 150 words unless asked for detail).
- If safety-critical (brakes, steering, smoke, oil pressure light), tell the driver to stop driving and tow.
- If asked anything non-automotive, politely redirect.`;

const COMING_SOON = "CCA Ally is coming soon! In the meantime, try Diagnostics or book an accredited specialist and they'll take a look.";

const STOP = new Set("a an the is are was my i me it to of and or for on in with what why how does do can my car vehicle".split(" "));
const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const norm = (s: string) => [...new Set(tokens(s))].sort().join(" ");

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: corsHeaders });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    const { data: flag } = await admin.from("platform_settings").select("value").eq("key", "ai_enabled").maybeSingle();
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (flag?.value !== true || !key) return json({ reply: COMING_SOON, comingSoon: true });

    const body = await req.json().catch(() => null);
    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) return json({ error: "messages array required" }, 400);
    const last = String(messages[messages.length - 1]?.content ?? "").slice(0, 2000);
    const n = norm(last);

    // 1) Knowledge base lookup
    if (n) {
      const q = tokens(last).slice(0, 6);
      const { data: candidates } = await admin.from("ai_knowledge").select("id,question_norm,answer,hits")
        .or(q.map((t) => `question_norm.ilike.%${t}%`).join(",")).limit(50);
      const mine = new Set(n.split(" "));
      let best: any = null, bestScore = 0;
      for (const c of candidates ?? []) {
        const theirs = new Set(String(c.question_norm).split(" "));
        const inter = [...mine].filter((w) => theirs.has(w)).length;
        const score = inter / new Set([...mine, ...theirs]).size;
        if (score > bestScore) { bestScore = score; best = c; }
      }
      if (best && bestScore >= 0.6) {
        await admin.from("ai_knowledge").update({ hits: (best.hits ?? 0) + 1 }).eq("id", best.id);
        return json({ reply: best.answer, source: "knowledge_base" });
      }
    }

    // 2) Escalate to AI
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, ...messages.slice(-20)],
      }),
    });
    if (r.status === 429) return json({ error: "Rate limit reached, try again in a moment." }, 429);
    if (r.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!r.ok) return json({ error: "AI service error" }, 502);
    const out = await r.json();
    const reply = out.choices?.[0]?.message?.content;
    if (!reply) return json({ error: "No answer generated" }, 502);

    // 3) Learn
    if (n) await admin.from("ai_knowledge").insert({ question_norm: n, question: last, answer: reply });
    return json({ reply, source: "ai" });
  } catch (e: any) {
    return json({ error: e?.message ?? "unknown" }, 500);
  }
});
