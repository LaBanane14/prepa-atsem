import ChromePublic from './chrome'

// Layout serveur des pages publiques : le chrome visuel (nav pilule, footer)
// est un composant client, voir chrome.js. Chaque sous-route porte ses
// métadonnées SEO dans son propre layout.js ; l'accueil hérite de celles de
// la racine (titre, description, Open Graph, robots index).
export default function LayoutPublic({ children }) {
  return <ChromePublic>{children}</ChromePublic>
}
