import { NextResponse } from "next/server";
import { calculateFinancing } from "@/lib/finance/calculate";
import { buildSafeFallback, explainWithFallback } from "@/lib/ai/explain";
import { explanationRequestSchema } from "@/lib/validation/finance";
import { hasDemoAccess, takeRateLimit } from "@/lib/ai/access";

const MAX_BODY_BYTES = 16_384;

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
    }
    const parsed = explanationRequestSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    const result = calculateFinancing(parsed.data.input);
    const access = hasDemoAccess(request.headers.get("x-demo-access-token"));
    const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const canCallProvider = parsed.data.consent && access && takeRateLimit(`explain:${source}`);
    const explanation = canCallProvider
      ? await explainWithFallback(parsed.data.input, result, { consent: true })
      : buildSafeFallback(parsed.data.input, result);
    return NextResponse.json({ explanation, result, externalProcessing: explanation.mode === "real" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No pudimos generar la explicación. La calculadora sigue disponible." }, { status: 400 });
  }
}
