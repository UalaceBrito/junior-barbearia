import "server-only";

import { services } from "@/lib/services";

export type BookingInput = {
  serviceId: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  idempotencyKey: string;
};

export type BookingSlot = { time: string };

type AppointmentRow = { starts_at: string; ends_at: string };

const TIME_ZONE = process.env.BOOKING_TIME_ZONE || "America/Sao_Paulo";
const DEFAULT_OPENING = "09:00";
const DEFAULT_CLOSING = "18:00";
const DEFAULT_SLOT_MINUTES = 30;
const MAX_DAYS_AHEAD = 30;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("BOOKING_DATABASE_NOT_CONFIGURED");
  }
  return { url, key };
}

function getLocalParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    year: Number(value.year),
    month: Number(value.month),
    day: Number(value.day),
    hour: Number(value.hour),
    minute: Number(value.minute),
  };
}

function getLocalDate(date: Date) {
  const { year, month, day } = getLocalParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function localDateTimeToUtc(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wanted = Date.UTC(year, month - 1, day, hour, minute);
  let guess = wanted;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = getLocalParts(new Date(guess));
    const represented = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
    );
    const difference = wanted - represented;
    if (difference === 0) break;
    guess += difference;
  }
  return new Date(guess);
}

function addLocalDays(date: string, amount: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount, 12));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

function getBusinessWindow(date: string) {
  const opening = process.env.BOOKING_OPENING_TIME || DEFAULT_OPENING;
  const closing = process.env.BOOKING_CLOSING_TIME || DEFAULT_CLOSING;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(opening) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(closing)) {
    throw new Error("BOOKING_HOURS_INVALID");
  }

  const start = localDateTimeToUtc(date, opening);
  const end = localDateTimeToUtc(date, closing);
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return { start, end, weekday, opening, closing };
}

function getSlotStep() {
  const value = Number(process.env.BOOKING_SLOT_MINUTES || DEFAULT_SLOT_MINUTES);
  if (!Number.isInteger(value) || value < 15 || value > 120) {
    throw new Error("BOOKING_SLOT_STEP_INVALID");
  }
  return value;
}

export function validateBookingDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  const localToday = getLocalDate(new Date());
  return date >= localToday && date <= addLocalDays(localToday, MAX_DAYS_AHEAD);
}

export function getService(serviceId: string) {
  return services.find((service) => service.id === serviceId);
}

async function supabaseFetch(path: string, init?: RequestInit) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    signal: AbortSignal.timeout(8_000),
  });
  return response;
}

export async function getAvailableSlots(serviceId: string, date: string): Promise<BookingSlot[]> {
  const service = getService(serviceId);
  if (!service || !validateBookingDate(date)) {
    throw new Error("BOOKING_SELECTION_INVALID");
  }

  const { start, end, weekday, opening, closing } = getBusinessWindow(date);
  if (weekday === 0) return [];

  const query = new URLSearchParams({
    select: "starts_at,ends_at",
    starts_at: `gte.${start.toISOString()}`,
    ends_at: `lte.${end.toISOString()}`,
    status: "eq.confirmed",
  });
  const response = await supabaseFetch(`appointments?${query}`);
  if (!response.ok) throw new Error("BOOKING_DATABASE_UNAVAILABLE");

  const booked = (await response.json()) as AppointmentRow[];
  const bookedIntervals = booked.map((row) => ({
    start: new Date(row.starts_at).getTime(),
    end: new Date(row.ends_at).getTime(),
  }));
  const duration = Number.parseInt(service.duration, 10);
  const step = getSlotStep();
  const closingMinutes = Number(closing.slice(0, 2)) * 60 + Number(closing.slice(3));
  const openingMinutes = Number(opening.slice(0, 2)) * 60 + Number(opening.slice(3));
  const now = Date.now();
  const slots: BookingSlot[] = [];

  for (let minutes = openingMinutes; minutes + duration <= closingMinutes; minutes += step) {
    const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    const slotStart = localDateTimeToUtc(date, time).getTime();
    const slotEnd = slotStart + duration * 60_000;
    if (slotStart <= now) continue;
    if (bookedIntervals.some((booking) => slotStart < booking.end && slotEnd > booking.start)) continue;
    slots.push({ time });
  }
  return slots;
}

export async function createAppointment(input: BookingInput, serviceDuration: number) {
  const startsAt = localDateTimeToUtc(input.date, input.time);
  const endsAt = new Date(startsAt.getTime() + serviceDuration * 60_000);
  const response = await supabaseFetch("rpc/create_barber_appointment", {
    method: "POST",
    body: JSON.stringify({
      p_idempotency_key: input.idempotencyKey,
      p_customer_name: input.name,
      p_customer_phone: input.phone,
      p_service_id: input.serviceId,
      p_starts_at: startsAt.toISOString(),
      p_ends_at: endsAt.toISOString(),
    }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    const code = details?.code ?? details?.message;
    if (code === "23P01" || code === "booking_slot_taken" || response.status === 409) {
      throw new Error("BOOKING_SLOT_TAKEN");
    }
    if (code === "P0001" || code === "booking_rate_limited" || response.status === 429) {
      throw new Error("BOOKING_RATE_LIMITED");
    }
    throw new Error("BOOKING_DATABASE_UNAVAILABLE");
  }
  return (await response.json()) as { id: string; starts_at: string; ends_at: string };
}

export function formatBookingDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: TIME_ZONE,
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}
