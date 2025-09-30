/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <explanation> */
import Script from "next/script";
import { useId } from "react";
import type { Organization, WebSite } from "schema-dts";
import { APP_CONTACTS, publicEnv, SITE_CONFIG } from "@/lib/constants";

export function WebsiteSchema() {
  const scriptId = useId();
  const websiteSchema: WebSite = {
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
        },
      },
    ],
  };

  const organizationSchema: Organization = {
    "@type": "Organization",
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: publicEnv.NEXT_PUBLIC_STORE_NAME,
    url: `${SITE_CONFIG.url}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.ogImage}`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `${APP_CONTACTS.phone.main}`,
      contactType: "customer service",
    },
    sameAs: [
      "https://facebook.com/" + publicEnv.NEXT_PUBLIC_STORE_NAME,
      "https://x.com/" + publicEnv.NEXT_PUBLIC_STORE_NAME,
      "https://instagram.com/" + publicEnv.NEXT_PUBLIC_STORE_NAME,
    ],
  };

  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [websiteSchema, organizationSchema] as const,
  };
  return (
    <Script
      id={scriptId}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
    />
  );
}
