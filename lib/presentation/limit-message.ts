import type { FinancingResult } from "@/types/finance";

export interface LimitMessage {
  tone: "neutral" | "warning" | "positive";
  title: string;
  detail: string;
  hasMaterialUnknowns: boolean;
}

export function hasMaterialUnknowns(result: FinancingResult): boolean {
  return result.feeKnowledge === "UNKNOWN"
    || result.dateStatus === "UNKNOWN"
    || result.budgetStatus === "unknown"
    || result.missing.length > 0;
}

export function getLimitMessage(result: FinancingResult): LimitMessage | undefined {
  if (result.limitStatus === "not_set") return undefined;
  const unknowns = hasMaterialUnknowns(result);
  if (result.limitStatus === "unknown") return { tone: "warning", title: "No se puede comparar la cuota con tu límite", detail: "Falta la mensualidad anunciada. Tu límite sigue siendo opcional y editable.", hasMaterialUnknowns: true };
  if (result.limitStatus === "exceeds") return { tone: "warning", title: "La cuota anunciada supera tu límite autoelegido", detail: "Esta comparación no aprueba ni prohíbe la compra. Puedes cambiar o eliminar tu límite.", hasMaterialUnknowns: unknowns };
  if (unknowns) return { tone: "neutral", title: "La cuota anunciada está debajo de tu límite autoelegido", detail: "Esto solo compara dos cantidades. No significa que la compra sea asequible: aún faltan comisiones, fechas u otra información importante.", hasMaterialUnknowns: true };
  return { tone: "positive", title: "La cuota anunciada está debajo de tu límite autoelegido", detail: "Esto solo compara dos cantidades y no aprueba la compra. Puedes cambiar o eliminar tu límite.", hasMaterialUnknowns: false };
}

