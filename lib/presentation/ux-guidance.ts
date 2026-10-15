import { formatMxn } from "@/lib/finance/money";
import type { FinancingInput } from "@/types/finance";

export const BUDGET_GUIDANCE = "Tu estimación de lo que queda después de gastos esenciales y compromisos ya descontados. No restes dos veces la misma obligación. Si tu ingreso varía, este monto es una estimación, no una disponibilidad mensual garantizada.";

export const DEMO_ACCESS_GUIDANCE = "Este código lo proporciona quien supervisa la demostración. No es tu contraseña ni tu clave de Gemini.";

export const PRIVACY_GUIDANCE = "La calculadora manual funciona localmente. Solo con tu consentimiento, las funciones opcionales de Gemini envían datos ficticios estructurados o una imagen ficticia a un proveedor externo. La herramienta nunca toma la decisión de compra.";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return date;
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(parsed);
}

export interface ObligationContext {
  knownGroups: string[];
  newInstallmentOverlapUnknown: boolean;
}

export function getObligationContext(input: FinancingInput): ObligationContext {
  const byDate = new Map<string, typeof input.obligations>();
  input.obligations.forEach((obligation) => {
    if (!obligation.dueDate) return;
    byDate.set(obligation.dueDate, [...(byDate.get(obligation.dueDate) ?? []), obligation]);
  });

  const knownGroups = [...byDate.entries()]
    .filter(([, obligations]) => obligations.length > 1)
    .map(([date, obligations]) => {
      const total = obligations.reduce((sum, obligation) => sum + obligation.amountCents, 0);
      return `Las ${obligations.length} obligaciones registradas suman ${formatMxn(total)} el ${formatDate(date)}.`;
    });

  return {
    knownGroups,
    newInstallmentOverlapUnknown: Boolean(knownGroups.length && !input.dueDates?.length),
  };
}

export const NEXT_INFORMATION_TO_CONFIRM = [
  "Las comisiones o cargos reales del financiamiento.",
  "Las fechas exactas de las mensualidades.",
  "Qué compromisos ya están incluidos en tu presupuesto y sus montos.",
  "Si tu presupuesto estimado sigue siendo realista en meses de menor ingreso.",
] as const;
