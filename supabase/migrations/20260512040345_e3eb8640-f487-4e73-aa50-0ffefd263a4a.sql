
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

DROP POLICY IF EXISTS "anyone creates appt" ON public.appointments;
CREATE POLICY "guests and customers create appt" ON public.appointments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND customer_id IS NULL AND guest_email IS NOT NULL)
    OR (auth.uid() IS NOT NULL AND customer_id = auth.uid())
  );
