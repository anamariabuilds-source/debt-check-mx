import type { FinancingResult } from "@/types/finance";

export interface ExplanationValidation {
  valid: boolean;
  reason?: string;
}

function numbersIn(text: string): string[] {
  return text.match(/(?:\$\s*)?\d[\d,.]*/g) ?? [];
}

function normalizeNumber(value: string): number | undefined {
  const numeric = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(numeric) ? numeric : undefined;
}

export function validateExplanation(text: string, result: FinancingResult): ExplanationValidation {
  if (text.length > 2_000) return { valid: false, reason: "La explicación excede el límite." };
  const allowed = new Set<number>();
  result.facts.forEach((fact) => numbersIn(fact.value).forEach((raw) => {
    const parsed = normalizeNumber(raw);
    if (parsed !== undefined) allowed.add(parsed);
  }));
  if (result.reconciliationDifferenceCents !== undefined) allowed.add(Math.abs(result.reconciliationDifferenceCents) / 100);
  for (const raw of numbersIn(text)) {
    const parsed = normalizeNumber(raw);
    if (parsed !== undefined && !allowed.has(parsed)) return { valid: false, reason: `Número no respaldado: ${raw}` };
  }
  const forbidden = [/te conviene/i, /debes comprar/i, /aprob(?:ado|ada)/i, /garantiz/i, /sin riesgo/i];
  if (forbidden.some((pattern) => pattern.test(text))) return { valid: false, reason: "Afirmación no permitida." };
  return { valid: true };
}

