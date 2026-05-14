import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";

export default function InvoicesPage() {
  useDocumentTitle("Invoices — Car Care Ally");
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground">Invoices & Receipts</h1>
      {list.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-foreground">No invoices yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Invoices appear here after you book a service.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {list.map((i) => (
            <div key={i.id} className="rounded-xl border bg-card p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">${Number(i.total).toFixed(2)} {i.currency}</p>
                <p className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs uppercase font-semibold text-primary">{i.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
