export type Knowledge = "KNOWN" | "UNKNOWN" | "INCONSISTENT" | "USER_ENTERED";
export type IncomePattern = "regular" | "irregular";
export type FeeStatus = "unknown" | "confirmed_zero" | "known";

export interface KnownObligation {
  id: string;
  label: string;
  amountCents: number;
  dueDate?: string;
}

export interface FinancingInput {
  purchasePriceCents: number;
  installmentCount: number;
  advertisedInstallmentCents?: number;
  feeStatus: FeeStatus;
  knownFeesCents?: number;
  availableBudgetCents: number;
  incomePattern: IncomePattern;
  optionalLimitCents?: number;
  dueDates?: string[];
  obligations: KnownObligation[];
  obligationsComplete: boolean;
}

export interface FinancingResult {
  installmentSubtotalCents?: number;
  knownFeesCents?: number;
  verifiedFinalTotalCents?: number;
  reconciliationDifferenceCents?: number;
  budgetStatus: "within" | "exceeds" | "unknown";
  limitStatus: "within" | "exceeds" | "not_set" | "unknown";
  dateStatus: Knowledge;
  feeKnowledge: Knowledge;
  overlaps: Array<{ date: string; obligationIds: string[]; totalCents: number }>;
  missing: string[];
  warnings: string[];
  facts: Array<{ label: string; value: string; knowledge: Knowledge }>;
}

