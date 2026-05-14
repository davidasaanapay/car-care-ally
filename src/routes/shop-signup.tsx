import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/lib/use-document-title";

export default function ShopSignupPage() {
  useDocumentTitle("Become a Partner Shop — Car Care Ally", "Join the Car Care Ally network of accredited US auto-repair shops.");
  return (
    <PageShell>
      <section className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <h1 className="font-display text-5xl font-bold text-foreground">Become a Car Care Ally partner</h1>
        <p className="mt-4 text-muted-foreground">Join a curated network of accredited US auto-repair shops. Apply to be reviewed by our team.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg"><a href="mailto:partners@carcareally.com?subject=Partner%20Application">Apply by email</a></Button>
          <Button asChild size="lg" variant="outline"><Link to="/contact">Contact us</Link></Button>
        </div>
      </section>
    </PageShell>
  );
}
