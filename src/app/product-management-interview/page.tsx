import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Product Manager Interview Prep: Product Sense & Strategy | Prodsnap",
  description: "Get comprehensive guides and CIRCLES framework breakdowns for Product Sense, Strategy, and Execution product manager interview questions.",
  alternates: { canonical: "/product-management-interview" },
};

export default function Page() {
  return <SEOPillarPage pillarId="product-management-interview" />;
}
