"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFormConfig, QHSE_FIXED_FORM_CODES } from "@/lib/qhseFormConfig";

export default function SupplierDueDiligenceFormContent() {
  const [form, setForm] = useState({
    supplierDetails: {
      inchargeNameAndCompany: "",
      contactDetails: "",
      companyRegistrationDetails: "",
      parentCompanyDetails: "",
      hasSubsidiaries: null,
      subsidiariesDetails: "",
      employeeCount: "",
      businessActivities: "",
      operatingLocations: "",
      paymentTerms: "30 days",
      paymentTermsOther: "",
    },
    legalDeclarations: {
      missingLicenses: null,
      criminalOffenceHistory: null,
      insolvencyStatus: null,
      businessMisconduct: null,
      unpaidStatutoryPayments: null,
      declarationDetails: "",
    },
    insuranceDetails: {
      pAndI: "",
      workersCompensation: "",
      publicLiability: "",
      otherInsurance: "",
    },
    complianceDetails: {
      qualityManagementSystem: {
        registered: null,
        dateAccredited: "",
        accreditedBy: "",
      },
      environmentalPolicy: null,
      esgProgramme: null,
      otherCertifications: "",
      isoCertification: "",
      drugAlcoholPolicy: null,
      drugAlcoholProcedure: "",
      healthSafetyPolicy: null,
      incidentsLastTwoYears: null,
      incidentDetails: "",
    },
    ethicsAndGovernance: {
      ethicalConductPolicy: null,
      equalityDiversityPolicy: null,
      subcontracting: null,
      subcontractingDetails: "",
      dueDiligenceForSubcontractors: null,
      antiCorruptionAcknowledged: null,
      modernSlaveryAcknowledged: null,
      sanctionsExposure: null,
    },
    financialAndData: {
      creditRatingDetails: "",
      turnoverLastTwoYears: "",
      dataProtectionPolicy: null,
      bankerDetails: {
        name: "",
        branch: "",
        contactDetails: "",
        ibanOrAccountNumber: "",
      },
    },
    generalDeclaration: {
      name: "",
      positionHeld: "",
      signedAt: "",
      signature: "",
      signatureImage: "",
    },
    purchasingDeclaration: {
      name: "",
      positionHeld: "",
      signedAt: "",
      signature: "",
      signatureImage: "",
    },
    additionalDocuments: [],
  });

  const config = getFormConfig("supplier-questionnaire");
  const defaultFormCode =
    config?.formCode || QHSE_FIXED_FORM_CODES.SUPPLIER_DUE_DILIGENCE;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const formCode = defaultFormCode;
  const version = "1.0";
  const [serialNumber, setSerialNumber] = useState("");

  const handleChange = (path, value) => {
    const keys = path.split(".");
    setForm((prev) => {
      const newForm = { ...prev };
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAdditionalDocumentsChange = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    const newDocs = await Promise.all(
      files.map(async (file) => ({
        fileName: file.name,
        mimeType: file.type,
        base64: await fileToBase64(file),
      }))
    );
    setForm((prev) => ({
      ...prev,
      additionalDocuments: [...(prev.additionalDocuments || []), ...newDocs],
    }));
    e.target.value = "";
  };

  const removeAdditionalDocument = (index) => {
    setForm((prev) => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index),
    }));
  };

  const handleSignatureImageChange = async (declarationKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (e.g. PNG, JPG) for signature.");
      return;
    }
    const base64 = await fileToBase64(file);
    handleChange(`${declarationKey}.signatureImage`, base64);
    e.target.value = "";
  };

  const clearSignatureImage = (declarationKey) => {
    handleChange(`${declarationKey}.signatureImage`, "");
  };

  const handleSubmit = async () => {
    if (!formCode || !version) {
      setError(
        "Form code missing. Please refresh to regenerate and try again."
      );
      return;
    }

    if (
      !form.supplierDetails.inchargeNameAndCompany ||
      !form.supplierDetails.contactDetails
    ) {
      setError("Please fill in required fields (Q1 and Q2)");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const sd = { ...form.supplierDetails };
      const ecRaw = sd.employeeCount;
      if (
        ecRaw === "" ||
        ecRaw == null ||
        String(ecRaw).trim() === ""
      ) {
        delete sd.employeeCount;
      } else {
        const n = Number(ecRaw);
        if (!Number.isNaN(n)) sd.employeeCount = n;
        else delete sd.employeeCount;
      }
      sd.paymentTerms =
        sd.paymentTerms === "Other" ? sd.paymentTermsOther : sd.paymentTerms;

      const payload = {
        formCode,
        version,
        ...form,
        supplierDetails: {
          ...sd,
        },
        complianceDetails: {
          ...form.complianceDetails,
          qualityManagementSystem: {
            ...form.complianceDetails.qualityManagementSystem,
            dateAccredited: form.complianceDetails.qualityManagementSystem
              .dateAccredited
              ? new Date(
                  form.complianceDetails.qualityManagementSystem.dateAccredited
                )
              : undefined,
          },
        },
        generalDeclaration: {
          ...form.generalDeclaration,
          signedAt: form.generalDeclaration.signedAt
            ? new Date(form.generalDeclaration.signedAt)
            : undefined,
        },
        purchasingDeclaration: {
          ...form.purchasingDeclaration,
          signedAt: form.purchasingDeclaration.signedAt
            ? new Date(form.purchasingDeclaration.signedAt)
            : undefined,
        },
      };

      const response = await fetch(
        "/api/proxy/qhse/due-diligence/due-diligence-questionnaire/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let msg = `Server error: ${response.status}.`;
        try {
          const j = JSON.parse(errorText);
          if (j.message) msg = j.message;
          if (j.hint) msg += " " + j.hint;
        } catch {
          if (errorText) msg += " " + errorText.slice(0, 80);
        }
        throw new Error(msg);
      }

      const result = await response.json();
      if (result.data?.serialNumber) setSerialNumber(result.data.serialNumber);

      // Show prominent success message
      setSuccess("Form submitted successfully!" + (result.data?.serialNumber ? ` Serial No: ${result.data.serialNumber}` : ""));
      setError("");

      // Reset form
      setForm({
        supplierDetails: {
          inchargeNameAndCompany: "",
          contactDetails: "",
          companyRegistrationDetails: "",
          parentCompanyDetails: "",
          hasSubsidiaries: null,
          subsidiariesDetails: "",
          employeeCount: "",
          businessActivities: "",
          operatingLocations: "",
          paymentTerms: "30 days",
          paymentTermsOther: "",
        },
        legalDeclarations: {
          missingLicenses: null,
          criminalOffenceHistory: null,
          insolvencyStatus: null,
          businessMisconduct: null,
          unpaidStatutoryPayments: null,
          declarationDetails: "",
        },
        insuranceDetails: {
          pAndI: "",
          workersCompensation: "",
          publicLiability: "",
          otherInsurance: "",
        },
        complianceDetails: {
          qualityManagementSystem: {
            registered: null,
            dateAccredited: "",
            accreditedBy: "",
          },
          environmentalPolicy: null,
          esgProgramme: null,
          otherCertifications: "",
          isoCertification: "",
          drugAlcoholPolicy: null,
          drugAlcoholProcedure: "",
          healthSafetyPolicy: null,
          incidentsLastTwoYears: null,
          incidentDetails: "",
        },
        ethicsAndGovernance: {
          ethicalConductPolicy: null,
          equalityDiversityPolicy: null,
          subcontracting: null,
          subcontractingDetails: "",
          dueDiligenceForSubcontractors: null,
          antiCorruptionAcknowledged: null,
          modernSlaveryAcknowledged: null,
          sanctionsExposure: null,
        },
        financialAndData: {
          creditRatingDetails: "",
          turnoverLastTwoYears: "",
          dataProtectionPolicy: null,
          bankerDetails: {
            name: "",
            branch: "",
            contactDetails: "",
            ibanOrAccountNumber: "",
          },
        },
        generalDeclaration: {
          name: "",
          positionHeld: "",
          signedAt: "",
          signature: "",
          signatureImage: "",
        },
        purchasingDeclaration: {
          name: "",
          positionHeld: "",
          signedAt: "",
          signature: "",
          signatureImage: "",
        },
        additionalDocuments: [],
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSuccess("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Custom Navigation / Header */}
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
              Supplier Due Diligence Questionnaire
            </h1>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 min-w-[250px] w-full md:w-auto">
            <div className="text-sm space-y-1 text-gray-300">
              <div className="flex justify-between gap-4">
                <span>Form Code:</span>
                <span className="text-white font-semibold">{formCode || defaultFormCode}</span>
              </div>
              {serialNumber && (
                <div className="flex justify-between gap-4">
                  <span>Serial No:</span>
                  <span className="text-white font-semibold">{serialNumber}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span>Rev.No.:</span>
                <span className="text-white font-semibold">{version}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Rev Date:</span>
                <span className="text-white font-semibold">N/A</span>
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

        {error && (
          <div className="text-sm text-red-300 bg-red-900 border border-red-700 rounded-lg px-4 py-3 flex items-center gap-2 mb-6">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="text-base text-emerald-300 bg-emerald-900/90 border border-emerald-700 rounded-lg px-6 py-4 mb-6">
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {(
          <form className="rounded-2xl border border-gray-700 bg-gray-800/90 backdrop-blur-sm p-6 space-y-8 shadow-xl">
            {/* Section 1: Basic Details (Q1-Q9) */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                Basic Details
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    1. Name of the person Incharge and company providing product
                    or service <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.supplierDetails.inchargeNameAndCompany}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.inchargeNameAndCompany",
                        e.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    2. Full style contact details{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.supplierDetails.contactDetails}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.contactDetails",
                        e.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    3. Company Registration Detail
                  </label>
                  <input
                    type="text"
                    value={form.supplierDetails.companyRegistrationDetails}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.companyRegistrationDetails",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                  <p className="text-xs text-white mt-1">
                    Please send a copy of trade license.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    4. Name of parent company (s) (if applicable): Registration
                    number of parent company (if applicable):
                  </label>
                  <input
                    type="text"
                    value={form.supplierDetails.parentCompanyDetails}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.parentCompanyDetails",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    5. Does the organisation have any subsidiaries? If yes, then
                    please state the name of the organisation(s):
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSubsidiaries"
                        checked={form.supplierDetails.hasSubsidiaries === true}
                        onChange={() =>
                          handleChange("supplierDetails.hasSubsidiaries", true)
                        }
                        className="h-4 w-4 text-orange-500"
                      />
                      <span className="text-sm text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSubsidiaries"
                        checked={form.supplierDetails.hasSubsidiaries === false}
                        onChange={() =>
                          handleChange("supplierDetails.hasSubsidiaries", false)
                        }
                        className="h-4 w-4 text-orange-500"
                      />
                      <span className="text-sm text-white">No</span>
                    </label>
                  </div>
                  {form.supplierDetails.hasSubsidiaries === true && (
                    <input
                      type="text"
                      value={form.supplierDetails.subsidiariesDetails}
                      onChange={(e) =>
                        handleChange(
                          "supplierDetails.subsidiariesDetails",
                          e.target.value
                        )
                      }
                      placeholder="Enter subsidiary names"
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    6. How many employees does your organisation employ?
                  </label>
                  <input
                    type="number"
                    value={form.supplierDetails.employeeCount}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.employeeCount",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    7. Kindly mention the business activities the organization
                    involved in:
                  </label>
                  <textarea
                    rows={3}
                    value={form.supplierDetails.businessActivities}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.businessActivities",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    8. Kindly mention the locations of operation, distribution,
                    and logistics:
                  </label>
                  <textarea
                    rows={3}
                    value={form.supplierDetails.operatingLocations}
                    onChange={(e) =>
                      handleChange(
                        "supplierDetails.operatingLocations",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    9. Please advise payment terms that can be offered:
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleChange("supplierDetails.paymentTerms", "30 days")
                      }
                      className={`px-4 py-2 rounded-lg border text-sm transition ${
                        form.supplierDetails.paymentTerms === "30 days"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-gray-700 text-white border-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      30 days
                    </button>
                    <span className="text-sm text-white">Others:</span>
                    <input
                      type="text"
                      value={form.supplierDetails.paymentTermsOther}
                      onChange={(e) =>
                        handleChange(
                          "supplierDetails.paymentTermsOther",
                          e.target.value
                        )
                      }
                      onFocus={() =>
                        handleChange("supplierDetails.paymentTerms", "Other")
                      }
                      placeholder="Enter other payment terms"
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Legal Declarations (Q10-Q15) */}
            <div className="space-y-6 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                Legal & Financial Declarations
              </h2>
              <p className="text-sm text-white font-medium">
                Kindly answer if any of the below applicable to your
                organization or any Director(s) or Partner(s).
              </p>

              <div className="space-y-4">
                {[
                  {
                    key: "missingLicenses",
                    label:
                      "10. Does not possess necessary licenses or memberships in appropriate as required by law?",
                  },
                  {
                    key: "criminalOffenceHistory",
                    label:
                      "11. Has been found guilty of a criminal offence related to business or professional affair?",
                  },
                  {
                    key: "insolvencyStatus",
                    label:
                      "12. Do you currently face bankruptcy, insolvency, compulsory winding up, or similar proceedings?",
                  },
                  {
                    key: "businessMisconduct",
                    label: "13. Committed a grave business misconduct?",
                  },
                  {
                    key: "unpaidStatutoryPayments",
                    label:
                      "14. Taxes and other statutory payments have not been paid?",
                  },
                ].map((q) => (
                  <div key={q.key} className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white block">
                      {q.label}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.legalDeclarations[q.key] === true}
                          onChange={() =>
                            handleChange(`legalDeclarations.${q.key}`, true)
                          }
                          className="h-4 w-4 text-orange-500"
                        />
                        <span className="text-sm text-white">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.legalDeclarations[q.key] === false}
                          onChange={() =>
                            handleChange(`legalDeclarations.${q.key}`, false)
                          }
                          className="h-4 w-4 text-orange-500"
                        />
                        <span className="text-sm text-white">No</span>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    15. If the answer to any of these is 'Yes' please give brief
                    details below, including what has been done to put things
                    right:
                  </label>
                  <textarea
                    rows={4}
                    value={form.legalDeclarations.declarationDetails}
                    onChange={(e) =>
                      handleChange(
                        "legalDeclarations.declarationDetails",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Insurance Details (Q16-Q19) */}
            <div className="space-y-6 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                Insurance Details
              </h2>
              <p className="text-sm text-white font-medium">
                Please provide details of your current insurance cover
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    16. P & I (Protection & Indemnity):
                  </label>
                  <input
                    type="text"
                    value={form.insuranceDetails.pAndI}
                    onChange={(e) =>
                      handleChange("insuranceDetails.pAndI", e.target.value)
                    }
                    placeholder="Value"
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    17. Workmen's Compensation / Employers' Liability (or
                    equivalent):
                  </label>
                  <input
                    type="text"
                    value={form.insuranceDetails.workersCompensation}
                    onChange={(e) =>
                      handleChange(
                        "insuranceDetails.workersCompensation",
                        e.target.value
                      )
                    }
                    placeholder="Value"
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    18. Liability for public and third parties:
                  </label>
                  <input
                    type="text"
                    value={form.insuranceDetails.publicLiability}
                    onChange={(e) =>
                      handleChange(
                        "insuranceDetails.publicLiability",
                        e.target.value
                      )
                    }
                    placeholder="Value"
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    19. Other (please provide details):
                  </label>
                  <input
                    type="text"
                    value={form.insuranceDetails.otherInsurance}
                    onChange={(e) =>
                      handleChange(
                        "insuranceDetails.otherInsurance",
                        e.target.value
                      )
                    }
                    placeholder="Value"
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Quality & Compliance (Q20-Q28) */}
            <div className="space-y-6 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                Quality & Compliance
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    20. Is your company registered with a recognised quality
                    management system? Please share details.
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="qualityManagementSystem"
                        checked={
                          form.complianceDetails.qualityManagementSystem
                            .registered === true
                        }
                        onChange={() =>
                          handleChange(
                            "complianceDetails.qualityManagementSystem.registered",
                            true
                          )
                        }
                        className="h-4 w-4 text-orange-500"
                      />
                      <span className="text-sm text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="qualityManagementSystem"
                        checked={
                          form.complianceDetails.qualityManagementSystem
                            .registered === false
                        }
                        onChange={() =>
                          handleChange(
                            "complianceDetails.qualityManagementSystem.registered",
                            false
                          )
                        }
                        className="h-4 w-4 text-orange-500"
                      />
                      <span className="text-sm text-white">No</span>
                    </label>
                  </div>
                  {form.complianceDetails.qualityManagementSystem.registered ===
                    true && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white block mb-1">
                          Date Accredited:
                        </label>
                        <input
                          type="date"
                          value={
                            form.complianceDetails.qualityManagementSystem
                              .dateAccredited
                          }
                          onChange={(e) =>
                            handleChange(
                              "complianceDetails.qualityManagementSystem.dateAccredited",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:outline-none focus:border-gray-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white block mb-1">
                          Accredited by:
                        </label>
                        <input
                          type="text"
                          value={
                            form.complianceDetails.qualityManagementSystem
                              .accreditedBy
                          }
                          onChange={(e) =>
                            handleChange(
                              "complianceDetails.qualityManagementSystem.accreditedBy",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {[
                  {
                    key: "environmentalPolicy",
                    label:
                      "21. Is there a written policy for environmental and sustainability in your organization? If yes, please provide a copy",
                  },
                  {
                    key: "esgProgramme",
                    label:
                      "22. Does your company have an Environmental, Social and Governance Programme?",
                  },
                  {
                    key: "drugAlcoholPolicy",
                    label:
                      "25. Is there a drug and alcohol policy in your organization?",
                  },
                  {
                    key: "healthSafetyPolicy",
                    label:
                      "27. Is there a written Health and Safety at Work Policy in your organization?",
                  },
                  {
                    key: "incidentsLastTwoYears",
                    label:
                      "28. In the past two years, has the company experienced any incident relating to health and safety?",
                  },
                ].map((q) => (
                  <div key={q.key} className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white block">
                      {q.label}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.complianceDetails[q.key] === true}
                          onChange={() =>
                            handleChange(`complianceDetails.${q.key}`, true)
                          }
                          className="h-4 w-4 text-orange-500"
                        />
                        <span className="text-sm text-white">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.complianceDetails[q.key] === false}
                          onChange={() =>
                            handleChange(`complianceDetails.${q.key}`, false)
                          }
                          className="h-4 w-4 text-orange-500"
                        />
                        <span className="text-sm text-white">No</span>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    23. Is there any other industry-recognized certification you
                    hold? If so, please share details:
                  </label>
                  <textarea
                    rows={3}
                    value={form.complianceDetails.otherCertifications}
                    onChange={(e) =>
                      handleChange(
                        "complianceDetails.otherCertifications",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    24. Does your company hold a valid ISO 9001, 14001, 45001
                    certificate or equivalent?
                  </label>
                  <input
                    type="text"
                    value={form.complianceDetails.isoCertification}
                    onChange={(e) =>
                      handleChange(
                        "complianceDetails.isoCertification",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                {form.complianceDetails.drugAlcoholPolicy === false && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-white block">
                      26. If no, please advise the procedure you adopt in case
                      of alcohol and drug abuse by your employees.
                    </label>
                    <textarea
                      rows={3}
                      value={form.complianceDetails.drugAlcoholProcedure}
                      onChange={(e) =>
                        handleChange(
                          "complianceDetails.drugAlcoholProcedure",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y"
                    />
                  </div>
                )}

                {form.complianceDetails.incidentsLastTwoYears === true && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-white block">
                      29. If 'Yes' to the above, please provide details:
                    </label>
                    <textarea
                      rows={4}
                      value={form.complianceDetails.incidentDetails}
                      onChange={(e) =>
                        handleChange(
                          "complianceDetails.incidentDetails",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Ethics & Governance (Q30-Q37) */}
            <div className="space-y-6 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                Ethics & Governance
              </h2>

              <div className="space-y-4">
                {[
                  {
                    key: "ethicalConductPolicy",
                    label:
                      "30. Is your company in possession of an Ethical Conduct Policy?",
                  },
                  {
                    key: "equalityDiversityPolicy",
                    label:
                      "31. Is there a written Equality, Diversity and Inclusion Policy in your company, so that discrimination can be avoided, and equal opportunities to be given to all employees, wherever possible?",
                  },
                  {
                    key: "subcontracting",
                    label:
                      "32. If any aspect of the services provided to the company is subcontracted to any third party.",
                  },
                  {
                    key: "dueDiligenceForSubcontractors",
                    label:
                      "34. The company must ensure that due diligence has been completed for the subcontractors and they must company with company's policies and procedures.",
                  },
                  {
                    key: "antiCorruptionAcknowledged",
                    label:
                      "35. Please ensure that you have read and understood the Anti-Corruption and Bribery Policy and you will comply with (Policy attached).",
                  },
                  {
                    key: "modernSlaveryAcknowledged",
                    label:
                      "36. Please ensure that you have read and understood our policy on Modern Slavery, and you will comply with (Policy attached).",
                  },
                  {
                    key: "sanctionsExposure",
                    label:
                      "37. Is your organization subject to any active sanctions issued by EU, UN, UK, OFAC or UAE Federal Law.",
                  },
                ].map((q) => (
                  <div key={q.key} className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white block">
                      {q.label}
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.ethicsAndGovernance[q.key] === true}
                          onChange={() =>
                            handleChange(`ethicsAndGovernance.${q.key}`, true)
                          }
                          className="h-4 w-4 text-orange-500"
                        />
                        <span className="text-sm text-white">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.key}
                          checked={form.ethicsAndGovernance[q.key] === false}
                          onChange={() =>
                            handleChange(`ethicsAndGovernance.${q.key}`, false)
                          }
                          className="h-4 w-4 text-orange-500"
                        />
                        <span className="text-sm text-white">No</span>
                      </label>
                    </div>
                  </div>
                ))}

                {form.ethicsAndGovernance.subcontracting === true && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-white block">
                      33. If 'Yes', please provide details.
                    </label>
                    <textarea
                      rows={3}
                      value={form.ethicsAndGovernance.subcontractingDetails}
                      onChange={(e) =>
                        handleChange(
                          "ethicsAndGovernance.subcontractingDetails",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 6: Financial & Data Protection (Q38-Q41) */}
            <div className="space-y-6 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                Financial & Data Protection
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    38. What is your current credit rating and name of credit
                    rating agency?
                  </label>
                  <input
                    type="text"
                    value={form.financialAndData.creditRatingDetails}
                    onChange={(e) =>
                      handleChange(
                        "financialAndData.creditRatingDetails",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    39. What was your turnover in the last two years:
                  </label>
                  <input
                    type="text"
                    value={form.financialAndData.turnoverLastTwoYears}
                    onChange={(e) =>
                      handleChange(
                        "financialAndData.turnoverLastTwoYears",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    40. *Do you have General Data Protection Policy in written,
                    please provide a copy.
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dataProtectionPolicy"
                        checked={
                          form.financialAndData.dataProtectionPolicy === true
                        }
                        onChange={() =>
                          handleChange(
                            "financialAndData.dataProtectionPolicy",
                            true
                          )
                        }
                        className="h-4 w-4 text-orange-500"
                      />
                      <span className="text-sm text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dataProtectionPolicy"
                        checked={
                          form.financialAndData.dataProtectionPolicy === false
                        }
                        onChange={() =>
                          handleChange(
                            "financialAndData.dataProtectionPolicy",
                            false
                          )
                        }
                        className="h-4 w-4 text-orange-500"
                      />
                      <span className="text-sm text-white">No</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-white block">
                    41. What is the name and branch of your bankers (who could
                    provide a reference)?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white block mb-1">
                        Name:
                      </label>
                      <input
                        type="text"
                        value={form.financialAndData.bankerDetails.name}
                        onChange={(e) =>
                          handleChange(
                            "financialAndData.bankerDetails.name",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white block mb-1">
                        Branch:
                      </label>
                      <input
                        type="text"
                        value={form.financialAndData.bankerDetails.branch}
                        onChange={(e) =>
                          handleChange(
                            "financialAndData.bankerDetails.branch",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white block mb-1">
                        Contact details:
                      </label>
                      <input
                        type="text"
                        value={
                          form.financialAndData.bankerDetails.contactDetails
                        }
                        onChange={(e) =>
                          handleChange(
                            "financialAndData.bankerDetails.contactDetails",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white block mb-1">
                        IBAN and/or account number:
                      </label>
                      <input
                        type="text"
                        value={
                          form.financialAndData.bankerDetails
                            .ibanOrAccountNumber
                        }
                        onChange={(e) =>
                          handleChange(
                            "financialAndData.bankerDetails.ibanOrAccountNumber",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Additional Documents */}
            <div className="space-y-4 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                Additional Documents
              </h2>
              <p className="text-sm text-gray-300">
                Attach any supporting documents (e.g. certificates, policies).
              </p>
              <div className="rounded-lg border border-gray-700 bg-gray-700/50 p-4 space-y-3">
                <label className="flex flex-col gap-2">
                  <span className="text-xs text-gray-300">
                    Choose files to attach (multiple allowed)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={handleAdditionalDocumentsChange}
                    className="w-full text-sm text-white file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:font-medium hover:file:opacity-90 file:cursor-pointer"
                  />
                </label>
                {form.additionalDocuments?.length > 0 && (
                  <ul className="space-y-2">
                    {form.additionalDocuments.map((doc, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white"
                      >
                        <span className="truncate">{doc.fileName}</span>
                        <button
                          type="button"
                          onClick={() => removeAdditionalDocument(index)}
                          className="ml-2 shrink-0 rounded px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Section 7: Declarations */}
            <div className="space-y-6 border-t border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                Declarations
              </h2>

              {/* General Declaration */}
              <div className="rounded-lg border border-gray-700 bg-gray-700/50 p-4 space-y-4">
                <h3 className="text-base font-semibold text-orange-400">
                  General Declaration
                </h3>
                <p className="text-sm text-white">
                  I declare that the information as requested by our client has
                  been provided and it is true to the best of my knowledge. I
                  understand that the evaluation process, to gauze the
                  suitability of my organization to be invited for the tenders
                  as announced by our client, will be based on the information
                  as provided in this questionnaire. I affirm that my
                  organisation complies to all applicable local, international
                  and industry regulations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Name:
                    </label>
                    <input
                      type="text"
                      value={form.generalDeclaration.name}
                      onChange={(e) =>
                        handleChange("generalDeclaration.name", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Position Held:
                    </label>
                    <input
                      type="text"
                      value={form.generalDeclaration.positionHeld}
                      onChange={(e) =>
                        handleChange(
                          "generalDeclaration.positionHeld",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-300 block mb-1">
                      Signature (type or upload image):
                    </label>
                    <textarea
                      rows={2}
                      value={form.generalDeclaration.signature}
                      onChange={(e) =>
                        handleChange(
                          "generalDeclaration.signature",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y mb-2"
                      placeholder="Type your signature here"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600">
                          Upload signature image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            handleSignatureImageChange(
                              "generalDeclaration",
                              e
                            )
                          }
                        />
                      </label>
                      {form.generalDeclaration.signatureImage && (
                        <>
                          <img
                            src={form.generalDeclaration.signatureImage}
                            alt="Signature"
                            className="h-10 border border-gray-600 rounded object-contain bg-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              clearSignatureImage("generalDeclaration")
                            }
                            className="text-xs text-red-300 hover:text-red-200"
                          >
                            Remove image
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Date (dd/mm/yyyy):
                    </label>
                    <input
                      type="date"
                      value={form.generalDeclaration.signedAt}
                      onChange={(e) =>
                        handleChange(
                          "generalDeclaration.signedAt",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Purchasing Declaration */}
              <div className="rounded-lg border border-gray-700 bg-gray-700/50 p-4 space-y-4">
                <h3 className="text-base font-semibold text-orange-400">
                  Purchasing Terms & Conditions Declaration
                </h3>
                <p className="text-sm text-white">
                  We declare that we have read and understood the company's
                  purchasing terms and condition and we affirm that the company
                  will comply with all the provisions mentioned therein and it
                  will not constitute any breach of a policy, local applicable
                  laws, and regulations thereupon.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Name:
                    </label>
                    <input
                      type="text"
                      value={form.purchasingDeclaration.name}
                      onChange={(e) =>
                        handleChange(
                          "purchasingDeclaration.name",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Position Held:
                    </label>
                    <input
                      type="text"
                      value={form.purchasingDeclaration.positionHeld}
                      onChange={(e) =>
                        handleChange(
                          "purchasingDeclaration.positionHeld",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-300 block mb-1">
                      Signature (type or upload image):
                    </label>
                    <textarea
                      rows={2}
                      value={form.purchasingDeclaration.signature}
                      onChange={(e) =>
                        handleChange(
                          "purchasingDeclaration.signature",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:outline-none focus:border-gray-400 resize-y mb-2"
                      placeholder="Type your signature here"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600">
                          Upload signature image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            handleSignatureImageChange(
                              "purchasingDeclaration",
                              e
                            )
                          }
                        />
                      </label>
                      {form.purchasingDeclaration.signatureImage && (
                        <>
                          <img
                            src={form.purchasingDeclaration.signatureImage}
                            alt="Signature"
                            className="h-10 border border-gray-600 rounded object-contain bg-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              clearSignatureImage("purchasingDeclaration")
                            }
                            className="text-xs text-red-300 hover:text-red-200"
                          >
                            Remove image
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">
                      Date (dd/mm/yyyy):
                    </label>
                    <input
                      type="date"
                      value={form.purchasingDeclaration.signedAt}
                      onChange={(e) =>
                        handleChange(
                          "purchasingDeclaration.signedAt",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
              <div className="flex items-center gap-4">
                {formCode ? (
                  <div className="text-xs text-white">
                    Form Code:{" "}
                    <span className="text-white font-semibold">{formCode}</span>{" "}
                    | Version:{" "}
                    <span className="text-white font-semibold">{version}</span>
                  </div>
                ) : (
                  <div className="text-xs text-red-300">
                    Form code missing. Please refresh and try again.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !formCode}
                className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold uppercase tracking-wider transition disabled:opacity-60 disabled:cursor-not-allowed "
              >
                {submitting ? "Submitting..." : "Submit Form"}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}

