// Prompts pour génération de QCM thématiques ATSEM
// Une catégorie = un set de 10 questions QCM (1 bonne réponse sur 4)

export const SYSTEM_QCM_THEMATIQUE = `Tu es un concepteur officiel d'épreuves du concours externe d'ATSEM principal de 2e classe. Tu connais parfaitement :
- Le décret n°92-850 du 28 août 1992 modifié (statut particulier des ATSEM)
- Le code général de la fonction publique (droits et obligations)
- Le Code de l'éducation (écoles maternelles)
- Le programme de l'école maternelle (BO n°25 du 24 juin 2021)
- Les protocoles sanitaires et d'hygiène en collectivité (INPES, ANSES, OMS)
- Les gestes de premiers secours (PSC1, recommandations MEN)
- Le cadre de la protection de l'enfance (loi du 14 mars 2016, CRIP, 119)

Tu conçois des QCM RÉALISTES reflétant fidèlement le niveau et le style des vraies annales organisées par les CDG (CIG Petite Couronne, CDG 77, 78, 91, 92, 93, 94, 95, Île-de-France, Nord, Rhône, Provence, Bretagne, etc.).

RÈGLES DE QUALITÉ :
- Vocabulaire juridique ou technique précis (ne pas vulgariser à outrance)
- Distracteurs plausibles (pas d'options absurdes qu'on élimine instantanément)
- Au moins 1 question qui teste une nuance fine (ex : discrétion ≠ secret professionnel)
- Au moins 1 piège classique (ex : penser que le maire est l'autorité fonctionnelle pendant le temps scolaire — faux, c'est le directeur)
- Au moins 1 question formulée au NÉGATIF (« Laquelle de ces propositions est FAUSSE ? » / « N'est PAS une mission de l'ATSEM »)
- Variez les difficultés : 3 faciles, 4 intermédiaires, 3 difficiles
- Varie les formulations : définitions, mises en situation, identification d'erreurs, choix d'un cadre légal, etc.`

const BASE_FORMAT = `

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict, sans backticks, sans texte avant ni après) :
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
      "explication": "Explication pédagogique de 2-3 phrases. Justifie pourquoi la bonne réponse est correcte ET pourquoi au moins 2 des autres sont fausses. Cite la référence (article, loi, protocole) si pertinent."
    }
  ]
}

CONTRAINTES DURES :
- EXACTEMENT 10 questions
- 1 SEULE bonne réponse par question (A, B, C ou D — varie leur répartition, ne mets pas toujours C)
- 4 propositions par question, toutes plausibles et de longueur similaire
- Aucune proposition ne doit révéler la réponse par sa longueur ou son vocabulaire
- Pas de formulations du type « toutes les réponses sont correctes » ou « aucune des réponses ci-dessus »`

export const PROMPTS_THEMATIQUES = {
  institutionnel: `Génère un QCM de 10 questions sur le cadre INSTITUTIONNEL de l'ATSEM.

SUJETS À COUVRIR (pioche parmi ceux-ci, ne force pas tout) :

1. Statut et cadre d'emplois
   - Filière médico-sociale, catégorie C, cadre d'emplois des ATSEM (décret 92-850)
   - Deux grades : ATSEM principal de 2e classe / ATSEM principal de 1re classe
   - Durée de stage (1 an), titularisation, avancement

2. Recrutement
   - Concours externe (CAP AEPE exigé), concours interne (4 ans de services effectifs), 3e voie
   - Rôle des Centres de Gestion (CDG) dans l'organisation des concours
   - Liste d'aptitude (2 ans renouvelable 2 ans), inscription sur la liste

3. Employeur et autorités
   - Employeur : commune (maire) — pouvoir hiérarchique, recrutement, rémunération
   - Autorité fonctionnelle pendant le temps scolaire : directeur d'école
   - Enseignant : organise les tâches au quotidien dans la classe
   - PIÈGE : beaucoup confondent autorité hiérarchique et fonctionnelle

4. Cadre légal de l'école maternelle
   - Loi Blanquer du 26 juillet 2019 : instruction obligatoire à 3 ans
   - Loi du 11 juillet 1975 (loi Haby) : création des ATSEM
   - Code de l'éducation (articles L.412-1 et suivants)

5. Vie institutionnelle
   - Conseil d'école : composition (directeur, enseignants, 1 ATSEM élue, parents, maire...), périodicité (3/an)
   - Projet d'école, règlement intérieur
   - IEN (Inspecteur de l'Éducation nationale), circonscription, DSDEN, rectorat

6. Droits et obligations du fonctionnaire (Code général de la fonction publique)
   - Droits : rémunération, congés, formation, grève, syndical, protection fonctionnelle
   - Obligations : service, obéissance hiérarchique, neutralité, laïcité, discrétion, réserve, secret professionnel, probité
   - Discipline : avertissement, blâme, radiation...

EXEMPLES DE QUESTIONS ATTENDUES (pour le style, pas à recopier) :
- « Pendant le temps scolaire, l'ATSEM est placée sous l'autorité fonctionnelle : »
- « Laquelle de ces instances n'est PAS présente au conseil d'école ? »
- « Depuis la loi du 26 juillet 2019, l'instruction est obligatoire à partir de... »` + BASE_FORMAT,

  hygiene: `Génère un QCM de 10 questions sur l'HYGIÈNE, l'entretien et la sécurité sanitaire en école maternelle.

SUJETS À COUVRIR :

1. Bionettoyage
   - Définition : opération visant à réduire momentanément la contamination bactérienne
   - 2 étapes : nettoyage (détergent) → désinfection (désinfectant) — ou produit détergent-désinfectant
   - Cercle de Sinner : 4 facteurs (action chimique, mécanique, temps, température)

2. Produits et pictogrammes CLP (règlement européen)
   - Flamme : inflammable
   - Tête de mort : toxique
   - Point d'exclamation : nocif/irritant
   - Corrosion : corrosif
   - Environnement : dangereux pour l'environnement
   - SGH : système général harmonisé

3. HACCP et restauration scolaire
   - Signification : Hazard Analysis Critical Control Point
   - Plats témoins conservés 5 jours (à +3°C)
   - Chaîne du froid (≤ +4°C) et chaîne du chaud (≥ +63°C)
   - Traçabilité, allergènes (14 majeurs obligatoires à déclarer)

4. Lavage des mains
   - OMS : lavage à l'eau et au savon 40 à 60 secondes
   - Gel hydro-alcoolique (SHA) : friction 20 à 30 secondes
   - Moments clés : avant repas, après WC, après mouchage, avant soins

5. Dilutions et doses
   - 1% = 10 mL/L ; 2% = 20 mL/L ; 5% = 50 mL/L
   - Eau de Javel : attention aux dilutions (2,6% vs 9,6%)
   - Ne JAMAIS mélanger eau de Javel + produit acide (dégagement de chlore)

6. Codes couleur matériel (recommandation interne)
   - Rouge : sanitaires
   - Jaune : lavabos
   - Vert : cuisine/self
   - Bleu : locaux généraux (parfois violet pour hauteurs)

7. Déchets
   - DASRI (Déchets d'Activités de Soins à Risques Infectieux) : conteneurs jaunes
   - Tri sélectif, circuits courts/longs pour le linge

8. Linge, literie, sanitaires
   - Lavage du linge à 60°C minimum
   - Draps housses changés régulièrement, au minimum toutes les 2 semaines (ou selon PAI)
   - Protocole sanitaires : ordre de propreté (du plus propre au plus sale)

PIÈGE CLASSIQUE : inverser l'ordre nettoyage/désinfection, ou confondre les pictogrammes.` + BASE_FORMAT,

  sante: `Génère un QCM de 10 questions sur la SANTÉ de l'enfant et les premiers secours à l'école maternelle.

SUJETS À COUVRIR :

1. PAI — Projet d'Accueil Individualisé
   - Pour qui : enfants avec troubles de santé chroniques (allergie alimentaire, asthme, diabète, épilepsie, drépanocytose, mucoviscidose...)
   - Qui rédige : médecin scolaire, avec médecin traitant, parents, directeur
   - Contenu : régime, médicaments autorisés, conduite à tenir en cas de crise
   - Distinction PAI (santé) vs PPS (handicap, avec MDPH) vs PAP (apprentissages)

2. Gestes interdits à l'ATSEM
   - Ne JAMAIS donner de médicament sans PAI (même paracétamol/Doliprane®)
   - Ne pas faire d'injection, ne pas prendre température en rectal
   - Autorisation parentale écrite requise même pour la crème solaire en certains cas

3. Fièvre
   - Enfant > 38°C : prévenir enseignant → parents
   - Découvrir, faire boire, mettre au calme
   - > 39°C ou signes de gravité + parents injoignables : 15

4. Épistaxis (saignement de nez)
   - Asseoir, pencher la tête EN AVANT (jamais en arrière)
   - Compression narinaire 10 minutes
   - Glace non recommandée

5. Étouffement / obstruction des voies aériennes
   - Obstruction PARTIELLE (tousse, respire) : encourager à tousser, NE PAS intervenir
   - Obstruction TOTALE (ne peut pas tousser/parler) :
     • Nourrisson < 1 an : 5 claques dans le dos + 5 compressions thoraciques
     • Enfant > 1 an : 5 claques dans le dos + manœuvre de Heimlich (compressions abdominales)

6. Convulsion fébrile
   - Mettre en PLS, protéger tête, noter durée
   - Appeler 15 si > 5 min ou premières convulsions

7. PLS — Position Latérale de Sécurité
   - Pour victime inconsciente qui respire
   - Objectif : éviter inhalation

8. Numéros d'urgence
   - 15 : SAMU (médical)
   - 18 : Pompiers
   - 17 : Police
   - 112 : numéro européen d'urgence
   - 119 : enfance en danger (24h/24)
   - 114 : urgences pour personnes sourdes (SMS/fax)

9. Pathologies courantes et évictions scolaires (arrêté du 3 mai 1989)
   - Gastro-entérite à E. coli : éviction 48h après reprise transit
   - Impétigo : éviction jusqu'à guérison clinique (si non traité) ou 72h antibio
   - Varicelle : PAS d'éviction (arrêté 1989), juste bon sens
   - Pédiculose : PAS d'éviction, traitement recommandé

10. Brûlures, plaies
    - Brûlure : eau tiède 15-20 minutes (règle des 3x15 : 15°C, 15 cm, 15 min)
    - Plaie : nettoyer eau et savon, pansement, pas d'alcool

PIÈGE : donner du paracétamol à un enfant fébrile (INTERDIT sans PAI), confondre PAI et PPS.` + BASE_FORMAT,

  pedagogie: `Génère un QCM de 10 questions sur la PÉDAGOGIE et le développement de l'enfant en maternelle.

SUJETS À COUVRIR :

1. Programme de la maternelle (BO n°25 du 24 juin 2021)
   5 domaines d'apprentissage :
   - Mobiliser le langage dans toutes ses dimensions
   - Agir, s'exprimer, comprendre à travers l'activité physique
   - Agir, s'exprimer, comprendre à travers les activités artistiques
   - Acquérir les premiers outils mathématiques (nombres, formes, grandeurs)
   - Explorer le monde (vivant, matière, objets, espace, temps)

2. Niveaux et âges
   - TPS (Toute Petite Section) : 2-3 ans (non obligatoire)
   - PS (Petite Section) : 3-4 ans
   - MS (Moyenne Section) : 4-5 ans
   - GS (Grande Section) : 5-6 ans
   - CP à 6 ans (école élémentaire)

3. Développement psychomoteur / stades
   - Piaget : sensori-moteur (0-2 ans), préopératoire (2-7 ans), opératoire concret (7-11), formel (11+)
   - Maternelle = stade PRÉOPÉRATOIRE (pensée symbolique, égocentrisme)
   - Wallon : stades émotionnel, sensori-moteur, personnalisme, catégoriel
   - Dolto : importance du langage précoce, « image inconsciente du corps »

4. Dessin de l'enfant (évolution)
   - 2-3 ans : gribouillage
   - 3-4 ans : bonhomme têtard (tête + membres, pas de tronc)
   - 4-5 ans : bonhomme avec tronc
   - 5-6 ans : bonhomme plus détaillé (doigts, vêtements)

5. Sieste
   - Essentielle en TPS/PS (1h30 à 2h)
   - Conditions : calme, pénombre, température 18-20°C, vêtements adaptés
   - Rôle ATSEM : préparation, accompagnement endormissement, surveillance
   - Respect du rythme : enfant non-dormeur peut se lever après repos calme

6. Ateliers — rôle de l'ATSEM
   - L'enseignant définit l'objectif pédagogique
   - L'ATSEM encadre l'atelier sous la responsabilité de l'enseignant
   - L'ATSEM ne se substitue PAS à l'enseignant
   - Participation à la préparation matérielle, accompagnement pendant, rangement après

7. Développement moteur
   - Motricité globale (courir, sauter) vs motricité fine (pince, ciseaux, écriture)
   - Latéralisation : se fixe entre 4 et 6 ans
   - Schéma corporel, orientation spatiale

8. Acquisition du langage
   - Babillage (6-12 mois), premiers mots (~1 an), explosion vocabulaire (2-3 ans)
   - Phrases complexes vers 3-4 ans
   - Rôle adulte : reformulation, lecture d'albums, comptines

9. Propreté et autonomie
   - Acquisition de la propreté généralement entre 2 et 4 ans
   - Maturation du sphincter préalable à l'apprentissage (vers 18 mois - 2 ans)
   - Pas de regressions forcées, respect du rythme de l'enfant

PIÈGE : confondre motricité fine et globale, attribuer à la maternelle des acquisitions du primaire.` + BASE_FORMAT,

  relations: `Génère un QCM de 10 questions sur les RELATIONS PROFESSIONNELLES de l'ATSEM.

SUJETS À COUVRIR :

1. Obligations du fonctionnaire (Code général de la fonction publique)
   - Devoir de RÉSERVE : modération dans l'expression publique, même hors service (critiques, réseaux sociaux)
   - DISCRÉTION professionnelle : ne pas divulguer d'informations internes au service
   - SECRET professionnel : pour certaines informations (santé, famille) — pénalement sanctionné si violé
   - OBÉISSANCE hiérarchique (sauf ordre manifestement illégal)
   - NEUTRALITÉ et LAÏCITÉ : pas de signe religieux ostensible, traitement égal des usagers
   - Probité, dignité, impartialité

2. Hiérarchie et relations avec encadrants
   - Maire (commune) : employeur, pouvoir hiérarchique, décisions de carrière
   - Directeur d'école : autorité fonctionnelle pendant le temps scolaire, organise le service
   - Enseignant : précise les tâches au quotidien, responsable pédagogique
   - Coordinateur ATSEM (dans certaines communes) : encadre l'équipe ATSEM

3. Relations avec les parents
   - Accueil courtois, bonne information, mais respect du rôle de l'enseignant
   - Ne pas communiquer d'informations sur les progrès scolaires (rôle enseignant)
   - Ne pas prendre parti en cas de plainte → orienter vers le directeur
   - Transmissions orales brèves acceptées (fatigue, sieste, repas)

4. Relations avec les collègues
   - Autres ATSEM : coordination, partage de matériel, entraide
   - Enseignants : binôme quotidien, communication essentielle
   - AESH (accompagnants d'élèves en situation de handicap) : complémentarité
   - Agents restauration, agents techniques, médecin scolaire, infirmière

5. Gestion de conflits
   - Entre enfants : intervenir avec bienveillance, éviter étiquetage
   - Avec un parent : écoute, orientation vers le directeur si nécessaire
   - Avec un collègue : dialogue direct, puis hiérarchie si blocage
   - Violences verbales ou physiques : signaler à la hiérarchie

6. Signalement / protection de l'enfance
   - Signes inquiétants : marques physiques, propos, changement de comportement
   - Information PRÉOCCUPANTE (IP) : transmise à la CRIP (Cellule de Recueil des Informations Préoccupantes du département)
   - En cas d'urgence grave : directement procureur de la République
   - 119 : « Allô Enfance en Danger », 24h/24, anonyme, gratuit
   - Loi du 14 mars 2016 : réforme de la protection de l'enfance

7. Posture professionnelle
   - Tenue adaptée (pas de bijoux, cheveux attachés, chaussures fermées)
   - Vouvoiement ou tutoiement ? Adaptation selon usages, mais vouvoiement avec parents
   - Limites relationnelles : ne pas devenir substitut parental affectif
   - Droit à l'image des enfants : autorisation écrite requise

PIÈGE : confondre discrétion (obligation interne) et secret (pénal), ou croire que l'obligation de réserve interdit toute expression.` + BASE_FORMAT,

  calculs: `Génère un QCM de 10 questions de CALCULS pratiques appliqués au métier d'ATSEM.

RÈGLE ABSOLUE : chaque question doit comporter un calcul concret avec un résultat numérique UNIQUE parmi les 4 propositions. Les 3 distracteurs doivent être des erreurs typiques (oubli d'une conversion, mauvaise formule, règle de trois inversée, etc.) — pas des nombres aléatoires.

SUJETS À COUVRIR :

1. Dilutions (produits d'entretien)
   - 1% = 10 mL/L ; 2% = 20 mL/L ; 0,5% = 5 mL/L
   - Ex : « Préparer 5 L d'une solution désinfectante à 2%. Quelle quantité de produit pur ? » → 100 mL
   - Attention aux conversions mL ↔ L

2. Surfaces et quantités
   - Surface d'une pièce rectangulaire (L × l) en m²
   - Consommation de produit (ex : 50 mL/m²) × surface
   - Ex : « Salle de 8 m × 6 m, produit à 50 mL/m². Combien de mL de produit ? » → 48 × 50 = 2400 mL = 2,4 L

3. Proportionnalité — produit en croix
   - Recette pour X enfants → adapter à Y enfants
   - Ex : « Une recette pour 10 enfants demande 500 g de farine. Pour 25 enfants ? » → 1250 g

4. Conversions d'unités (concours)
   - Volumes : 1 L = 1000 mL = 100 cL ; 1 mL = 1 cm³
   - Masses : 1 kg = 1000 g ; 1 g = 1000 mg
   - Longueurs : 1 m = 100 cm = 1000 mm
   - Temps : convertir min↔h, durée entre deux horaires

5. Pourcentages simples
   - Prix réduit de 20% : 50 € → 40 €
   - Augmentation de 15% : 60 € → 69 €
   - Attention : -20% PUIS +20% ≠ prix d'origine

6. Effectifs et ratios
   - Réglementation d'accueil périscolaire : 1 animateur pour 10 enfants (moins de 6 ans)
   - Taux d'encadrement : règle de trois (« 30 enfants, combien d'adultes ? »)

7. Durées, horaires
   - École ouvre à 8h30, sieste démarre à 13h15, se termine à 14h45 → durée ?
   - Calcul entre deux horaires avec passage d'heure

8. Moyenne
   - Moyenne simple : somme / nombre
   - Ex : 3 températures (19°C, 21°C, 20°C), moyenne ? → 20°C

9. Partages et répartitions
   - 24 pommes à répartir en 4 paniers égaux → 6/panier
   - Reste d'une division euclidienne

EXEMPLES D'ÉNONCÉS RÉALISTES (style, pas à copier) :
- « Vous disposez d'une bouteille de détergent à 5%. Combien de mL verser dans un seau de 3 L pour obtenir une solution à 1% ? »
- « Une classe de 28 enfants prépare une galette. La recette pour 8 personnes demande 200 g de beurre. Quelle quantité de beurre pour toute la classe ? »
- « Vous préparez la sieste à 13h30. Combien de minutes reste-t-il avant 14h45 ? »

STYLE : énoncés concrets, contexte école maternelle, pas de calcul abstrait hors contexte.` + BASE_FORMAT,
}

export const CATEGORIES_LABELS = {
  institutionnel: 'Institutionnel',
  hygiene: 'Hygiène',
  sante: 'Santé',
  pedagogie: 'Pédagogie',
  relations: 'Relations pro',
  calculs: 'Calculs',
}
