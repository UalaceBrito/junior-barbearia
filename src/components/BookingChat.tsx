"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { services } from "@/lib/services";

type Slot = { time: string };
type ChatMessage = { id: number; role: "assistant" | "customer"; text: string };
type BookingConfirmation = {
  appointment: { id: string; service: string; date: string; time: string };
  message: string;
};

function localDateString(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function getBookableDays() {
  const days: { value: string; day: string; weekday: string }[] = [];
  const today = new Date();
  for (let offset = 0; days.length < 14 && offset < 21; offset += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    if (date.getDay() === 0) continue;
    days.push({
      value: localDateString(date),
      day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date),
      weekday: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", ""),
    });
  }
  return days;
}

function getFriendlyError(error: unknown) {
  return error instanceof Error ? error.message : "Algo deu errado. Tente novamente.";
}

export default function BookingChat({ initialServiceId }: { initialServiceId: string }) {
  const initialService = services.find((service) => service.id === initialServiceId);
  const [serviceId, setServiceId] = useState(initialService?.id ?? "");
  const [step, setStep] = useState<"service" | "details" | "calendar" | "time" | "review" | "done">(
    initialService ? "details" : "service",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const days = useMemo(getBookableDays, []);
  const service = services.find((item) => item.id === serviceId);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: initialService
        ? `Ótima escolha: ${initialService.name}. Primeiro, me diga seu nome e telefone para reservarmos seu horário.`
        : "Olá! Vou ajudar você a agendar na Junior Barbearia. Qual serviço deseja?",
    },
  ]);

  useEffect(() => {
    if (!selectedDate || !serviceId) return;
    const controller = new AbortController();
    setLoadingSlots(true);
    setSlots([]);
    setError("");

    fetch(`/api/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(selectedDate)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Não foi possível consultar a agenda.");
        return body as { slots: Slot[] };
      })
      .then((body) => setSlots(body.slots))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(getFriendlyError(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSlots(false);
      });

    return () => controller.abort();
  }, [availabilityVersion, selectedDate, serviceId]);

  function addMessage(role: ChatMessage["role"], text: string) {
    setMessages((current) => [...current, { id: Date.now() + current.length, role, text }]);
  }

  function chooseService(value: string) {
    const chosen = services.find((item) => item.id === value);
    if (!chosen) return;
    setServiceId(value);
    setError("");
    addMessage("customer", chosen.name);
    addMessage("assistant", `Perfeito, ${chosen.name}. Agora me diga seu nome e telefone de contato.`);
    setStep("details");
  }

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    if (cleanName.length < 2 || !/^\+?[1-9]\d{7,14}$/.test(cleanPhone)) {
      setError("Informe seu nome e telefone com DDD e código do país.");
      return;
    }
    setName(cleanName);
    setPhone(cleanPhone);
    setError("");
    addMessage("customer", `${cleanName} · ${cleanPhone}`);
    addMessage("assistant", "Obrigado! Escolha um dia no calendário para consultar os horários realmente livres.");
    setStep("calendar");
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setError("");
    addMessage("customer", formatDate(date));
    addMessage("assistant", "Estou consultando a agenda. Toque em um dos horários livres.");
    setStep("time");
  }

  function chooseTime(time: string) {
    setSelectedTime(time);
    setIdempotencyKey(crypto.randomUUID());
    setError("");
    addMessage("customer", time);
    addMessage("assistant", "Confira os dados antes de confirmar. Seu horário só fica reservado depois que a agenda aceitar.");
    setStep("review");
  }

  async function confirmBooking() {
    if (!service || !selectedDate || !selectedTime || !idempotencyKey) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          serviceId,
          date: selectedDate,
          time: selectedTime,
          idempotencyKey,
          website: "",
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível confirmar esse horário.");
      setConfirmation(body as BookingConfirmation);
      addMessage("assistant", body.message);
      setStep("done");
    } catch (reason) {
      setError(getFriendlyError(reason));
      if (reason instanceof Error && reason.message.toLowerCase().includes("horário")) {
        setSelectedTime("");
        setAvailabilityVersion((version) => version + 1);
        setStep("time");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-label="Assistente de agendamento" className="booking-chat">
      <div aria-live="polite" className="booking-chat__messages" role="log">
        {messages.map((message) => (
          <p className={`chat-message chat-message--${message.role}`} key={message.id}>
            {message.role === "assistant" && <span aria-hidden="true" className="chat-message__avatar">JB</span>}
            <span>{message.text}</span>
          </p>
        ))}
        {step === "done" && confirmation && (
          <div className="chat-confirmation" role="status">
            <div>
              <strong>Horário confirmado</strong>
              <p>{confirmation.appointment.service}</p>
              <p>{confirmation.appointment.date} · {confirmation.appointment.time}</p>
              <small>Guarde esta confirmação para apresentar na barbearia.</small>
            </div>
          </div>
        )}
      </div>

      {step === "service" && (
        <div className="chat-panel">
          <p className="chat-panel__label">ESCOLHA O SERVIÇO</p>
          {services.map((item) => (
            <button className="chat-choice" key={item.id} onClick={() => chooseService(item.id)} type="button">
              <span><strong>{item.name}</strong><small>{item.duration} · {item.priceLabel}</small></span>
            </button>
          ))}
        </div>
      )}

      {step === "details" && (
        <form className="chat-panel chat-form" onSubmit={submitDetails}>
          <label aria-hidden="true" className="chat-form__trap">
            Site<input autoComplete="off" name="website" tabIndex={-1} />
          </label>
          <label>Seu nome<input autoComplete="name" maxLength={80} minLength={2} onChange={(event) => setName(event.target.value)} required value={name} /></label>
          <label>Telefone com DDD<input autoComplete="tel" maxLength={20} onChange={(event) => setPhone(event.target.value)} placeholder="+55 (11) 99999-9999" required type="tel" value={phone} /></label>
          <button className="button button--gold" type="submit">Continuar para o calendário</button>
        </form>
      )}

      {step === "calendar" && (
        <div className="chat-panel">
          <p className="chat-panel__label">DIAS DISPONÍVEIS · PRÓXIMOS 14 DIAS</p>
          <div className="calendar-days">
            {days.map((day) => (
              <button className="calendar-day" key={day.value} onClick={() => chooseDate(day.value)} type="button">
                <span>{day.weekday}</span><strong>{day.day}</strong>
              </button>
            ))}
          </div>
          <small className="chat-privacy">Domingos não são exibidos. Datas sujeitas à disponibilidade da agenda.</small>
        </div>
      )}

      {step === "time" && (
        <div className="chat-panel">
          <p className="chat-panel__label">HORÁRIOS LIVRES · {selectedDate}</p>
          {loadingSlots && <p className="chat-feedback">Consultando agenda…</p>}
          {!loadingSlots && !error && slots.length === 0 && <p className="chat-feedback">Não há horários livres nesse dia. Escolha outra data.</p>}
          {!loadingSlots && slots.length > 0 && (
            <div className="calendar-times">
              {slots.map((slot) => (
                <button className="calendar-time" key={slot.time} onClick={() => chooseTime(slot.time)} type="button">{slot.time}</button>
              ))}
            </div>
          )}
          <button className="chat-back" onClick={() => setStep("calendar")} type="button">Voltar ao calendário</button>
        </div>
      )}

      {step === "review" && service && (
        <div className="chat-panel chat-review">
          <p className="chat-panel__label">CONFIRME SEU AGENDAMENTO</p>
          <p><span>Serviço</span><strong>{service.name}</strong></p>
          <p><span>Cliente</span><strong>{name}</strong></p>
          <p><span>Data</span><strong>{formatDate(selectedDate)}</strong></p>
          <p><span>Horário</span><strong>{selectedTime}</strong></p>
          <button className="button button--gold" disabled={submitting} onClick={confirmBooking} type="button">
            {submitting ? "Confirmando na agenda…" : "Confirmar agendamento"}
          </button>
          <button className="chat-back" disabled={submitting} onClick={() => setStep("time")} type="button">Escolher outro horário</button>
        </div>
      )}

      {step === "done" && (
        <div className="chat-panel">
          <p className="chat-feedback">O assistente registrou seu horário. Em caso de dúvidas, entre em contato com a barbearia.</p>
          <Link className="button button--outline" href="/">Voltar ao início</Link>
        </div>
      )}

      {error && <p className="chat-error" role="alert">{error}</p>}
      <p className="chat-privacy">Seus dados são usados apenas para registrar este pedido. Não envie dados de cartão.</p>
    </section>
  );
}
