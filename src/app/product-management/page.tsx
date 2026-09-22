import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Product Management Guides & Career Resources | Prodsnap",
  description: "Master foundational product management guides, career roadmaps, discovery frameworks, and prioritization strategies.",
  alternates: { canonical: "/product-management" },
};

export default function Page() {
  return <SEOPillarPage pillarId="product-management" />;
}
