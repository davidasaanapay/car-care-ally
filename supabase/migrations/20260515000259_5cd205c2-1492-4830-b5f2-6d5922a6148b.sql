
-- 1. SERVICE CATALOG
CREATE TABLE public.service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  default_interval_months integer,
  default_interval_miles integer,
  typical_cost_low numeric,
  typical_cost_high numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads catalog" ON public.service_catalog FOR SELECT USING (true);
CREATE POLICY "super admin writes catalog" ON public.service_catalog FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

INSERT INTO public.service_catalog (code,name,description,default_interval_months,default_interval_miles,typical_cost_low,typical_cost_high) VALUES
  ('oil_change','Oil Change','Engine oil and filter replacement',6,5000,45,90),
  ('tire_rotation','Tire Rotation','Rotate tires for even wear',6,6000,25,60),
  ('brake_service','Brake Service','Brake pads/rotors inspection and replacement',24,30000,180,600),
  ('air_filter','Engine Air Filter','Replace engine air filter',24,20000,30,80),
  ('cabin_filter','Cabin Air Filter','Replace cabin air filter',12,15000,40,90),
  ('transmission_fluid','Transmission Fluid','Transmission fluid service',36,60000,150,400),
  ('coolant_flush','Coolant Flush','Cooling system flush',60,60000,120,250),
  ('battery_check','Battery Check','Battery test and replacement',12,12000,120,300),
  ('inspection','State Inspection','Annual safety/emissions inspection',12,NULL,30,80),
  ('alignment','Wheel Alignment','4-wheel alignment',12,12000,80,180),
  ('spark_plugs','Spark Plugs','Spark plug replacement',60,60000,100,300),
  ('ac_service','A/C Service','A/C recharge and inspection',24,NULL,90,250);

-- 2. VEHICLE SERVICE HISTORY
CREATE TABLE public.vehicle_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  service_code text NOT NULL,
  performed_on date NOT NULL,
  mileage_at_service integer,
  shop_id uuid,
  appointment_id uuid,
  cost_usd numeric,
  notes text,
  next_due_date date,
  next_due_mileage integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_vehicle_services_owner ON public.vehicle_services(owner_id);
CREATE INDEX idx_vehicle_services_vehicle ON public.vehicle_services(vehicle_id);
ALTER TABLE public.vehicle_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads service history" ON public.vehicle_services FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));
CREATE POLICY "owner adds service history" ON public.vehicle_services FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id
    OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid())
    OR public.is_super_admin(auth.uid()));
CREATE POLICY "owner updates service history" ON public.vehicle_services FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));

-- Auto-compute next_due_date / next_due_mileage from catalog
CREATE OR REPLACE FUNCTION public.fill_next_service_due()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record;
BEGIN
  SELECT default_interval_months, default_interval_miles INTO c
  FROM public.service_catalog WHERE code = NEW.service_code;
  IF NEW.next_due_date IS NULL AND c.default_interval_months IS NOT NULL THEN
    NEW.next_due_date := NEW.performed_on + (c.default_interval_months || ' months')::interval;
  END IF;
  IF NEW.next_due_mileage IS NULL AND c.default_interval_miles IS NOT NULL AND NEW.mileage_at_service IS NOT NULL THEN
    NEW.next_due_mileage := NEW.mileage_at_service + c.default_interval_miles;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_fill_next_service_due BEFORE INSERT ON public.vehicle_services
  FOR EACH ROW EXECUTE FUNCTION public.fill_next_service_due();

-- 3. MEDIA UPLOADS METADATA
CREATE TABLE public.media_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL,
  uploader_role text NOT NULL DEFAULT 'customer',
  context text NOT NULL DEFAULT 'diagnostics',
  appointment_id uuid,
  diagnostic_id uuid,
  vehicle_id uuid,
  storage_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  caption text,
  captured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_uploader ON public.media_uploads(uploader_id);
CREATE INDEX idx_media_appointment ON public.media_uploads(appointment_id);
ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media participants read" ON public.media_uploads FOR SELECT TO authenticated
  USING (
    auth.uid() = uploader_id
    OR public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.appointments a JOIN public.shops s ON s.id = a.shop_id
               WHERE a.id = media_uploads.appointment_id AND (s.owner_id = auth.uid() OR a.customer_id = auth.uid()))
  );
CREATE POLICY "uploader inserts media" ON public.media_uploads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "uploader deletes media" ON public.media_uploads FOR DELETE TO authenticated
  USING (auth.uid() = uploader_id OR public.is_super_admin(auth.uid()));

-- 4. TEAM MEMBERS (shop staff)
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL,
  user_id uuid,
  full_name text NOT NULL,
  email text,
  phone text,
  role text NOT NULL DEFAULT 'specialist',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_team_shop ON public.team_members(shop_id);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop owner reads team" ON public.team_members FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid())
    OR auth.uid() = user_id);
CREATE POLICY "shop owner writes team" ON public.team_members FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));

-- 5. STORAGE BUCKET for media (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('media','media',false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users upload own media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users read own media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.media_uploads m
               JOIN public.appointments a ON a.id = m.appointment_id
               JOIN public.shops s ON s.id = a.shop_id
               WHERE m.storage_path = name AND s.owner_id = auth.uid())
  ));
CREATE POLICY "users delete own media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin(auth.uid())));

-- 6. PROMOTE EXISTING SUPER ADMIN (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role FROM auth.users WHERE lower(email) = 'david@asaanapay.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. UPDATE invoice status enum-style guard via trigger (allow 'sent','paid','void','provisional')
-- (already text, no enum needed)
