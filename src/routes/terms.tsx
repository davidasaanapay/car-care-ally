import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Car Care Ally" }] }),
  component: () => (
    <PageShell>
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">By using Car Care Ally you agree to our standard terms. Full terms coming soon.</p>
      </section>
    </PageShell>
  ),
});
