import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Management Templates: Free PRD & Roadmap Docs | Prodsnap",
  description: "Download professional, battle-tested templates for Product Requirements Documents (PRDs), Agile roadmaps, user stories, and product discovery.",
};

export default function Page() {
  return <SEOPillarPage pillarId="templates" />;
}
