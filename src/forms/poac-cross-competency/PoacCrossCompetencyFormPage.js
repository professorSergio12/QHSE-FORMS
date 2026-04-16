"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFormConfig, QHSE_FIXED_FORM_CODES } from "@/lib/qhseFormConfig";
import {
  POAC_EVALUATION_ITEMS,
  EVALUATION_CATEGORIES,
} from "./poacEvaluationItems";

const initialEvaluationItems = POAC_EVALUATION_ITEMS.map((item) => ({
  srNo: item.srNo,
  area: item.area,
  evaluation: null,
  remarks: "",
}));

export default function PoacCrossCompetencyFormPage() {
  const config = getFormConfig("poac-cross-competency");
  const [form, setForm] = useState({
    nameOfPOAC: "",
    evaluationDate: "",
    jobRefNo: "",
    leadPOAC: "",
    dischargingVessel: "",
    receivingVessel: "",
    location: "",
    typeOfOperation: "",
    weatherCondition: "",
    deadweightDischarging: "",
    deadweightReceiving: "",
    evaluationItems: initialEvaluationItems,
    leadPOACComment: "",
    leadPOACName: "",
    leadPOACDate: "",
    leadPOACSignature: "",
    opsSupportTeamComment: "",
    opsTeamName: "",
    opsTeamDate: "",
    opsTeamSignature: "",
    opsTeamSupdtName: "",
    opsTeamSupdtDate: "",
    opsTeamSupdtSignature: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const displayFormCode =
    config?.formCode || QHSE_FIXED_FORM_CODES.POAC_CROSS_COMPETENCY;
  const displayVersion = "1.0";
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitResult, setSubmitResult] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSignatureUpload = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await fileToBase64(file);
      handleChange(field, base64);
    } catch (_) {}
    e.target.value = "";
  };

  const clearSignature = (field) => handleChange(field, "");

  const handleEvaluationChange = (index, field, value) => {
    setForm((prev) => {
      const newItems = [...prev.evaluationItems];
      if (field === "evaluation") {
        let numValue = null;
        if (value && value !== "" && value != null) {
          const parsed = typeof value === "string" ? parseInt(value, 10) : Number(value);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) numValue = parsed;
        }
        newItems[index] = { ...newItems[index], [field]: numValue };
        if (numValue != null && numValue >= 3) {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[`evaluation_${index}`];
            return next;
          });
        }
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return { ...prev, evaluationItems: newItems };
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.nameOfPOAC?.trim()) errors.nameOfPOAC = "Name of POAC is required";
    if (!form.evaluationDate) errors.evaluationDate = "Evaluation date is required";
    if (!form.jobRefNo?.trim()) errors.jobRefNo = "Job Ref No is required";
    if (!form.leadPOAC?.trim()) errors.leadPOAC = "Lead POAC is required";
    form.evaluationItems.forEach((item, index) => {
      if (item.evaluation != null && item.evaluation !== undefined) {
        const evalNum = parseInt(item.evaluation, 10);
        if (!isNaN(evalNum) && evalNum < 3 && (!item.remarks || !item.remarks.trim())) {
          errors[`evaluation_${index}`] = `Remarks required for item ${item.srNo} when evaluation is less than 3`;
        }
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setValidationErrors({});

    if (!validateForm()) {
      setSubmitting(false);
      setError("Please fix the validation errors before submitting");
      return;
    }

    try {
      const payload = {
        nameOfPOAC: form.nameOfPOAC.trim(),
        evaluationDate: form.evaluationDate,
        jobRefNo: form.jobRefNo.trim(),
        leadPOAC: form.leadPOAC.trim(),
        ...(form.dischargingVessel?.trim() && { dischargingVessel: form.dischargingVessel.trim() }),
        ...(form.receivingVessel?.trim() && { receivingVessel: form.receivingVessel.trim() }),
        ...(form.location?.trim() && { location: form.location.trim() }),
        ...(form.typeOfOperation?.trim() && { typeOfOperation: form.typeOfOperation.trim() }),
        ...(form.weatherCondition?.trim() && { weatherCondition: form.weatherCondition.trim() }),
        ...(form.deadweightDischarging !== "" && form.deadweightDischarging != null && { deadweightDischarging: Number(form.deadweightDischarging) }),
        ...(form.deadweightReceiving !== "" && form.deadweightReceiving != null && { deadweightReceiving: Number(form.deadweightReceiving) }),
        evaluationItems: form.evaluationItems.map((item) => {
          let evaluationValue = null;
          if (item.evaluation != null && item.evaluation !== "" && item.evaluation !== undefined) {
            const parsed = parseInt(item.evaluation, 10);
            evaluationValue = !isNaN(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
          }
          return {
            srNo: item.srNo,
            evaluation: evaluationValue,
            remarks: item.remarks?.trim() || "",
          };
        }),
        ...(form.leadPOACComment?.trim() && { leadPOACComment: form.leadPOACComment.trim() }),
        ...(form.leadPOACName?.trim() && { leadPOACName: form.leadPOACName.trim() }),
        ...(form.leadPOACDate && { leadPOACDate: form.leadPOACDate }),
        ...(form.leadPOACSignature?.trim() && { leadPOACSignature: form.leadPOACSignature.trim() }),
        ...(form.opsSupportTeamComment?.trim() && { opsSupportTeamComment: form.opsSupportTeamComment.trim() }),
        ...(form.opsTeamName?.trim() && { opsTeamName: form.opsTeamName.trim() }),
        ...(form.opsTeamDate && { opsTeamDate: form.opsTeamDate }),
        ...(form.opsTeamSignature?.trim() && { opsTeamSignature: form.opsTeamSignature.trim() }),
        ...(form.opsTeamSupdtName?.trim() && { opsTeamSupdtName: form.opsTeamSupdtName.trim() }),
        ...(form.opsTeamSupdtDate && { opsTeamSupdtDate: form.opsTeamSupdtDate }),
        ...(form.opsTeamSupdtSignature?.trim() && { opsTeamSupdtSignature: form.opsTeamSupdtSignature.trim() }),
        status: "Submitted",
      };

      const res = await fetch("/api/proxy/qhse/cross-competency/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {}

      if (!res.ok) {
        throw new Error(data.error || data.message || `Server error: ${res.status}`);
      }

      setSubmitResult(data.data || {});
      setMessage("Form submitted successfully. Form Code and Serial Number are generated by the main app.");
      setError(null);
      setValidationErrors({});
      setForm({
        nameOfPOAC: "",
        evaluationDate: "",
        jobRefNo: "",
        leadPOAC: "",
        dischargingVessel: "",
        receivingVessel: "",
        location: "",
        typeOfOperation: "",
        weatherCondition: "",
        deadweightDischarging: "",
        deadweightReceiving: "",
        evaluationItems: initialEvaluationItems.map((item) => ({
          srNo: item.srNo,
          area: item.area,
          evaluation: null,
          remarks: "",
        })),
        leadPOACComment: "",
        leadPOACName: "",
        leadPOACDate: "",
        leadPOACSignature: "",
        opsSupportTeamComment: "",
        opsTeamName: "",
        opsTeamDate: "",
        opsTeamSignature: "",
        opsTeamSupdtName: "",
        opsTeamSupdtDate: "",
        opsTeamSupdtSignature: "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Something went wrong");
      setMessage(null);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-white bg-gray-700 focus:outline-none focus:border-gray-400 ${
      hasError ? "border-red-500" : "border-gray-600"
    }`;
  const labelClass = "block text-xs font-medium text-gray-300 mb-1.5";
  const sectionClass = "bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-xl";
  const sectionTitleClass = "text-lg font-bold text-white mb-4";

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
              POAC Cross Competency
            </h1>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 min-w-[250px] w-full md:w-auto">
            <div className="text-sm space-y-1 text-gray-300">
              <div className="flex justify-between gap-4">
                <span>Form Code:</span>
                <span className="text-white font-semibold">{displayFormCode}</span>
              </div>
              {submitResult?.serialNumber && (
                <div className="flex justify-between gap-4">
                  <span>Serial No:</span>
                  <span className="text-white font-semibold">{submitResult.serialNumber}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span>Rev.No.:</span>
                <span className="text-white font-semibold">{displayVersion}</span>
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
          <div className="text-sm text-red-300 bg-red-900 border border-red-700 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}
        {message && (
          <div className="text-base text-emerald-300 bg-emerald-900 border border-emerald-700 rounded-lg px-6 py-4 mb-6">
            <span className="font-semibold">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* POAC Details */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>POAC Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Name of POAC <span className="text-red-400">*</span></label>
                <input type="text" className={inputClass(!!validationErrors.nameOfPOAC)} value={form.nameOfPOAC} onChange={(e) => handleChange("nameOfPOAC", e.target.value)} required />
                {validationErrors.nameOfPOAC && <p className="text-xs text-red-400 mt-1">{validationErrors.nameOfPOAC}</p>}
              </div>
              <div>
                <label className={labelClass}>Evaluation Date <span className="text-red-400">*</span></label>
                <input type="date" className={inputClass(!!validationErrors.evaluationDate)} value={form.evaluationDate} onChange={(e) => handleChange("evaluationDate", e.target.value)} required />
                {validationErrors.evaluationDate && <p className="text-xs text-red-400 mt-1">{validationErrors.evaluationDate}</p>}
              </div>
              <div>
                <label className={labelClass}>Job Ref No <span className="text-red-400">*</span></label>
                <input type="text" className={inputClass(!!validationErrors.jobRefNo)} value={form.jobRefNo} onChange={(e) => handleChange("jobRefNo", e.target.value)} required />
                {validationErrors.jobRefNo && <p className="text-xs text-red-400 mt-1">{validationErrors.jobRefNo}</p>}
              </div>
              <div>
                <label className={labelClass}>Lead POAC <span className="text-red-400">*</span></label>
                <input type="text" className={inputClass(!!validationErrors.leadPOAC)} value={form.leadPOAC} onChange={(e) => handleChange("leadPOAC", e.target.value)} required />
                {validationErrors.leadPOAC && <p className="text-xs text-red-400 mt-1">{validationErrors.leadPOAC}</p>}
              </div>
              <div>
                <label className={labelClass}>Discharging Vessel</label>
                <input type="text" className={inputClass(false)} value={form.dischargingVessel} onChange={(e) => handleChange("dischargingVessel", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Receiving Vessel</label>
                <input type="text" className={inputClass(false)} value={form.receivingVessel} onChange={(e) => handleChange("receivingVessel", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input type="text" className={inputClass(false)} value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Type of Operation</label>
                <input type="text" className={inputClass(false)} value={form.typeOfOperation} onChange={(e) => handleChange("typeOfOperation", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Weather Condition</label>
                <input type="text" className={inputClass(false)} value={form.weatherCondition} onChange={(e) => handleChange("weatherCondition", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Deadweight Discharging</label>
                <input type="number" step="any" className={inputClass(false)} value={form.deadweightDischarging} onChange={(e) => handleChange("deadweightDischarging", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Deadweight Receiving</label>
                <input type="number" step="any" className={inputClass(false)} value={form.deadweightReceiving} onChange={(e) => handleChange("deadweightReceiving", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Evaluation Items */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Evaluation Items</h2>
            <p className="text-xs text-gray-400 mb-4">Rate each item 1–5. Remarks are required when evaluation is less than 3.</p>
            <div className="space-y-6">
              {EVALUATION_CATEGORIES.map((category) => {
                const categoryItems = form.evaluationItems.filter((item) => item.srNo >= category.start && item.srNo <= category.end);
                return (
                  <div key={category.name} className="border border-gray-700 rounded-xl p-4 bg-gray-700/30">
                    <h3 className="text-sm font-bold text-gray-200 mb-3">{category.name}</h3>
                    <div className="space-y-3">
                      {categoryItems.map((item) => {
                        const globalIndex = form.evaluationItems.findIndex((e) => e.srNo === item.srNo);
                        const hasError = validationErrors[`evaluation_${globalIndex}`];
                        const evalNum = typeof item.evaluation === "number" ? item.evaluation : item.evaluation != null ? parseInt(item.evaluation, 10) : null;
                        const showRemarks = evalNum != null && !isNaN(evalNum) && evalNum < 3;
                        return (
                          <div key={item.srNo} className="border border-gray-600 rounded-lg p-3 bg-gray-700/20">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs font-semibold text-gray-400 shrink-0">{item.srNo}.</span>
                              <p className="text-xs text-gray-300 flex-1 min-w-0">{item.area}</p>
                              <div className="shrink-0 w-[100px]">
                                <label className="block text-[10px] text-gray-400 mb-1">Evaluation (1-5)</label>
                                <select
                                  className={inputClass(hasError) + " py-1.5 w-full"}
                                  value={item.evaluation != null && item.evaluation !== undefined ? String(item.evaluation) : ""}
                                  onChange={(e) => handleEvaluationChange(globalIndex, "evaluation", e.target.value)}
                                >
                                  <option value="">Select</option>
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                  <option value="4">4</option>
                                  <option value="5">5</option>
                                </select>
                              </div>
                            </div>
                            {(showRemarks || item.remarks) && (
                              <div className="mt-2 pl-9">
                                <label className="block text-[10px] text-gray-400 mb-1">Remarks {showRemarks && <span className="text-red-400">*</span>}</label>
                                <textarea
                                  className={inputClass(hasError) + " py-1.5 resize-y"}
                                  rows={2}
                                  value={item.remarks}
                                  onChange={(e) => handleEvaluationChange(globalIndex, "remarks", e.target.value)}
                                  placeholder="Required when evaluation &lt; 3"
                                  required={showRemarks}
                                />
                                {hasError && <p className="text-[10px] text-red-400 mt-1">{validationErrors[`evaluation_${globalIndex}`]}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead POAC Comments & Signatures */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Lead POAC Comments & Signatures</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Lead POAC Comment</label>
                <textarea className={inputClass(false)} rows={4} value={form.leadPOACComment} onChange={(e) => handleChange("leadPOACComment", e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Lead POAC Name</label>
                  <input type="text" className={inputClass(false)} value={form.leadPOACName} onChange={(e) => handleChange("leadPOACName", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Lead POAC Date</label>
                  <input type="date" className={inputClass(false)} value={form.leadPOACDate} onChange={(e) => handleChange("leadPOACDate", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Lead POAC Signature</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    className={inputClass(false)}
                    value={form.leadPOACSignature?.startsWith?.("data:") ? "" : (form.leadPOACSignature || "")}
                    onChange={(e) => handleChange("leadPOACSignature", e.target.value)}
                    placeholder="Type signature or name"
                  />
                  <p className="text-[10px] text-gray-400">Or upload signature image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSignatureUpload("leadPOACSignature", e)}
                    className="block w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-600 file:text-white file:font-medium hover:file:bg-gray-500 file:cursor-pointer"
                  />
                  {form.leadPOACSignature?.startsWith?.("data:") && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <img src={form.leadPOACSignature} alt="Lead POAC signature" className="h-14 border border-gray-600 rounded object-contain bg-white" />
                      <button type="button" onClick={() => clearSignature("leadPOACSignature")} className="text-xs text-red-400 hover:text-red-300">
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Operations Support Team Comment */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Operations Support Team Comment</h2>
            <textarea className={inputClass(false)} rows={4} value={form.opsSupportTeamComment} onChange={(e) => handleChange("opsSupportTeamComment", e.target.value)} />
          </div>

          {/* Ops Team Signatures */}
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Operations Team Signatures</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Ops Team Name</label>
                <input type="text" className={inputClass(false)} value={form.opsTeamName} onChange={(e) => handleChange("opsTeamName", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Ops Team Date</label>
                <input type="date" className={inputClass(false)} value={form.opsTeamDate} onChange={(e) => handleChange("opsTeamDate", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Ops Team Signature</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    className={inputClass(false)}
                    value={form.opsTeamSignature?.startsWith?.("data:") ? "" : (form.opsTeamSignature || "")}
                    onChange={(e) => handleChange("opsTeamSignature", e.target.value)}
                    placeholder="Type signature or name"
                  />
                  <p className="text-[10px] text-gray-400">Or upload signature image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSignatureUpload("opsTeamSignature", e)}
                    className="block w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-600 file:text-white file:font-medium hover:file:bg-gray-500 file:cursor-pointer"
                  />
                  {form.opsTeamSignature?.startsWith?.("data:") && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <img src={form.opsTeamSignature} alt="Ops Team signature" className="h-14 border border-gray-600 rounded object-contain bg-white" />
                      <button type="button" onClick={() => clearSignature("opsTeamSignature")} className="text-xs text-red-400 hover:text-red-300">
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>Ops Team Superintendent Name</label>
                <input type="text" className={inputClass(false)} value={form.opsTeamSupdtName} onChange={(e) => handleChange("opsTeamSupdtName", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Ops Team Superintendent Date</label>
                <input type="date" className={inputClass(false)} value={form.opsTeamSupdtDate} onChange={(e) => handleChange("opsTeamSupdtDate", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Ops Team Superintendent Signature</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    className={inputClass(false)}
                    value={form.opsTeamSupdtSignature?.startsWith?.("data:") ? "" : (form.opsTeamSupdtSignature || "")}
                    onChange={(e) => handleChange("opsTeamSupdtSignature", e.target.value)}
                    placeholder="Type signature or name"
                  />
                  <p className="text-[10px] text-gray-400">Or upload signature image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSignatureUpload("opsTeamSupdtSignature", e)}
                    className="block w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-600 file:text-white file:font-medium hover:file:bg-gray-500 file:cursor-pointer"
                  />
                  {form.opsTeamSupdtSignature?.startsWith?.("data:") && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <img src={form.opsTeamSupdtSignature} alt="Ops Superintendent signature" className="h-14 border border-gray-600 rounded object-contain bg-white" />
                      <button type="button" onClick={() => clearSignature("opsTeamSupdtSignature")} className="text-xs text-red-400 hover:text-red-300">
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/" className="px-6 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white font-medium hover:bg-gray-600 transition">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Form"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
