// Stripe checkout — deferred. Activates when STRIPE_SECRET_KEY is set in backend secrets.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      return Response.json(
        { error: "Stripe not configured. Super admin must add STRIPE_SECRET_KEY in backend secrets." },
        { status: 503, headers: corsHeaders },
      );
    }

    const { invoice_id, line_items, success_url, cancel_url, customer_email } = await req.json();
    if (!Array.isArray(line_items) || line_items.length === 0) {
      return Response.json({ error: "line_items required" }, { status: 400, headers: corsHeaders });
    }

    const body = new URLSearchParams();
    body.append("mode", "payment");
    body.append("success_url", success_url ?? "https://carcareally.com/invoices?paid=1");
    body.append("cancel_url", cancel_url ?? "https://carcareally.com/invoices");
    if (customer_email) body.append("customer_email", customer_email);
    if (invoice_id) body.append("client_reference_id", String(invoice_id));
    line_items.forEach((li: any, i: number) => {
      body.append(`line_items[${i}][price_data][currency]`, li.currency ?? "usd");
      body.append(`line_items[${i}][price_data][product_data][name]`, li.name);
      body.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(li.amount * 100)));
      body.append(`line_items[${i}][quantity]`, String(li.quantity ?? 1));
    });

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const json = await r.json();
    if (!r.ok) return Response.json({ error: json.error?.message ?? "stripe error" }, { status: 502, headers: corsHeaders });
    return Response.json({ url: json.url, id: json.id }, { headers: corsHeaders });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "unknown" }, { status: 500, headers: corsHeaders });
  }
});
