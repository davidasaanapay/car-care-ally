import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Car Care Ally" },
      { name: "description", content: "Car Care Ally is on a mission to make auto care simpler, more transparent, and more trustworthy for every American driver." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <section className="container mx-auto px-4 py-20 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our mission</p>
        <h1 className="mt-2 font-display text-5xl font-bold text-foreground text-balance">
          Making car care simpler for every American driver.
        </h1>
        <div className="mt-8 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Auto repair has been mysterious for too long. Drivers fear surprise bills. Shops struggle with
            outdated tools. Car Care Ally connects them with a single, AI-powered platform built on radical
            transparency.
          </p>
          <p>
            Every partner shop and independent specialist on Car Care Ally is vetted and accredited.
            Every diagnostic is paired with an estimated price range from real, similar repairs. Every
            invoice is line-by-line, approve-as-you-go.
          </p>
          <p>
            We're starting in the United States, state by state, building the most trusted automotive
            network in the country — and we're just getting started.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          <Pillar title="Transparency" desc="No hidden fees. Every part, every hour, on the receipt." />
          <Pillar title="Trust" desc="Vetted shops only. Background-checked specialists." />
          <Pillar title="Technology" desc="AI that learns from every repair to help the next one." />
        </div>
      </section>
    </PageShell>
  );
}

function Pillar({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-display font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
