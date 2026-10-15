import { describe, expect, it } from "vitest";
import { calculateFinancing } from "@/lib/finance/calculate";
import { validateExplanation } from "./validate";

const result = calculateFinancing({
  purchasePriceCents: 360_000, installmentCount: 6, advertisedInstallmentCents: 60_000,
  feeStatus: "unknown", availableBudgetCents: 80_000, incomePattern: "regular",
  obligations: [], obligationsComplete: true,
});

describe("guardas de explicación", () => {
  it("rechaza números inventados por una respuesta", () => {
    expect(validateExplanation("El total será $4,200.", result).valid).toBe(false);
  });

  it("acepta una explicación conservadora sin cifras nuevas", () => {
    expect(validateExplanation("El total final sigue desconocido porque faltan comisiones.", result).valid).toBe(true);
  });
});
