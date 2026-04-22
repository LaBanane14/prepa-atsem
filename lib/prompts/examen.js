// lib/prompts/examen.js
// ============================================================
// EXAMEN BLANC QCM ATSEM — 20 questions / 45 minutes
// Le system prompt est assemblé dynamiquement côté route.js :
//   - ~33% des faits de chaque thème piochés aléatoirement
//   - 3 pièges sur 8 piochés aléatoirement
//   - répartition thématique avec tolérance
//   - calcul de dilution non systématique
// ============================================================

export const SYSTEM_BASE = `Tu es le moteur de génération de QCM du site Prépa ATSEM, une plateforme de préparation au concours externe d'Agent Territorial Spécialisé des Écoles Maternelles (ATSEM) principal de 2e classe.

## CONTEXTE DE L'ÉPREUVE RÉELLE
- Épreuve : 20 questions à choix multiple (QCM)
- Durée : 45 minutes
- Coefficient : 1 (l'oral a un coefficient 2)
- Chaque question comporte UNE ou PLUSIEURS réponses exactes (1 à 4+)
- Chaque question comporte entre 3 et 8 propositions (variable)
- Le nombre de bonnes réponses N'EST PAS indiqué au candidat
- Barème : 1 point par question uniquement si TOUTES les bonnes réponses sont cochées et AUCUNE mauvaise
- Thème : situations concrètes habituellement rencontrées par les ATSEM dans l'exercice de leurs fonctions
- Pas de calculatrice autorisée (mais des calculs simples peuvent être demandés : dilutions, quantités)

## LES 7 THÉMATIQUES DU CONCOURS
1. Missions et statut de l'ATSEM
2. Hygiène et produits d'entretien
3. Santé de l'enfant et premiers secours
4. Maladies infantiles et évictions scolaires
5. Vie scolaire et cadre institutionnel
6. Développement et bien-être de l'enfant
7. Protection de l'enfance

## RÈGLES DE GÉNÉRATION
1. Générer EXACTEMENT 20 questions
2. Nombre de propositions VARIABLE par question : entre 4 et 7 (pas toujours le même)
3. Nombre de bonnes réponses VARIABLE : entre 1 et 4 (ne jamais indiquer combien)
4. Respecter (avec tolérance) la répartition thématique demandée dans l'instruction utilisateur
5. Intégrer les pièges fournis dans l'instruction utilisateur
6. Au moins 1 question formulée en NÉGATIF ("Que ne devez-vous PAS faire ?")
7. Les propositions doivent être PLAUSIBLES (pas de réponse absurde évidente)
8. Varier les contextes : accueil du matin, atelier, récréation, cantine, sieste, périscolaire, sortie scolaire, réunion
9. Ne JAMAIS recopier une question de vrai sujet à l'identique — s'en INSPIRER
10. Le JSON doit être VALIDE et PARSABLE directement (pas de backticks, pas de texte avant/après)
`;

// Faits par thème — piochés aléatoirement à chaque génération
export const FACTS_BY_THEME = {
  missions_statut: [
    "L'ATSEM est fonctionnaire territorial, catégorie C, filière médico-sociale",
    "Double autorité : hiérarchique (maire) et fonctionnelle (directeur d'école sur temps scolaire)",
    "Missions : assistance au personnel enseignant, accueil, hygiène des enfants, entretien des locaux",
    "L'ATSEM NE PEUT PAS : se substituer à l'enseignant(e), prendre en charge la classe seul(e), décider du contenu pédagogique",
    "L'ATSEM PEUT : animer un atelier sous responsabilité de l'enseignant(e), surveiller la cantine, accompagner la sieste",
    "Pendant le périscolaire : sous l'autorité du maire (pas de l'enseignant)",
    "Entretien annuel d'évaluation : par le supérieur hiérarchique direct, obligatoire",
    "Obligation de réserve et discrétion professionnelle (s'applique aussi hors temps de travail)",
    "Ne jamais renseigner les parents sur la pédagogie → renvoyer vers l'enseignant(e)",
    "Communauté éducative : l'ATSEM en fait partie",
    "Recrutement par concours : externe (CAP AEPE), interne, 3e voie",
    "Droits et obligations du fonctionnaire : loi du 13 juillet 1983 (Le Pors)",
    "Neutralité, laïcité, probité, dignité comme valeurs fondamentales",
    "Avancement d'échelon à l'ancienneté, avancement de grade au choix ou par concours",
  ],
  hygiene_produits: [
    "Dilution de produits : calculs de pourcentages (ex : 3% dans 10L = 30 cl = 300 mL)",
    "Pictogrammes SGH : inflammable, corrosif, toxique, irritant, comburant, dangereux environnement, dangereux santé",
    "Comburant = substance qui AIDE une substance inflammable à prendre feu",
    "Bionettoyage = nettoyage + rinçage + désinfection",
    "Cercle de Sinner : 4 facteurs (température, temps d'action, action mécanique, action chimique)",
    "Stockage : local ventilé, fermé à clé, produits rangés par famille, lourds en bas, JAMAIS mélanger",
    "Contenants dilués DOIVENT être étiquetés",
    "Verser le produit dans l'eau (JAMAIS l'inverse)",
    "Eau de Javel : bactéricide, désinfectant surfaces inertes, irritant, MOINS efficace diluée eau chaude",
    "FDS (Fiche de Données de Sécurité) + étiquette = documents de référence risque chimique",
    "Document unique d'évaluation des risques professionnels",
    "Symboles d'entretien textile (lavage, repassage, séchage)",
    "Méthodes de balayage humide (godille, poussé)",
    "Détergent = nettoie ; désinfectant = détruit micro-organismes ; détergent-désinfectant combine les deux",
    "Protocole de plan de nettoyage : fréquence, produits, méthode, responsable",
    "EPI (équipements de protection individuelle) : gants, blouse, lunettes selon risque",
  ],
  sante_secours: [
    "Pharmacie école AUTORISÉ : compresses stériles, sparadrap, gants jetables, ciseaux, savon de Marseille, couverture isothermique, thermomètre frontal, pansements, éosine non colorée, pince à échardes",
    "Pharmacie INTERDIT : médicaments (sauf PAI), Bétadine, Biafine, Advil/Doliprane, alcool à 90°, Mercurochrome, pommade anti-inflammatoire, Arnica, crème anti-coups, coton hydrophile sur plaie ouverte",
    "Épistaxis (saignement de nez) : pencher la tête EN AVANT, comprimer la narine, NE PAS allonger",
    "Fièvre/hyperthermie : déshabiller légèrement, hydrater, prévenir enseignant(e) puis parents, NE PAS couvrir, NE PAS donner de médicament",
    "Numéros d'urgence : 15 (SAMU), 18 (pompiers), 112 (européen), 119 (enfance maltraitée)",
    "Soigner une plaie : gants, eau + savon de Marseille, NE PAS utiliser gel hydroalcoolique ni alcool à 70°",
    "PAI (Projet d'Accueil Individualisé) : allergies alimentaires, diabète, asthme → permet prise de médicaments à l'école, régimes adaptés",
    "PAI ≠ handicap (le handicap relève du PPS avec AESH)",
    "TIAC = Toxi-Infections Alimentaires Collectives",
    "HACCP = gestion des risques sécurité alimentaire en restauration collective",
    "Méthode de Heimlich : obstruction TOTALE des voies respiratoires (pas partielle)",
    "Brûlure : refroidir à l'eau tiède 15 min, ne pas percer les cloques, ne pas appliquer de pommade",
    "PLS (Position Latérale de Sécurité) : victime inconsciente qui respire",
    "Crise d'asthme : rester calme, asseoir l'enfant, donner sa Ventoline si PAI, appeler les secours si aggravation",
    "Convulsions fébriles : protéger la tête, ne rien mettre dans la bouche, chronométrer, appeler le 15",
  ],
  maladies_evictions: [
    "Maladies éruptives : varicelle, rougeole, rubéole, scarlatine, syndrome pieds-mains-bouche, roséole",
    "Éviction scolaire OBLIGATOIRE : coqueluche, rougeole, scarlatine (certaines selon arrêté)",
    "PAS d'éviction : rhinopharyngite, grippe, otite, bronchite, gastro-entérite (sauf cas grave)",
    "Transmission : mains (lavage fréquent = prévention), gouttelettes, contact",
    "Oxyurose, pédiculose (poux), gale = parasitaires, transmissibles par contact",
    "Scoliose = PAS une maladie infectieuse (trouble orthopédique)",
    "Varicelle : éruption vésiculeuse, contagion jusqu'à croûtes, pas d'éviction obligatoire mais souvent recommandée",
    "Impétigo : bactérien, très contagieux, éviction jusqu'à traitement efficace",
    "Calendrier vaccinal obligatoire en collectivité (11 vaccins pour nés après 2018)",
  ],
  vie_scolaire: [
    "Conseil d'école : présidé par le directeur, se réunit au moins 1 fois par trimestre, adopte le projet d'école (3-5 ans)",
    "Composition conseil d'école : directeur, enseignants, représentants parents élus, maire ou représentant, DDEN",
    "ATSEM au conseil d'école : peut être INVITÉ, voix CONSULTATIVE uniquement (pas de vote)",
    "Projet d'école = document de référence pour les activités sur temps scolaire",
    "PPMS = Plan Particulier de Mise en Sûreté (risques majeurs, intrusion)",
    "Laïcité : interdiction signes religieux ostensibles, obligation de neutralité pour les personnels",
    "Récréations : maximum 30 minutes par demi-journée",
    "Commune compétente : construction et entretien des écoles primaires (PAS collèges = département, PAS lycées = région)",
    "Cycle 1 = TPS/PS/MS/GS (maternelle) ; cycle 2 = CP/CE1/CE2 ; cycle 3 = CM1/CM2/6e",
    "5 domaines d'apprentissage en maternelle : langage, activité physique, activités artistiques, structurer sa pensée, explorer le monde",
    "Inscription à l'école : auprès de la mairie (certificat d'inscription) puis directeur (admission)",
    "Obligation scolaire à partir de 3 ans depuis la rentrée 2019 (loi Blanquer)",
    "Jours d'école : lundi, mardi, jeudi, vendredi (4 jours) ou 4,5 jours selon organisation communale",
  ],
  developpement_enfant: [
    "Objet transitionnel (doudou) : rassure l'enfant en l'absence des parents",
    "Bonhomme têtard : premier dessin du bonhomme en petite section",
    "Sommeil : cycles (endormissement, sommeil léger, sommeil profond, sommeil paradoxal, éveil calme)",
    "Sieste : respecter le rythme de l'enfant, ne pas réveiller, surveiller",
    "Dyspraxie = trouble de la coordination et planification des gestes",
    "Encoprésie = incapacité à retenir ses selles",
    "Énurésie = pipi au lit",
    "Auteurs littérature jeunesse cycle 1 : Claude Ponti, Claude Boujon, Mario Ramos, Tomi Ungerer",
    "Attitude bienveillante : écoute, accompagnement, règles de vie, autonomie (PAS absence d'autorité)",
    "Allergie fruits à coque : noisettes, noix, noix de pécan, amandes, pistaches (PAS soja, PAS vanille)",
    "Allergie gluten : pain, crêpes, céréales, yaourts au muesli (PAS riz, PAS œufs, PAS pommes)",
    "Stades de Piaget : sensori-moteur (0-2), préopératoire (2-7), opérations concrètes (7-11)",
    "Acquisition de la propreté : vers 2-3 ans, variable selon l'enfant, ne jamais forcer",
    "Théorie de l'attachement (Bowlby) : besoin de figures d'attachement sécurisantes",
    "Motricité fine : pinces, découpage, enfilage de perles ; motricité globale : sauter, courir, grimper",
  ],
  protection_enfance: [
    "Obligation de signalement : tout agent public DOIT signaler une suspicion de maltraitance",
    "En cas de doute (hématomes suspects) : signaler à l'enseignant(e) ou au directeur, NE PAS interroger les parents, NE PAS en parler aux collègues",
    "119 = numéro enfance en danger (appel gratuit et anonyme)",
    "Information préoccupante → CRIP (Cellule de Recueil des Informations Préoccupantes)",
    "Secret professionnel : ne s'oppose PAS au signalement de maltraitance",
    "Convention internationale des droits de l'enfant : droit à l'égalité, santé, protection, expression",
    "4 formes de maltraitance : physique, psychologique, sexuelle, négligence",
    "Signalement judiciaire : procureur de la République (cas graves, urgence)",
  ],
};

// Pièges — 3 sont piochés aléatoirement à chaque génération
export const PIEGES = [
  "Piège du \"NE PAS\" : question formulée en négatif (\"Que ne devez-vous PAS faire ?\") — les candidats cochent ce qu'il FAUT faire par erreur",
  "Piège de la dilution : confusion mL/cL/dL/L dans les conversions de dosage",
  "Piège PAI vs PPS : le PAI concerne les maladies chroniques (allergie, diabète), le PPS concerne le handicap",
  "Piège du périscolaire : sur le temps périscolaire l'ATSEM est sous l'autorité du MAIRE, pas du directeur",
  "Piège du conseil d'école : l'ATSEM a une voix CONSULTATIVE, pas délibérative",
  "Piège de l'épistaxis : pencher la tête en AVANT, pas en arrière",
  "Piège de la pharmacie : le savon de Marseille est AUTORISÉ, l'alcool à 90° est INTERDIT",
  "Piège récréation : 30 minutes max par demi-journée (pas par journée)",
];

// Libellés lisibles pour les thèmes (utilisés dans la construction dynamique)
export const THEME_LABELS = {
  missions_statut: "Missions et statut de l'ATSEM",
  hygiene_produits: "Hygiène et produits d'entretien",
  sante_secours: "Santé de l'enfant et premiers secours",
  maladies_evictions: "Maladies infantiles et évictions scolaires",
  vie_scolaire: "Vie scolaire et cadre institutionnel",
  developpement_enfant: "Développement et bien-être de l'enfant",
  protection_enfance: "Protection de l'enfance",
};

// Prompt pour générer la correction à partir des questions (inchangé)
export const PROMPT_CORRECTION_ONLY = `Voici les 20 questions d'un QCM du concours ATSEM. Pour chaque question, donne les bonnes réponses et une explication pédagogique.

QUESTIONS :
{QUESTIONS_JSON}

Réponds UNIQUEMENT avec le JSON ci-dessous. Aucun texte avant ni après, aucun backtick.
{
  "correction": [
    {
      "numero": 1,
      "reponses_correctes": ["C"],
      "explication": "Explication courte et pédagogique justifiant chaque bonne réponse et pourquoi les autres sont fausses."
    }
  ]
}`;
