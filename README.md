# Junior Barbearia

Site responsivo da Junior Barbearia, desenvolvido com Next.js 16 (App Router), React e TypeScript. O agendamento é feito em modo chat na página `/agendar` e registra reservas na agenda persistida no Supabase.

## Agendamento

No chat, a pessoa escolhe o serviço, informa nome e telefone, seleciona uma data no calendário, escolhe um horário disponível e confirma explicitamente a reserva. A confirmação só é exibida depois que a reserva é registrada com sucesso; consultar horários não cria um agendamento.

- `GET /api/availability?serviceId=...&date=...` consulta horários livres para um serviço e uma data.
- `POST /api/booking` valida e confirma a reserva.
- O OpenAI é usado no servidor com tool calling estritamente restrito à ferramenta `criar_agendamento`. Ela só é chamada depois da confirmação e recebe apenas o serviço, a data e a hora já escolhidos; o servidor valida os dados e grava a reserva.
- O Supabase armazena os agendamentos. A migração do esquema e das regras da agenda está em `supabase/migrations/20261011000000_create_barber_appointments.sql`.

## Configuração local

Requer Node.js e npm instalados. Copie `.env.example` para `.env.local` e preencha as configurações necessárias. Não exponha chaves privadas nem as adicione ao Git.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Comandos disponíveis para validação e build:

```powershell
npm run lint
npm run build
```

### Variáveis de ambiente

As variáveis documentadas em `.env.example` são:

| Variável | Uso |
| --- | --- |
| `SUPABASE_URL` | URL do projeto Supabase, usada no servidor. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` do Supabase, mantida apenas no servidor. |
| `OPENAI_API_KEY` | Chave da API OpenAI, mantida apenas no servidor. |
| `OPENAI_BOOKING_MODEL` | Modelo usado pelo agente de agendamento (padrão: `gpt-4o-mini`). |
| `BOOKING_TIME_ZONE` | Fuso horário da agenda (padrão: `America/Sao_Paulo`). |
| `BOOKING_OPENING_TIME` | Início provisório do expediente (padrão: `09:00`). |
| `BOOKING_CLOSING_TIME` | Fim provisório do expediente (padrão: `18:00`). |
| `BOOKING_SLOT_MINUTES` | Duração provisória dos intervalos (padrão: `30` minutos). |

Os horários e intervalos são provisórios. Confirme-os com a barbearia e atualize `.env.local` antes de aceitar reservas reais.

## Segurança

- Política CSP com nonce por requisição e diretivas de segurança, configurada em `src/proxy.ts`.
- Honeypot e validação de dados no endpoint de reserva.
- Limite de reservas por telefone aplicado no banco de dados.
- Chave de idempotência para evitar duplicação de reservas em novas tentativas; a migração também impede sobreposição de horários.
- Credenciais do Supabase e da OpenAI ficam no servidor; não use prefixo `NEXT_PUBLIC_` para segredos.

## Fotos

As imagens atuais são referências de bancos de imagens, servidas localmente pelo site:

- Foto de destaque: Pexels, foto `1813272`, sob a [licença Pexels](https://www.pexels.com/license/).
- Fotos dos serviços: Unsplash (`photo-1621605815971-fbc98d665033`, `photo-1599351431202-1e0f0137899a`, `photo-1503951914875-452162b0f3f1` e `photo-1622286342621-4bd786c2447c`).

Substitua essas referências por fotos próprias da barbearia e da equipe para representar o estabelecimento com fidelidade.

## Pagamento e publicação

Não há pagamento online integrado. O projeto também não está publicado nem tem deploy configurado na Vercel; atualmente, o repositório está no GitHub.
