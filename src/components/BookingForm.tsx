"use client"

import { type FormEvent, useState } from "react"
import { services } from "@/lib/services"

function getToday() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

export default function BookingForm() {
  const [serviceId, setServiceId] = useState("")
  const [bookingLink, setBookingLink] = useState("")
  const [message, setMessage] = useState("")

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBookingLink("")
    setMessage("")

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const date = String(formData.get("date") ?? "")
    const time = String(formData.get("time") ?? "")
    const service = services.find((item) => item.id === serviceId)
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? ""

    if (!service || name.length < 2 || !date || !time) {
      setMessage("Confira os campos obrigatórios e tente novamente.")
      return
    }

    if (date < getToday()) {
      setMessage("Escolha hoje ou uma data futura.")
      return
    }

    if (!/^\d{8,15}$/.test(phoneNumber)) {
      setMessage("O canal de agendamento ainda está sendo configurado. Entre em contato com a barbearia para agendar.")
      return
    }

    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`))
    const bookingMessage = [
      "Olá! Gostaria de solicitar um horário na Junior Barbearia.",
      `Nome: ${name}`,
      `Serviço: ${service.name}`,
      `Data: ${formattedDate}`,
      `Horário preferido: ${time}`,
      "",
      "Se possível, confirme a disponibilidade e as formas de pagamento.",
    ].join("\n")
    const link = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(bookingMessage)}`
    setBookingLink(link)
    setMessage("Sua mensagem está pronta. Abra o WhatsApp para solicitar a confirmação do horário.")
  }

  return (
    <form className="booking-form" onSubmit={submitBooking}>
      <label>
        Seu nome
        <input
          autoComplete="name"
          maxLength={60}
          minLength={2}
          name="name"
          placeholder="Como podemos chamar você?"
          required
        />
      </label>

      <label>
        Serviço
        <select
          name="service"
          onChange={(event) => setServiceId(event.target.value)}
          required
          value={serviceId}
        >
          <option disabled value="">Escolha um serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {service.duration}
            </option>
          ))}
        </select>
      </label>

      <div className="booking-form__row">
        <label>
          Dia preferido
          <input name="date" required type="date" />
        </label>
        <label>
          Horário preferido
          <input name="time" required type="time" />
        </label>
      </div>

      <button className="button button--gold booking-form__submit" type="submit">
        Solicitar horário <span aria-hidden="true">↗</span>
      </button>

      <p className="booking-form__privacy">
        Seus dados só serão usados para preparar a mensagem. Nenhum dado de pagamento é solicitado ou armazenado aqui.
      </p>
      <p aria-live="polite" className="booking-form__message" role="status">
        {message}
      </p>
      {bookingLink && (
        <a className="button button--outline booking-form__fallback" href={bookingLink} rel="noopener noreferrer" target="_blank">
          Continuar para o WhatsApp
        </a>
      )}
    </form>
  )
}
