export const FORM_CODES = [
  "audit-form",
  "hse-induction-checklist",
  "near-miss",
  "poac-cross-competency",
  "supplier-questionnaire",
  "transfer-audit-report",
];

const formTitles = {
  "audit-form": "Due Diligence Subcontractor Audit",
  "hse-induction-checklist": "HSE Induction Checklist",
  "near-miss": "Near Miss / Incident & Injury Reporting",
  "poac-cross-competency": "POAC Cross Competency",
  "supplier-questionnaire": "Supplier Due Diligence Questionnaire",
  "transfer-audit-report": "STS Transfer Audit Report",
};

export function getFormTitle(formCode) {
  return formTitles[formCode] || formCode;
}
