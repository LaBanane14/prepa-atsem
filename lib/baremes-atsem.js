// Barèmes normalisés du concours ATSEM, regroupés en 4 familles selon les CDG.
// Référence : usages observés dans les annales 2015-2025.

// Niveau de difficulté : 1 = Souple, 2 = Normal, 3 = Difficile
export const NIVEAUX = [
  { id: 1, label: 'Souple' },
  { id: 2, label: 'Normal' },
  { id: 3, label: 'Difficile' },
]

export const BAREME_FAMILIES = {
  1: {
    id: 1,
    titre: 'Tout ou rien',
    niveau: 1, // Souple
    couleur: 'emerald',
    regle: [
      'Réponse parfaite (toutes les bonnes réponses cochées, aucune mauvaise) : 1 point',
      'Réponse partielle ou erreur : 0 point',
      'Pas de pénalité — s\'abstenir ou se tromper coûte la même chose',
    ],
    strategie: 'Cochez généreusement : dès que vous avez un doute raisonnable sur une proposition, tentez-la. Vous ne risquez rien à essayer.',
  },
  2: {
    id: 2,
    titre: 'Partiel bienveillant',
    niveau: 2, // Normal
    couleur: 'sky',
    regle: [
      'Réponse parfaite : 1 point',
      'Réponse partielle (une partie des bonnes réponses, aucune mauvaise) : 0,5 point',
      'Erreur (au moins une mauvaise réponse) : 0 point',
      'Pas de pénalité',
    ],
    strategie: 'Cochez uniquement ce dont vous êtes sûr(e). Ne piochez jamais « au cas où » — une seule mauvaise réponse transforme votre 0,5 pt en 0.',
  },
  3: {
    id: 3,
    titre: 'Pénalité sur erreur',
    niveau: 2, // Normal
    couleur: 'amber',
    regle: [
      'Réponse parfaite : 1 point',
      'Pas de réponse : 0 point',
      'Au moins une erreur : −0,5 point',
    ],
    strategie: 'Abstenez-vous en cas de doute fort. Ne tentez que si vous êtes quasi-sûr(e). L\'abstention ne coûte rien, l\'erreur oui.',
  },
  4: {
    id: 4,
    titre: 'Pénalité sur erreur ET sur abstention',
    niveau: 3, // Difficile
    couleur: 'rose',
    regle: [
      'Réponse parfaite : 1 point',
      'Erreur : pénalité (variable selon le CDG, souvent −0,25 à −0,5 pt)',
      'Pas de réponse : pénalité (équivalente à une erreur)',
    ],
    strategie: 'Répondez à TOUTES les questions. S\'abstenir coûte autant que se tromper — autant tenter et gagner en probabilité.',
  },
}

// Mapping région (normalisée) → famille
// Normalisation : minuscules, sans accents, trim
const REGION_TO_FAMILY = {
  'occitanie': 1,
  'nouvelle-aquitaine': 1,
  'normandie': 1,
  'hauts-de-france': 1,

  'auvergne-rhone-alpes': 2,

  'pays de la loire': 3,

  'paca': 4,
  'provence-alpes-cote d azur': 4,
  'provence alpes cote d azur': 4,
  'bretagne': 4,
  'grand est': 4,
  'ile-de-france': 4,
  'bourgogne-franche-comte': 4,
  'bourgogne': 4,
  'corse': 4,
}

function normalize(s) {
  if (!s) return ''
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[''`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Renvoie la famille (objet) pour une région donnée, ou null si non mappée
export function getBaremeFamily(regionNom) {
  const norm = normalize(regionNom)
  const familyId = REGION_TO_FAMILY[norm]
  return familyId ? BAREME_FAMILIES[familyId] : null
}
