# Junior Barbearia

Site responsivo da Junior Barbearia, criado com Next.js App Router, React e TypeScript. A interface inclui serviços, apresentação da barbearia e um formulário que prepara uma solicitação de horário pelo WhatsApp.

## Rodar localmente

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Preencha `NEXT_PUBLIC_WHATSAPP_NUMBER` em `.env.local` com o número comercial no formato internacional, apenas dígitos (por exemplo, `5511999999999`). Não use telefone de exemplo em produção. Sem essa configuração, o site informa que o agendamento está indisponível e não simula uma confirmação.

```powershell
npm run lint
npm run build
npm start
```

## Antes de divulgar

- Confirme o telefone comercial, endereço, horários, preços e duração dos serviços.
- Os valores são deliberadamente mostrados como **Consulte** enquanto não forem confirmados pela empresa.
- A solicitação de horário abre uma conversa no WhatsApp, mas não consulta disponibilidade, salva reservas nem confirma o agendamento.
- Pagamento online não está integrado. A página orienta o cliente a confirmar as formas de pagamento com a equipe; não insira dados de cartão no site.
- Configure `NEXT_PUBLIC_SITE_URL` com o domínio definitivo para metadados Open Graph com a origem canônica.

## Segurança e privacidade

- Segredos não devem ter prefixo `NEXT_PUBLIC_` nem ser adicionados ao Git.
- O formulário não persiste dados no site. Nome, serviço, data e horário só são enviados ao WhatsApp quando a pessoa abre e envia a mensagem.
- A CSP nonce-based e os headers de segurança são configurados em `src/proxy.ts` e `next.config.ts`.
- Rate limiting, agenda persistente e pagamento hospedado devem ser implementados antes de aceitar reservas ou pagamentos automaticamente.
