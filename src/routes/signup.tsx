import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Car Care Ally" }] }),
  component: () => (
    <PageShell>
      <section className="container mx-auto px-4 py-20 max-w-md text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Same flow as sign-in — enter your email and we'll send you a one-time code.</p>
        <Link to="/login" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Continue to email sign-in</Link>
      </section>
    </PageShell>
  ),
});
