import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Management Glossary: Common Industry Terms Defined | Prodsnap",
  description: "Get clear definitions and practical PM context for industry terms like MVP, Product-Market Fit, and North Star Metric.",
};

export default function Page() {
  return <SEOPillarPage pillarId="glossary" />;
}
