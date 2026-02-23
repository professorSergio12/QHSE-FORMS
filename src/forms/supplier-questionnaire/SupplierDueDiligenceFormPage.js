"use client";

import { Suspense } from "react";
import SupplierDueDiligenceFormContent from "./SupplierDueDiligenceFormContent";

function SupplierFormFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-gray-600 border-t-orange-500 mb-4" />
        <p className="text-gray-300">Loading form...</p>
      </div>
    </div>
  );
}

export default function SupplierDueDiligenceFormPage() {
  return (
    <Suspense fallback={<SupplierFormFallback />}>
      <SupplierDueDiligenceFormContent />
    </Suspense>
  );
}
