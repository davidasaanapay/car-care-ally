import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PaymentProofDialog } from "@/components/PaymentProofDialog";

export default function InvoicesPage() {
  useDocumentTitle("Invoices — Car Care Ally");
  const [list, setList] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, any[]>>({});
  const { user } = useAuth();
  const [payFor, setPayFor] = useState<any | null>(null);
  const load = () => supabase.from("invoices").select("*").order("created_at", { ascending: false }).then(({ data }) => setList(data ?? []));
  useEffect(() => { load(); }, []);

  const decide = async (id: string, approve: boolean) => {
    let reason: string | null = null;
    if (!approve) { reason = prompt("Why are you disputing this invoice?"); if (!reason) return; }
    const { error } = await supabase.rpc("customer_invoice_decision", { _invoice: id, _approve: approve, _reason: reason ?? "" });
    if (error) return toast.error(error.message);
    toast.success(approve ? "Invoice approved" : "Dispute sent to the specialist"); load();
  };

  const toggle = async (id: string) => {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    if (!items[id]) {
      const { data } = await supabase.from("invoice_items").select("*").eq("invoice_id", id).order("created_at");
      setItems((m) => ({ ...m, [id]: data ?? [] }));
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground">Invoices & Receipts</h1>
      {list.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-foreground">No invoices yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Invoices appear here after a specialist completes your service.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {list.map((i) => (
            <div key={i.id} className="rounded-xl border bg-card overflow-hidden">
              <button onClick={() => toggle(i.id)} className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/40">
                <div>
                  <p className="font-semibold text-foreground">${Number(i.total).toFixed(2)} {i.currency} · #{i.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()} · {i.notes ? i.notes.slice(0, 60) : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs uppercase font-semibold px-2 py-1 rounded-full ${i.status === "paid" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>{i.status}</span>
                  {openId === i.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>
              {openId === i.id && (
                <div className="border-t border-border p-5 bg-secondary/20 text-sm">
                  {items[i.id]?.length ? (
                    <table className="w-full text-xs">
                      <thead><tr className="text-muted-foreground"><th className="text-left">Item</th><th className="text-right">Qty</th><th className="text-right">Unit</th><th className="text-right">Total</th></tr></thead>
                      <tbody>
                        {items[i.id].map((it) => (
                          <tr key={it.id} className="border-t border-border/50">
                            <td className="py-1.5">{it.description} <span className="text-muted-foreground">({it.kind})</span></td>
                            <td className="text-right">{it.quantity}</td>
                            <td className="text-right">${Number(it.unit_price).toFixed(2)}</td>
                            <td className="text-right">${Number(it.total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-muted-foreground">No line items.</p>}
                  <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
                    <p className="flex justify-between"><span>Subtotal</span><span>${Number(i.subtotal).toFixed(2)}</span></p>
                    <p className="flex justify-between text-muted-foreground"><span>Tax</span><span>${Number(i.tax).toFixed(2)}</span></p>
                    <p className="flex justify-between text-muted-foreground"><span>Appointment fee</span><span>${Number(i.appointment_fee).toFixed(2)}</span></p>
                    <p className="flex justify-between font-bold text-foreground border-t pt-1"><span>Total</span><span>${Number(i.total).toFixed(2)}</span></p>
                  </div>
                  {i.payment_channel && <p className="mt-3 text-xs text-muted-foreground">Paid via {i.payment_channel} on {i.payment_date}{i.payment_reference ? ` · ref ${i.payment_reference}` : ""} · proof attached</p>}
                  {i.status === "disputed" && <p className="mt-3 text-xs text-destructive">Your dispute: {i.dispute_reason}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {i.status === "sent" && <><Button size="sm" onClick={() => decide(i.id, true)}>Approve</Button><Button size="sm" variant="outline" onClick={() => decide(i.id, false)}>Dispute</Button></>}
                    {i.status === "approved" && <Button size="sm" onClick={() => setPayFor(i)}>I've paid — attach proof</Button>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {payFor && user && <PaymentProofDialog userId={user.id} invoice={payFor} onClose={() => setPayFor(null)} onDone={() => { setPayFor(null); load(); }} />}
    </div>
  );
}
