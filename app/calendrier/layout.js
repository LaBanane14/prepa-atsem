export const metadata = {
  title: "Calendrier du concours ATSEM 2026",
  description: "Toutes les dates du concours ATSEM 2026 par région : inscriptions, épreuves écrites, oraux d'admission. Carte interactive des CDG organisateurs département par département.",
  keywords: [
    "calendrier concours ATSEM 2026",
    "dates concours ATSEM 2026",
    "inscription concours ATSEM 2026",
    "concours ATSEM par région",
    "CDG concours ATSEM",
    "épreuves écrites ATSEM 2026",
    "oral ATSEM 2026",
    "prochain concours ATSEM",
  ],
  openGraph: {
    title: "Calendrier du concours ATSEM 2026 | Prépa ATSEM",
    description: "Carte interactive des dates du concours ATSEM 2026 par région et CDG organisateurs.",
    type: "website",
    url: "https://www.prepa-atsem.fr/calendrier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendrier du concours ATSEM 2026 | Prépa ATSEM",
    description: "Dates du concours ATSEM 2026 par région et CDG organisateurs.",
  },
  alternates: {
    canonical: "https://www.prepa-atsem.fr/calendrier",
  },
}

export default function CalendrierLayout({ children }) {
  return children
}
