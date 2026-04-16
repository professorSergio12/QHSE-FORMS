"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getFormConfig, QHSE_FIXED_FORM_CODES } from "@/lib/qhseFormConfig";

const CheckboxComponent = ({ question, checked, onChange }) => {
  return (
    <div className="mb-4">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-5 h-5 text-gray-400 bg-gray-700 border-gray-600 focus:ring-0 focus:border-gray-400 rounded"
        />
        <span className="text-gray-300 group-hover:text-white transition-colors flex-1">
          {question}
        </span>
      </label>
    </div>
  );
};

export default function HSEInductionChecklist() {
  const router = useRouter();
  const config = getFormConfig("hse-induction-checklist");
  const formCode = config?.formCode || QHSE_FIXED_FORM_CODES.HSE_INDUCTION;
  const version = "1.0";
  const revisionDate = "";
  const [serialNumber, setSerialNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    formNo: formCode || QHSE_FIXED_FORM_CODES.HSE_INDUCTION,
    revisionNo: "1.0",
    revisionDate: "",
    approvedBy: "",
    employeeOrContractorName: "",
    dateOfInduction: "",
    location: "",
    hseChecklist: {
      hsePolicy: false,
      facilityTour: false,
      reportingFire: false,
      occupationalHazards: false,
      injuryIllnessNearMissReporting: false,
      emergencyActionPlan: false,
      wasteManagementProcedures: false,
      ppeRequirements: false,
      hazcomMsds: false,
      spillReportingProcedures: false,
      ergonomicsAwareness: false,
      housekeepingExpectations: false,
      disciplinaryProcedure: false,
    },
    jobSpecificChecklist: {
      safeOperationOfToolsMachinery: false,
      trainingAndCertificationRequirements: false,
      riskAssessmentOverview: false,
      safeLiftingAndBackInjuryPrevention: false,
      craneOperationAndSlingInspection: false,
      loadingUnloadingHandlingProcedures: false,
    },
    signatures: {
      employeeSignature: "",
      employeeSignatureDate: "",
      inductionGivenBySignature: "",
    },
    submittedBy: "",
  });

  const updateChecklist = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSignature = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      signatures: {
        ...prev.signatures,
        [field]: value,
      },
    }));
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSignatureImage = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await fileToBase64(file);
      updateSignature(field, base64);
    } catch (_) { }
    e.target.value = "";
  };

  const clearSignatureImage = (field) => updateSignature(field, "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation to match API requirements
    if (!formData.employeeOrContractorName?.trim()) {
      alert("Employee/Contractor Name is required");
      return;
    }

    if (!formData.dateOfInduction) {
      alert("Date of Induction is required");
      return;
    }

    if (!formData.location?.trim()) {
      alert("Location is required");
      return;
    }

    const hasEmployeeSig =
      formData.signatures?.employeeSignature &&
      (formData.signatures.employeeSignature.startsWith("data:") ||
        formData.signatures.employeeSignature.trim() !== "");
    if (!hasEmployeeSig) {
      alert("Employee signature is required (type or upload image)");
      return;
    }

    const hasInductionSig =
      formData.signatures?.inductionGivenBySignature &&
      (formData.signatures.inductionGivenBySignature.startsWith("data:") ||
        formData.signatures.inductionGivenBySignature.trim() !== "");
    if (!hasInductionSig) {
      alert("Induction giver signature is required (type or upload image)");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        formNo: formData.formNo,
        revisionNo: formData.revisionNo,
        revisionDate: formData.revisionDate,
        approvedBy: formData.approvedBy,
        employeeOrContractorName: formData.employeeOrContractorName.trim(),
        dateOfInduction: formData.dateOfInduction,
        location: formData.location.trim(),
        hseChecklist: formData.hseChecklist,
        jobSpecificChecklist: formData.jobSpecificChecklist,
        signatures: {
          employeeSignature:
            typeof formData.signatures.employeeSignature === "string" &&
              formData.signatures.employeeSignature.startsWith("data:")
              ? formData.signatures.employeeSignature
              : (formData.signatures.employeeSignature || "").trim(),
          employeeSignatureDate:
            formData.signatures.employeeSignatureDate || null,
          inductionGivenBySignature:
            typeof formData.signatures.inductionGivenBySignature === "string" &&
              formData.signatures.inductionGivenBySignature.startsWith("data:")
              ? formData.signatures.inductionGivenBySignature
              : (formData.signatures.inductionGivenBySignature || "").trim(),
        },
        submittedBy: formData.submittedBy?.trim() || null,
      };

      const createPath = config?.createPath || "qhse/form-checklist/hse-induction-checklist/create";
      const response = await fetch(`/api/proxy/${createPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const responseText = await response.text();
      let result = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          response.ok
            ? "Invalid response from server."
            : `Request failed (${response.status}). ${responseText.slice(0, 120)}`
        );
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to submit form");
      }

      if (result.data?.serialNumber) setSerialNumber(result.data.serialNumber);
      alert(result.data?.serialNumber ? `Form submitted successfully. Serial No: ${result.data.serialNumber}` : "Form submitted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen futuristic-bg">
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
              HSE Induction Checklist
            </h1>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 min-w-[250px] w-full md:w-auto">
            <div className="text-sm space-y-1 text-gray-300">
              <div className="flex justify-between gap-4">
                <span>Form Code:</span>
                <span className="text-white font-semibold">
                  {formCode || formData.formNo || config?.formCode || "—"}
                </span>
              </div>
              {serialNumber && (
                <div className="flex justify-between gap-4">
                  <span>Serial No:</span>
                  <span className="text-white font-semibold">{serialNumber}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span>Rev.No.:</span>
                <span className="text-white font-semibold">
                  {version || formData.revisionNo || "N/A"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Rev Date:</span>
                <span className="text-white font-semibold">
                  {(() => {
                    if (revisionDate || formData.revisionDate) {
                      const dateStr = revisionDate || formData.revisionDate;
                      if (dateStr) {
                        try {
                          return new Date(dateStr).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          );
                        } catch {
                          return dateStr;
                        }
                      }
                    }
                    return "N/A";
                  })()}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Approved by:</span>
                <span className="text-white font-semibold">
                  {formData.approvedBy || "JS"}
                </span>
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
          {/* Header Section */}
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl mb-8 p-8 border border-gray-700 shadow-xl">

            <p className="text-gray-300 text-sm mb-6 italic">
              Discuss each of the following items with the concerned. This
              orientation should be completed prior to the employee or contractor
              starting work / visitor being allowed in the workshop.
            </p>

            {/* General Information */}
            <div className="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600">
              <h2 className="text-xl font-bold text-white mb-4">
                General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="employeeOrContractorName"
                    className="block text-white text-sm font-medium mb-2"
                  >
                    Employee / Contractor Name
                  </label>
                  <input
                    id="employeeOrContractorName"
                    type="text"
                    value={formData.employeeOrContractorName}
                    onChange={(e) =>
                      updateField("employeeOrContractorName", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all"
                    placeholder="Enter employee/contractor name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dateOfInduction"
                    className="block text-white text-sm font-medium mb-2"
                  >
                    Date of Induction
                  </label>
                  <input
                    id="dateOfInduction"
                    type="date"
                    value={formData.dateOfInduction}
                    onChange={(e) =>
                      updateField("dateOfInduction", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="location"
                    className="block text-white text-sm font-medium mb-2"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all"
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* HSE Policy Checklist */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-xl">
              <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
                <h2 className="text-2xl font-bold text-white">
                  HSE Policy Checklist
                </h2>
              </div>
              <div className="space-y-6">
                <CheckboxComponent
                  question="HSE Policy"
                  checked={formData.hseChecklist.hsePolicy}
                  onChange={(value) =>
                    updateChecklist("hseChecklist", "hsePolicy", value)
                  }
                />
                <CheckboxComponent
                  question="A facility tour including a discussion of the types of processes performed, location of bulletin boards for postings, breakrooms, restrooms, First-Aid cabinets, fire-fighting equipment, evacuation routes & assembly areas"
                  checked={formData.hseChecklist.facilityTour}
                  onChange={(value) =>
                    updateChecklist("hseChecklist", "facilityTour", value)
                  }
                />
                <CheckboxComponent
                  question="Reporting fire"
                  checked={formData.hseChecklist.reportingFire}
                  onChange={(value) =>
                    updateChecklist("hseChecklist", "reportingFire", value)
                  }
                />
                <CheckboxComponent
                  question="Occupational Hazards"
                  checked={formData.hseChecklist.occupationalHazards}
                  onChange={(value) =>
                    updateChecklist("hseChecklist", "occupationalHazards", value)
                  }
                />
                <CheckboxComponent
                  question="The procedure for reporting an industrial injury, illness, near-miss accident, or an unsafe condition"
                  checked={formData.hseChecklist.injuryIllnessNearMissReporting}
                  onChange={(value) =>
                    updateChecklist(
                      "hseChecklist",
                      "injuryIllnessNearMissReporting",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="The facility Emergency Action Plan"
                  checked={formData.hseChecklist.emergencyActionPlan}
                  onChange={(value) =>
                    updateChecklist("hseChecklist", "emergencyActionPlan", value)
                  }
                />
                <CheckboxComponent
                  question="Waste Management Procedures"
                  checked={formData.hseChecklist.wasteManagementProcedures}
                  onChange={(value) =>
                    updateChecklist(
                      "hseChecklist",
                      "wasteManagementProcedures",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="PPE (Personal Protective Equipment) requirements by area including the proper use, care & maintenance of such equipment"
                  checked={formData.hseChecklist.ppeRequirements}
                  onChange={(value) =>
                    updateChecklist("hseChecklist", "ppeRequirements", value)
                  }
                />
                <CheckboxComponent
                  question="(HazCom) - Location of MSDS sheets, summary of hazardous chemicals on site"
                  checked={formData.hseChecklist.hazcomMsds}
                  onChange={(value) =>
                    updateChecklist("hseChecklist", "hazcomMsds", value)
                  }
                />
                <CheckboxComponent
                  question="The procedure for reporting spills, and the importance of keeping containers covered"
                  checked={formData.hseChecklist.spillReportingProcedures}
                  onChange={(value) =>
                    updateChecklist(
                      "hseChecklist",
                      "spillReportingProcedures",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="Ergonomics (awareness)"
                  checked={formData.hseChecklist.ergonomicsAwareness}
                  onChange={(value) =>
                    updateChecklist("hseChecklist", "ergonomicsAwareness", value)
                  }
                />
                <CheckboxComponent
                  question="The importance and expectations for good housekeeping"
                  checked={formData.hseChecklist.housekeepingExpectations}
                  onChange={(value) =>
                    updateChecklist(
                      "hseChecklist",
                      "housekeepingExpectations",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="The disciplinary procedure for Safety and Environmental Violations"
                  checked={formData.hseChecklist.disciplinaryProcedure}
                  onChange={(value) =>
                    updateChecklist(
                      "hseChecklist",
                      "disciplinaryProcedure",
                      value
                    )
                  }
                />
              </div>
            </div>

            {/* Job Function / Facility Operation */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-xl">
              <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
                <h2 className="text-2xl font-bold text-white">
                  As appropriate by job function & facility operation
                </h2>
              </div>
              <div className="space-y-6">
                <CheckboxComponent
                  question="Safe operation of any tools/machinery that may be required"
                  checked={
                    formData.jobSpecificChecklist.safeOperationOfToolsMachinery
                  }
                  onChange={(value) =>
                    updateChecklist(
                      "jobSpecificChecklist",
                      "safeOperationOfToolsMachinery",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="Training & certification requirements prior to driving a forklift or other motorized equipment"
                  checked={
                    formData.jobSpecificChecklist
                      .trainingAndCertificationRequirements
                  }
                  onChange={(value) =>
                    updateChecklist(
                      "jobSpecificChecklist",
                      "trainingAndCertificationRequirements",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="Risk Assessment overview"
                  checked={formData.jobSpecificChecklist.riskAssessmentOverview}
                  onChange={(value) =>
                    updateChecklist(
                      "jobSpecificChecklist",
                      "riskAssessmentOverview",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="Safe Lifting & Back Injury Prevention"
                  checked={
                    formData.jobSpecificChecklist
                      .safeLiftingAndBackInjuryPrevention
                  }
                  onChange={(value) =>
                    updateChecklist(
                      "jobSpecificChecklist",
                      "safeLiftingAndBackInjuryPrevention",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="Safe crane operation & sling inspection"
                  checked={
                    formData.jobSpecificChecklist.craneOperationAndSlingInspection
                  }
                  onChange={(value) =>
                    updateChecklist(
                      "jobSpecificChecklist",
                      "craneOperationAndSlingInspection",
                      value
                    )
                  }
                />
                <CheckboxComponent
                  question="Procedures for safely loading/unloading and handling of equipment"
                  checked={
                    formData.jobSpecificChecklist
                      .loadingUnloadingHandlingProcedures
                  }
                  onChange={(value) =>
                    updateChecklist(
                      "jobSpecificChecklist",
                      "loadingUnloadingHandlingProcedures",
                      value
                    )
                  }
                />
              </div>
            </div>

            {/* Commitment Section */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-xl">
              <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
                <h2 className="text-2xl font-bold text-white">
                  Employee's / visitor's / contractor's Commitment
                </h2>
              </div>
              <p className="text-gray-300 mb-4">
                My signature below indicates the following:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-gray-300">
                <li>a) I have been instructed on all items checked above,</li>
                <li>
                  b) I have been instructed on the safe way to perform my job,
                </li>
                <li>
                  c) I understand my responsibility to work safely, to comply with
                  company health & safety rules, to inspect equipment or vehicles
                  prior to use, and to not operate any equipment I am unfamiliar
                  with until properly trained to do so,
                </li>
                <li>d) My questions regarding safety were fully answered.</li>
              </ul>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="employeeSignature"
                    className="block text-white text-sm font-medium mb-2"
                  >
                    Signature (type or upload image)
                  </label>
                  <input
                    id="employeeSignature"
                    type="text"
                    value={
                      formData.signatures.employeeSignature?.startsWith("data:")
                        ? ""
                        : formData.signatures.employeeSignature || ""
                    }
                    onChange={(e) =>
                      updateSignature("employeeSignature", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                    placeholder="Type signature or full name"
                  />
                  <p className="text-xs text-gray-400 mt-1">Or upload signature image</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 text-sm font-medium">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          handleSignatureImage("employeeSignature", e)
                        }
                      />
                      Choose image
                    </label>
                    {formData.signatures.employeeSignature?.startsWith("data:") && (
                      <>
                        <img
                          src={formData.signatures.employeeSignature}
                          alt="Employee signature"
                          className="h-12 w-20 object-contain rounded border border-gray-600 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => clearSignatureImage("employeeSignature")}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Remove image
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="employeeSignatureDate"
                    className="block text-white text-sm font-medium mb-2"
                  >
                    Date
                  </label>
                  <input
                    id="employeeSignatureDate"
                    type="date"
                    value={formData.signatures.employeeSignatureDate}
                    onChange={(e) =>
                      updateSignature("employeeSignatureDate", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Induction Giver Signature */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-xl">
              <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
                <h2 className="text-2xl font-bold text-white">
                  Signature of Person Giving Induction (type or upload image)
                </h2>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={
                    formData.signatures.inductionGivenBySignature?.startsWith(
                      "data:"
                    )
                      ? ""
                      : formData.signatures.inductionGivenBySignature || ""
                  }
                  onChange={(e) =>
                    updateSignature("inductionGivenBySignature", e.target.value)
                  }
                  className="w-full max-w-md px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                  placeholder="Type signature or full name"
                />
                <p className="text-xs text-gray-400">Or upload signature image</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 text-sm font-medium">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        handleSignatureImage("inductionGivenBySignature", e)
                      }
                    />
                    Choose image
                  </label>
                  {formData.signatures.inductionGivenBySignature?.startsWith(
                    "data:"
                  ) && (
                      <>
                        <img
                          src={formData.signatures.inductionGivenBySignature}
                          alt="Induction giver signature"
                          className="h-12 w-20 object-contain rounded border border-gray-600 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            clearSignatureImage("inductionGivenBySignature")
                          }
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Remove image
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>

            {/* Submitted By */}
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-xl">
              <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
                <h2 className="text-2xl font-bold text-white">Submitted By</h2>
              </div>
              <div>
                <input
                  type="text"
                  value={formData.submittedBy}
                  onChange={(e) => updateField("submittedBy", e.target.value)}
                  className="w-full max-w-md px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all"
                  placeholder="Enter name"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pb-8">
              <button
                type="submit"
                className="px-8 py-3 bg-gray-600 hover:bg-gray-500 cursor-pointer text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Form"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
