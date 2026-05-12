import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/super-admin")({
  head: () => ({ meta: [{ title: "Platform Administration — Car Care Ally" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SuperAdminPage,
});

function SuperAdminPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: window.location.origin } });
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
    // Super-admin role is auto-granted by the database trigger if email matches.
    const userId = data.user?.id;
    if (userId) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin");
      if (roles && roles.length > 0) {
        toast.success("Welcome, super admin.");
        nav({ to: "/admin" });
        return;
      }
    }
    toast.error("This email is not authorized for platform administration.");
    await supabase.auth.signOut();
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-20 max-w-md">
        <div className="rounded-2xl border-2 border-primary/20 bg-card p-8 shadow-elegant">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Platform Administration</h1>
          <p className="mt-1 text-sm text-muted-foreground">Authorized super admins only.</p>

          {step === "email" ? (
            <form onSubmit={sendCode} className="mt-6 space-y-4">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@carcareally.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send admin code"}</Button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span></p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={verify} className="w-full" disabled={busy || otp.length !== 6}>{busy ? "Verifying…" : "Verify"}</Button>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
