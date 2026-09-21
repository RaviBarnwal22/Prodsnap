/**
 * Site-wide JSON-LD. Rendered once from the root layout so every page carries
 * Organization + WebSite entities. Page-specific schema (Article, FAQPage,
 * BreadcrumbList) is emitted by the page components themselves.
 */
const SITE_URL = "https://prodsnap.in"

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Prodsnap",
    url: SITE_URL,
    logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
    },
    description:
        "Prodsnap is an AI-powered product management interview preparation platform offering PM case practice, instant AI feedback and 1:1 mentorship.",
    founder: {
        "@type": "Person",
        "@id": `${SITE_URL}/#ravi-barnwal`,
        name: "Ravi Barnwal",
        jobTitle: "Product Leader & Founder",
        url: "https://www.linkedin.com/in/barnwalravi/",
        sameAs: ["https://www.linkedin.com/in/barnwalravi/"],
    },
    sameAs: ["https://www.linkedin.com/in/barnwalravi/"],
}

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Prodsnap",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
}

export function SiteStructuredData() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
        </>
    )
}
