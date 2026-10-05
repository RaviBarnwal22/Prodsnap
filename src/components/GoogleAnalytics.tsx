import Script from "next/script";

// GA4 measurement IDs are public by design (they ship in every page's HTML),
// so this lives in code rather than an env var. That avoids a Vercel env step
// that, if missed, would silently send no data.
const GA_MEASUREMENT_ID = "G-WCJNGE0V25";

// Only production builds report. Local `npm run dev` runs as development, so
// testing on localhost does not inflate visitor counts.
//
// Client-side navigations are tracked by GA4's enhanced measurement
// ("page changes based on browser history events"), which is on by default,
// so no per-route pageview call is needed here.
export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
