"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFormConfig, QHSE_FIXED_FORM_CODES } from "@/lib/qhseFormConfig";

const QuestionComponent = ({
  question,
  value,
  onChange,
  showRemarks = false,
  remarksValue,
  onRemarksChange,
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-4 mb-2">
        <span className="text-sm font-semibold text-gray-300 min-w-[60px]">
          {question.qNo}
        </span>
        <p className="text-white flex-1">{question.question}</p>
      </div>
      <div className="flex gap-6 ml-[76px]">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={`question-${question.qNo}`}
            value="Yes"
            checked={value === "Yes"}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-gray-400 bg-gray-700 border-gray-600 focus:ring-0 focus:border-gray-400"
          />
          <span className="text-gray-300 group-hover:text-white transition-colors">
            Yes
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={`question-${question.qNo}`}
            value="No"
            checked={value === "No"}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-gray-400 bg-gray-700 border-gray-600 focus:ring-0 focus:border-gray-400"
          />
          <span className="text-gray-300 group-hover:text-white transition-colors">
            No
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={`question-${question.qNo}`}
            value="NA"
            checked={value === "NA"}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-gray-400 bg-gray-700 border-gray-600 focus:ring-0 focus:border-gray-400"
          />
          <span className="text-gray-300 group-hover:text-white transition-colors">
            NA
          </span>
        </label>
      </div>
      {showRemarks && (
        <div className="ml-[76px] mt-3">
          <input
            type="text"
            value={remarksValue || ""}
            onChange={(e) => onRemarksChange(e.target.value)}
            placeholder="Enter details..."
            className="w-full max-w-md px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all"
          />
        </div>
      )}
    </div>
  );
};

const TextQuestionComponent = ({
  question,
  value,
  onChange,
  placeholder = "Enter details...",
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-4 mb-2">
        <span className="text-sm font-semibold text-gray-300 min-w-[60px]">
          {question.qNo}
        </span>
        <p className="text-white flex-1">{question.question}</p>
      </div>
      <div className="ml-[76px] mt-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full max-w-md px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all"
        />
      </div>
    </div>
  );
};

export default function TransferAuditReportPage() {
  const config = getFormConfig("transfer-audit-report");
  const formCode = config?.formCode || QHSE_FIXED_FORM_CODES.STS_TRANSFER_AUDIT;
  const version = "1.0";
  const revisionDate = new Date().toLocaleDateString();
  const [serialNumber, setSerialNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [formData, setFormData] = useState({
    formCode: formCode || QHSE_FIXED_FORM_CODES.STS_TRANSFER_AUDIT,
    version,
    revisionDate,
    header: {
      locationName: "",
      date: "",
      jobNo: "",
      dischargingVessel: "",
      receivingVessel: "",
    },
    sectionA_PrePlanning: [
      {
        qNo: "1.1",
        question: "Was adequate notice given to you before this assignment?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.2",
        question:
          "Were you provided with location information including relevant contact information?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.3",
        question:
          "Do you have access to the local area risk assessment for the operating location?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.4",
        question:
          "Do you have access to the latest version of the Oceane Fenders DMCC Operations Manual and Appendices?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.5",
        question:
          "Did operational timings allow a sufficient rest period before commencement of operations?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.6",
        question:
          "Did you receive and accept the completed SSQs, area JPO and vessel Q88s?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.7",
        question: "Were you made aware of any vessel irregularities?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.8",
        question:
          "Local base agents have been informed of all relevant details applicable to the operation?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.9",
        question:
          "Were pre-arrival instructions sufficiently clear to ensure both vessels arrive prepared for the STS operation?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "1.10",
        question:
          "Any amendments to be made to the pre-arrival and planning processes to enable a smoother STS operation?",
        answer: "",
        remarks: "",
      },
    ],
    sectionB_MobilizationToDemobilization: [
      {
        qNo: "2.1",
        question:
          "Are the service providers/personnel involved with mobilizing the equipment punctual, efficient, competent, and conversant in English?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "2.2",
        question: "Are the service providers all wearing PPE?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "2.3",
        question:
          "Were there any operational delays that could have been prevented by local partners/agents?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "2.4",
        question: "Did you have to exercise your Stop Work Authority?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "2.5",
        question: "Did you report an incident during your operation?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "2.6",
        question:
          "If Yes to the above question, did you receive adequate guidance from the Marine and HSE departments in a timely manner?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "2.7",
        question:
          "If Yes to question 2.4, did you receive acknowledgement from Head Office of receipt of the incident form and notified of the incident number?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "2.8",
        question:
          "Did you observe any hazards which are not covered in either the Generic or Area Specific Risk Assessments?",
        answer: "",
        remarks: "",
      },
    ],
    sectionC_SupportCraft: [
      {
        qNo: "3.1",
        question: "Which support craft are you using?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "3.2",
        question: "Are safe boarding arrangements always provided?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "3.3",
        question:
          "Is the support craft in generally good order and suitable for the task at hand?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "3.4",
        question:
          "Is the support craft Master familiar or experienced with STS operations?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "3.5",
        question: "Are the support craft crew all wearing appropriate PPE?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "3.6",
        question:
          "Is the support craft able to communicate effectively with the vessels involved in the STS operation?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "3.7",
        question:
          "Does the fender rigging method alongside/onboard leave the fenders exposed to preventable damage?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "3.8",
        question:
          "Does the hose stowage method onboard leave the hoses exposed to preventable damage?",
        answer: "",
        remarks: "",
      },
    ],
    sectionD_STSEquipment: [
      {
        qNo: "4.1",
        question:
          "Have you been provided with VHF radio in good working order?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "4.2",
        question:
          "Is the STS equipment and Lifting Strops in a visibly good condition?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "4.3",
        question:
          "Is the Hose Blanks has been bolted properly with bolt thread facing inward and correct size of gaskets in place.",
        answer: "",
        remarks: "",
      },
      {
        qNo: "4.4",
        question:
          "Have you reported any equipment deficiencies or maintenance requirements on your Timesheet and Equipment Checklist?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "4.5",
        question:
          "If Yes to the above question, what equipment maintenance number(s) were you given?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "4.6",
        question:
          "Are all the current test certificates for both hoses and fenders available on location?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "4.7",
        question: "Have you been asked to conduct a stock check of equipment?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "4.8",
        question:
          "If Yes to the above question, were there any issues with conducting the stock check?",
        answer: "",
        remarks: "",
      },
    ],
    sectionE_PostOperation: [
      {
        qNo: "5.1",
        question:
          "Have environmental/commercial factors affecting the designated STS location changed sufficiently to warrant a re-evaluation?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "5.2",
        question: "Was provision of weather forecast information sufficient?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "5.3",
        question: "Please advise which weather forecasts were most accurate",
        answer: "",
        remarks: "",
      },
      {
        qNo: "5.4",
        question: "Were the surveyors professional and efficient?",
        answer: "",
        remarks: "",
      },
      {
        qNo: "5.5",
        question: "Were the local agents appointed professional and efficient?",
        answer: "",
        remarks: "",
      },
    ],
    comments: {
      remarks: "",
    },
    completedBy: {
      name: "",
      date: "",
      signature: "", // text or base64 data URL for image
    },
  });

  const updateQuestion = (section, index, field, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      newData[section] = [...newData[section]];
      newData[section][index] = { ...newData[section][index], [field]: value };
      return newData;
    });
  };

  const updateHeader = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      header: { ...prev.header, [field]: value },
    }));
  };

  const updateComments = (value) => {
    setFormData((prev) => ({
      ...prev,
      comments: { ...prev.comments, remarks: value },
    }));
  };

  const updateCompletedBy = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      completedBy: { ...prev.completedBy, [field]: value },
    }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === "string") updateCompletedBy("signature", dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearSignatureImage = () => {
    updateCompletedBy("signature", "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitSuccess("");
    setIsSubmitting(true);
    try {
      // Prepare the complete form data with formCode, version, and revisionDate
      const submitData = {
        ...formData,
        formCode,
        version,
        revisionDate,
      };

      const createPath = config?.createPath || "qhse/form-checklist/transfer-audit/create";
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
        const msg = result?.error || result?.message || `Server error: ${response.status}`;
        throw new Error(msg);
      }
      if (result.data?.serialNumber) setSerialNumber(result.data.serialNumber);
      const successMsg = result.data?.serialNumber
        ? `Form submitted successfully. Serial No: ${result.data.serialNumber}`
        : "Form submitted successfully.";
      setSubmitSuccess(successMsg);
      setFormData((prev) => ({
        ...prev,
        header: {
          locationName: "",
          date: "",
          jobNo: "",
          dischargingVessel: "",
          receivingVessel: "",
        },
        sectionA_PrePlanning: prev.sectionA_PrePlanning.map((q) => ({ ...q, answer: "", remarks: "" })),
        sectionB_MobilizationToDemobilization: prev.sectionB_MobilizationToDemobilization.map((q) => ({ ...q, answer: "", remarks: "" })),
        sectionC_SupportCraft: prev.sectionC_SupportCraft.map((q) => ({ ...q, answer: "", remarks: "" })),
        sectionD_STSEquipment: prev.sectionD_STSEquipment.map((q) => ({ ...q, answer: "", remarks: "" })),
        sectionE_PostOperation: prev.sectionE_PostOperation.map((q) => ({ ...q, answer: "", remarks: "" })),
        comments: { remarks: "" },
        completedBy: { name: "", date: "", signature: "" },
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
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
              STS Transfer Audit Report
            </h1>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 min-w-[250px] w-full md:w-auto">
            <div className="text-sm space-y-1 text-gray-300">
              <div className="flex justify-between gap-4">
                <span>Form Code:</span>
                <span className="text-white font-semibold">
                  {formCode || config?.formCode || QHSE_FIXED_FORM_CODES.STS_TRANSFER_AUDIT}
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
                  {version || "1.0"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Rev Date:</span>
                <span className="text-white font-semibold">
                  {revisionDate
                    ? (() => {
                        const d = new Date(revisionDate);
                        return Number.isNaN(d.getTime())
                          ? revisionDate
                          : d.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            });
                      })()
                    : "N/A"}
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
          {submitSuccess && (
            <div className="mb-6 text-base text-emerald-300 bg-emerald-900/90 border border-emerald-700 rounded-lg px-6 py-4">
              <span className="font-semibold">{submitSuccess}</span>
            </div>
          )}

          {/* General Information Section */}
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl mb-8 p-8 border border-gray-700 shadow-xl">
            <p className="text-gray-300 text-sm mb-6 italic">
              An STS Transfer Audit shall be conducted by an active POAC whilst on
              an operation for each base, annually as a minimum, or upon request.
            </p>

            <div className="bg-gray-700/80 rounded-lg p-4 mb-4 border border-gray-600">
              <h2 className="text-xl font-bold text-white mb-4">
                General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="locationName" className="block text-white text-sm font-medium mb-2">Location name</label>
                  <input id="locationName" type="text" value={formData.header.locationName} onChange={(e) => updateHeader("locationName", e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all" placeholder="Enter location name" />
                </div>
                <div>
                  <label htmlFor="date" className="block text-white text-sm font-medium mb-2">Date</label>
                  <input id="date" type="date" value={formData.header.date} onChange={(e) => updateHeader("date", e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all" />
                </div>
                <div>
                  <label htmlFor="jobNo" className="block text-white text-sm font-medium mb-2">Job no.</label>
                  <input id="jobNo" type="text" value={formData.header.jobNo} onChange={(e) => updateHeader("jobNo", e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all" placeholder="Enter job number" />
                </div>
                <div>
                  <label htmlFor="dischargingVessel" className="block text-white text-sm font-medium mb-2">Discharging vessel</label>
                  <input id="dischargingVessel" type="text" value={formData.header.dischargingVessel} onChange={(e) => updateHeader("dischargingVessel", e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all" placeholder="Enter discharging vessel" />
                </div>
                <div>
                  <label htmlFor="receivingVessel" className="block text-white text-sm font-medium mb-2">Receiving vessel</label>
                  <input id="receivingVessel" type="text" value={formData.header.receivingVessel} onChange={(e) => updateHeader("receivingVessel", e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all" placeholder="Enter receiving vessel" />
                </div>
              </div>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section A - Pre-planning */}
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-xl">
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white">A Pre-planning</h2>
            </div>
            <div className="space-y-6">
              {formData.sectionA_PrePlanning.map((question, index) => (
                <QuestionComponent
                  key={question.qNo}
                  question={question}
                  value={question.answer}
                  onChange={(value) =>
                    updateQuestion(
                      "sectionA_PrePlanning",
                      index,
                      "answer",
                      value
                    )
                  }
                  showRemarks={question.qNo === "1.10"}
                  remarksValue={question.remarks}
                  onRemarksChange={(value) =>
                    updateQuestion(
                      "sectionA_PrePlanning",
                      index,
                      "remarks",
                      value
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* Section B - Mobilization to Demobilization */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white">
                B Mobilization to Demobilization
              </h2>
            </div>
            <div className="space-y-6">
              {formData.sectionB_MobilizationToDemobilization.map(
                (question, index) => (
                  <QuestionComponent
                    key={question.qNo}
                    question={question}
                    value={question.answer}
                    onChange={(value) =>
                      updateQuestion(
                        "sectionB_MobilizationToDemobilization",
                        index,
                        "answer",
                        value
                      )
                    }
                    showRemarks={false}
                  />
                )
              )}
            </div>
          </div>

          {/* Section C - Support Craft */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white">C Support Craft</h2>
            </div>
            <div className="space-y-6">
              {formData.sectionC_SupportCraft.map((question, index) => {
                if (question.qNo === "3.1") {
                  return (
                    <TextQuestionComponent
                      key={question.qNo}
                      question={question}
                      value={question.remarks}
                      onChange={(value) =>
                        updateQuestion(
                          "sectionC_SupportCraft",
                          index,
                          "remarks",
                          value
                        )
                      }
                      placeholder="Enter support craft details..."
                    />
                  );
                }
                return (
                  <QuestionComponent
                    key={question.qNo}
                    question={question}
                    value={question.answer}
                    onChange={(value) =>
                      updateQuestion(
                        "sectionC_SupportCraft",
                        index,
                        "answer",
                        value
                      )
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Section D - STS Equipment */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white">D STS Equipment</h2>
            </div>
            <div className="space-y-6">
              {formData.sectionD_STSEquipment.map((question, index) => {
                if (question.qNo === "4.5") {
                  return (
                    <TextQuestionComponent
                      key={question.qNo}
                      question={question}
                      value={question.remarks}
                      onChange={(value) =>
                        updateQuestion(
                          "sectionD_STSEquipment",
                          index,
                          "remarks",
                          value
                        )
                      }
                      placeholder="Enter equipment maintenance number(s)..."
                    />
                  );
                }
                return (
                  <QuestionComponent
                    key={question.qNo}
                    question={question}
                    value={question.answer}
                    onChange={(value) =>
                      updateQuestion(
                        "sectionD_STSEquipment",
                        index,
                        "answer",
                        value
                      )
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Section E - Post Operation */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white">
                E Post Operation
              </h2>
            </div>
            <div className="space-y-6">
              {formData.sectionE_PostOperation.map((question, index) => {
                if (question.qNo === "5.3") {
                  return (
                    <TextQuestionComponent
                      key={question.qNo}
                      question={question}
                      value={question.remarks}
                      onChange={(value) =>
                        updateQuestion(
                          "sectionE_PostOperation",
                          index,
                          "remarks",
                          value
                        )
                      }
                      placeholder="Enter weather forecast details..."
                    />
                  );
                }
                return (
                  <QuestionComponent
                    key={question.qNo}
                    question={question}
                    value={question.answer}
                    onChange={(value) =>
                      updateQuestion(
                        "sectionE_PostOperation",
                        index,
                        "answer",
                        value
                      )
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white">Comments</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4 italic">
              Remarks, actions required, safety suggestions or improvements.
            </p>
            <textarea
              value={formData.comments.remarks}
              onChange={(e) => updateComments(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all resize-none"
              placeholder="Enter your comments, remarks, actions required, safety suggestions or improvements..."
            />
          </div>

          {/* Completed By Section */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white">Completed by</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="completedDate"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Date
                </label>
                <input
                  id="completedDate"
                  type="date"
                  value={formData.completedBy.date}
                  onChange={(e) => updateCompletedBy("date", e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="completedName"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Name
                </label>
                <input
                  id="completedName"
                  type="text"
                  value={formData.completedBy.name}
                  onChange={(e) => updateCompletedBy("name", e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:outline-none focus:border-gray-400 transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label
                  htmlFor="signature"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Signature
                </label>
                <div className="space-y-2">
                  <input
                    id="signature"
                    type="text"
                    value={formData.completedBy.signature?.startsWith?.("data:") ? "" : (formData.completedBy.signature || "")}
                    onChange={(e) => updateCompletedBy("signature", e.target.value)}
                    placeholder="Type signature or name"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                  />
                  <p className="text-[10px] text-gray-400">Or upload signature image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="block w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-600 file:text-white file:font-medium hover:file:bg-gray-500 file:cursor-pointer"
                  />
                  {formData.completedBy.signature?.startsWith?.("data:") && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <img
                        src={formData.completedBy.signature}
                        alt="Signature"
                        className="h-14 border border-gray-600 rounded object-contain bg-white"
                      />
                      <button
                        type="button"
                        onClick={clearSignatureImage}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
                "Submit Report"
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
