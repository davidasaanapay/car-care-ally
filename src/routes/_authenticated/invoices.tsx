import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";

export default function InvoicesPage() {
  useDocumentTitle("Invoices — Car Care Ally");
  const [list, setList] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, any[]>>({});

  useEffect(() => {
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).then(({ data }) => setList(data ?? []));
  }, []);

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
                    <p className="flex justify-between text-muted-foreground"><span>Platform fee</span><span>${Number(i.appointment_fee).toFixed(2)}</span></p>
                    <p className="flex justify-between font-bold text-foreground border-t pt-1"><span>Total</span><span>${Number(i.total).toFixed(2)}</span></p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
