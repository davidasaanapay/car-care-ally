import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Car Care Ally" }] }),
  component: () => (
    <PageShell>
      <section className="container mx-auto px-4 py-16 max-w-3xl prose">
        <h1 className="font-display text-4xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">Car Care Ally respects your privacy. We collect only the data needed to provide the service, store secrets server-side only, and never sell personal information. Full policy coming soon.</p>
      </section>
    </PageShell>
  ),
});
