import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";
import { PAYMENT_CHANNELS, uploadProof, money } from "@/lib/workflow";

export function PaymentProofDialog({ userId, invoice, onClose, onDone }: { userId: string; invoice: any; onClose: () => void; onDone: () => void }) {
  const [channel, setChannel] = useState("cash");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ref, setRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!file) return toast.error("Attach a photo or screenshot of the payment");
    setBusy(true);
    try {
      const path = await uploadProof(userId, file);
      const { error } = await supabase.rpc("record_invoice_payment", { _invoice: invoice.id, _channel: channel, _date: date, _reference: ref, _proof: path });
      if (error) throw error;
      toast.success("Payment recorded");
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Could not record payment");
    } finally {
      setBusy(false);
    }
  };

  const field = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-elegant max-w-md w-full p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Record payment</h3>
            <p className="text-xs text-muted-foreground">Invoice #{invoice.id.slice(0, 8)} · {money(invoice.total)}. Payment happens directly between customer and specialist.</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">How was it paid?
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className={field}>
              {PAYMENT_CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="block">Date paid<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} /></label>
          <label className="block">Reference / confirmation # (optional)<input value={ref} onChange={(e) => setRef(e.target.value)} className={field} /></label>
          <label className="block">Proof of payment (photo, screenshot or PDF)
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-xs" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Saving…" : "Save payment"}</Button>
        </div>
      </div>
    </div>
  );
}
