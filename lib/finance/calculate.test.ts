import { describe, expect, it } from "vitest";
import { calculateFinancing } from "./calculate";
import { parseMxnToCents } from "./money";
import type { FinancingInput } from "@/types/finance";

const base = (): FinancingInput => ({
  purchasePriceCents: 360_000,
  installmentCount: 6,
  advertisedInstallmentCents: 60_000,
  feeStatus: "unknown",
  availableBudgetCents: 80_000,
  incomePattern: "regular",
  optionalLimitCents: 65_000,
  obligations: [],
  obligationsComplete: true,
});

describe("motor financiero determinista", () => {
  it("mantiene comisiones y total final como desconocidos", () => {
    const result = calculateFinancing(base());
    expect(result.installmentSubtotalCents).toBe(360_000);
    expect(result.feeKnowledge).toBe("UNKNOWN");
    expect(result.verifiedFinalTotalCents).toBeUndefined();
  });

  it("no inventa fechas de mensualidades", () => {
    const result = calculateFinancing(base());
    expect(result.dateStatus).toBe("UNKNOWN");
    expect(result.missing).toContain("Fechas exactas de las mensualidades");
  });

  it("detecta dos obligaciones conocidas en la misma fecha", () => {
    const result = calculateFinancing({ ...base(), obligations: [
      { id: "a", label: "Renta", amountCents: 50_000, dueDate: "2026-11-01" },
      { id: "b", label: "Internet", amountCents: 5_000, dueDate: "2026-11-01" },
    ] });
    expect(result.overlaps).toEqual([{ date: "2026-11-01", obligationIds: ["a", "b"], totalCents: 55_000 }]);
  });

  it("detecta coincidencia entre una mensualidad de la compra y una obligación existente", () => {
    const result = calculateFinancing({
      ...base(),
      dueDates: ["2026-11-01"],
      obligations: [{ id: "renta", label: "Renta", amountCents: 50_000, dueDate: "2026-11-01" }],
    });
    expect(result.overlaps).toEqual([{
      date: "2026-11-01",
      obligationIds: ["purchase-installment-1", "renta"],
      totalCents: 110_000,
    }]);
    expect(result.warnings).toContain("Hay pagos conocidos que coinciden en la misma fecha.");
  });

  it("no certifica capacidad con ingreso irregular", () => {
    expect(calculateFinancing({ ...base(), incomePattern: "irregular" }).budgetStatus).toBe("unknown");
  });

  it("no vuelve a restar obligaciones del presupuesto que la persona ya capturó como disponible", () => {
    const result = calculateFinancing({
      ...base(),
      availableBudgetCents: 90_000,
      obligations: [
        { id: "a", label: "Obligación A", amountCents: 30_000, dueDate: "2026-11-15" },
        { id: "b", label: "Obligación B", amountCents: 25_000, dueDate: "2026-11-15" },
      ],
    });
    expect(result.budgetStatus).toBe("within");
    expect(result.overlaps[0]?.totalCents).toBe(55_000);
  });

  it.each([0, -10_000])("no marca dentro del presupuesto cuando es %i", (availableBudgetCents) => {
    expect(calculateFinancing({ ...base(), availableBudgetCents }).budgetStatus).toBe("exceeds");
  });

  it("marca el límite opcional excedido sin alterar el cálculo", () => {
    expect(calculateFinancing({ ...base(), optionalLimitCents: 50_000 }).limitStatus).toBe("exceeds");
  });

  it("recalcula al cambiar el límite", () => {
    expect(calculateFinancing({ ...base(), optionalLimitCents: 70_000 }).limitStatus).toBe("within");
  });

  it("admite eliminar el límite", () => {
    expect(calculateFinancing({ ...base(), optionalLimitCents: undefined }).limitStatus).toBe("not_set");
  });

  it("reporta diferencia y no la clasifica como interés", () => {
    const result = calculateFinancing({ ...base(), advertisedInstallmentCents: 65_000 });
    expect(result.reconciliationDifferenceCents).toBe(30_000);
    expect(result.warnings[0]).toContain("diferencia sin explicar");
    expect(result.warnings.join(" ")).not.toContain("interés");
  });

  it("representa mensualidad faltante sin calcularla", () => {
    const result = calculateFinancing({ ...base(), advertisedInstallmentCents: undefined });
    expect(result.installmentSubtotalCents).toBeUndefined();
    expect(result.budgetStatus).toBe("unknown");
  });

  it("rechaza subtotal extremadamente grande", () => {
    expect(() => calculateFinancing({ ...base(), purchasePriceCents: 100_000_000, advertisedInstallmentCents: 100_000_000, installmentCount: 120 })).toThrow(RangeError);
  });

  it("rechaza texto, negativos y precisión inválida al convertir moneda", () => {
    expect(parseMxnToCents("hola")).toBeUndefined();
    expect(parseMxnToCents("-1")).toBeUndefined();
    expect(parseMxnToCents("1.999")).toBeUndefined();
  });

  it("diferencia cero confirmado de comisión desconocida", () => {
    const zero = calculateFinancing({ ...base(), feeStatus: "confirmed_zero" });
    const unknown = calculateFinancing(base());
    expect(zero.verifiedFinalTotalCents).toBe(360_000);
    expect(unknown.verifiedFinalTotalCents).toBeUndefined();
  });

  it("señala inventario incompleto de obligaciones", () => {
    expect(calculateFinancing({ ...base(), obligationsComplete: false }).missing).toContain("Confirmación de todas las obligaciones existentes");
  });
});
