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
    niveau: 1, // Souple → vert
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
    niveau: 2, // Normal → jaune
    couleur: 'amber',
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
    niveau: 2, // Normal → jaune
    couleur: 'amber',
    defaultPenalty: -0.5,
    strategie: 'Abstenez-vous en cas de doute fort. Ne tentez que si vous êtes quasi-sûr(e). L\'abstention ne coûte rien, l\'erreur oui.',
  },
  4: {
    id: 4,
    titre: 'Pénalité sur erreur ET sur abstention',
    niveau: 3, // Difficile → rouge (nuance douce)
    couleur: 'rose',
    defaultPenalty: -0.25, // Bretagne, Grand Est, IDF — standard historique
    strategie: 'Répondez à TOUTES les questions. S\'abstenir coûte autant que se tromper — autant tenter et gagner en probabilité.',
  },
}

// F1 et F2 n'ont pas de pénalité (0), ajouté pour uniformiser
BAREME_FAMILIES[1].defaultPenalty = 0
BAREME_FAMILIES[2].defaultPenalty = 0

// Règles d'affichage par famille (avec pénalité dynamique)
BAREME_FAMILIES[1].regle = () => [
  'Réponse parfaite (toutes les bonnes réponses cochées, aucune mauvaise) : +1 point',
  'Réponse partielle ou erreur : 0 point',
  'Pas de pénalité — s\'abstenir ou se tromper coûte la même chose',
]
BAREME_FAMILIES[2].regle = () => [
  'Réponse parfaite : +1 point',
  'Réponse partielle (une partie des bonnes réponses, aucune mauvaise) : +0,5 point',
  'Erreur (au moins une mauvaise réponse) : 0 point',
  'Pas de pénalité',
]
BAREME_FAMILIES[3].regle = (penalty) => [
  'Réponse parfaite : +1 point',
  'Réponse partielle (sans erreur) : +0,5 point',
  `Au moins une erreur : ${fmtPts(penalty)} point`,
  'Pas de réponse : 0 point',
]
BAREME_FAMILIES[4].regle = (penalty) => [
  'Réponse parfaite : +1 point',
  'Réponse partielle (sans erreur) : +0,5 point',
  `Erreur : ${fmtPts(penalty)} point`,
  `Pas de réponse : ${fmtPts(penalty)} point`,
]

// Overrides spécifiques par région (uniquement pour PACA et Corse qui utilisent −1)
const REGION_PENALTY_OVERRIDE = {
  'paca': -1,
  'provence-alpes-cote d azur': -1,
  'provence alpes cote d azur': -1,
  'corse': -1,
}

function fmtPts(p) {
  if (p === 0) return '0'
  const abs = Math.abs(p)
  const str = Number.isInteger(abs) ? String(abs) : abs.toString().replace('.', ',')
  return (p < 0 ? '−' : '+') + str
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

// Noms d'affichage normalisés pour chaque région
const REGION_DISPLAY_NAMES = {
  'occitanie': 'Occitanie',
  'nouvelle-aquitaine': 'Nouvelle-Aquitaine',
  'normandie': 'Normandie',
  'hauts-de-france': 'Hauts-de-France',
  'auvergne-rhone-alpes': 'Auvergne-Rhône-Alpes',
  'pays de la loire': 'Pays de la Loire',
  'paca': 'PACA',
  'provence-alpes-cote d azur': 'PACA',
  'provence alpes cote d azur': 'PACA',
  'bretagne': 'Bretagne',
  'grand est': 'Grand Est',
  'ile-de-france': 'Île-de-France',
  'bourgogne-franche-comte': 'Bourgogne-Franche-Comté',
  'bourgogne': 'Bourgogne',
  'corse': 'Corse',
}

// Renvoie la liste des régions (noms propres, dédupliqués) appartenant à une famille
export function getRegionsForFamily(familyId) {
  const seen = new Set()
  const out = []
  for (const [norm, fid] of Object.entries(REGION_TO_FAMILY)) {
    if (fid !== familyId) continue
    const display = REGION_DISPLAY_NAMES[norm] || norm
    if (seen.has(display)) continue
    seen.add(display)
    out.push(display)
  }
  return out
}

// Renvoie le nom d'affichage normalisé d'une région (ex: "ILE DE FRANCE" → "Île-de-France")
export function getRegionDisplayName(regionNom) {
  const norm = normalize(regionNom)
  return REGION_DISPLAY_NAMES[norm] || regionNom
}

// Renvoie la pénalité résolue pour une région (override éventuel ou pénalité par défaut de la famille)
export function getPenalty(regionNom) {
  const family = getBaremeFamily(regionNom)
  if (!family) return 0
  const norm = normalize(regionNom)
  if (REGION_PENALTY_OVERRIDE[norm] !== undefined) return REGION_PENALTY_OVERRIDE[norm]
  return family.defaultPenalty ?? 0
}

// Renvoie un objet « barème » complet pour une région, avec la règle résolue (texte)
export function getBareme(regionNom) {
  const family = getBaremeFamily(regionNom)
  if (!family) return null
  const penalty = getPenalty(regionNom)
  const regle = typeof family.regle === 'function' ? family.regle(penalty) : family.regle
  return { ...family, penalty, regle }
}

/**
 * Calcule le score d'une question selon la famille de barème et la pénalité.
 * @param {{ id: number, penalty: number }} bareme — objet retourné par getBareme()
 * @param {string[]} userAnswers
 * @param {string[]} correctAnswers
 * @returns {{ points: number, status: 'perfect'|'partial'|'error'|'empty' }}
 */
export function scoreQuestion(bareme, userAnswers, correctAnswers) {
  const familyId = bareme?.id || 1
  const penalty = bareme?.penalty ?? 0
  const userSet = new Set((userAnswers || []).map(a => String(a).toLowerCase()))
  const correctSet = new Set((correctAnswers || []).map(a => String(a).toLowerCase()))

  // Abstention
  if (userSet.size === 0) {
    if (familyId === 4) return { points: penalty, status: 'empty' }
    return { points: 0, status: 'empty' }
  }

  const hasWrong = [...userSet].some(a => !correctSet.has(a))
  const allCorrectChecked = correctSet.size > 0 && [...correctSet].every(a => userSet.has(a))
  const isPerfect = !hasWrong && allCorrectChecked

  if (isPerfect) return { points: 1, status: 'perfect' }

  // Partiel sans erreur
  const isPartial = !hasWrong && !allCorrectChecked && userSet.size > 0
  if (isPartial) {
    if (familyId === 1) return { points: 0, status: 'partial' }
    return { points: 0.5, status: 'partial' }
  }

  // Au moins une erreur
  if (familyId === 1 || familyId === 2) return { points: 0, status: 'error' }
  return { points: penalty, status: 'error' } // F3 par défaut -0.5, F4 -0.25 ou -1 (PACA/Corse)
}
