
INSERT INTO public.integration_credentials (provider, is_configured, notes) VALUES
  ('stripe', false, 'Stripe Connect — set STRIPE_SECRET_KEY in backend secrets to activate checkout & payouts.'),
  ('resend', false, 'Resend transactional email — set RESEND_API_KEY in backend secrets.'),
  ('lovable_ai', true, 'Lovable AI Gateway — managed key already configured.'),
  ('twilio', false, 'Twilio SMS — set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to activate.'),
  ('parts_api', false, 'Parts pricing provider — set PARTS_API_KEY to activate live quotes.')
ON CONFLICT (provider) DO NOTHING;

INSERT INTO public.platform_settings (key, value) VALUES
  ('feature_ai_diagnostics', 'true'::jsonb),
  ('feature_ai_chatbot', 'true'::jsonb),
  ('feature_stripe_checkout', 'false'::jsonb),
  ('feature_email_notifications', 'false'::jsonb),
  ('feature_marketplace', 'true'::jsonb),
  ('platform_phone', '"1-302-640-0060"'::jsonb),
  ('platform_email', '"hello@carcareally.com"'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own chat" ON public.chat_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "users write own chat" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own chat" ON public.chat_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_created_idx ON public.chat_messages (user_id, created_at);

CREATE TABLE IF NOT EXISTS public.maintenance_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  reminder_type text NOT NULL,
  due_date date,
  sent_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own reminders" ON public.maintenance_reminders
  FOR SELECT TO authenticated USING (auth.uid() = owner_id OR public.is_super_admin(auth.uid()));
CREATE INDEX IF NOT EXISTS maintenance_reminders_vehicle_idx ON public.maintenance_reminders (vehicle_id, reminder_type, due_date);
