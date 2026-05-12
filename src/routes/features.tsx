import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Cpu, Calendar, FileText, Bell, ShieldCheck, Wrench, Store, CreditCard, BarChart3, MessageSquare, Car, Map } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Platform Features — Car Care Ally" },
      { name: "description", content: "AI diagnostics, transparent invoicing, integrated marketplace, and everything modern auto-repair shops need to grow." },
      { property: "og:title", content: "Platform Features — Car Care Ally" },
      { property: "og:description", content: "Everything modern auto-repair shops and drivers need on one platform." },
    ],
  }),
  component: FeaturesPage,
});

const groups = [
  {
    title: "For Drivers",
    items: [
      { icon: Cpu, name: "AI Diagnostics", desc: "Vehicle picker → symptom drilldown → visual indicators → AI assessment with price range." },
      { icon: Car, name: "My Garage", desc: "Add unlimited vehicles, track service history, get tag-renewal and maintenance reminders." },
      { icon: MessageSquare, name: "AI Chatbot", desc: "Ask anything about your vehicle. Backed by a knowledge base synced for every US region." },
      { icon: FileText, name: "Live Invoices", desc: "See every action your specialist takes — like a Walmart receipt for your engine." },
    ],
  },
  {
    title: "For Shops",
    items: [
      { icon: Calendar, name: "Appointment Engine", desc: "Tekmetric-grade scheduling, reimagined. Drag, drop, dispatch in seconds." },
      { icon: BarChart3, name: "Smart Estimates", desc: "Pull part costs from Tekmetric or other open APIs, with AI fallback for unknown jobs." },
      { icon: Store, name: "Built-in Marketplace", desc: "Sell parts and accessories on your own storefront. Pay a small % only on items sold." },
      { icon: CreditCard, name: "Bring Your Own Stripe", desc: "Connect your business Stripe to accept Apple Pay, Google Pay, Cards, and Cash App." },
    ],
  },
  {
    title: "For Everyone",
    items: [
      { icon: ShieldCheck, name: "Vetted Network", desc: "Every shop and independent specialist is verified by the Car Care Ally team." },
      { icon: Bell, name: "Smart Notifications", desc: "Email + in-app updates for appointment status, completion, and follow-up service." },
      { icon: Map, name: "All 50 States", desc: "Coverage broken down by state, surfacing local accredited partners." },
      { icon: Wrench, name: "Specialist Profiles", desc: "Browse certifications, specialties, and reviews before you book." },
    ],
  },
];

function FeaturesPage() {
  return (
    <PageShell>
      <section className="bg-subtle-gradient py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold text-foreground text-balance">
            A complete operating system for auto care.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Built so drivers stay confident and shops stay focused on what they do best — fixing cars.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 space-y-20">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">{g.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {g.items.map((it) => (
                <div key={it.name} className="rounded-xl border border-border bg-card p-6 hover:shadow-elegant transition">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <it.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{it.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-2xl bg-hero-gradient p-10 text-center text-primary-foreground">
          <h3 className="font-display text-3xl font-bold">Ready to see it in action?</h3>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" variant="secondary"><Link to="/diagnostics">Try AI Diagnostics</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary"><Link to="/pricing">See Pricing</Link></Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
