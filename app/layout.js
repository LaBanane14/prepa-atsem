import "./globals.css";

const siteUrl = "https://www.prepa-atsem.fr";
const siteName = "Prépa ATSEM";
const description = "Préparez le concours ATSEM avec des QCM, annales corrigées, simulations d'oral et fiches de révision. La plateforme de référence pour réussir le concours d'Agent Territorial Spécialisé des Écoles Maternelles.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prépa ATSEM — Préparation au concours ATSEM 2026",
    template: "%s | Prépa ATSEM",
  },
  description,
  keywords: [
    "concours ATSEM",
    "concours ATSEM 2026",
    "préparation concours ATSEM",
    "QCM ATSEM",
    "annales ATSEM corrigées",
    "oral concours ATSEM",
    "agent territorial école maternelle",
    "révision concours ATSEM",
    "fiches ATSEM",
    "reconversion ATSEM",
    "CAP AEPE",
    "concours fonction publique territoriale",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName,
    title: "Prépa ATSEM — Préparation au concours ATSEM 2026",
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prépa ATSEM - Préparation concours ATSEM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prépa ATSEM — Préparation au concours ATSEM 2026",
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.png",
  },
};

import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Prépa ATSEM",
          "alternateName": "Prépa ATSEM - Concours ATSEM",
          "url": "https://www.prepa-atsem.fr",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.prepa-atsem.fr/blog?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "LP Labs",
          "legalName": "LP Labs SAS",
          "url": "https://www.prepa-atsem.fr",
          "logo": "https://www.prepa-atsem.fr/favicon.svg",
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "support@prepa-atsem.fr",
            "contactType": "customer service",
            "availableLanguage": "French"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "20 route de la Rousserie",
            "addressLocality": "Monthuchon",
            "postalCode": "50200",
            "addressCountry": "FR"
          },
          "sameAs": []
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Prépa FPC",
          "description": "Plateforme de préparation au concours FPC d'entrée en IFSI",
          "url": "https://www.prepa-fpc.fr",
          "offers": [
            {
              "@type": "Offer",
              "name": "Abonnement mensuel",
              "price": "12.99",
              "priceCurrency": "EUR",
              "url": "https://www.prepa-fpc.fr/tarifs"
            },
            {
              "@type": "Offer",
              "name": "Pack annuel",
              "price": "89.99",
              "priceCurrency": "EUR",
              "url": "https://www.prepa-fpc.fr/tarifs"
            }
          ]
        })}} />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-W24Z96D93P" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-W24Z96D93P');
        `}</Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
