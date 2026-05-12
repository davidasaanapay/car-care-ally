
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'shop_owner', 'specialist', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin');
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "super admin manages roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  state TEXT,
  city TEXT,
  marketing_emails BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self read profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_super_admin(auth.uid()));
CREATE POLICY "self update profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_super_admin(auth.uid()));
CREATE POLICY "self insert profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile + role on signup, auto-elevate the super admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  IF lower(NEW.email) = 'david@asaanapay.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin')
      ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ VEHICLES ============
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  vin TEXT,
  license_plate TEXT,
  state TEXT,
  color TEXT,
  mileage INTEGER,
  last_service_date DATE,
  next_service_due DATE,
  tags_renewal_date DATE,
  nickname TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles owner all" ON public.vehicles FOR ALL TO authenticated
  USING (auth.uid() = owner_id OR public.is_super_admin(auth.uid()))
  WITH CHECK (auth.uid() = owner_id OR public.is_super_admin(auth.uid()));

-- ============ SHOPS ============
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | active | suspended
  accepts_apple_pay BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_google_pay BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_cards BOOLEAN NOT NULL DEFAULT TRUE,
  accepts_cashapp BOOLEAN NOT NULL DEFAULT FALSE,
  has_own_stripe BOOLEAN NOT NULL DEFAULT FALSE,
  marketplace_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 8.00,
  marketplace_fee_schedule TEXT NOT NULL DEFAULT 'monthly', -- monthly | weekly | daily | on_demand
  monthly_subscription_usd NUMERIC(10,2) NOT NULL DEFAULT 49.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads active shops" ON public.shops FOR SELECT TO anon, authenticated
  USING (status = 'active' OR auth.uid() = owner_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "owner updates shop" ON public.shops FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "super admin inserts shop" ON public.shops FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin deletes shop" ON public.shops FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- ============ SPECIALISTS ============
CREATE TABLE public.specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  certifications TEXT[],
  specialties TEXT[],
  state TEXT,
  city TEXT,
  is_independent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads active specialists" ON public.specialists FOR SELECT TO anon, authenticated
  USING (status = 'active' OR auth.uid() = user_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "super admin manages specialists" ON public.specialists FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ============ APPOINTMENTS ============
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_name TEXT,
  guest_phone TEXT,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  vehicle_summary TEXT,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  specialist_id UUID REFERENCES public.specialists(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  service_type TEXT,
  issue_summary TEXT,
  status TEXT NOT NULL DEFAULT 'requested', -- requested | confirmed | in_progress | completed | cancelled
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer reads own appts" ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.is_super_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = appointments.shop_id AND s.owner_id = auth.uid()));
CREATE POLICY "anyone creates appt" ON public.appointments FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);
CREATE POLICY "owner updates appt" ON public.appointments FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id OR public.is_super_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = appointments.shop_id AND s.owner_id = auth.uid()));

-- ============ DIAGNOSTICS ============
CREATE TABLE public.diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  vehicle_data JSONB NOT NULL DEFAULT '{}',
  symptoms JSONB NOT NULL DEFAULT '{}',
  ai_assessment TEXT,
  estimated_cost_low NUMERIC(10,2),
  estimated_cost_high NUMERIC(10,2),
  recommended_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag owner reads" ON public.diagnostics FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "diag owner inserts" ON public.diagnostics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

-- ============ INVOICES ============
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'provisional', -- provisional | final | paid | disputed
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  appointment_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice parties read" ON public.invoices FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.is_super_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = invoices.shop_id AND s.owner_id = auth.uid()));
CREATE POLICY "shop or admin writes invoice" ON public.invoices FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = invoices.shop_id AND s.owner_id = auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = invoices.shop_id AND s.owner_id = auth.uid()));

CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'service', -- service | part | fee
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice items follow invoice read" ON public.invoice_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id
      AND (i.customer_id = auth.uid()
           OR public.is_super_admin(auth.uid())
           OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = i.shop_id AND s.owner_id = auth.uid()))
  ));
CREATE POLICY "invoice items follow invoice write" ON public.invoice_items FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id
      AND (public.is_super_admin(auth.uid())
           OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = i.shop_id AND s.owner_id = auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id
      AND (public.is_super_admin(auth.uid())
           OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = i.shop_id AND s.owner_id = auth.uid()))
  ));

-- ============ MARKETPLACE ============
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price_usd NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads active items" ON public.marketplace_items FOR SELECT TO anon, authenticated
  USING (active = TRUE OR public.is_super_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = marketplace_items.shop_id AND s.owner_id = auth.uid()));
CREATE POLICY "shop manages items" ON public.marketplace_items FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = marketplace_items.shop_id AND s.owner_id = auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid())
         OR EXISTS (SELECT 1 FROM public.shops s WHERE s.id = marketplace_items.shop_id AND s.owner_id = auth.uid()));

-- ============ PLATFORM SETTINGS ============
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads public settings" ON public.platform_settings FOR SELECT TO anon, authenticated
  USING (TRUE);
CREATE POLICY "super admin writes settings" ON public.platform_settings FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ============ INTEGRATION CREDENTIAL FLAGS ============
CREATE TABLE public.integration_credentials (
  provider TEXT PRIMARY KEY, -- 'stripe', 'resend', 'lovable_ai', 'tekmetric'
  is_configured BOOLEAN NOT NULL DEFAULT FALSE,
  configured_at TIMESTAMPTZ,
  configured_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admin reads creds" ON public.integration_credentials FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));
CREATE POLICY "super admin writes creds" ON public.integration_credentials FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- Seed default platform settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('appointment_base_fee_usd', '0'::jsonb),
  ('ai_diagnostics_enabled', 'true'::jsonb),
  ('marketplace_enabled', 'true'::jsonb),
  ('stripe_enabled', 'false'::jsonb),
  ('resend_enabled', 'false'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO public.integration_credentials (provider, is_configured) VALUES
  ('stripe', FALSE),
  ('resend', FALSE),
  ('lovable_ai', TRUE),
  ('tekmetric', FALSE)
ON CONFLICT DO NOTHING;
