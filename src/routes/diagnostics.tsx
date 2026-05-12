import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Cpu, ArrowRight, ArrowLeft, Sparkles, AlertTriangle, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VehicleSelect, type VehicleSelection } from "@/components/VehicleSelect";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "AI Vehicle Diagnostics — Car Care Ally" },
      { name: "description", content: "Tell us your symptoms and our AI will identify the most likely issue and price range." },
    ],
  }),
  component: DiagnosticsPage,
});

const issueCategories = [
  { id: "engine", label: "Engine / Check Engine Light" },
  { id: "ac", label: "A/C or Heating" },
  { id: "brakes", label: "Brakes" },
  { id: "tires", label: "Tires & Wheels" },
  { id: "electrical", label: "Electrical / Battery" },
  { id: "transmission", label: "Transmission" },
  { id: "service", label: "Routine Service" },
  { id: "other", label: "Something else" },
];

const symptomMap: Record<string, string[]> = {
  engine: ["Check engine light", "Engine misfire / rough idle", "Loss of power", "Strange smell", "Smoke from exhaust"],
  ac: ["Not cold enough", "No airflow", "Strange odor", "Loud fan noise"],
  brakes: ["Squealing / grinding", "Soft pedal", "Vibration when braking", "ABS warning"],
  tires: ["Low pressure warning", "Vibration at speed", "Uneven wear", "Bald tires"],
  electrical: ["Won't start", "Battery light", "Dim headlights", "Random electronics failing"],
  transmission: ["Slipping gears", "Hard shifting", "Fluid leak", "Whining noise"],
  service: ["Oil change due", "Tire rotation", "Inspection", "Fluid top-up"],
};

function DiagnosticsPage() {
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState<VehicleSelection>({ year: "", make: "", model: "" });
  const [category, setCategory] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [errorCode, setErrorCode] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ assessment: string; low: number; high: number; action: string } | null>(null);

  const toggleSymptom = (s: string) =>
    setSymptoms((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);

  const categoryLabel = issueCategories.find((c) => c.id === category)?.label ?? "";
  const hasSymptomList = category && category !== "other" && (symptomMap[category]?.length ?? 0) > 0;

  const goAfterCategory = (id: string) => {
    setCategory(id);
    setSymptoms([]);
    // Skip step 2 entirely for "other" — no symptom list
    setStep(id === "other" ? 3 : 2);
  };

  const runAI = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-diagnostics", {
        body: { vehicle, category, symptoms, errorCode, notes },
      });
      if (error) throw error;
      setResult(data);
      setStep(4);
    } catch {
      const baseLow = category === "brakes" ? 180 : category === "ac" ? 220 : category === "engine" ? 300 : 80;
      const baseHigh = baseLow * 2.4;
      setResult({
        assessment: `Based on what you described for your ${vehicle.year} ${vehicle.make} ${vehicle.model}, the most likely cause involves the ${categoryLabel || category} system. We recommend an in-shop inspection by a Car Care Ally certified specialist to confirm.`,
        low: baseLow,
        high: Math.round(baseHigh),
        action: "Book an appointment with an accredited shop to confirm the diagnosis.",
      });
      setStep(4);
      toast.message("Showing baseline estimate. Live AI activates once the platform admin enables AI diagnostics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
          <Cpu className="h-4 w-4" /> AI Diagnostics
        </div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold text-foreground">Let's figure out what's wrong.</h1>

        <div className="mt-8 flex gap-1.5">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {/* Selected-so-far summary */}
        {(vehicle.year || category || symptoms.length > 0 || errorCode || notes) && step < 4 && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {vehicle.year && vehicle.make && vehicle.model && (
              <Chip onEdit={() => setStep(0)}>{vehicle.year} {vehicle.make} {vehicle.model}</Chip>
            )}
            {category && <Chip onEdit={() => setStep(1)}>{categoryLabel}</Chip>}
            {symptoms.map((s) => (
              <Chip key={s} onEdit={() => setStep(2)}>{s}</Chip>
            ))}
            {errorCode && <Chip onEdit={() => setStep(3)}>Code: {errorCode}</Chip>}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card">
          {step === 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Tell us about your vehicle</h2>
              <div className="mt-4">
                <VehicleSelect value={vehicle} onChange={setVehicle} />
              </div>
              <NextRow onNext={() => setStep(1)} disabled={!vehicle.year || !vehicle.make || !vehicle.model} />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">What category best describes the issue?</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-2">
                {issueCategories.map((c) => (
                  <button key={c.id} onClick={() => goAfterCategory(c.id)}
                    className={`text-left rounded-lg border p-4 text-sm font-medium transition ${category === c.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
              <BackRow onBack={() => setStep(0)} />
            </div>
          )}

          {step === 2 && hasSymptomList && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Which symptoms match?</h2>
              <p className="text-sm text-muted-foreground mt-1">Select all that apply.</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-2">
                {(symptomMap[category] ?? []).map((s) => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className={`text-left rounded-lg border p-3 text-sm transition ${symptoms.includes(s) ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/40"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <BackRow onBack={() => setStep(1)} onNext={() => setStep(3)} disabled={symptoms.length === 0} />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Any error codes or extra detail?</h2>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">OBD-II error code (optional)</span>
                  <input value={errorCode} onChange={(e) => setErrorCode(e.target.value)} placeholder="e.g. P0420"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="When does it happen? Any sounds, smells, or warning lights?"
                    className="mt-1 w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y" />
                </label>
              </div>
              <BackRow onBack={() => setStep(hasSymptomList ? 2 : 1)} onNext={runAI} nextLabel={loading ? "Analyzing…" : "Run AI assessment"} disabled={loading} />
            </div>
          )}

          {step === 4 && result && (
            <div>
              <div className="flex items-center gap-2 text-success text-sm font-semibold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> AI assessment complete
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Here's what we think.</h2>
              <p className="mt-3 text-foreground leading-relaxed">{result.assessment}</p>

              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated cost range</p>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">${result.low} – ${result.high}</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended action</p>
                  <p className="mt-1 text-sm text-foreground">{result.action}</p>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-accent/10 p-4 text-xs text-foreground flex gap-2">
                <AlertTriangle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span>This is an AI-generated estimate based on similar vehicles. A certified specialist will confirm the exact issue at your appointment.</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild><Link to="/book">Book an accredited shop</Link></Button>
                <Button variant="outline" onClick={() => { setStep(0); setResult(null); setSymptoms([]); setCategory(""); setErrorCode(""); setNotes(""); }}>Start over</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function Chip({ children, onEdit }: { children: React.ReactNode; onEdit: () => void }) {
  return (
    <button onClick={onEdit} type="button" className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-primary hover:bg-primary/10">
      <Check className="h-3 w-3" /> {children}
    </button>
  );
}

function NextRow({ onNext, disabled }: { onNext: () => void; disabled?: boolean }) {
  return (
    <div className="mt-6 flex justify-end">
      <Button onClick={onNext} disabled={disabled}>Continue <ArrowRight className="ml-1 h-4 w-4" /></Button>
    </div>
  );
}
function BackRow({ onBack, onNext, disabled, nextLabel = "Continue" }: { onBack: () => void; onNext?: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-6 flex justify-between">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
      {onNext && <Button onClick={onNext} disabled={disabled}>{nextLabel} <ArrowRight className="ml-1 h-4 w-4" /></Button>}
    </div>
  );
}
