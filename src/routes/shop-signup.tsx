import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/shop-signup")({
  head: () => ({ meta: [{ title: "Become a Partner Shop — Car Care Ally" }] }),
  component: () => (
    <PageShell>
      <section className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold text-foreground">Become a Car Care Ally partner shop</h1>
        <p className="mt-4 text-muted-foreground">Every shop is vetted by our team. Reach out and we'll get you onboarded.</p>
        <Link to="/contact" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Talk to our partnerships team</Link>
      </section>
    </PageShell>
  ),
});
