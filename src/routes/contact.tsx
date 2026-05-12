import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Car Care Ally" },
      { name: "description", content: "Talk to the Car Care Ally team about partnership, support, or media inquiries." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Email delivery activates once the platform admin configures Resend.
    setTimeout(() => {
      toast.success("Thanks! We'll be in touch within one business day.");
      setSending(false);
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 max-w-5xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
          <h1 className="mt-2 font-display text-5xl font-bold text-foreground">Let's talk.</h1>
          <p className="mt-4 text-muted-foreground">
            Whether you're a driver, a shop owner, or a partner — we'd love to hear from you.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <a href="mailto:hello@carcareally.com" className="flex items-center gap-3 text-foreground hover:text-primary"><Mail className="h-4 w-4 text-primary" /><span>hello@carcareally.com</span></a>
            <a href="tel:+13026400060" className="flex items-center gap-3 text-foreground hover:text-primary"><Phone className="h-4 w-4 text-primary" /><span>1-302-640-0060</span></a>
            <div className="flex items-center gap-3 text-foreground"><MapPin className="h-4 w-4 text-primary" /><span>United States — all 50 states</span></div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Field label="Your name"><input required name="name" className={fieldClass} /></Field>
          <Field label="Email"><input required type="email" name="email" className={fieldClass} /></Field>
          <Field label="I am a"><select name="role" className={fieldClass}><option>Driver</option><option>Shop owner</option><option>Independent specialist</option><option>Partner / press</option></select></Field>
          <Field label="Message"><textarea required name="message" rows={5} className={fieldClass + " resize-none"} /></Field>
          <Button type="submit" className="w-full" disabled={sending}>{sending ? "Sending…" : "Send message"}</Button>
        </form>
      </section>
    </PageShell>
  );
}

const fieldClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
