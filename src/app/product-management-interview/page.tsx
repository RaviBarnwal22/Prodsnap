import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Manager Interview Prep: Product Sense & Strategy | Prodsnap",
  description: "Get comprehensive guides and CIRCLES framework breakdowns for Product Sense, Strategy, and Execution product manager interview questions.",
};

export default function Page() {
  return <SEOPillarPage pillarId="product-management-interview" />;
}
