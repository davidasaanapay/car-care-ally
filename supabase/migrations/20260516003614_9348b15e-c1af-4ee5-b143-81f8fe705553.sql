begin;

create or replace view public.public_shops as
select
  id,
  name,
  slug,
  description,
  address,
  city,
  state,
  zip,
  phone,
  email,
  website,
  rating,
  status,
  accepts_apple_pay,
  accepts_google_pay,
  accepts_cards,
  accepts_cashapp
from public.shops
where status = 'active';

grant select on public.public_shops to anon, authenticated;

create or replace view public.public_specialists as
select
  id,
  full_name,
  shop_id,
  city,
  state,
  bio,
  specialties,
  certifications,
  is_independent,
  status
from public.specialists
where status = 'active';

grant select on public.public_specialists to anon, authenticated;

drop policy if exists "anyone reads public settings" on public.platform_settings;
create policy "super admin reads settings"
on public.platform_settings
for select
to authenticated
using (is_super_admin(auth.uid()));

drop policy if exists "anyone reads active shops" on public.shops;
create policy "owners and admins read shops"
on public.shops
for select
to authenticated
using ((auth.uid() = owner_id) or is_super_admin(auth.uid()));

drop policy if exists "anyone reads active specialists" on public.specialists;
create policy "admins and specialists read specialist records"
on public.specialists
for select
to authenticated
using ((auth.uid() = user_id) or is_super_admin(auth.uid()));

drop policy if exists "diag owner inserts" on public.diagnostics;
create policy "diag owner inserts"
on public.diagnostics
for insert
to authenticated
with check ((auth.uid() = customer_id) or is_super_admin(auth.uid()));

create policy "owners create own reminders"
on public.maintenance_reminders
for insert
to authenticated
with check ((auth.uid() = owner_id) or is_super_admin(auth.uid()));

create policy "owners update own reminders"
on public.maintenance_reminders
for update
to authenticated
using ((auth.uid() = owner_id) or is_super_admin(auth.uid()))
with check ((auth.uid() = owner_id) or is_super_admin(auth.uid()));

create policy "owners delete own reminders"
on public.maintenance_reminders
for delete
to authenticated
using ((auth.uid() = owner_id) or is_super_admin(auth.uid()));

drop policy if exists "customer reads own appts" on public.appointments;
create policy "appointment participants read"
on public.appointments
for select
to authenticated
using (
  (auth.uid() = customer_id)
  or is_super_admin(auth.uid())
  or exists (
    select 1
    from public.shops s
    where s.id = appointments.shop_id
      and s.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.shop_id = appointments.shop_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "owner updates appt" on public.appointments;
create policy "appointment participants update"
on public.appointments
for update
to authenticated
using (
  (auth.uid() = customer_id)
  or is_super_admin(auth.uid())
  or exists (
    select 1
    from public.shops s
    where s.id = appointments.shop_id
      and s.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.shop_id = appointments.shop_id
      and tm.user_id = auth.uid()
  )
)
with check (
  (auth.uid() = customer_id)
  or is_super_admin(auth.uid())
  or exists (
    select 1
    from public.shops s
    where s.id = appointments.shop_id
      and s.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.shop_id = appointments.shop_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "invoice parties read" on public.invoices;
create policy "invoice parties read"
on public.invoices
for select
to authenticated
using (
  (auth.uid() = customer_id)
  or is_super_admin(auth.uid())
  or exists (
    select 1
    from public.shops s
    where s.id = invoices.shop_id
      and s.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.shop_id = invoices.shop_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "shop or admin writes invoice" on public.invoices;
create policy "shop staff or admin writes invoice"
on public.invoices
for all
to authenticated
using (
  is_super_admin(auth.uid())
  or exists (
    select 1
    from public.shops s
    where s.id = invoices.shop_id
      and s.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.shop_id = invoices.shop_id
      and tm.user_id = auth.uid()
  )
)
with check (
  is_super_admin(auth.uid())
  or exists (
    select 1
    from public.shops s
    where s.id = invoices.shop_id
      and s.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.team_members tm
    where tm.shop_id = invoices.shop_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "invoice items follow invoice read" on public.invoice_items;
create policy "invoice items follow invoice read"
on public.invoice_items
for select
to authenticated
using (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_items.invoice_id
      and (
        i.customer_id = auth.uid()
        or is_super_admin(auth.uid())
        or exists (
          select 1
          from public.shops s
          where s.id = i.shop_id
            and s.owner_id = auth.uid()
        )
        or exists (
          select 1
          from public.team_members tm
          where tm.shop_id = i.shop_id
            and tm.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "invoice items follow invoice write" on public.invoice_items;
create policy "invoice items follow invoice write"
on public.invoice_items
for all
to authenticated
using (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_items.invoice_id
      and (
        is_super_admin(auth.uid())
        or exists (
          select 1
          from public.shops s
          where s.id = i.shop_id
            and s.owner_id = auth.uid()
        )
        or exists (
          select 1
          from public.team_members tm
          where tm.shop_id = i.shop_id
            and tm.user_id = auth.uid()
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_items.invoice_id
      and (
        is_super_admin(auth.uid())
        or exists (
          select 1
          from public.shops s
          where s.id = i.shop_id
            and s.owner_id = auth.uid()
        )
        or exists (
          select 1
          from public.team_members tm
          where tm.shop_id = i.shop_id
            and tm.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "media participants read" on public.media_uploads;
create policy "media participants read"
on public.media_uploads
for select
to authenticated
using (
  (auth.uid() = uploader_id)
  or is_super_admin(auth.uid())
  or exists (
    select 1
    from public.appointments a
    join public.shops s on s.id = a.shop_id
    where a.id = media_uploads.appointment_id
      and (
        s.owner_id = auth.uid()
        or a.customer_id = auth.uid()
      )
  )
  or exists (
    select 1
    from public.appointments a
    join public.team_members tm on tm.shop_id = a.shop_id
    where a.id = media_uploads.appointment_id
      and tm.user_id = auth.uid()
  )
);

drop policy if exists "users read own media" on storage.objects;
create policy "users read own media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'media'
  and (
    (auth.uid())::text = (storage.foldername(name))[1]
    or is_super_admin(auth.uid())
    or exists (
      select 1
      from public.media_uploads m
      left join public.appointments a on a.id = m.appointment_id
      left join public.shops s on s.id = a.shop_id
      left join public.team_members tm on tm.shop_id = a.shop_id
      where m.storage_path = name
        and (
          a.customer_id = auth.uid()
          or s.owner_id = auth.uid()
          or tm.user_id = auth.uid()
        )
    )
  )
);

create or replace function public.claim_team_member_invite()
returns setof public.team_members
language plpgsql
security definer
set search_path = public
as $$
declare
  _email text;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  _email := lower(coalesce(auth.jwt()->>'email', ''));
  if _email = '' then
    raise exception 'Email not available for invite claim';
  end if;

  update public.team_members
  set user_id = auth.uid()
  where user_id is null
    and lower(coalesce(email, '')) = _email;

  insert into public.user_roles (user_id, role)
  select auth.uid(), 'specialist'::public.app_role
  where exists (
    select 1
    from public.team_members tm
    where tm.user_id = auth.uid()
       or lower(coalesce(tm.email, '')) = _email
  )
  on conflict (user_id, role) do nothing;

  return query
  select tm.*
  from public.team_members tm
  where tm.user_id = auth.uid()
     or lower(coalesce(tm.email, '')) = _email;
end;
$$;

revoke all on function public.claim_team_member_invite() from public;
revoke all on function public.claim_team_member_invite() from anon;
grant execute on function public.claim_team_member_invite() to authenticated;

commit;