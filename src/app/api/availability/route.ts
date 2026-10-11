import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, getService } from "@/lib/booking-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId") ?? "";
  const date = request.nextUrl.searchParams.get("date") ?? "";

  if (!getService(serviceId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Escolha um serviço e uma data válidos." }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(serviceId, date);
    return NextResponse.json({ slots }, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "BOOKING_SELECTION_INVALID") {
      return NextResponse.json({ error: "Essa data não está disponível para agendamento." }, { status: 400 });
    }
    console.error("Falha ao consultar disponibilidade de agendamentos.");
    return NextResponse.json(
      { error: "Não foi possível carregar a agenda agora. Tente novamente em instantes." },
      { status: 503 },
    );
  }
}
