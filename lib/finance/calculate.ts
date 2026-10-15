import type { FinancingInput, FinancingResult, Knowledge } from "@/types/finance";
import { MAX_MXN_CENTS, formatMxn } from "./money";

function assertValid(input: FinancingInput): void {
  const money = [input.purchasePriceCents, input.availableBudgetCents];
  if (input.advertisedInstallmentCents !== undefined) money.push(input.advertisedInstallmentCents);
  if (input.knownFeesCents !== undefined) money.push(input.knownFeesCents);
  if (input.optionalLimitCents !== undefined) money.push(input.optionalLimitCents);
  input.obligations.forEach((item) => money.push(item.amountCents));
  if (money.some((value) => !Number.isSafeInteger(value) || Math.abs(value) > MAX_MXN_CENTS)) {
    throw new RangeError("Monto inválido o fuera del límite permitido.");
  }
  if (input.purchasePriceCents <= 0) throw new RangeError("El precio debe ser mayor a cero.");
  if (!Number.isInteger(input.installmentCount) || input.installmentCount < 1 || input.installmentCount > 120) {
    throw new RangeError("El número de mensualidades debe estar entre 1 y 120.");
  }
  if (input.advertisedInstallmentCents !== undefined && input.advertisedInstallmentCents <= 0) {
    throw new RangeError("La mensualidad anunciada debe ser mayor a cero.");
  }
  if (input.knownFeesCents !== undefined && input.knownFeesCents < 0) throw new RangeError("Las comisiones no pueden ser negativas.");
  if (input.optionalLimitCents !== undefined && input.optionalLimitCents < 0) throw new RangeError("El límite no puede ser negativo.");
}

export function calculateFinancing(input: FinancingInput): FinancingResult {
  assertValid(input);
  const installment = input.advertisedInstallmentCents;
  const subtotal = installment === undefined ? undefined : installment * input.installmentCount;
  if (subtotal !== undefined && (!Number.isSafeInteger(subtotal) || subtotal > MAX_MXN_CENTS)) {
    throw new RangeError("El subtotal excede el límite permitido.");
  }

  const feesKnown = input.feeStatus !== "unknown";
  const knownFees = input.feeStatus === "confirmed_zero" ? 0 : input.feeStatus === "known" ? input.knownFeesCents : undefined;
  if (input.feeStatus === "known" && knownFees === undefined) throw new RangeError("Falta el monto de comisiones conocidas.");
  const finalTotal = subtotal !== undefined && feesKnown ? subtotal + (knownFees ?? 0) : undefined;
  const difference = subtotal === undefined ? undefined : subtotal - input.purchasePriceCents;

  const budgetStatus = installment === undefined || input.incomePattern === "irregular"
    ? "unknown"
    : installment <= input.availableBudgetCents && input.availableBudgetCents > 0 ? "within" : "exceeds";
  const limitStatus = input.optionalLimitCents === undefined
    ? "not_set"
    : installment === undefined ? "unknown" : installment <= input.optionalLimitCents ? "within" : "exceeds";

  const dated = new Map<string, Array<{ id: string; cents: number }>>();
  input.obligations.forEach((item) => {
    if (!item.dueDate) return;
    dated.set(item.dueDate, [...(dated.get(item.dueDate) ?? []), { id: item.id, cents: item.amountCents }]);
  });
  const overlaps = [...dated.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([date, items]) => ({ date, obligationIds: items.map((item) => item.id), totalCents: items.reduce((sum, item) => sum + item.cents, 0) }));

  const missing: string[] = [];
  if (installment === undefined) missing.push("Mensualidad anunciada");
  if (!feesKnown) missing.push("Comisiones del financiamiento");
  if (!input.dueDates?.length) missing.push("Fechas exactas de las mensualidades");
  if (!input.obligationsComplete) missing.push("Confirmación de todas las obligaciones existentes");
  const warnings: string[] = [];
  if (difference !== undefined && difference !== 0) warnings.push(`Hay una diferencia sin explicar de ${formatMxn(Math.abs(difference))}.`);
  if (input.incomePattern === "irregular") warnings.push("El ingreso es irregular; no se puede confirmar que la cuota quepa cada mes.");
  if (input.availableBudgetCents <= 0) warnings.push("El presupuesto disponible es cero o negativo.");
  if (overlaps.length) warnings.push("Hay obligaciones conocidas que coinciden en la misma fecha.");

  const facts: FinancingResult["facts"] = [
    { label: "Precio capturado", value: formatMxn(input.purchasePriceCents), knowledge: "USER_ENTERED" },
    { label: "Subtotal de mensualidades anunciadas", value: subtotal === undefined ? "DESCONOCIDO" : formatMxn(subtotal), knowledge: subtotal === undefined ? "UNKNOWN" : "KNOWN" },
    { label: "Comisiones", value: feesKnown ? formatMxn(knownFees ?? 0) : "DESCONOCIDAS", knowledge: feesKnown ? "KNOWN" : "UNKNOWN" },
    { label: "Total final verificado", value: finalTotal === undefined ? "DESCONOCIDO" : formatMxn(finalTotal), knowledge: finalTotal === undefined ? "UNKNOWN" : "KNOWN" },
    { label: "Fechas exactas", value: input.dueDates?.length ? `${input.dueDates.length} capturadas` : "DESCONOCIDAS", knowledge: (input.dueDates?.length ? "USER_ENTERED" : "UNKNOWN") as Knowledge },
  ];

  return {
    installmentSubtotalCents: subtotal,
    knownFeesCents: knownFees,
    verifiedFinalTotalCents: finalTotal,
    reconciliationDifferenceCents: difference,
    budgetStatus,
    limitStatus,
    dateStatus: input.dueDates?.length ? "USER_ENTERED" : "UNKNOWN",
    feeKnowledge: feesKnown ? "KNOWN" : "UNKNOWN",
    overlaps,
    missing,
    warnings,
    facts,
  };
}
