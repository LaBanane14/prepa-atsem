export const metadata = {
  title: "Annales corrigées du concours ATSEM (2015-2025) — Prépa ATSEM",
  description: "Entraînez-vous sur les vrais sujets du concours ATSEM : annales officielles des CDG de 2015 à 2025, corrigées en détail. Chronomètre 45 min, barème adapté à chaque région, correction commentée.",
  keywords: [
    "annales concours ATSEM",
    "annales ATSEM corrigées",
    "annales ATSEM 2025",
    "annales ATSEM 2024",
    "annales ATSEM 2023",
    "sujets concours ATSEM",
    "QCM concours ATSEM",
    "sujets CDG ATSEM",
    "correction concours ATSEM",
    "épreuves écrites ATSEM",
  ],
  openGraph: {
    title: "Annales corrigées du concours ATSEM (2015-2025) | Prépa ATSEM",
    description: "Vrais sujets QCM des CDG avec correction détaillée et barème adapté par région.",
    type: "website",
    url: "https://www.prepa-atsem.fr/annales",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annales corrigées du concours ATSEM | Prépa ATSEM",
    description: "Vrais sujets QCM des CDG avec correction détaillée.",
  },
  alternates: {
    canonical: "https://www.prepa-atsem.fr/annales",
  },
  // Page réservée aux comptes (redirection vers /auth si non connecté) :
  // pas d'indexation tant qu'il n'existe pas de vitrine publique des annales
  robots: { index: false, follow: false },
}

export default function AnnalesLayout({ children }) {
  return children
}
