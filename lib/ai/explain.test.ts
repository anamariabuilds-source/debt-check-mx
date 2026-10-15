import { describe, expect, it, vi } from "vitest";
import { calculateFinancing } from "@/lib/finance/calculate";
import { explainWithFallback } from "./explain";
import type { FinancingInput } from "@/types/finance";

const input: FinancingInput = {
  purchasePriceCents: 360_000, installmentCount: 6, advertisedInstallmentCents: 60_000,
  feeStatus: "unknown", availableBudgetCents: 80_000, incomePattern: "regular",
  obligations: [], obligationsComplete: false,
};

describe("modo explicativo", () => {
  it("sigue disponible y rotulado cuando no existe servicio LLM", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("sin servicio")));
    const response = await explainWithFallback(input, calculateFinancing(input));
    expect(response.mode).toBe("simulated");
    expect(response.label).toBe("SIMULATED AI OUTPUT");
    expect(response.paragraphs.join(" ")).toContain("desconocido");
  });
});

