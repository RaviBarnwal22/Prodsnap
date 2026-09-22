import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Product Management Templates: Free PRD & Roadmap Docs | Prodsnap",
  description: "Download professional, battle-tested templates for Product Requirements Documents (PRDs), Agile roadmaps, user stories, and product discovery.",
  alternates: { canonical: "/templates" },
};

export default function Page() {
  return <SEOPillarPage pillarId="templates" />;
}
