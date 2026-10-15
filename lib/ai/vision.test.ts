import { describe, expect, it, vi } from "vitest";
import { detectImageMime, extractOfferFromImage, MAX_IMAGE_BYTES, visionExtractionSchema } from "./vision";
import { buildVisionProposal } from "./vision-proposal";

function providerFetch(payload: unknown): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } })) as typeof fetch;
}
const png = new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a, ...Array(16).fill(0)]);
const valid = { purchasePrice: 3600, installmentCount: 6, advertisedInstallment: 600, knownFees: null, feeStatus: "UNKNOWN", dueDates: [], uncertainFields: ["knownFees", "dueDates"] } as const;

describe("visión de oferta ficticia", () => {
  it("acepta PNG real por firma y extrae términos estructurados", async () => {
    expect(detectImageMime(png)).toBe("image/png");
    expect(await extractOfferFromImage(png, "image/png", { apiKey: "test", fetchImpl: providerFetch(valid) })).toMatchObject({ purchasePrice: 3600, installmentCount: 6 });
  });
  it("rechaza formato identificado solo por etiqueta", () => expect(detectImageMime(new TextEncoder().encode("not an image"))).toBeUndefined());
  it("mantiene un límite conservador de 2 MB", () => expect(MAX_IMAGE_BYTES).toBe(2 * 1024 * 1024));
  it("comisiones ausentes permanecen UNKNOWN y null", () => expect(visionExtractionSchema.parse(valid)).toMatchObject({ feeStatus: "UNKNOWN", knownFees: null }));
  it("fechas ausentes permanecen vacías", () => expect(visionExtractionSchema.parse(valid).dueDates).toEqual([]));
  it("texto ambiguo permanece marcado como no verificado", () => expect(visionExtractionSchema.parse(valid).uncertainFields).toContain("knownFees"));
  it("solo transfiere valores seleccionados tras confirmación", () => {
    const proposal = buildVisionProposal(visionExtractionSchema.parse(valid), { price: "3600", count: "6", installment: "600", fees: "", paymentDates: "" }, { price: true, count: false, installment: true, fees: false, paymentDates: false });
    expect(proposal).toEqual({ price: "3600", installment: "600" });
  });
  it("rechazar equivale a no construir ni aplicar propuesta", () => expect(buildVisionProposal(visionExtractionSchema.parse(valid), { price: "3600", count: "6", installment: "600", fees: "", paymentDates: "" }, { price: false, count: false, installment: false, fees: false, paymentDates: false })).toEqual({}));
  it("una falla de proveedor se propaga para mantener captura manual", async () => {
    const fetchImpl = vi.fn(async () => new Response("fail", { status: 500 })) as typeof fetch;
    await expect(extractOfferFromImage(png, "image/png", { apiKey: "test", fetchImpl })).rejects.toThrow();
  });
  it("rechaza una respuesta malformada", async () => {
    await expect(extractOfferFromImage(png, "image/png", { apiKey: "test", fetchImpl: providerFetch({ purchasePrice: "3600" }) })).rejects.toThrow();
  });
});
