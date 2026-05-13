INSERT INTO public.platform_settings (key, value) VALUES
  ('appointment_base_fee_usd', '29'::jsonb),
  ('shop_monthly_subscription_usd', '49'::jsonb),
  ('marketplace_fee_pct', '8'::jsonb),
  ('diagnostic_fee_usd', '49'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Harden chat_messages: keep super-admin read, but enforce strict per-user access (already in policy).
-- Add a defensive index for pagination performance.
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON public.chat_messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments (customer_id, scheduled_for DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices (customer_id, created_at DESC);
