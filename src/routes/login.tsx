import { useDocumentTitle } from "@/lib/use-document-title";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, KeyRound } from "lucide-react";
import { getPostLoginRoute, syncUserRoles } from "@/lib/role-routing";
function LoginPage() {
  useDocumentTitle("Sign In — Car Care Ally", "Sign in to your Car Care Ally account.");
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enter" | "otp">("enter");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const routeAfterLogin = async (userId: string) => {
    const roles = await syncUserRoles(userId);
    nav(getPostLoginRoute(roles));
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    if (data.user) await routeAfterLogin(data.user.id);
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Code sent. Check your inbox.");
    setStep("otp");
  };

  const verify = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    if (data.user) await routeAfterLogin(data.user.id);
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-20 max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            {mode === "password" ? <KeyRound className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your password or a one-time email code.</p>

          <div className="mt-4 inline-flex rounded-md border border-border p-1 text-xs">
            <button type="button" onClick={() => { setMode("password"); setStep("enter"); }} className={`px-3 py-1.5 rounded ${mode === "password" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Password</button>
            <button type="button" onClick={() => { setMode("otp"); setStep("enter"); }} className={`px-3 py-1.5 rounded ${mode === "otp" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Email code</button>
          </div>

          {mode === "password" ? (
            <form onSubmit={submitPassword} className="mt-6 space-y-4">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
            </form>
          ) : step === "enter" ? (
            <form onSubmit={sendCode} className="mt-6 space-y-4">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send code"}</Button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Enter the code sent to <span className="font-medium text-foreground">{email}</span></p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>{[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={verify} className="w-full" disabled={busy || otp.length !== 6}>{busy ? "Verifying…" : "Verify & continue"}</Button>
              <button type="button" onClick={() => setStep("enter")} className="text-xs text-muted-foreground hover:text-primary w-full text-center">Use a different email</button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
          </p>
        </div>
      </section>
    </PageShell>

  );
}

export default LoginPage;
