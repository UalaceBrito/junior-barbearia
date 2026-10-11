create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  customer_phone text not null check (customer_phone ~ '^\+?[1-9][0-9]{7,14}$'),
  service_id text not null check (service_id in ('corte', 'barba', 'combo', 'acabamento')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint appointment_positive_duration check (ends_at > starts_at)
);

alter table public.appointments enable row level security;
revoke all on public.appointments from anon, authenticated;

do $$
begin
  alter table public.appointments
    add constraint appointment_time_no_overlap
    exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&)
    where (status = 'confirmed');
exception
  when duplicate_object then null;
end
$$;

create or replace function public.create_barber_appointment(
  p_idempotency_key uuid,
  p_customer_name text,
  p_customer_phone text,
  p_service_id text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_appointment public.appointments;
  created_appointment public.appointments;
begin
  select * into existing_appointment
    from public.appointments
    where idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'id', existing_appointment.id,
      'starts_at', existing_appointment.starts_at,
      'ends_at', existing_appointment.ends_at
    );
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_customer_phone, 0));

  select * into existing_appointment
    from public.appointments
    where idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'id', existing_appointment.id,
      'starts_at', existing_appointment.starts_at,
      'ends_at', existing_appointment.ends_at
    );
  end if;

  if (
    select count(*)
    from public.appointments
    where customer_phone = p_customer_phone
      and created_at > now() - interval '24 hours'
  ) >= 5 then
    raise exception using errcode = 'P0001', message = 'booking_rate_limited';
  end if;

  insert into public.appointments (
    idempotency_key,
    customer_name,
    customer_phone,
    service_id,
    starts_at,
    ends_at
  ) values (
    p_idempotency_key,
    p_customer_name,
    p_customer_phone,
    p_service_id,
    p_starts_at,
    p_ends_at
  )
  returning * into created_appointment;

  return jsonb_build_object(
    'id', created_appointment.id,
    'starts_at', created_appointment.starts_at,
    'ends_at', created_appointment.ends_at
  );
exception
  when exclusion_violation then
    raise exception using errcode = '23P01', message = 'booking_slot_taken';
end;
$$;

revoke all on function public.create_barber_appointment(uuid, text, text, text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.create_barber_appointment(uuid, text, text, text, timestamptz, timestamptz) to service_role;
