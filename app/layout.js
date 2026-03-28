import "./globals.css";

const siteUrl = "https://prepa-fpc.vercel.app";
const siteName = "Prépa FPC";
const description = "Préparez le concours FPC infirmier (passerelle IFSI) avec des QCM de maths, calculs de doses, simulations d'oral et cours de culture sanitaire et sociale. La plateforme de référence pour les aides-soignants et auxiliaires de puériculture.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prépa FPC — Préparation au concours infirmier passerelle IFSI",
    template: "%s | Prépa FPC",
  },
  description,
  keywords: [
    "concours FPC infirmier",
    "passerelle IFSI",
    "préparation concours infirmier",
    "concours aide-soignant infirmier",
    "concours auxiliaire puériculture infirmier",
    "QCM concours infirmier",
    "calculs de doses IFSI",
    "oral concours FPC",
    "formation professionnelle continue infirmier",
    "reconversion infirmier",
    "annales concours FPC",
    "exercices maths concours infirmier",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName,
    title: "Prépa FPC — Préparation au concours infirmier passerelle IFSI",
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prépa FPC - Préparation concours infirmier FPC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prépa FPC — Préparation au concours infirmier passerelle IFSI",
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23dc2626'/><path d='M38 20a2 2 0 0 0-2 2v22a18 18 0 0 0 18 18 18 18 0 0 0 18-18V22a2 2 0 0 0-2-2h-4a1.5 1.5 0 1 0 0 3h1v19a14 14 0 0 1-14 14 14 14 0 0 1-14-14V23h1a1.5 1.5 0 1 0 0-3h-4z' fill='white'/><path d='M50 62v4a18 18 0 0 0 18 18 18 18 0 0 0 18-18v-8' fill='none' stroke='white' stroke-width='4' stroke-linecap='round'/><circle cx='86' cy='54' r='5' fill='none' stroke='white' stroke-width='4'/></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
