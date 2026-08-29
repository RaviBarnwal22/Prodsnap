import { SEOPillarPage } from "@/components/SEOPillarPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Management Frameworks Library: RICE, ICE, Kano | Prodsnap",
  description: "Learn how to use RICE, ICE, MoSCoW, Kano, and Jobs-to-be-Done (JTBD) frameworks to prioritize backlogs and build customer-centric products.",
};

export default function Page() {
  return <SEOPillarPage pillarId="frameworks" />;
}
