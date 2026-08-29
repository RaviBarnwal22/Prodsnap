import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Analytics & KPIs Guide: North Star Metric | Prodsnap",
  description: "Learn how to define activation, track cohort retention, calculate stickiness, and scale your product using product analytics.",
};

export default function Page() {
  return <SEOPillarPage pillarId="product-analytics" />;
}
