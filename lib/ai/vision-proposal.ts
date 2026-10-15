import type { VisionExtraction } from "./vision";

export interface VisionProposalValues { price: string; count: string; installment: string; fees: string; paymentDates: string }
export interface VisionProposalResult { price?: string; count?: string; installment?: string; feeStatus?: "unknown" | "confirmed_zero" | "known"; fees?: string; paymentDates?: string }

export function buildVisionProposal(extraction: VisionExtraction, draft: VisionProposalValues, selected: Record<keyof VisionProposalValues, boolean>): VisionProposalResult {
  const proposal: VisionProposalResult = {};
  if (selected.price && draft.price) proposal.price = draft.price;
  if (selected.count && draft.count) proposal.count = draft.count;
  if (selected.installment && draft.installment) proposal.installment = draft.installment;
  if (selected.fees) {
    proposal.feeStatus = extraction.feeStatus === "UNKNOWN" ? "unknown" : extraction.feeStatus === "EXPLICIT_ZERO" ? "confirmed_zero" : "known";
    if (draft.fees) proposal.fees = draft.fees;
  }
  if (selected.paymentDates && draft.paymentDates) proposal.paymentDates = draft.paymentDates;
  return proposal;
}
