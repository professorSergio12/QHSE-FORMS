"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFormConfig, QHSE_FIXED_FORM_CODES } from "@/lib/qhseFormConfig";

const ISO_CERTIFICATIONS = [
  "ISO 9001",
  "ISO 14001",
  "ISO 45001",
  "ISO 27001",
  "OHSAS 18001",
  "Other",
];

export default function AuditFormPage() {
  const config = getFormConfig("audit-form");
  const formCode = config?.formCode || QHSE_FIXED_FORM_CODES.SUB_CONTRACTOR_AUDIT;
  const version = "1.0";
  const revisionDate = new Date().toLocaleDateString();
  const [serialNumber, setSerialNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    subcontractorName: "",
    subcontractorAddress: "",
    serviceType: "",
    contactPerson: "",
    emailOfContactPerson: "",
    phoneOfContactPerson: "",
    operatingAreas: "",
    tradeLicenseCopyAvailable: null,
    hasHSEPolicy: null,
    auditsSubcontractors: null,
    hasInsurance: null,
    insuranceDetails: "",
    isoCertifications: [],
    auditCompletedBy: {
      name: "",
      designation: "",
      signedAt: "",
      signatureText: "",
      signaturePhoto: null,
    },
    contractorApprovedBy: {
      name: "",
      designation: "",
      signedAt: "",
      signatureText: "",
      signaturePhoto: null,
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value,
      },
    }));
  };

  const handleSignaturePhotoChange = (parentField, file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          signaturePhoto: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const clearSignaturePhoto = (parentField) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        signaturePhoto: null,
      },
    }));
  };

  const handleBooleanChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleISOCertificationChange = (cert) => {
    setFormData((prev) => {
      const current = prev.isoCertifications || [];
      const updated = current.includes(cert)
        ? current.filter((c) => c !== cert)
        : [...current, cert];
      return {
        ...prev,
        isoCertifications: updated,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Client-side validation before API hit
      const requiredTextFields = [
        "subcontractorName",
        "subcontractorAddress",
        "serviceType",
        "contactPerson",
        "emailOfContactPerson",
        "phoneOfContactPerson",
      ];

      for (const field of requiredTextFields) {
        if (!formData[field]?.trim()) {
          throw new Error("Please fill all required fields before submitting.");
        }
      }

      const requiredBooleans = [
        "tradeLicenseCopyAvailable",
        "hasHSEPolicy",
        "auditsSubcontractors",
        "hasInsurance",
      ];

      for (const field of requiredBooleans) {
        if (formData[field] === null) {
          throw new Error("Please answer all compliance questions (Yes/No).");
        }
      }

      if (formData.hasInsurance && !formData.insuranceDetails?.trim()) {
        throw new Error("Insurance details are required when insurance is selected.");
      }

      if (!formData.isoCertifications || formData.isoCertifications.length === 0) {
        throw new Error("Select at least one ISO certification.");
      }

      const requiredAuditBy = ["name", "designation", "signedAt"];
      for (const key of requiredAuditBy) {
        if (!formData.auditCompletedBy?.[key]?.trim()) {
          throw new Error("Audit completed by fields are required.");
        }
      }

      const requiredContractorBy = ["name", "designation", "signedAt"];
      for (const key of requiredContractorBy) {
        if (!formData.contractorApprovedBy?.[key]?.trim()) {
          throw new Error("Contractor approved by fields are required.");
        }
      }

      const createPath = config?.createPath || "qhse/due-diligence/audit-sub-contractor/create";
      const payload = {
        formCode: formCode || config?.formCode,
        ...formData,
      };

      const response = await fetch(`/api/proxy/${createPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Server error (${response.status}): Failed to save audit form`;
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage =
              errorData.error || errorData.message || errorMessage;
          } catch {
            const preview = responseText.substring(0, 200).replace(/\n/g, " ");
            errorMessage = `Server error (${response.status}): ${preview}`;
          }
        }
        throw new Error(errorMessage);
      }

      let data;
      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from server");
      }

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON response: ${parseError.message}. Response: ${responseText.substring(0, 100)}`
        );
      }

      setSuccess(
        data.message || "Sub contractor audit created successfully!"
      );
      if (data.data?.serialNumber) setSerialNumber(data.data.serialNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Reset form after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to save audit form");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Custom Navigation / Header Header for this page */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 py-4 px-4 shadow-lg">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
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

          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white text-center">
              Due Diligence Subcontractor Audit Form
            </h1>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 min-w-[250px] w-full md:w-auto">
            <div className="text-sm space-y-1 text-gray-300">
              <div className="flex justify-between gap-4">
                <span>Form Code:</span>
                <span className="text-white font-semibold">
                  {formCode || config?.formCode || "—"}
                </span>
              </div>
              {serialNumber && (
                <div className="flex justify-between gap-4">
                  <span>Serial No:</span>
                  <span className="text-white font-semibold">{serialNumber}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span>Version:</span>
                <span className="text-white font-semibold">
                  {version || "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Rev Date:</span>
                <span className="text-white font-semibold">
                  {revisionDate || "N/A"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Approved by:</span>
                <span className="text-white font-semibold">JS</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative min-h-screen">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-30 filter blur-xs"
          style={{ backgroundImage: 'url("/image/ship-bg.jpg")' }}
        ></div>

        <div className="container relative z-10 mx-auto px-4 py-8 max-w-3xl">

        {/* Error/Success Messages */}
        {(error || success) && (
          <div
            className={`rounded-xl px-6 py-4 mb-6 border ${
              error
                ? "bg-red-900 border border-red-700 text-red-200"
                : "bg-emerald-900 border border-emerald-700 text-emerald-200"
            }`}
          >
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subcontractor Information */}
          <section className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded"></span>
              Subcontractor Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subcontractor Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subcontractorName}
                  onChange={(e) =>
                    handleInputChange("subcontractorName", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter subcontractor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Service Type <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.serviceType}
                  onChange={(e) =>
                    handleInputChange("serviceType", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter service type"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subcontractor Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.subcontractorAddress}
                  onChange={(e) =>
                    handleInputChange("subcontractorAddress", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 resize-none"
                  placeholder="Enter full address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Operating Areas
                </label>
                <input
                  type="text"
                  value={formData.operatingAreas}
                  onChange={(e) =>
                    handleInputChange("operatingAreas", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter operating areas"
                />
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded"></span>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Person <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) =>
                    handleInputChange("contactPerson", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.emailOfContactPerson}
                  onChange={(e) =>
                    handleInputChange("emailOfContactPerson", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneOfContactPerson}
                  onChange={(e) =>
                    handleInputChange("phoneOfContactPerson", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </section>

          {/* Compliance Questions */}
          <section className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded"></span>
              Compliance Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  key: "tradeLicenseCopyAvailable",
                  label: "Trade License Copy Available",
                },
                { key: "hasHSEPolicy", label: "Has HSE Policy" },
                {
                  key: "auditsSubcontractors",
                  label: "Audits Subcontractors",
                },
                { key: "hasInsurance", label: "Has Insurance" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">
                    {label} <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={key}
                        checked={formData[key] === true}
                        onChange={() => handleBooleanChange(key, true)}
                        className="w-4 h-4 text-orange-500 bg-gray-700/50 border-gray-600 focus:ring-0 focus:border-gray-400"
                        required
                      />
                      <span className="text-gray-300">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={key}
                        checked={formData[key] === false}
                        onChange={() => handleBooleanChange(key, false)}
                        className="w-4 h-4 text-orange-500 bg-gray-700/50 border-gray-600 focus:ring-0 focus:border-gray-400"
                        required
                      />
                      <span className="text-gray-300">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Insurance Details (conditional) */}
            {formData.hasInsurance === true && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Insurance Details <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.insuranceDetails}
                  onChange={(e) =>
                    handleInputChange("insuranceDetails", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 resize-none"
                  placeholder="Enter insurance details"
                />
              </div>
            )}
          </section>

          {/* ISO Certifications */}
          <section className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded"></span>
              ISO Certifications <span className="text-red-400">*</span>
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Select at least one ISO certification
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ISO_CERTIFICATIONS.map((cert) => (
                <label
                  key={cert}
                  className="flex items-center gap-3 p-4 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-700/80 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={formData.isoCertifications.includes(cert)}
                    onChange={() => handleISOCertificationChange(cert)}
                    className="w-4 h-4 text-orange-500 bg-gray-700/50 border-gray-600 rounded focus:ring-0 focus:border-gray-400"
                  />
                  <span className="text-gray-300">{cert}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Audit Completed By */}
          <section className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded"></span>
              Audit Completed By <span className="text-red-400">*</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.auditCompletedBy.name}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "auditCompletedBy",
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Designation <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.auditCompletedBy.designation}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "auditCompletedBy",
                      "designation",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter designation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Signed At <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.auditCompletedBy.signedAt}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "auditCompletedBy",
                      "signedAt",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-600">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Signature (optional – type or upload image)
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.auditCompletedBy.signatureText || ""}
                  onChange={(e) =>
                    handleNestedInputChange("auditCompletedBy", "signatureText", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 text-sm"
                  placeholder="Type your signature or full name"
                />
                <p className="text-xs text-gray-400">Or upload signature image</p>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="cursor-pointer px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/80 transition text-sm font-medium">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSignaturePhotoChange("auditCompletedBy", f);
                        e.target.value = "";
                      }}
                    />
                    Choose image
                  </label>
                  {formData.auditCompletedBy.signaturePhoto && (
                    <div className="flex items-center gap-2">
                      <img
                        src={formData.auditCompletedBy.signaturePhoto}
                        alt="Signature preview"
                        className="h-12 w-24 object-contain rounded border border-gray-600 bg-gray-700/50"
                      />
                      <button
                        type="button"
                        onClick={() => clearSignaturePhoto("auditCompletedBy")}
                        className="text-sm text-red-400 hover:text-red-300 transition"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Contractor Approved By */}
          <section className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded"></span>
              Contractor Approved By <span className="text-red-400">*</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.contractorApprovedBy.name}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "contractorApprovedBy",
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Designation <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.contractorApprovedBy.designation}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "contractorApprovedBy",
                      "designation",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter designation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Signed At <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.contractorApprovedBy.signedAt}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "contractorApprovedBy",
                      "signedAt",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-600">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Signature (optional – type or upload image)
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.contractorApprovedBy.signatureText || ""}
                  onChange={(e) =>
                    handleNestedInputChange("contractorApprovedBy", "signatureText", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 text-sm"
                  placeholder="Type your signature or full name"
                />
                <p className="text-xs text-gray-400">Or upload signature image</p>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="cursor-pointer px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/80 transition text-sm font-medium">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSignaturePhotoChange("contractorApprovedBy", f);
                        e.target.value = "";
                      }}
                    />
                    Choose image
                  </label>
                  {formData.contractorApprovedBy.signaturePhoto && (
                    <div className="flex items-center gap-2">
                      <img
                        src={formData.contractorApprovedBy.signaturePhoto}
                        alt="Signature preview"
                        className="h-12 w-24 object-contain rounded border border-gray-600 bg-gray-700/50"
                      />
                      <button
                        type="button"
                        onClick={() => clearSignaturePhoto("contractorApprovedBy")}
                        className="text-sm text-red-400 hover:text-red-300 transition"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-600">
            <Link
              href="/"
              className="px-6 py-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white font-medium hover:bg-gray-700/80 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Audit Form"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
