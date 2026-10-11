import Link from "next/link";
import BookingChat from "@/components/BookingChat";
import { services } from "@/lib/services";

export const metadata = {
  title: "Agendamento",
  description: "Escolha o serviço e encontre um horário livre na Junior Barbearia.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  const { servico = "" } = await searchParams;
  const initialServiceId = services.some((service) => service.id === servico) ? servico : "";

  return (
    <main className="booking-page">
      <div className="booking-page__top">
        <Link aria-label="Voltar para a Junior Barbearia" className="booking-page__brand" href="/">
          <span aria-hidden="true">JB</span> Junior Barbearia
        </Link>
        <Link className="booking-page__back" href="/">Voltar ao início</Link>
      </div>
      <section aria-labelledby="booking-page-title" className="booking-page__content">
        <p className="eyebrow"><span className="eyebrow__line" /> RESERVA ONLINE</p>
        <h1 id="booking-page-title">Seu próximo momento começa <span>aqui.</span></h1>
        <p className="booking-page__intro">
          Converse com nosso assistente, escolha um horário livre e confirme seu agendamento.
        </p>
        <BookingChat initialServiceId={initialServiceId} />
      </section>
    </main>
  );
}
