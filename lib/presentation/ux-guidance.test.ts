import { describe, expect, it } from "vitest";
import { BUDGET_GUIDANCE, DEMO_ACCESS_GUIDANCE, getObligationContext, NEXT_INFORMATION_TO_CONFIRM, PRIVACY_GUIDANCE } from "./ux-guidance";
import type { FinancingInput } from "@/types/finance";

const scenario: FinancingInput = {
  purchasePriceCents: 360_000,
  installmentCount: 6,
  advertisedInstallmentCents: 60_000,
  feeStatus: "unknown",
  availableBudgetCents: 90_000,
  incomePattern: "irregular",
  optionalLimitCents: 65_000,
  dueDates: undefined,
  obligations: [
    { id: "a", label: "Obligación A", amountCents: 30_000, dueDate: "2026-11-15" },
    { id: "b", label: "Obligación B", amountCents: 25_000, dueDate: "2026-11-15" },
  ],
  obligationsComplete: false,
};

describe("guía UX posterior a la segunda persona sintética", () => {
  it("evita comunicar doble descuento o disponibilidad garantizada", () => {
    expect(BUDGET_GUIDANCE).toContain("No restes dos veces");
    expect(BUDGET_GUIDANCE).toContain("no una disponibilidad mensual garantizada");
  });

  it("resume compromisos conocidos sin inventar coincidencia con la nueva compra", () => {
    const context = getObligationContext(scenario);
    expect(context.knownGroups).toEqual(["Las 2 obligaciones registradas suman $550 el 15 de noviembre de 2026."]);
    expect(context.newInstallmentOverlapUnknown).toBe(true);
  });

  it("deja de marcar como desconocido el cruce cuando sí hay fechas nuevas", () => {
    expect(getObligationContext({ ...scenario, dueDates: ["2026-11-15"] }).newInstallmentOverlapUnknown).toBe(false);
  });

  it("describe con precisión privacidad, acceso y cierre neutral", () => {
    expect(PRIVACY_GUIDANCE).toContain("funciona localmente");
    expect(PRIVACY_GUIDANCE).toContain("Solo con tu consentimiento");
    expect(DEMO_ACCESS_GUIDANCE).toContain("quien supervisa la demostración");
    expect(NEXT_INFORMATION_TO_CONFIRM).toHaveLength(4);
    expect(NEXT_INFORMATION_TO_CONFIRM.join(" ")).not.toMatch(/segura|aprobada|asequible/i);
  });
});
