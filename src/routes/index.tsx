import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ShieldCheck, Calendar, Wrench, Car, Cpu, FileText,
  Search, MapPin, ArrowRight, Star, Gauge, Bell,
} from "lucide-react";
import heroImg from "@/images/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Car Care Ally — AI-Powered Auto Care for Every American Driver" },
      { name: "description", content: "Diagnose your vehicle in seconds, book accredited US repair shops, and manage every car you own — all on one trusted platform." },
      { property: "og:title", content: "Car Care Ally" },
      { property: "og:description", content: "AI-powered diagnostics and a nationwide network of accredited auto-repair shops." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell>
      <Hero />
      <FindByVehicle />
      <ValueProps />
      <HowItWorks />
      <Stats />
      <CtaBanner />
    </PageShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-subtle-gradient">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 px-4 py-20 lg:py-28 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Sparkles className="h-3 w-3" />
            AI-powered · US-accredited shops
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] text-balance">
            Simply smarter <br />
            <span className="text-primary">car service.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Diagnose issues with AI in 60 seconds, get a transparent estimate, and book an
            accredited US repair shop — all from one platform built for the modern American driver.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="text-base">
              <Link to="/diagnostics">
                <Cpu className="mr-2 h-4 w-4" /> Start AI Diagnostics
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/book">
                <Calendar className="mr-2 h-4 w-4" /> Book a Shop
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Accredited shops only</div>
            <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-accent" /> No-surprise estimates</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-elegant border border-border">
            <img src={heroImg} alt="AI-powered diagnostics on a modern vehicle" className="w-full h-auto" width={1920} height={1080} />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-card border border-border p-4 max-w-[220px]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-3.5 w-3.5 text-primary" /> Diagnostic complete</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Brake pads — 22% remaining</div>
            <div className="mt-1 text-xs text-success">Est. $180 – $260</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FindByVehicle() {
  return (
    <section className="container mx-auto px-4 -mt-8 relative z-10">
      <div className="rounded-2xl bg-card border border-border shadow-card p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-4 justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Find service for your vehicle</h2>
            <p className="text-sm text-muted-foreground">Search by vehicle, plate, or VIN — we'll surface the right shops near you.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/diagnostics">
              Skip, run AI diagnostics <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <SearchField icon={<Car className="h-4 w-4" />} label="Year / Make / Model" placeholder="2021 Toyota Camry" />
          <SearchField icon={<FileText className="h-4 w-4" />} label="License plate" placeholder="ABC-1234" />
          <SearchField icon={<Search className="h-4 w-4" />} label="VIN" placeholder="1HGBH41JXMN109186" />
          <SearchField icon={<MapPin className="h-4 w-4" />} label="ZIP code" placeholder="10001" />
        </div>
        <div className="mt-4 flex justify-end">
          <Button asChild>
            <Link to="/shops">Find shops near me</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SearchField({ icon, label, placeholder }: { icon: React.ReactNode; label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
        <span className="text-muted-foreground">{icon}</span>
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}

const features = [
  { icon: Cpu, title: "AI Diagnostics", desc: "Tell us the symptoms — our AI matches them against millions of similar vehicles to predict the issue and price range." },
  { icon: Calendar, title: "Instant Booking", desc: "Choose a shop, pick a time, and confirm. Guest checkout supported, no signup required." },
  { icon: FileText, title: "Transparent Invoicing", desc: "Provisional estimate before you arrive, line-by-line approval after service. No surprises." },
  { icon: Bell, title: "Maintenance Reminders", desc: "We track service intervals and tag renewals so your fleet is never behind." },
  { icon: ShieldCheck, title: "Accredited Network", desc: "Every partner shop is vetted. Independent specialists are background-checked." },
  { icon: Wrench, title: "All Work Documented", desc: "See every action your specialist took — like a Walmart receipt for your engine." },
];

function ValueProps() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">The platform</p>
        <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold text-foreground text-balance">
          Everything you need. Nothing you don't.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Built to be the future of automotive service — for drivers, shops, and independent specialists.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-6 hover:shadow-elegant transition-all"
          >
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Tell us about your car", desc: "Pick year, make, model. Add what you're experiencing — alarm, sound, smell, or error code." },
    { n: "02", title: "Get an AI assessment", desc: "We match your symptoms with thousands of similar repairs to pinpoint the likely issue and a price range." },
    { n: "03", title: "Book an accredited shop", desc: "Choose from vetted shops near you, confirm a time, and get a provisional invoice before you arrive." },
    { n: "04", title: "Approve, pay, drive", desc: "Specialist updates the work in real time. Approve the final invoice, pay in-app, get your receipt by email." },
  ];
  return (
    <section className="bg-secondary/40 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold text-foreground">From symptom to solved.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-xl bg-card border border-border p-6">
              <div className="font-display text-3xl font-bold text-primary/30">{s.n}</div>
              <h3 className="mt-3 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "50", suffix: "states", label: "Coverage across the US" },
    { v: "60s", suffix: "", label: "Average AI diagnostic time" },
    { v: "0%", suffix: "", label: "Platform fee on shop revenue" },
    { v: "24/7", suffix: "", label: "Customer portal access" },
  ];
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-5xl font-bold bg-hero-gradient bg-clip-text text-transparent">
              {s.v}<span className="text-2xl ml-1">{s.suffix}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="container mx-auto px-4 pb-20">
      <div className="rounded-3xl bg-hero-gradient p-10 md:p-14 text-center text-primary-foreground shadow-elegant relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
        <h2 className="font-display text-3xl md:text-5xl font-bold text-balance relative z-10">
          Your car deserves an ally.
        </h2>
        <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto relative z-10">
          Join thousands of US drivers who've replaced guesswork with intelligence.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center relative z-10">
          <Button asChild size="lg" variant="secondary" className="text-base">
            <Link to="/signup">Create free account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            <Link to="/diagnostics">Try AI diagnostics</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
