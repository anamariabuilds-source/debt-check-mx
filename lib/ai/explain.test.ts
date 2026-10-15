import { describe, expect, it, vi } from "vitest";
import { calculateFinancing } from "@/lib/finance/calculate";
import { explainWithFallback } from "./explain";
import type { FinancingInput } from "@/types/finance";

const input: FinancingInput = { purchasePriceCents: 360_000, installmentCount: 6, advertisedInstallmentCents: 60_000, feeStatus: "unknown", availableBudgetCents: 80_000, incomePattern: "regular", obligations: [], obligationsComplete: false };
const result = calculateFinancing(input);

function providerFetch(payload: unknown): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } })) as typeof fetch;
}

describe("explicación Gemini con fallback", () => {
  it("sin consentimiento no hace solicitud externa", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const response = await explainWithFallback(input, result, { consent: false, apiKey: "test", fetchImpl });
    expect(fetchImpl).not.toHaveBeenCalled(); expect(response.mode).toBe("simulated");
  });
  it("sin API key conserva fallback rotulado", async () => {
    const response = await explainWithFallback(input, result, { consent: true, apiKey: "" });
    expect(response).toMatchObject({ mode: "simulated", label: "SIMULATED AI OUTPUT" });
  });
  it("acepta una respuesta real segura", async () => {
    const response = await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl: providerFetch({ paragraphs: ["Las comisiones siguen desconocidas y no deben suponerse en cero.", "Las fechas también son desconocidas; tú decides después de revisar la información."] }) });
    expect(response).toMatchObject({ mode: "real", label: "EXPLICACIÓN GENERADA CON IA" });
  });
  it("una falla del modelo vuelve al fallback", async () => {
    const fetchImpl = vi.fn(async () => new Response("error", { status: 500 })) as typeof fetch;
    expect((await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl })).mode).toBe("simulated");
  });
  it("un timeout vuelve al fallback", async () => {
    const fetchImpl = vi.fn((_url, init) => new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))))) as typeof fetch;
    expect((await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl, timeoutMs: 1 })).mode).toBe("simulated");
  });
  it("rechaza una cifra no respaldada", async () => {
    const response = await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl: providerFetch({ paragraphs: ["Las comisiones desconocidas serán 999 pesos.", "Las fechas son desconocidas y tú decides."] }) });
    expect(response.mode).toBe("simulated");
  });
  it("exige preservar comisiones desconocidas", async () => {
    const response = await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl: providerFetch({ paragraphs: ["El costo requiere revisión.", "Las fechas son desconocidas y tú decides."] }) });
    expect(response.mode).toBe("simulated");
  });
  it("exige preservar fechas desconocidas", async () => {
    const response = await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl: providerFetch({ paragraphs: ["Las comisiones siguen desconocidas.", "Tú decides después de revisar."] }) });
    expect(response.mode).toBe("simulated");
  });
  it("rechaza lenguaje que aprueba la compra", async () => {
    const response = await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl: providerFetch({ paragraphs: ["Las comisiones y fechas son desconocidas.", "La compra está aprobada."] }) });
    expect(response.mode).toBe("simulated");
  });
  it("rechaza confirmaciones ambiguas de estar dentro del límite", async () => {
    const response = await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl: providerFetch({ paragraphs: ["Las comisiones y fechas son desconocidas.", "Estás dentro de tu límite y tú decides."] }) });
    expect(response.mode).toBe("simulated");
  });
  it("distingue de forma visible etiquetas real y simulada", async () => {
    const simulated = await explainWithFallback(input, result, { consent: false });
    const real = await explainWithFallback(input, result, { consent: true, apiKey: "test", fetchImpl: providerFetch({ paragraphs: ["Las comisiones siguen desconocidas.", "Las fechas son desconocidas y tú conservas la decisión."] }) });
    expect(simulated.label).toBe("SIMULATED AI OUTPUT");
    expect(real.label).toBe("EXPLICACIÓN GENERADA CON IA");
  });
});
