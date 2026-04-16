/**
 * QHSE form config – fixed controlled-document form codes (no client-side generation).
 * Year-wise serial numbers (e.g. 2026-001) are assigned in Oceane Marine on create.
 *
 * These forms are intentionally anonymous (like Google Forms): no login in QHSE-FORMS.
 * The main app must allow POST to each `createPath` without auth — see
 * Oceane-Marine `src/middleware.js` → `PUBLIC_EXTERNAL_FORM_POST_ROUTES`.
 */

/** Canonical codes (same register as main app `qhse-form-codes.js`) */
export const QHSE_FIXED_FORM_CODES = {
  STS_TRANSFER_AUDIT: "QAF-OFD-003",
  HSE_INDUCTION: "QAF-OFD-008",
  POAC_CROSS_COMPETENCY: "QAF-OFD-009",
  NEAR_MISS_INCIDENT: "QAF-OFD-015",
  SUPPLIER_DUE_DILIGENCE: "QAF-OFD-043",
  SUB_CONTRACTOR_AUDIT: "QAF-OFD-055",
};

export const QHSE_FORM_CONFIG = {
  "audit-form": {
    formCode: QHSE_FIXED_FORM_CODES.SUB_CONTRACTOR_AUDIT,
    createPath: "qhse/due-diligence/audit-sub-contractor/create",
  },
  "hse-induction-checklist": {
    formCode: QHSE_FIXED_FORM_CODES.HSE_INDUCTION,
    createPath: "qhse/form-checklist/hse-induction-checklist/create",
  },
  "near-miss": {
    formCode: QHSE_FIXED_FORM_CODES.NEAR_MISS_INCIDENT,
    createPath: "near-miss-form/create",
  },
  "poac-cross-competency": {
    formCode: QHSE_FIXED_FORM_CODES.POAC_CROSS_COMPETENCY,
    createPath: "qhse/cross-competency/create",
  },
  "supplier-questionnaire": {
    formCode: QHSE_FIXED_FORM_CODES.SUPPLIER_DUE_DILIGENCE,
    createPath: "qhse/due-diligence/due-diligence-questionnaire/create",
  },
  "transfer-audit-report": {
    formCode: QHSE_FIXED_FORM_CODES.STS_TRANSFER_AUDIT,
    createPath: "qhse/form-checklist/transfer-audit/create",
  },
};

export function getFormConfig(formSlug) {
  return QHSE_FORM_CONFIG[formSlug] || null;
}

export function getFormCodeFallback(formSlug) {
  return QHSE_FORM_CONFIG[formSlug]?.formCode ?? "";
}
