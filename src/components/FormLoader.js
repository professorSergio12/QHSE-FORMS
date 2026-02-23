"use client";

import dynamic from "next/dynamic";

function FormLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-r-transparent" />
        <p className="mt-4 text-gray-300">Loading form...</p>
      </div>
    </div>
  );
}

const AuditForm = dynamic(() => import("@/forms/audit-form/AuditFormPage"), {
  ssr: false,
  loading: FormLoading,
});
const HSEInductionChecklist = dynamic(() => import("@/forms/hse-induction-checklist/HSEInductionChecklistPage"), {
  ssr: false,
  loading: FormLoading,
});
const NearMissForm = dynamic(() => import("@/forms/near-miss/NearMissFormPage"), {
  ssr: false,
  loading: FormLoading,
});
const SupplierQuestionnaire = dynamic(() => import("@/forms/supplier-questionnaire/SupplierDueDiligenceFormPage"), {
  ssr: false,
  loading: FormLoading,
});
const TransferAuditReport = dynamic(() => import("@/forms/transfer-audit-report/TransferAuditReportPage"), {
  ssr: false,
  loading: FormLoading,
});
const PoacCrossCompetency = dynamic(() => import("@/forms/poac-cross-competency/PoacCrossCompetencyFormPage"), {
  ssr: false,
  loading: FormLoading,
});

function getFormComponent(formCode) {
  switch (formCode) {
    case "audit-form":
      return AuditForm;
    case "hse-induction-checklist":
      return HSEInductionChecklist;
    case "near-miss":
      return NearMissForm;
    case "poac-cross-competency":
      return PoacCrossCompetency;
    case "supplier-questionnaire":
      return SupplierQuestionnaire;
    case "transfer-audit-report":
      return TransferAuditReport;
    default:
      return null;
  }
}

export default function FormLoader({ formCode }) {
  const FormComponent = getFormComponent(formCode);
  if (!FormComponent) return null;
  return <FormComponent />;
}
