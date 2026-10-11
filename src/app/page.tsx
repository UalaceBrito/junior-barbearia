import BookingForm from "@/components/BookingForm"
import { services } from "@/lib/services"

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 42 42">
      <path d="M8 7h26v28H8z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M15 28V14h4.5c3.5 0 5.5 1.8 5.5 4.8s-2 4.8-5.5 4.8H15m9-1 4 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function Arrow() {
  return <span aria-hidden="true">↗</span>
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
          <a className="button button--small button--outline header-cta" href="#agendamento">
            Marcar horário <Arrow />
          </a>
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
                <a className="button button--gold" href="#agendamento">Agende seu horário <Arrow /></a>
                <a className="text-link" href="#servicos">Conheça os serviços <span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero__proof">
                <span className="proof-mark" aria-hidden="true">JB</span>
                <p><strong>Tradição no cuidado.</strong><br />Detalhe em cada acabamento.</p>
              </div>
            </div>

            <div aria-label="Ilustração artística de cadeira clássica de barbearia" className="hero-art" role="img">
              <div className="hero-art__frame">
                <div className="hero-art__sun" />
                <svg className="hero-art__chair" fill="none" viewBox="0 0 440 500">
                  <path d="M158 103c0-20 16-36 36-36h74c20 0 36 16 36 36v115H158V103Z" fill="#46352A" stroke="#B88751" strokeWidth="3" />
                  <path d="M158 218h146l27 57H131l27-57Z" fill="#6C4D36" stroke="#B88751" strokeWidth="3" />
                  <path d="M146 275h170l-18 100H164l-18-100Z" fill="#3A2B23" stroke="#B88751" strokeWidth="3" />
                  <path d="m164 375-31 77m165-77 30 77m-164-77 2 77m128-77-1 77M108 452h63m133 0h62" stroke="#B88751" strokeLinecap="round" strokeWidth="7" />
                  <path d="M187 103h93M180 237h102M178 297h105" stroke="#CB9D68" strokeLinecap="round" strokeWidth="2" opacity=".72" />
                  <path d="M211 67V34h42v33" stroke="#B88751" strokeWidth="3" />
                  <circle cx="232" cy="26" r="12" fill="#B88751" />
                </svg>
                <div className="hero-art__caption"><span>01 / 04</span><span>O cuidado começa no detalhe</span></div>
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
                  <div className="service-card__icon" aria-hidden="true">
                    {index === 0 ? "✳" : index === 1 ? "⌁" : index === 2 ? "✦" : "⌖"}
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-card__meta">
                    <span>{service.duration}</span>
                    <span>{service.priceLabel}</span>
                  </div>
                  <a aria-label={`Agendar ${service.name}`} className="service-card__link" href="#agendamento">
                    Escolher serviço <Arrow />
                  </a>
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
                <Mark className="experience__mark" />
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
              <a className="text-link text-link--light" href="#agendamento">Venha conhecer <Arrow /></a>
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
              <p>Escolha o serviço, indique um dia e horário. A equipe confirma a disponibilidade diretamente com você.</p>
              <div className="booking__details">
                <div><span className="detail-icon" aria-hidden="true">◷</span><p><strong>Sem espera</strong><br />Atendimento com horário combinado.</p></div>
                <div><span className="detail-icon" aria-hidden="true">◇</span><p><strong>Pagamento com tranquilidade</strong><br />Consulte as opções disponíveis ao confirmar com a equipe.</p></div>
                <div><span className="detail-icon" aria-hidden="true">⌖</span><p><strong>Endereço</strong><br />A localização será informada pela barbearia ao confirmar.</p></div>
              </div>
            </div>
            <div className="booking-panel">
              <div className="booking-panel__heading">
                <div><span className="eyebrow">RESERVA</span><h3>Solicite seu horário</h3></div>
                <span aria-hidden="true" className="booking-panel__step">01 — 04</span>
              </div>
              <BookingForm />
              <p className="booking-panel__notice">A solicitação não confirma automaticamente um horário. Aguarde a resposta da equipe.</p>
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
          <a className="button button--gold button--small" href="#agendamento">Marcar horário <Arrow /></a>
        </div>
        <div className="container site-footer__bottom">
          <span>© Junior Barbearia. Todos os direitos reservados.</span>
          <span>Estilo é pessoal. O cuidado também.</span>
        </div>
      </footer>
    </>
  )
}
