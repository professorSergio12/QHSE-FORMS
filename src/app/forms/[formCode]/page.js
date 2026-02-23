import { notFound } from "next/navigation";
import { FORM_CODES, getFormTitle } from "@/forms/registry";
import FormLoader from "@/components/FormLoader";

export async function generateStaticParams() {
  return FORM_CODES.map((formCode) => ({ formCode }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const formCode = typeof resolved?.formCode === "string" ? resolved.formCode : resolved?.formCode?.[0];
  if (!formCode || !FORM_CODES.includes(formCode)) return { title: "QHSE Forms" };
  return {
    title: `${getFormTitle(formCode)} - QHSE Forms`,
    description: getFormTitle(formCode),
  };
}

export default async function FormPage({ params }) {
  const resolved = await params;
  const formCode = typeof resolved?.formCode === "string" ? resolved.formCode : resolved?.formCode?.[0];
  if (!formCode || !FORM_CODES.includes(formCode)) notFound();
  return <FormLoader formCode={formCode} />;
}
