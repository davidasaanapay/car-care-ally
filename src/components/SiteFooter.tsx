import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-20">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              The world-class platform for accredited US auto-repair shops and the drivers who trust them.
            </p>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="h-1 w-6 rounded-full bg-primary" />
              <span className="h-1 w-6 rounded-full bg-foreground" />
              <span className="h-1 w-6 rounded-full bg-accent" />
            </div>
          </div>

          <FooterCol title="Drivers" items={[
            { to: "/diagnostics", label: "AI Diagnostics" },
            { to: "/book", label: "Book Service" },
            { to: "/shops", label: "Find a Shop" },
            { to: "/dashboard", label: "Customer Portal" },
          ]} />

          <FooterCol title="Shops" items={[
            { to: "/features", label: "Platform Features" },
            { to: "/pricing", label: "Pricing" },
            { to: "/shop-signup", label: "Become a Partner" },
          ]} />

          <FooterCol title="Company" items={[
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/privacy", label: "Privacy" },
            { to: "/terms", label: "Terms" },
          ]} />
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Car Care Ally. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Made in the USA</span>
            <Link
              to="/super-admin"
              className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              aria-label="Support Login"
            >
              Support Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
