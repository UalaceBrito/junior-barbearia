import Image from "next/image"
import Link from "next/link"
import { services } from "@/lib/services"

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 42 42">
      <path d="M8 7h26v28H8z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M15 28V14h4.5c3.5 0 5.5 1.8 5.5 4.8s-2 4.8-5.5 4.8H15m9-1 4 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#principal">Pular para o conteúdo</a>
      <header className="site-header">
        <div className="container site-header__inner">
          <a aria-label="Junior Barbearia, início" className="brand" href="#inicio">
            <Mark className="brand__mark" />
            <span className="brand__name">JUNIOR<span>BARBEARIA</span></span>
          </a>
          <nav aria-label="Navegação principal" className="main-nav">
            <a href="#servicos">Serviços</a>
            <a href="#experiencia">A barbearia</a>
            <a href="#agendamento">Agendamento</a>
          </nav>
          <Link className="button button--small button--outline header-cta" href="/agendar">
            Marcar horário
          </Link>
        </div>
      </header>

      <main id="principal">
        <section aria-labelledby="hero-title" className="hero" id="inicio">
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow"><span className="eyebrow__line" /> BARBEARIA · ESTILO · PRESENÇA</p>
              <h1 id="hero-title">Seu estilo.<br />Sua <span>assinatura.</span></h1>
              <p className="hero__description">
                Mais do que um corte: um momento seu, com atenção aos detalhes e respeito à sua identidade.
              </p>
              <div className="hero__actions">
                <Link className="button button--gold" href="/agendar"                >Agende seu horário</Link>
                                <a className="text-link" href="#servicos">Conheça os serviços</a>
              </div>
              <div className="hero__proof">
                <span className="proof-mark" aria-hidden="true">JB</span>
                <p><strong>Tradição no cuidado.</strong><br />Detalhe em cada acabamento.</p>
              </div>
            </div>

            <div className="hero-art">
              <div className="hero-art__frame">
                <Image
                  alt="Interior de barbearia com cadeiras profissionais e barbeiros atendendo clientes"
                  className="hero-art__photo"
                  height={760}
                  priority
                  sizes="(max-width: 680px) calc(100vw - 50px), (max-width: 980px) 44vw, 480px"
                  src="/images/hero-barbershop.jpg"
                  width={1000}
                />
                <div aria-hidden="true" className="hero-art__shade" />
                <div className="hero-art__caption"><span>JUNIOR BARBEARIA</span><span>O cuidado começa no detalhe</span></div>
              </div>
              <span className="hero-art__stamp">DESDE<br /><strong>JB</strong></span>
            </div>
          </div>
          <a className="hero__scroll" href="#servicos"><span /> Role para descobrir</a>
        </section>

        <section aria-labelledby="services-title" className="section services" id="servicos">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow"><span className="eyebrow__line" /> NOSSO MENU</p>
                <h2 id="services-title">Cuidado que <span>se nota.</span></h2>
              </div>
              <p className="section-heading__aside">Técnica, conversa e um acabamento feito sem pressa.</p>
            </div>
            <ul className="service-grid">
              {services.map((service, index) => (
                <li className="service-card" key={service.id}>
                  <span className="service-card__index">0{index + 1}</span>
                  <Image
                    alt={service.imageAlt}
                    className="service-card__image"
                    src={service.image}
                    width={1100}
                    height={760}
                    sizes="(max-width: 680px) calc(100vw - 40px), (max-width: 980px) calc((100vw - 60px) / 2), (max-width: 1280px) calc((100vw - 112px) / 4), 280px"
                  />
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-card__meta">
                    <span>{service.duration}</span>
                    <span>{service.priceLabel}</span>
                  </div>
                  <Link aria-label={`Agendar ${service.name}`} className="service-card__link" href={`/agendar?servico=${service.id}`}>
                    Escolher serviço
                  </Link>
                </li>
              ))}
            </ul>
            <p className="service-note">Valores e duração são confirmados pela equipe ao solicitar seu horário.</p>
          </div>
        </section>

        <section aria-labelledby="experience-title" className="experience" id="experiencia">
          <div className="container experience__grid">
            <div className="experience__visual">
              <div className="experience__visual-inner">
                <span className="experience__vertical">JUNIOR BARBEARIA · DESDE O PRIMEIRO CORTE</span>
                <div className="experience__visual-copy">
                  <span>RESPEITO</span><span>À SUA</span><strong>ESSÊNCIA.</strong>
                </div>
                <span className="experience__visual-number">JB — 01</span>
              </div>
            </div>
            <div className="experience__copy">
              <p className="eyebrow"><span className="eyebrow__line" /> UM TEMPO PARA VOCÊ</p>
              <h2 id="experience-title">O clássico nunca sai de <span>estilo.</span></h2>
              <p>
                Na Junior Barbearia, cada atendimento começa com uma conversa. Entendemos o que você procura,
                cuidamos de cada detalhe e finalizamos com o capricho que faz diferença.
              </p>
              <p>
                Um espaço para desacelerar, renovar o visual e sair se sentindo você — na sua melhor versão.
              </p>
              <Link className="text-link text-link--light" href="/agendar">Venha conhecer</Link>
              <ul className="experience__values">
                <li><strong>01</strong><span>Escuta de verdade</span></li>
                <li><strong>02</strong><span>Técnica cuidadosa</span></li>
                <li><strong>03</strong><span>Seu estilo em primeiro lugar</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="booking-title" className="section booking" id="agendamento">
          <div className="container booking__grid">
            <div className="booking__copy">
              <p className="eyebrow"><span className="eyebrow__line" /> SEU PRÓXIMO HORÁRIO</p>
              <h2 id="booking-title">O próximo passo é <span>seu.</span></h2>
              <p>Converse com nosso assistente, consulte os horários disponíveis e confirme seu agendamento.</p>
              <div className="booking__details">
                <div><p><strong>Sem espera</strong><br />Atendimento com horário combinado.</p></div>
                <div><p><strong>Pagamento com tranquilidade</strong><br />Consulte as opções disponíveis ao confirmar com a equipe.</p></div>
                <div><p><strong>Horários de atendimento</strong><br />Consulte a disponibilidade atual com a equipe.</p></div>
                <div><p><strong>Endereço</strong><br />A localização será informada pela barbearia ao confirmar.</p></div>
              </div>
            </div>
            <div className="booking-panel booking-panel--callout">
              <div className="booking-panel__heading">
                <div><span className="eyebrow">RESERVA ONLINE</span><h3>Encontre seu próximo horário</h3></div>
                <span aria-hidden="true" className="booking-panel__step">JB</span>
              </div>
              <p className="booking-panel__notice">Escolha o serviço, o dia e um horário livre. Sua reserva só é confirmada quando registrada na agenda.</p>
              <Link className="button button--gold booking-panel__cta" href="/agendar">Começar agendamento</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__top">
          <a aria-label="Junior Barbearia, início" className="brand brand--footer" href="#inicio">
            <Mark className="brand__mark" />
            <span className="brand__name">JUNIOR<span>BARBEARIA</span></span>
          </a>
          <p>Seu estilo, com presença.<br />Seu momento, com cuidado.</p>
          <Link className="button button--gold button--small" href="/agendar">Marcar horário</Link>
        </div>
        <div className="container site-footer__bottom">
          <span>© Junior Barbearia. Todos os direitos reservados.</span>
          <span>Estilo é pessoal. O cuidado também.</span>
        </div>
      </footer>
    </>
  )
}
