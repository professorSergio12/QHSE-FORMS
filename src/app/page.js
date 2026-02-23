import Link from "next/link";

const FORMS = [
  { code: "audit-form", title: "Due Diligence Subcontractor Audit", description: "Subcontractor audit and compliance form." },
  { code: "hse-induction-checklist", title: "HSE Induction Checklist", description: "Health, Safety & Environment induction checklist for employees and contractors." },
  { code: "near-miss", title: "Near Miss / Incident & Injury Reporting", description: "Report near misses, incidents and injuries." },
  { code: "poac-cross-competency", title: "POAC Cross Competency", description: "POAC cross competency evaluation form. View list in main Oceane Marine app." },
  { code: "supplier-questionnaire", title: "Supplier Due Diligence Questionnaire", description: "Supplier evaluation and due diligence questionnaire." },
  { code: "transfer-audit-report", title: "STS Transfer Audit Report", description: "Ship-to-ship transfer audit report for mooring masters." },
];

export default function Home() {
  return (
    <div className="min-h-screen futuristic-bg">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            QHSE External Forms
          </h1>
          <p className="text-gray-300 text-lg">
            Select a form below. The same base URL is used for all forms; only the form code in the path changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FORMS.map(({ code, title, description }) => (
            <Link
              key={code}
              href={`/forms/${code}`}
              className="block bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 group"
            >
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                {title}
              </h2>
              <p className="text-gray-400 text-sm mb-4">{description}</p>
              <span className="text-orange-400 text-sm font-medium">
                Open form →
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-gray-500 text-sm">
          URL pattern: <code className="bg-gray-800 px-2 py-1 rounded">/forms/[form-code]</code>
          <br />
          e.g. <code className="bg-gray-800 px-2 py-1 rounded">/forms/audit-form</code>, <code className="bg-gray-800 px-2 py-1 rounded">/forms/near-miss</code>
        </p>
      </div>
    </div>
  );
}
