import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Car Care Ally" },
      { name: "description", content: "Simple monthly SaaS pricing for auto-repair shops. Drivers always use Car Care Ally for free." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Driver",
    price: "$0",
    period: "/forever",
    desc: "Everything an American driver needs to keep every car healthy.",
    features: [
      "Unlimited vehicles in your garage",
      "AI diagnostics & estimates",
      "Find accredited shops in all 50 states",
      "Maintenance & tag-renewal reminders",
      "AI chatbot for vehicle questions",
      "Real-time invoices and digital receipts",
    ],
    cta: { label: "Create free account", to: "/signup" },
    highlight: false,
  },
  {
    name: "Shop · Starter",
    price: "$49",
    period: "/month",
    desc: "Perfect for independent shops getting started.",
    features: [
      "Unlimited appointments & customers",
      "0% platform fee on service revenue",
      "Bring your own Stripe (Apple Pay, Google Pay, Cards, Cash App)",
      "Marketplace storefront (small % per item sold)",
      "Provisional → final invoice workflow",
      "Email support",
    ],
    cta: { label: "Become a partner", to: "/contact" },
    highlight: true,
  },
  {
    name: "Shop · Pro",
    price: "$129",
    period: "/month",
    desc: "For growing shops and multi-bay operations.",
    features: [
      "Everything in Starter",
      "Open-API parts and pricing integrations",
      "Custom marketplace fee structure",
      "Featured placement in shop directory",
      "Specialist team management",
      "Priority support",
    ],
    cta: { label: "Talk to sales", to: "/contact" },
    highlight: false,
  },
];

function PricingPage() {
  return (
    <PageShell>
      <section className="bg-subtle-gradient py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-bold text-foreground text-balance">
            Free for drivers. Fair for shops.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Shops keep 100% of service revenue. We make money from a transparent monthly subscription
            and a small marketplace fee on parts sold.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                t.highlight
                  ? "border-primary bg-card shadow-elegant relative"
                  : "border-border bg-card"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-foreground">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-foreground">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={t.highlight ? "default" : "outline"}>
                <Link to={t.cta.to}>{t.cta.label}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10 max-w-2xl mx-auto">
          Marketplace fee, payout schedule, and subscription rate can be customized per shop by the platform admin team.
        </p>
      </section>
    </PageShell>
  );
}
