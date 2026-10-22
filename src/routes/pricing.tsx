import { useDocumentTitle } from "@/lib/use-document-title";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
const tiers = [
  {
    name: "Driver",
    price: "$29",
    period: "/month",
    desc: "Everything a driver needs to keep every car healthy.",
    features: [
      "Unlimited vehicles in your garage",
      "Diagnostics & price-range estimates",
      "Find accredited shops in all 50 states",
      "Maintenance & tag-renewal reminders",
      "Live job tracking with ETA",
      "Full visit, invoice & payment history",
    ],
    cta: { label: "Create account", to: "/signup" },
    highlight: false,
  },
  {
    name: "Specialist · Starter",
    price: "$99",
    period: "/month",
    desc: "For shops and independent specialists. No payment setup needed.",
    features: [
      "+ $9 per appointment booked, billed monthly",
      "Customers pay you directly — keep 100%",
      "Cash, Zelle, Cash App, Venmo, card, ACH",
      "Live job board & customer updates",
      "E-invoices with proof-of-payment",
      "Tamper-proof audit trail",
    ],
    cta: { label: "Become a partner", to: "/shop-signup" },
    highlight: true,
  },
  {
    name: "Specialist · Pro",
    price: "$199",
    period: "/month",
    desc: "Add your own parts marketplace.",
    features: [
      "Everything in Starter",
      "+ $9 per appointment booked",
      "Your own parts marketplace (e.g. brake pads)",
      "Add verified parts to customer orders",
      "Parts flow straight onto the invoice",
      "Priority support",
    ],
    cta: { label: "Go Pro", to: "/shop-signup" },
    highlight: false,
  },
];

function PricingPage() {
  useDocumentTitle("Pricing — Car Care Ally", "Simple monthly pricing for drivers ($29) and auto specialists ($99 Starter, $199 Pro).");
  return (
    <PageShell>
      <section className="bg-subtle-gradient py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-bold text-foreground text-balance">
            Simple for drivers. Fair for specialists.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Specialists keep 100% of what customers pay them. We charge a flat monthly plan plus $9 per
            appointment booked — nothing else.
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
          Appointment fees are tallied automatically and visible to both you and our support team for easy month-end reconciliation.
        </p>
      </section>
    </PageShell>

  );
}

export default PricingPage;
