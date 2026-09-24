import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Product Management: Interview Prep & Playbooks | Prodsnap",
  description: "Prepare for AI product manager roles: interview questions, LLM evaluation, hallucination budgets, RAG vs fine-tuning trade-offs, and AI roadmap templates.",
  alternates: { canonical: "/ai-product-management" },
  openGraph: {
    title: "AI Product Management: Interview Prep & Playbooks | Prodsnap",
    description: "Interview questions, eval strategy, and roadmap playbooks for product managers building LLM and AI products.",
    url: "/ai-product-management",
    type: "website",
  },
};

export default function Page() {
  return <SEOPillarPage pillarId="ai-product-management" />;
}
