import { z } from "zod";

const cents = z.number().int().min(-100_000_000).max(100_000_000);
const positiveCents = z.number().int().positive().max(100_000_000);

export const financingInputSchema = z.object({
  purchasePriceCents: positiveCents,
  installmentCount: z.number().int().min(1).max(120),
  advertisedInstallmentCents: positiveCents.optional(),
  feeStatus: z.enum(["unknown", "confirmed_zero", "known"]),
  knownFeesCents: z.number().int().min(0).max(100_000_000).optional(),
  availableBudgetCents: cents,
  incomePattern: z.enum(["regular", "irregular"]),
  optionalLimitCents: z.number().int().min(0).max(100_000_000).optional(),
  dueDates: z.array(z.iso.date()).max(120).optional(),
  obligations: z.array(z.object({
    id: z.string().min(1).max(80),
    label: z.string().min(1).max(80),
    amountCents: positiveCents,
    dueDate: z.iso.date().optional(),
  })).max(50),
  obligationsComplete: z.boolean(),
}).superRefine((value, context) => {
  if (value.feeStatus === "known" && value.knownFeesCents === undefined) {
    context.addIssue({ code: "custom", path: ["knownFeesCents"], message: "Falta el monto de comisiones." });
  }
});

