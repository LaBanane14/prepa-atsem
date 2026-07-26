import MaquetteChrome from './chrome'

// Layout serveur de la maquette : porte les métadonnées SEO (le chrome visuel
// est un composant client, voir chrome.js). Le titre et la description de
// l'accueil sont hérités de la racine du site ; chaque sous-route de la
// maquette a son propre layout.js avec ses métadonnées, calquées sur celles
// du site public pour être prêtes au moment de la bascule.
// robots noindex tant que la bascule n'a pas eu lieu (contenu dupliqué).
export const metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  alternates: {
    canonical: 'https://www.prepa-atsem.fr',
  },
}

export default function MaquetteLayout({ children }) {
  return <MaquetteChrome>{children}</MaquetteChrome>
}
