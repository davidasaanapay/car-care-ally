
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS per_appointment_fee_usd numeric NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS business_type text NOT NULL DEFAULT 'shop';
ALTER TABLE public.shops ALTER COLUMN monthly_subscription_usd SET DEFAULT 99;

CREATE OR REPLACE FUNCTION public.owns_shop(_shop uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.shops WHERE id = _shop AND owner_id = auth.uid())
$$;

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid, shop_id uuid, appointment_id uuid, customer_id uuid,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit read scoped" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR (shop_id IS NOT NULL AND public.owns_shop(shop_id)) OR customer_id = auth.uid());
CREATE INDEX audit_log_shop_idx ON public.audit_log(shop_id, created_at DESC);
CREATE INDEX audit_log_appt_idx ON public.audit_log(appointment_id, created_at);

CREATE OR REPLACE FUNCTION public.audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'audit_log is append-only'; END $$;
CREATE TRIGGER audit_no_update BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_immutable();

CREATE OR REPLACE FUNCTION public.write_audit(_event text, _shop uuid, _appt uuid, _customer uuid, _details jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.audit_log(actor_id, shop_id, appointment_id, customer_id, event_type, details)
  VALUES (auth.uid(), _shop, _appt, _customer, _event, COALESCE(_details,'{}'::jsonb));
$$;
REVOKE EXECUTE ON FUNCTION public.write_audit(text,uuid,uuid,uuid,jsonb) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.log_shop_view(_shop uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  PERFORM public.write_audit('shop_browsed', _shop, NULL, auth.uid(), '{}'::jsonb);
END $$;
GRANT EXECUTE ON FUNCTION public.log_shop_view(uuid) TO authenticated;

CREATE TABLE public.shop_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_usd numeric NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shop_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_services TO authenticated;
GRANT ALL ON public.shop_services TO service_role;
ALTER TABLE public.shop_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads services" ON public.shop_services FOR SELECT TO anon, authenticated USING (active OR public.owns_shop(shop_id) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "owner manages services" ON public.shop_services FOR ALL TO authenticated
  USING (public.owns_shop(shop_id) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.owns_shop(shop_id) OR public.has_role(auth.uid(),'super_admin'));

CREATE OR REPLACE FUNCTION public.audit_service_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit('pricing_added', NEW.shop_id, NULL, NULL, jsonb_build_object('service',NEW.name,'price',NEW.price_usd));
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    PERFORM public.write_audit('pricing_updated', NEW.shop_id, NULL, NULL, jsonb_build_object('service',NEW.name,'old_price',OLD.price_usd,'new_price',NEW.price_usd,'active',NEW.active));
  ELSE
    PERFORM public.write_audit('pricing_removed', OLD.shop_id, NULL, NULL, jsonb_build_object('service',OLD.name,'price',OLD.price_usd));
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER shop_services_audit_ins AFTER INSERT ON public.shop_services FOR EACH ROW EXECUTE FUNCTION public.audit_service_change();
CREATE TRIGGER shop_services_audit_upd BEFORE UPDATE ON public.shop_services FOR EACH ROW EXECUTE FUNCTION public.audit_service_change();
CREATE TRIGGER shop_services_audit_del AFTER DELETE ON public.shop_services FOR EACH ROW EXECUTE FUNCTION public.audit_service_change();

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS eta timestamptz,
  ADD COLUMN IF NOT EXISTS stage_note text,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.audit_appointment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit('appointment_booked', NEW.shop_id, NEW.id, NEW.customer_id,
      jsonb_build_object('scheduled_for',NEW.scheduled_for,'service',NEW.service_type));
  ELSIF NEW.status IS DISTINCT FROM OLD.status OR NEW.eta IS DISTINCT FROM OLD.eta THEN
    PERFORM public.write_audit(NEW.status, NEW.shop_id, NEW.id, NEW.customer_id,
      jsonb_build_object('from',OLD.status,'to',NEW.status,'eta',NEW.eta,'note',NEW.stage_note));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER appointments_audit AFTER INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.audit_appointment();

DROP POLICY IF EXISTS "shop owner reads appts" ON public.appointments;
CREATE POLICY "shop owner reads appts" ON public.appointments FOR SELECT TO authenticated
  USING (shop_id IS NOT NULL AND public.owns_shop(shop_id));
DROP POLICY IF EXISTS "shop owner updates appts" ON public.appointments;
CREATE POLICY "shop owner updates appts" ON public.appointments FOR UPDATE TO authenticated
  USING (shop_id IS NOT NULL AND public.owns_shop(shop_id)) WITH CHECK (shop_id IS NOT NULL AND public.owns_shop(shop_id));

CREATE OR REPLACE FUNCTION public.customer_set_stage(_appt uuid, _stage text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _stage NOT IN ('en_route','picked_up','appointment_review','cancelled') THEN RAISE EXCEPTION 'Stage not allowed'; END IF;
  UPDATE public.appointments SET status = _stage, updated_at = now()
   WHERE id = _appt AND customer_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Appointment not found'; END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.customer_set_stage(uuid,text) TO authenticated;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS customer_decision text,
  ADD COLUMN IF NOT EXISTS dispute_reason text,
  ADD COLUMN IF NOT EXISTS payment_channel text,
  ADD COLUMN IF NOT EXISTS payment_date date,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS proof_path text,
  ADD COLUMN IF NOT EXISTS work_summary text;
ALTER TABLE public.invoices ALTER COLUMN appointment_fee SET DEFAULT 0;

CREATE OR REPLACE FUNCTION public.audit_invoice() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit('invoice_generated', NEW.shop_id, NEW.appointment_id, NEW.customer_id, jsonb_build_object('invoice',NEW.id,'total',NEW.total));
    IF NEW.status = 'sent' THEN
      PERFORM public.write_audit('invoice_dispatched', NEW.shop_id, NEW.appointment_id, NEW.customer_id, jsonb_build_object('invoice',NEW.id));
      PERFORM public.write_audit('pending_customer_review', NEW.shop_id, NEW.appointment_id, NEW.customer_id, jsonb_build_object('invoice',NEW.id));
    END IF;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.write_audit(
      CASE NEW.status WHEN 'approved' THEN 'customer_approved_invoice'
                      WHEN 'disputed' THEN 'customer_rejected_invoice'
                      WHEN 'paid' THEN 'invoice_paid'
                      WHEN 'sent' THEN 'invoice_dispatched'
                      ELSE 'invoice_' || NEW.status END,
      NEW.shop_id, NEW.appointment_id, NEW.customer_id,
      jsonb_build_object('invoice',NEW.id,'total',NEW.total,'channel',NEW.payment_channel,'reason',NEW.dispute_reason));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER invoices_audit AFTER INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.audit_invoice();

CREATE OR REPLACE FUNCTION public.customer_invoice_decision(_invoice uuid, _approve boolean, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT _approve AND COALESCE(trim(_reason),'') = '' THEN RAISE EXCEPTION 'A reason is required to dispute'; END IF;
  UPDATE public.invoices
     SET status = CASE WHEN _approve THEN 'approved' ELSE 'disputed' END,
         customer_decision = CASE WHEN _approve THEN 'approved' ELSE 'disputed' END,
         dispute_reason = CASE WHEN _approve THEN NULL ELSE _reason END,
         updated_at = now()
   WHERE id = _invoice AND customer_id = auth.uid() AND status IN ('sent','disputed');
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not available for review'; END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.customer_invoice_decision(uuid,boolean,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_invoice_payment(_invoice uuid, _channel text, _date date, _reference text, _proof text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.invoices;
BEGIN
  SELECT * INTO inv FROM public.invoices WHERE id = _invoice;
  IF inv.id IS NULL THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  IF NOT (inv.customer_id = auth.uid() OR public.owns_shop(inv.shop_id) OR public.has_role(auth.uid(),'super_admin')) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  IF _channel NOT IN ('cash','zelle','cash_app','venmo','card','ach','check','other') THEN RAISE EXCEPTION 'Invalid payment channel'; END IF;
  IF COALESCE(_proof,'') = '' THEN RAISE EXCEPTION 'Proof of payment is required'; END IF;
  UPDATE public.invoices SET status='paid', paid_at=now(), payment_channel=_channel, payment_date=_date,
    payment_reference=_reference, proof_path=_proof, updated_at=now() WHERE id=_invoice;
END $$;
GRANT EXECUTE ON FUNCTION public.record_invoice_payment(uuid,text,date,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.close_appointment(_appt uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.appointments;
BEGIN
  SELECT * INTO a FROM public.appointments WHERE id=_appt;
  IF a.id IS NULL OR NOT (public.owns_shop(a.shop_id) OR public.has_role(auth.uid(),'super_admin')) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE appointment_id=_appt AND status='paid' AND proof_path IS NOT NULL) THEN
    RAISE EXCEPTION 'A paid invoice with proof of payment is required before closing';
  END IF;
  UPDATE public.appointments SET status='appointment_closed', closed_at=now(), updated_at=now() WHERE id=_appt;
END $$;
GRANT EXECUTE ON FUNCTION public.close_appointment(uuid) TO authenticated;

CREATE TABLE public.appointment_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL,
  marketplace_item_id uuid REFERENCES public.marketplace_items(id) ON DELETE SET NULL,
  title text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  verified_by text NOT NULL DEFAULT 'human',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_parts TO authenticated;
GRANT ALL ON public.appointment_parts TO service_role;
ALTER TABLE public.appointment_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parts read" ON public.appointment_parts FOR SELECT TO authenticated
  USING (public.owns_shop(shop_id) OR public.has_role(auth.uid(),'super_admin')
    OR EXISTS (SELECT 1 FROM public.appointments a WHERE a.id = appointment_id AND a.customer_id = auth.uid()));
CREATE POLICY "parts write" ON public.appointment_parts FOR ALL TO authenticated
  USING (public.owns_shop(shop_id)) WITH CHECK (public.owns_shop(shop_id));

CREATE TABLE public.shop_fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  period text NOT NULL,
  amount_usd numeric NOT NULL,
  method text, reference text, recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.shop_fee_payments TO authenticated;
GRANT ALL ON public.shop_fee_payments TO service_role;
ALTER TABLE public.shop_fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee payments read" ON public.shop_fee_payments FOR SELECT TO authenticated
  USING (public.owns_shop(shop_id) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "admin records fee payment" ON public.shop_fee_payments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE OR REPLACE VIEW public.shop_fee_ledger WITH (security_invoker = true) AS
WITH c AS (
  SELECT shop_id, to_char(date_trunc('month', created_at), 'YYYY-MM') AS period, count(*) AS n
  FROM public.appointments WHERE shop_id IS NOT NULL GROUP BY 1, 2
)
SELECT s.id AS shop_id, s.name AS shop_name, s.plan, c.period,
       c.n AS appointments_booked,
       s.per_appointment_fee_usd AS fee_per_appointment,
       c.n * s.per_appointment_fee_usd AS appointment_fees_usd,
       s.monthly_subscription_usd AS subscription_usd,
       c.n * s.per_appointment_fee_usd + s.monthly_subscription_usd AS total_due_usd,
       COALESCE((SELECT sum(p.amount_usd) FROM public.shop_fee_payments p WHERE p.shop_id = s.id AND p.period = c.period), 0) AS paid_usd
FROM c JOIN public.shops s ON s.id = c.shop_id;
GRANT SELECT ON public.shop_fee_ledger TO authenticated;

CREATE OR REPLACE FUNCTION public.register_shop(
  _name text, _business_type text, _plan text, _phone text, _email text, _address text,
  _city text, _state text, _zip text, _timezone text, _description text, _hours jsonb, _website text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _slug text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  IF EXISTS (SELECT 1 FROM public.shops WHERE owner_id = auth.uid()) THEN RAISE EXCEPTION 'You already have a business profile'; END IF;
  IF _plan NOT IN ('starter','pro') THEN RAISE EXCEPTION 'Invalid plan'; END IF;
  _slug := regexp_replace(lower(_name), '[^a-z0-9]+', '-', 'g') || '-' || substr(gen_random_uuid()::text,1,6);
  INSERT INTO public.shops(name, slug, owner_id, status, plan, business_type, phone, email, address, city, state, zip,
    timezone, description, hours, website, monthly_subscription_usd, per_appointment_fee_usd, has_own_stripe)
  VALUES (_name, _slug, auth.uid(), 'active', _plan, COALESCE(_business_type,'shop'), _phone, _email, _address, _city, _state, _zip,
    COALESCE(_timezone,'America/New_York'), _description, COALESCE(_hours,'{}'::jsonb), _website,
    CASE WHEN _plan='pro' THEN 199 ELSE 99 END, 9, false)
  RETURNING id INTO _id;
  INSERT INTO public.user_roles(user_id, role) VALUES (auth.uid(), 'shop_owner') ON CONFLICT DO NOTHING;
  PERFORM public.write_audit('business_registered', _id, NULL, NULL, jsonb_build_object('plan',_plan));
  RETURN _id;
END $$;
GRANT EXECUTE ON FUNCTION public.register_shop(text,text,text,text,text,text,text,text,text,text,text,jsonb,text) TO authenticated;

CREATE TABLE public.ai_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_norm text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  vehicle_context text,
  hits integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_knowledge TO authenticated;
GRANT ALL ON public.ai_knowledge TO service_role;
ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kb readable" ON public.ai_knowledge FOR SELECT TO authenticated USING (true);
CREATE INDEX ai_knowledge_norm_idx ON public.ai_knowledge(question_norm);

INSERT INTO public.platform_settings(key, value) VALUES
  ('customer_subscription_usd', '29'::jsonb),
  ('starter_monthly_usd', '99'::jsonb),
  ('pro_monthly_usd', '199'::jsonb),
  ('per_appointment_fee_usd', '9'::jsonb),
  ('ai_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
