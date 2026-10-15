import { supabase } from "@/integrations/supabase/client";

export const STAGES: { id: string; label: string }[] = [
  { id: "requested", label: "Appointment booked" },
  { id: "confirmed", label: "Confirmed" },
  { id: "en_route", label: "Customer en route" },
  { id: "appointment_started", label: "Appointment started" },
  { id: "human_diagnostics_ongoing", label: "Human diagnostics ongoing" },
  { id: "human_diagnostics_completed", label: "Human diagnostics completed" },
  { id: "diagnostics_report_generated", label: "Diagnostics report (AI assisted) generated" },
  { id: "diagnostics_report_attached", label: "Diagnostics report (AI assisted) attached" },
  { id: "pending_customer_review", label: "Pending customer review" },
  { id: "servicing_commenced", label: "Servicing commenced" },
  { id: "servicing_completed", label: "Servicing completed" },
  { id: "servicing_review", label: "Servicing review" },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "ready_for_pickup", label: "Ready for pickup" },
  { id: "picked_up", label: "Picked up" },
  { id: "appointment_review", label: "Appointment review" },
  { id: "appointment_closed", label: "Appointment closed" },
  { id: "cancelled", label: "Cancelled" },
];

export const stageLabel = (id: string) =>
  STAGES.find((s) => s.id === id)?.label ??
  id.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const stageIndex = (id: string) => STAGES.findIndex((s) => s.id === id);

export const PAYMENT_CHANNELS = [
  { id: "cash", label: "Cash" },
  { id: "zelle", label: "Zelle" },
  { id: "cash_app", label: "Cash App" },
  { id: "venmo", label: "Venmo" },
  { id: "card", label: "Card" },
  { id: "ach", label: "ACH / bank transfer" },
  { id: "check", label: "Check" },
  { id: "other", label: "Other" },
];

export async function uploadProof(userId: string, file: File) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/proofs/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

/** Best-effort customer email; silently skipped until email sending is configured. */
export async function notifyCustomer(to: string | null | undefined, subject: string, html: string) {
  if (!to) return;
  try {
    await supabase.functions.invoke("send-email", { body: { to, subject, html } });
  } catch {
    /* email not configured yet */
  }
}

export function fmtInTz(value: string | null | undefined, tz?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: tz, timeZoneName: "short" }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleString();
  }
}

export const money = (n: any) => `$${Number(n || 0).toFixed(2)}`;
