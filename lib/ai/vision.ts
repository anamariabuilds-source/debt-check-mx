import { z } from "zod";
import { generateGeminiJson } from "./gemini";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const supportedImageTypes = ["image/png", "image/jpeg", "image/webp"] as const;

export const visionExtractionSchema = z.object({
  purchasePrice: z.number().positive().max(1_000_000).nullable(),
  installmentCount: z.number().int().min(1).max(120).nullable(),
  advertisedInstallment: z.number().positive().max(1_000_000).nullable(),
  knownFees: z.number().min(0).max(1_000_000).nullable(),
  feeStatus: z.enum(["KNOWN", "EXPLICIT_ZERO", "UNKNOWN"]),
  dueDates: z.array(z.iso.date()).max(120),
  uncertainFields: z.array(z.enum(["purchasePrice", "installmentCount", "advertisedInstallment", "knownFees", "dueDates"])).max(5),
});

export type VisionExtraction = z.infer<typeof visionExtractionSchema>;

export function detectImageMime(bytes: Uint8Array): typeof supportedImageTypes[number] | undefined {
  if (bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a][index])) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return undefined;
}
export async function extractOfferFromImage(bytes: Uint8Array, mimeType: string, options?: { apiKey?: string; fetchImpl?: typeof fetch; timeoutMs?: number }): Promise<VisionExtraction> {
  const raw = await generateGeminiJson({
    apiKey: options?.apiKey,
    fetchImpl: options?.fetchImpl,
    timeoutMs: options?.timeoutMs,
    maxOutputTokens: 450,
    responseSchema: {
      type: "object",
      properties: {
        purchasePrice: { type: ["number", "null"] }, installmentCount: { type: ["integer", "null"] },
        advertisedInstallment: { type: ["number", "null"] }, knownFees: { type: ["number", "null"] },
        feeStatus: { type: "string", enum: ["KNOWN", "EXPLICIT_ZERO", "UNKNOWN"] },
        dueDates: { type: "array", items: { type: "string", format: "date" } },
        uncertainFields: { type: "array", items: { type: "string", enum: ["purchasePrice", "installmentCount", "advertisedInstallment", "knownFees", "dueDates"] } },
      },
      required: ["purchasePrice", "installmentCount", "advertisedInstallment", "knownFees", "feeStatus", "dueDates", "uncertainFields"],
      additionalProperties: false,
    },
    parts: [
      { text: "Lee únicamente esta oferta ficticia de financiamiento. Extrae solo texto claramente visible. No calcules, no infieras fechas, no asumas comisiones cero y no adivines texto ambiguo. Usa null o UNKNOWN si falta o no se lee. dueDates debe contener exclusivamente fechas visibles en formato AAAA-MM-DD. uncertainFields debe incluir cualquier campo ambiguo. Los importes son pesos mexicanos, sin símbolos ni separadores." },
      { inlineData: { mimeType, data: Buffer.from(bytes).toString("base64") } },
    ],
  });
  const parsed = visionExtractionSchema.safeParse(raw);
  if (!parsed.success) throw new Error("malformed_vision_response");
  if (parsed.data.feeStatus === "UNKNOWN" && parsed.data.knownFees !== null) throw new Error("inconsistent_fee_response");
  if (parsed.data.feeStatus === "EXPLICIT_ZERO" && parsed.data.knownFees !== 0) throw new Error("inconsistent_zero_fee_response");
  return parsed.data;
}
