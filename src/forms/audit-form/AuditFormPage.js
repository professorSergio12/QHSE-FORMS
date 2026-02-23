"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFormConfig } from "@/lib/qhseFormConfig";

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
  const [formCode, setFormCode] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [version, setVersion] = useState("");
  const [revisionDate, setRevisionDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch form code on mount (proxy to main app; fallback to config)
  useEffect(() => {
    let cancelled = false;
    const fetchCode = async () => {
      try {
        setIsLoading(true);
        const codePath = config?.codePath;
        if (codePath) {
          const res = await fetch(`/api/proxy/${codePath}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (cancelled) return;
          if (res.ok) {
            const data = await res.json();
            setFormCode(data.formCode || config?.formCode || "");
            setVersion(data.version || "1.0");
            setRevisionDate(
              data.revisionDate
                ? new Date(data.revisionDate).toLocaleDateString()
                : new Date().toLocaleDateString()
            );
          } else {
            setFormCode(config?.formCode || "");
            setVersion("1.0");
            setRevisionDate(new Date().toLocaleDateString());
          }
        } else {
          setFormCode(config?.formCode || "");
          setVersion("1.0");
          setRevisionDate(new Date().toLocaleDateString());
        }
      } catch (e) {
        if (!cancelled) {
          setFormCode(config?.formCode || "");
          setVersion("1.0");
          setRevisionDate(new Date().toLocaleDateString());
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchCode();
    return () => { cancelled = true; };
  }, [config?.codePath, config?.formCode]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <p className="text-gray-300 text-lg">Generating form code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-2">
              Due Diligence Subcontractor Audit Form
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-300 flex-wrap">
              <div>
                <span className="text-orange-400">Form Code:</span>{" "}
                <span className="font-semibold text-white">{formCode || config?.formCode || "—"}</span>
              </div>
              {serialNumber && (
                <div>
                  <span className="text-orange-400">Serial No:</span>{" "}
                  <span className="font-semibold text-white">{serialNumber}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Version:</span>{" "}
                <span className="font-semibold text-white">{version || "—"}</span>
              </div>
              {revisionDate && (
                <div>
                  <span className="text-gray-400">Revision Date:</span>{" "}
                  <span className="font-semibold text-white">{revisionDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

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
          <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
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
          <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
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
          <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
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
          <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
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
          <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
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
          <section className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
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
  );
}
