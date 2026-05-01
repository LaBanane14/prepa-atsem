import "./globals.css";
import { Sora, Nunito, Young_Serif, DM_Sans } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});
const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-young-serif",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl = "https://www.prepa-atsem.fr";
const siteName = "Prépa ATSEM";
const description = "Préparation au concours ATSEM 2026 : QCM thématiques, annales corrigées (2015-2025), simulation d'oral par IA, calendrier des épreuves par région. Réussissez le concours ATSEM externe, interne ou 3ᵉ voie avec Prépa ATSEM.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Concours ATSEM 2026 — Préparation en ligne | Prépa ATSEM",
    template: "%s | Prépa ATSEM",
  },
  description,
  keywords: [
    // Keyword cible principal
    "concours ATSEM",
    "concours ATSEM 2026",
    // Variantes
    "préparation concours ATSEM",
    "préparer concours ATSEM",
    "se préparer au concours ATSEM",
    "réussir concours ATSEM",
    "s'inscrire concours ATSEM",
    // Épreuves et contenu
    "QCM ATSEM",
    "QCM concours ATSEM",
    "annales ATSEM",
    "annales ATSEM corrigées",
    "sujets concours ATSEM",
    "oral concours ATSEM",
    "épreuve écrite ATSEM",
    "programme concours ATSEM",
    "barème concours ATSEM",
    // Longue traîne
    "calendrier concours ATSEM 2026",
    "dates concours ATSEM 2026",
    "inscription concours ATSEM",
    "révision concours ATSEM",
    "examen blanc ATSEM",
    "formation concours ATSEM",
    "formation ATSEM en ligne",
    // Persona
    "devenir ATSEM",
    "métier ATSEM",
    "CAP AEPE",
    "reconversion ATSEM",
    "agent territorial école maternelle",
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
    title: "Concours ATSEM 2026 — Préparation en ligne | Prépa ATSEM",
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
    title: "Concours ATSEM 2026 — Préparation en ligne | Prépa ATSEM",
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
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
    <html lang="fr" className={`${sora.variable} ${nunito.variable} ${youngSerif.variable} ${dmSans.variable}`}>
      <head>
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
          "name": "Prépa ATSEM",
          "description": "Plateforme de préparation au concours d'ATSEM (Agent Territorial Spécialisé des Écoles Maternelles)",
          "url": "https://www.prepa-atsem.fr",
          "offers": [
            {
              "@type": "Offer",
              "name": "Formule mensuelle",
              "price": "9.99",
              "priceCurrency": "EUR",
              "url": "https://www.prepa-atsem.fr/tarifs"
            },
            {
              "@type": "Offer",
              "name": "Pack Concours 6 mois",
              "price": "49.99",
              "priceCurrency": "EUR",
              "url": "https://www.prepa-atsem.fr/tarifs"
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
