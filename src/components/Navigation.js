"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const FORMS = [
  { code: "audit-form", label: "Subcontractor Audit" },
  { code: "hse-induction-checklist", label: "HSE Induction" },
  { code: "near-miss", label: "Near Miss" },
  { code: "poac-cross-competency", label: "POAC Cross Competency" },
  { code: "supplier-questionnaire", label: "Supplier Questionnaire" },
  { code: "transfer-audit-report", label: "STS Transfer Audit" },
];

export default function Navigation() {
  const pathname = usePathname();
  const isFormPage = pathname?.startsWith("/forms/");
  const isHome = pathname === "/";
  const isHseInduction = pathname === "/forms/hse-induction-checklist";
  const isAuditForm = pathname === "/forms/audit-form";
  const isNearMiss = pathname === "/forms/near-miss";
  const isPoac = pathname === "/forms/poac-cross-competency";
  const isSupplier = pathname === "/forms/supplier-questionnaire";
  const isTransferAudit = pathname === "/forms/transfer-audit-report";

  if (isHseInduction || isAuditForm || isNearMiss || isPoac || isSupplier || isTransferAudit) return null;

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="rounded-lg">
              <Image
                src="/image/logo.png"
                alt="OCEANE GROUP Logo"
                width={120}
                height={60}
                className="object-contain"
              />
            </div>
          </Link>

          {!isFormPage && (
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isHome ? "bg-orange-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              Home
            </Link>
            {FORMS.map(({ code, label }) => (
              <Link
                key={code}
                href={`/forms/${code}`}
                className="px-3 py-2 rounded-lg text-sm transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {label}
              </Link>
            ))}
          </div>
          )}
        </div>
      </div>
    </nav>
  );
}
