import { NextResponse } from "next/server";
import { hasDemoAccess, takeRateLimit } from "@/lib/ai/access";
import { detectImageMime, extractOfferFromImage, MAX_IMAGE_BYTES } from "@/lib/ai/vision";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_IMAGE_BYTES + 16_384) return NextResponse.json({ error: "La imagen supera el límite de 2 MB." }, { status: 413 });
  try {
    const form = await request.formData();
    if (form.get("consent") !== "true") return NextResponse.json({ error: "Necesitamos tu consentimiento explícito para el procesamiento externo." }, { status: 400 });
    if (!hasDemoAccess(request.headers.get("x-demo-access-token"))) return NextResponse.json({ error: "La función de IA está disponible solo en la demostración supervisada." }, { status: 403 });
    const source = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!takeRateLimit(`vision:${source}`)) return NextResponse.json({ error: "Se alcanzó el límite temporal de lecturas con IA." }, { status: 429 });
    const image = form.get("image");
    if (!(image instanceof File)) return NextResponse.json({ error: "Selecciona una imagen ficticia." }, { status: 400 });
    if (image.size < 16 || image.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "La imagen debe pesar menos de 2 MB." }, { status: 413 });
    const bytes = new Uint8Array(await image.arrayBuffer());
    const detectedMime = detectImageMime(bytes);
    if (!detectedMime) return NextResponse.json({ error: "Formato no compatible. Usa PNG, JPEG o WebP." }, { status: 415 });
    const extraction = await extractOfferFromImage(bytes, detectedMime);
    return NextResponse.json({ extraction, mode: "real", label: "EXTRACCIÓN GENERADA CON IA", verified: false }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No pudimos leer la imagen. Puedes continuar con la captura manual." }, { status: 502 });
  }
}
