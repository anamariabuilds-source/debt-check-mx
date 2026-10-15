import { describe, expect, it } from "vitest";
import { calculateFinancing } from "@/lib/finance/calculate";
import { getLimitMessage } from "./limit-message";

function resultWithUnknowns() {
  return calculateFinancing({ purchasePriceCents: 360_000, installmentCount: 6, advertisedInstallmentCents: 60_000, feeStatus: "unknown", availableBudgetCents: 80_000, incomePattern: "regular", optionalLimitCents: 65_000, obligations: [], obligationsComplete: false });
}

describe("mensaje de comparación con límite", () => {
  it("usa tono neutral si la cuota está debajo del límite pero faltan datos importantes", () => {
    expect(getLimitMessage(resultWithUnknowns())).toMatchObject({ tone: "neutral", hasMaterialUnknowns: true, title: "La cuota anunciada está debajo de tu límite autoelegido" });
  });
  it("aclara que la comparación no demuestra asequibilidad", () => {
    const detail = getLimitMessage(resultWithUnknowns())?.detail;
    expect(detail).toContain("solo compara dos cantidades");
    expect(detail).toContain("No significa que la compra sea asequible");
    expect(detail).toContain("aún faltan");
  });
  it("elimina el mensaje ambiguo anterior", () => {
    const message = getLimitMessage(resultWithUnknowns());
    expect(`${message?.title} ${message?.detail}`).not.toContain("Dentro de tu límite elegido");
    expect(`${message?.title} ${message?.detail}`).not.toContain("puedes comprar");
  });
  it("preserva control del comprador cuando supera el límite", () => {
    const result = resultWithUnknowns();
    result.limitStatus = "exceeds";
    const message = getLimitMessage(result);
    expect(message?.tone).toBe("warning");
    expect(message?.title).toContain("supera tu límite autoelegido");
    expect(message?.detail).toContain("no aprueba ni prohíbe");
  });
});
