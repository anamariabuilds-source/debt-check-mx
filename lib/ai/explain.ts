import type { FinancingInput, FinancingResult } from "@/types/finance";
import { formatMxn } from "@/lib/finance/money";
import { z } from "zod";
import { generateGeminiJson } from "./gemini";
import { validateExplanation } from "./validate";

export interface ExplanationResponse {
  mode: "simulated" | "real";
  label: "SIMULATED AI OUTPUT" | "EXPLICACIÓN GENERADA CON IA";
  paragraphs: string[];
}

export function buildSafeFallback(input: FinancingInput, result: FinancingResult): ExplanationResponse {
  const payment = input.advertisedInstallmentCents;
  return {
    mode: "simulated",
    label: "SIMULATED AI OUTPUT",
    paragraphs: [
      payment === undefined
        ? "No conocemos la mensualidad anunciada, así que no podemos compararla con tu presupuesto o límite."
        : `La mensualidad capturada es ${formatMxn(payment)}. Esta cifra viene de tus datos; no fue calculada por IA.`,
      result.verifiedFinalTotalCents === undefined
        ? "El total final todavía es desconocido porque falta información, como las comisiones."
        : `Con los datos confirmados, el total verificable es ${formatMxn(result.verifiedFinalTotalCents)}.`,
      "La herramienta solo informa. Tú tienes la última decisión.",
    ],
  };
}

const realExplanationSchema = z.object({ paragraphs: z.array(z.string().min(1).max(500)).min(2).max(3) });

export async function explainWithFallback(input: FinancingInput, result: FinancingResult, options?: {
  consent?: boolean;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<ExplanationResponse> {
  if (!options?.consent) return buildSafeFallback(input, result);
  try {
    const facts = {
      incomePattern: input.incomePattern,
      feeKnowledge: result.feeKnowledge,
      dateKnowledge: result.dateStatus,
      budgetStatus: result.budgetStatus,
      limitStatus: result.limitStatus,
      missing: result.missing,
      warnings: result.warnings,
      hasPaymentOverlaps: result.overlaps.length > 0,
    };
    const raw = await generateGeminiJson({
      apiKey: options.apiKey,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      maxOutputTokens: 350,
      responseSchema: {
        type: "object",
        properties: { paragraphs: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 } },
        required: ["paragraphs"],
        additionalProperties: false,
      },
      parts: [{ text: `Explica estos hechos financieros ficticios en español mexicano claro. No hagas cálculos ni incluyas cifras: la interfaz las muestra aparte. No apruebes, prohíbas ni recomiendes comprar. Nunca digas simplemente "dentro de tu límite": si limitStatus es within, aclara que solo la mensualidad anunciada está por debajo del límite elegido por la persona y que eso no confirma que pueda pagar la compra. Di expresamente que los datos desconocidos siguen desconocidos, menciona comisiones y fechas si faltan, explica ingreso irregular o coincidencias si aplican y termina preservando la decisión del comprador. Hechos: ${JSON.stringify(facts)}` }],
    });
    const parsed = realExplanationSchema.safeParse(raw);
    if (!parsed.success) return buildSafeFallback(input, result);
    const text = parsed.data.paragraphs.join(" ");
    const validation = validateExplanation(text, result);
    if (!validation.valid) return buildSafeFallback(input, result);
    if (result.feeKnowledge === "UNKNOWN" && !/comision|comisiones/i.test(text)) return buildSafeFallback(input, result);
    if (result.dateStatus === "UNKNOWN" && !/fecha|fechas/i.test(text)) return buildSafeFallback(input, result);
    return { mode: "real", label: "EXPLICACIÓN GENERADA CON IA", paragraphs: parsed.data.paragraphs };
  } catch {
    return buildSafeFallback(input, result);
  }
}
