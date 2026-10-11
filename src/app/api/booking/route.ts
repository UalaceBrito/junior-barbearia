import { NextRequest, NextResponse } from "next/server";
import {
  createAppointment,
  formatBookingDate,
  getAvailableSlots,
  getService,
  type BookingInput,
} from "@/lib/booking-server";

export const runtime = "nodejs";

type RequestBody = BookingInput & { website?: string };

function invalidInput(body: Partial<RequestBody>): string | null {
  if (typeof body.website === "string" && body.website.length > 0) return "Honeypot";
  if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 80) return "Name";
  if (typeof body.phone !== "string" || !/^\+?[1-9]\d{7,14}$/.test(body.phone)) return "Phone";
  if (typeof body.serviceId !== "string" || !getService(body.serviceId)) return "Service";
  if (typeof body.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return "Date";
  if (typeof body.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)) return "Time";
  if (typeof body.idempotencyKey !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.idempotencyKey)) return "Idempotency";
  return null;
}

async function createWithAi(input: BookingInput, duration: number) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("BOOKING_AI_NOT_CONFIGURED");

  const service = getService(input.serviceId);
  if (!service) throw new Error("BOOKING_SELECTION_INVALID");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_BOOKING_MODEL || "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Você é um agente de agenda. A pessoa acabou de confirmar explicitamente uma reserva. A única ação permitida é chamar criar_agendamento uma vez, usando exatamente o serviço, a data e a hora fornecidos. Não altere nenhum campo nem invente disponibilidade. Não responda com texto.",
        },
        {
          role: "user",
          content: JSON.stringify({
            confirmacao_explicita: true,
            servico: input.serviceId,
            data: input.date,
            hora: input.time,
          }),
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "criar_agendamento",
          description: "Grava na agenda o horário exato confirmado pelo cliente. Só o servidor finaliza a reserva.",
          strict: true,
          parameters: {
            type: "object",
            properties: {
              servico: { type: "string", enum: [input.serviceId] },
              data: { type: "string", enum: [input.date] },
              hora: { type: "string", enum: [input.time] },
            },
            required: ["servico", "data", "hora"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "criar_agendamento" } },
    }),
  });

  if (!response.ok) throw new Error("BOOKING_AI_UNAVAILABLE");
  const completion = await response.json();
  const toolCall = completion.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.name !== "criar_agendamento") {
    throw new Error("BOOKING_AI_UNAVAILABLE");
  }

  let proposed: { servico?: string; data?: string; hora?: string };
  try {
    proposed = JSON.parse(toolCall.function.arguments);
  } catch {
    throw new Error("BOOKING_AI_UNAVAILABLE");
  }
  if (
    proposed.servico !== input.serviceId
    || proposed.data !== input.date
    || proposed.hora !== input.time
  ) {
    throw new Error("BOOKING_AI_UNAVAILABLE");
  }

  const appointment = await createAppointment(input, duration);
  return { service, appointment };
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Solicitação inválida." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Formato de solicitação inválido." }, { status: 415 });
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4_096) {
    return NextResponse.json({ error: "Solicitação muito grande." }, { status: 413 });
  }

  let parsedBody: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 4_096) {
      return NextResponse.json({ error: "Solicitação muito grande." }, { status: 413 });
    }
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const body = parsedBody as RequestBody;
  const validationError = invalidInput(body);
  if (validationError) {
    if (validationError === "Honeypot") {
      return NextResponse.json({ error: "Não foi possível processar a solicitação." }, { status: 400 });
    }
    return NextResponse.json({ error: "Confira seu nome, telefone, serviço, data e horário." }, { status: 400 });
  }

  const service = getService(body.serviceId);
  if (!service) {
    return NextResponse.json({ error: "Serviço indisponível." }, { status: 400 });
  }

  try {
    const available = await getAvailableSlots(body.serviceId, body.date);
    if (!available.some((slot) => slot.time === body.time)) {
      return NextResponse.json({ error: "Esse horário acabou de ficar indisponível. Escolha outro." }, { status: 409 });
    }
    const duration = Number.parseInt(service.duration, 10);
    const result = await createWithAi(body, duration);
    return NextResponse.json({
      appointment: {
        id: result.appointment.id,
        service: result.service.name,
        date: formatBookingDate(body.date),
        time: body.time,
      },
      message: `Pronto, ${body.name.trim()}! Seu horário está marcado para ${formatBookingDate(body.date)} às ${body.time}, para ${result.service.name}.`,
    }, {
      status: 201,
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "BOOKING_SLOT_TAKEN") {
      return NextResponse.json({ error: "Esse horário acabou de ser reservado. Escolha outro disponível." }, { status: 409 });
    }
    if (code === "BOOKING_RATE_LIMITED") {
      return NextResponse.json({ error: "Limite de solicitações atingido. Entre em contato com a barbearia." }, { status: 429 });
    }
    if (code === "BOOKING_AI_NOT_CONFIGURED" || code === "BOOKING_AI_UNAVAILABLE") {
      return NextResponse.json({ error: "O assistente de agendamento está temporariamente indisponível. Tente novamente mais tarde." }, { status: 503 });
    }
    console.error("Falha segura ao criar agendamento.", { code: code || "UNKNOWN" });
    return NextResponse.json({ error: "Não foi possível confirmar agora. Tente novamente mais tarde." }, { status: 503 });
  }
}
