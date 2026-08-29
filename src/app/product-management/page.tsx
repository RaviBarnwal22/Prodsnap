import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Management Guides & Career Resources | Prodsnap",
  description: "Master foundational product management guides, career roadmaps, discovery frameworks, and prioritization strategies.",
};

export default function Page() {
  return <SEOPillarPage pillarId="product-management" />;
}
