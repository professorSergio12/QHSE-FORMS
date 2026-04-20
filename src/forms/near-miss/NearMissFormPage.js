"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFormConfig, QHSE_FIXED_FORM_CODES } from "@/lib/qhseFormConfig";

const AREA_OPTIONS = [
  "Main Deck",
  "Bridge",
  "Offshore",
  "Support Craft",
  "Manifold Area",
  "Mobilization & Demobilization",
  "Transportation",
  "Cargo Control Room",
  "Underway / Anchoring",
  "Other",
];

const POSITION_OPTIONS = [
  "Mooring Master - POAC",
  "Management",
  "Third Party",
  "Other",
];

const TYPE_OPTIONS = [
  "Near Miss",
  "Collision",
  "Fatality",
  "Injury",
  "Pollution",
  "Contact Damage",
  "Best Practice",
];

export default function NearMissFormPage() {
  const router = useRouter();
  const config = getFormConfig("near-miss");
  const formCode = config?.formCode || QHSE_FIXED_FORM_CODES.NEAR_MISS_INCIDENT;
  const [form, setForm] = useState({
    jobRef: "",
    vesselName: "",
    date: "",
    observerName: "",
    position: "",
    positionOther: "",
    email: "",
    typeOfReporting: "",
    area: "",
    description: "",
    immediateCause: "",
    rootCause: "",
    correctiveAction: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [lastSubmittedSerial, setLastSubmittedSerial] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      // Match Oceane Marine NearMiss schema (required fields + enums)
      if (
        !form.jobRef?.trim() ||
        !form.vesselName?.trim() ||
        !form.date ||
        !form.observerName?.trim() ||
        !form.position ||
        !form.email?.trim() ||
        !form.typeOfReporting ||
        !form.area ||
        !form.description?.trim() ||
        !form.immediateCause?.trim() ||
        !form.rootCause?.trim() ||
        !form.correctiveAction?.trim()
      ) {
        setSubmitError("Please fill all required fields marked with *");
        setSubmitting(false);
        return;
      }

      const incidentDate = new Date(form.date);
      if (Number.isNaN(incidentDate.getTime())) {
        setSubmitError("Please enter a valid date.");
        setSubmitting(false);
        return;
      }

      const payload = {
        JobRefNo: form.jobRef.trim(),
        VesselName: form.vesselName.trim(),
        timeOfIncident: incidentDate.toISOString(),
        NameOfObserver: form.observerName.trim(),
        PositionOfObserver: form.position,
        email: form.email.trim(),
        TypeOfReporting: form.typeOfReporting,
        AreaOfNearMiss: form.area,
        Description: form.description.trim(),
        ImmediateCause: form.immediateCause.trim(),
        RootCause: form.rootCause.trim(),
        CorrectiveAction: form.correctiveAction.trim(),
        status: "Under Review",
      };

      const createPath = config?.createPath || "near-miss-form/create";
      const res = await fetch(`/api/proxy/${createPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let responseData = {};
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          res.ok
            ? "Invalid response from server."
            : `Server error: ${res.status}. ${responseText.slice(0, 120)}`
        );
      }
      if (!res.ok) {
        throw new Error(
          responseData.error ||
            responseData.message ||
            `Server error: ${res.status} ${res.statusText}`
        );
      }

      const newSerial = responseData.data?.serialNumber || "";
      setLastSubmittedSerial(newSerial);
      setSubmitSuccess(
        "Form submitted successfully. A confirmation email will be sent to the address you provided."
      );
      setForm({
        jobRef: "",
        vesselName: "",
        date: "",
        observerName: "",
        position: "",
        positionOther: "",
        email: "",
        typeOfReporting: "",
        area: "",
        description: "",
        immediateCause: "",
        rootCause: "",
        correctiveAction: "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(
        error.message || "Something went wrong while submitting the form."
      );
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
              Near Miss / Incident &amp; Injury Reporting
            </h1>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 min-w-[250px] w-full md:w-auto">
            <div className="text-sm space-y-1 text-gray-300">
              <div className="flex justify-between gap-4">
                <span>Form Code:</span>
                <span className="text-white font-semibold">{formCode}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Rev.No.:</span>
                <span className="text-white font-semibold">1.0</span>
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
          {submitSuccess && (
            <div className="mb-6 rounded-lg bg-emerald-900/80 border border-emerald-700 px-4 py-3 text-center">
              <p className="text-emerald-200 font-semibold">{submitSuccess}</p>
              {lastSubmittedSerial && (
                <p className="text-emerald-100/90 text-sm mt-1">
                  Form Code: <span className="font-medium">{formCode}</span>
                  {" · "}
                  Serial No: <span className="font-medium">{lastSubmittedSerial}</span>
                </p>
              )}
            </div>
          )}

          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-10 shadow-xl">
              <p className="text-gray-300 text-sm mb-4 italic">
                When you submit this form, it will not automatically collect
                your details like name and email address unless you provide it
                yourself.
              </p>
              <p className="mb-6 text-xs text-red-400 font-medium">
                * Required
              </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* 1. Job Ref # */}
              <div>
                <label className="block font-medium text-white">
                  1. Job Ref # <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-red-400 mb-1">
                  Enter Job Ref # (Example: 053-2023)
                </p>
                <input
                  type="text"
                  name="jobRef"
                  value={form.jobRef}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter your answer"
                />
              </div>

              {/* 2. Vessel Name */}
              <div>
                <label className="block font-medium text-white">
                  2. Vessel Name <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-red-400 mb-1">Enter Vessel Name</p>
                <input
                  type="text"
                  name="vesselName"
                  value={form.vesselName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter your answer"
                />
              </div>

              {/* 3. Date */}
              <div>
                <label className="block font-medium text-white">
                  3. Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white focus:outline-none focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* 4. Name of the Observer */}
              <div>
                <label className="block font-medium text-white">
                  4. Name of the Observer{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="observerName"
                  value={form.observerName}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter your answer"
                />
              </div>

              {/* 5. Position of Observer */}
              <div>
                <p className="font-medium text-white">
                  5. Position of Observer{" "}
                  <span className="text-red-400">*</span>
                </p>
                <div className="mt-2 space-y-2">
                  {POSITION_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-sm text-white"
                    >
                      <input
                        type="radio"
                        name="position"
                        value={option}
                        checked={form.position === option}
                        onChange={handleChange}
                        className="h-4 w-4 text-orange-400 focus:ring-orange-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                  {form.position === "Other" && (
                    <input
                      type="text"
                      name="positionOther"
                      value={form.positionOther}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                      placeholder="Please specify"
                    />
                  )}
                </div>
              </div>

              {/* 6. Email address */}
              <div>
                <label className="block font-medium text-white">
                  6. Email address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter your answer"
                />
              </div>

              {/* 7. Type of Reporting */}
              <div>
                <p className="font-medium text-white">
                  7. Type of Reporting <span className="text-red-400">*</span>
                </p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TYPE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-sm text-white"
                    >
                      <input
                        type="radio"
                        name="typeOfReporting"
                        value={option}
                        checked={form.typeOfReporting === option}
                        onChange={handleChange}
                        className="h-4 w-4 text-orange-400 focus:ring-orange-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 8. Area of Near Miss, Incident or Injury */}
              <div>
                <label className="block font-medium text-white">
                  8. Area of Near Miss, Incident or Injury{" "}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white focus:outline-none focus:outline-none focus:border-gray-400"
                >
                  <option value="">Select your answer</option>
                  {AREA_OPTIONS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* 9. Description */}
              <div>
                <label className="block font-medium text-white">
                  9. Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 resize-y focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter your answer"
                />
              </div>

              {/* 10. Immediate Cause */}
              <div>
                <label className="block font-medium text-white">
                  10. Immediate Cause <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="immediateCause"
                  value={form.immediateCause}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 resize-y focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter your answer"
                />
              </div>

              {/* 11. Root Cause */}
              <div>
                <label className="block font-medium text-white">
                  11. Root Cause <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="rootCause"
                  value={form.rootCause}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 resize-y focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter your answer"
                />
              </div>

              {/* 12. Corrective Action */}
              <div>
                <label className="block font-medium text-white">
                  12. Corrective Action <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="correctiveAction"
                  value={form.correctiveAction}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 resize-y focus:outline-none focus:outline-none focus:border-gray-400"
                  placeholder="Enter your answer"
                />
              </div>

              <p className="text-xs text-gray-300">
                You can print a copy of your answer after you submit.
              </p>

              {submitError && (
                <p className="text-sm text-red-400">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-sm text-emerald-400">{submitSuccess}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex w-full justify-center rounded-md bg-orange-600 py-3 text-white font-semibold  hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
