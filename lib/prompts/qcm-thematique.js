// Prompts pour génération de QCM thématiques ATSEM
// Une catégorie = un set de 10 questions QCM (1 bonne réponse sur 4)

export const SYSTEM_QCM_THEMATIQUE = `Tu es un concepteur officiel d'épreuves du concours externe d'ATSEM principal de 2e classe. Tu connais parfaitement le cadre statutaire, les missions, l'hygiène, la santé de l'enfant, les premiers secours, les maladies infantiles, la vie scolaire, la pédagogie maternelle et la protection de l'enfance.

Tu génères des QCM RÉALISTES, du même niveau que les vraies annales de concours organisées par les CDG. Tu varies les formulations, les niveaux de difficulté et tu inclus quelques pièges classiques.`

const BASE_FORMAT = `
Format de réponse OBLIGATOIRE (JSON pur, sans backticks, sans texte avant ni après) :
{
  "questions": [
    {
      "numero": 1,
      "enonce": "Énoncé clair se terminant par '?' ou ':'",
      "propositions": [
        {"lettre": "A", "texte": "..."},
        {"lettre": "B", "texte": "..."},
        {"lettre": "C", "texte": "..."},
        {"lettre": "D", "texte": "..."}
      ],
      "reponse_correcte": "C",
      "explication": "Explication pédagogique de 2-3 phrases. Justifie pourquoi la bonne réponse est correcte ET pourquoi les autres sont fausses."
    }
  ]
}

Règles :
- EXACTEMENT 10 questions
- 1 SEULE bonne réponse par question (lettre A, B, C ou D)
- 4 propositions par question, plausibles
- Inclus 1-2 pièges classiques et 1 question formulée en négatif
- Varie les difficultés (simple, intermédiaire, difficile)`

export const PROMPTS_THEMATIQUES = {
  institutionnel: `Génère un QCM de 10 questions sur le cadre INSTITUTIONNEL de l'ATSEM.

Sujets à couvrir :
- Statut de fonctionnaire territorial (catégorie C, filière médico-sociale)
- Employeur (mairie) vs autorité fonctionnelle (directeur d'école)
- Cadre d'emplois, recrutement, concours externe/interne/3e voie
- Loi Blanquer 2019 (instruction obligatoire à 3 ans)
- Code général de la fonction publique, droits et obligations
- Conseil d'école, projet d'école, IEN
- Circonscription, académie, ministère de l'Éducation nationale
- Discipline, notation, avancement, formation continue` + BASE_FORMAT,

  hygiene: `Génère un QCM de 10 questions sur l'HYGIÈNE et l'entretien à l'école maternelle.

Sujets à couvrir :
- Bionettoyage (nettoyage + désinfection)
- Pictogrammes des produits dangereux (CLP)
- HACCP en restauration scolaire
- Lavage des mains (OMS, durée, gel hydro-alcoolique)
- Dilutions (ex: 2% = 20 ml/L)
- Codes couleur du matériel d'entretien
- Tri des déchets, DASRI
- Linge, lits, sanitaires, protocoles spécifiques` + BASE_FORMAT,

  sante: `Génère un QCM de 10 questions sur la SANTÉ de l'enfant et les premiers secours.

Sujets à couvrir :
- PAI (Projet d'Accueil Individualisé) — qui, pour qui, contenu
- Conduite à tenir : fièvre, épistaxis, convulsion, étouffement
- Méthode de Heimlich (adulte/enfant) vs claques dans le dos (nourrisson)
- PLS (position latérale de sécurité)
- Numéros d'urgence (15, 18, 112, 119)
- Gestes interdits à l'ATSEM (médicaments sans PAI)
- Anaphylaxie, asthme, diabète, épilepsie
- Brûlures, plaies, traumatismes courants` + BASE_FORMAT,

  pedagogie: `Génère un QCM de 10 questions sur la PÉDAGOGIE et le développement de l'enfant en maternelle.

Sujets à couvrir :
- 5 domaines d'apprentissage de la maternelle
- Niveaux : TPS, PS, MS, GS — âges et caractéristiques
- Sieste (durée, conditions, rôle ATSEM)
- Bonhomme têtard (3 ans), stades du dessin
- Stades de Piaget (sensori-moteur, préopératoire...)
- Atelier dirigé vs autonome — rôle de l'ATSEM
- Motricité fine, motricité globale, langage
- Propreté, autonomie, socialisation` + BASE_FORMAT,

  relations: `Génère un QCM de 10 questions sur les RELATIONS PROFESSIONNELLES de l'ATSEM.

Sujets à couvrir :
- Devoir de réserve, discrétion professionnelle, secret professionnel
- Hiérarchie : maire (employeur) vs directeur (autorité fonctionnelle) vs enseignant
- Communication avec les parents (limites, ce qu'on dit / ne dit pas)
- Relations avec les collègues (autres ATSEM, enseignants, AESH, restauration)
- Travail en équipe, transmissions
- Posture professionnelle, neutralité, laïcité
- Gestion de conflits (enfants, parents, collègues)
- Information préoccupante (CRIP, 119) — quand et comment` + BASE_FORMAT,

  calculs: `Génère un QCM de 10 questions de CALCULS pratiques pour l'ATSEM.

Sujets à couvrir :
- Dilutions (ex: préparer 5 L à 2%)
- Surfaces (m²) pour quantité de produit
- Proportionnalité (recettes, quantités enfants)
- Conversions (mL/L, g/kg, m/cm)
- Pourcentages simples (réduction, augmentation)
- Calcul de doses (produit en croix)
- Durées et horaires
- Effectifs et ratios (1 ATSEM pour X enfants)

IMPORTANT : chaque question doit comporter un calcul concret avec un résultat numérique unique parmi les 4 propositions.` + BASE_FORMAT,
}

export const CATEGORIES_LABELS = {
  institutionnel: 'Institutionnel',
  hygiene: 'Hygiène',
  sante: 'Santé',
  pedagogie: 'Pédagogie',
  relations: 'Relations pro',
  calculs: 'Calculs',
}
