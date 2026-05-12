import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Car Care Ally" }, { name: "description", content: "Create your free Car Care Ally account with a one-time email code." }] }),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Code sent. Check your inbox.");
    setStep("otp");
  };

  const verify = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome to Car Care Ally!");
    nav({ to: "/dashboard" });
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-20 max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">No passwords. We'll email you a 6-digit code.</p>

          {step === "email" ? (
            <form onSubmit={sendCode} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your name</span>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Driver"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send code"}</Button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Enter the code sent to <span className="font-medium text-foreground">{email}</span></p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={verify} className="w-full" disabled={busy || otp.length !== 6}>{busy ? "Verifying…" : "Create account"}</Button>
              <button type="button" onClick={() => setStep("email")} className="text-xs text-muted-foreground hover:text-primary w-full text-center">Use a different email</button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
