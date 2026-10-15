import { NextResponse } from "next/server";
import { calculateFinancing } from "@/lib/finance/calculate";
import { explainWithFallback } from "@/lib/ai/explain";
import { financingInputSchema } from "@/lib/validation/finance";

const MAX_BODY_BYTES = 16_384;

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
    }
    const parsed = financingInputSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    const result = calculateFinancing(parsed.data);
    const explanation = await explainWithFallback(parsed.data, result);
    return NextResponse.json({ explanation, result }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No pudimos generar la explicación. La calculadora sigue disponible." }, { status: 400 });
  }
}

