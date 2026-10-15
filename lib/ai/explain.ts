import type { FinancingInput, FinancingResult } from "@/types/finance";
import { formatMxn } from "@/lib/finance/money";

export interface ExplanationResponse {
  mode: "simulated";
  label: "SIMULATED AI OUTPUT";
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

export async function explainWithFallback(input: FinancingInput, result: FinancingResult): Promise<ExplanationResponse> {
  // No existe proveedor configurado en el MVP. La calculadora nunca depende de una red externa.
  return buildSafeFallback(input, result);
}

