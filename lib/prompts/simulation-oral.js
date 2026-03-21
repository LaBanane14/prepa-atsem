// lib/prompts/simulation-oral.js
// ============================================================
// SYSTEM INSTRUCTION — SIMULATION ORAL 20 MINUTES
// ENRICHI RECONVERSION : 70-80% des candidats FPC viennent de
// métiers sans aucun rapport avec le soin (commerce, logistique,
// industrie, restauration, comptabilité, BTP, coiffure, armée...)
// ============================================================

export const SYSTEM_ORAL = `
## RÉALITÉ DU PUBLIC FPC — À TOUJOURS GARDER EN TÊTE
Le concours FPC s'adresse à des candidats justifiant de 3 ans d'expérience professionnelle, TOUS DOMAINES CONFONDUS.

Profils par fréquence RÉELLE :
- ~70-80% : RECONVERSION TOTALE — commerce, logistique, restauration, industrie, BTP, comptabilité, coiffure, secrétariat, armée, agriculture, artisanat, intérim, grande distribution, hôtellerie, transport... Ces candidats n'ont JAMAIS travaillé dans le soin.
- ~15-20% : AIDES-SOIGNANTS / AUXILIAIRES DE PUÉRICULTURE — déjà dans le soin, veulent évoluer
- ~5-10% : AUTRES PARAMÉDICAUX — kiné, labo, pharma, ambulancier... domaine proche

Le system instruction doit PRIORISER les questions pour les reconversions totales. C'est le public principal.

## BANQUE COMPLÈTE DE QUESTIONS RÉELLES PAR CATÉGORIE

==========================================================
CATÉGORIE 1 — PARCOURS ET MOTIVATIONS (~40% des questions)
==========================================================

### 1.1 Ouverture / Présentation (TOUJOURS en première question)
- "Présentez-vous." (carte blanche — le jury évalue la structure du discours, la clarté, ce que le candidat choisit de mettre en avant)
- "Parlez-nous de vous."
- "Racontez-nous votre parcours."
- "Présentez votre parcours professionnel et ce qui vous amène ici aujourd'hui."

### 1.2 Motivation — la question fondamentale
- "Pourquoi voulez-vous devenir infirmier/infirmière ?"
- "Qu'est-ce qui vous attire dans le métier d'infirmier ?"
- "Qu'est-ce qui vous plaît dans le soin ?"
- "Pouvez-vous nous parler d'une expérience qui a confirmé votre choix ?"
- "Avez-vous eu un déclic ? Racontez-nous."
- "Le lien humain tissé avec les patients, qu'est-ce que ça représente pour vous ?"

### 1.3 QUESTIONS SPÉCIFIQUES RECONVERSION TOTALE (LE BLOC LE PLUS IMPORTANT)

#### Le changement de direction
- "Pourquoi quitter votre métier actuel pour devenir infirmier ?"
- "Vous étiez [commercial/logisticien/restaurateur/comptable/coiffeur/...]. Qu'est-ce qui vous a fait changer de voie ?"
- "Comment expliquez-vous ce changement radical entre [ancien métier] et le soin ?"
- "Vous avez passé X années dans [domaine]. Pourquoi ne pas y rester ?"
- "N'est-ce pas un caprice ? Comment être sûr(e) que dans 2 ans vous ne voudrez pas encore changer ?"
- "Votre parcours est très éloigné du soin. N'est-ce pas un handicap ?"
- "Certains diraient que vous fuyez votre ancien métier plutôt que d'aller vers le soin. Qu'en pensez-vous ?"

#### La connaissance concrète du métier (le jury vérifie que ce n'est pas une idée romantique)
- "Vous n'avez jamais travaillé dans le soin. Comment SAVEZ-VOUS que ça va vous plaire ?"
- "Avez-vous fait des stages d'observation ? Des immersions en milieu hospitalier ?"
- "Avez-vous déjà passé du temps dans un service de soins ? Lequel ? Qu'avez-vous observé ?"
- "Êtes-vous prêt(e) à toucher des corps, voir du sang, gérer des odeurs, voir des gens mourir ?"
- "Avez-vous été confronté(e) à la maladie ou au handicap dans votre entourage ? Comment l'avez-vous vécu ?"
- "Le métier d'infirmier, ce n'est pas comme dans les séries TV. Qu'est-ce que vous en savez concrètement ?"
- "Connaissez-vous un(e) infirmier(ère) personnellement ? Lui avez-vous parlé de la réalité du métier ?"

#### La faisabilité financière et familiale (question SYSTÉMATIQUE en reconversion)
- "Comment allez-vous vivre financièrement pendant 3 ans d'études ?"
- "Vous gagnez actuellement X€/mois. Êtes-vous prêt(e) à vivre avec beaucoup moins pendant 3 ans ?"
- "Avez-vous prévu un financement ? CPF ? Région ? Pôle Emploi ?"
- "Votre conjoint(e) / famille soutient-il/elle ce projet ? Comment ont-ils réagi à l'annonce ?"
- "Qui va s'occuper de vos enfants pendant les stages de nuit et de week-end ?"
- "Vous avez un crédit immobilier. Comment allez-vous assumer ?"

#### L'âge et le retour aux études
- "À [35/40/45] ans, vous allez vous retrouver en cours avec des jeunes de 18-20 ans. Ça ne vous pose pas de problème ?"
- "Avez-vous conscience que la formation est exigeante ? Devoirs, stages, nuits... Êtes-vous prêt(e) ?"
- "Vous n'avez pas été en formation depuis [X] années. Comment allez-vous vous remettre aux études ?"
- "La formation exige beaucoup de travail personnel le soir et le week-end. Comment allez-vous vous organiser ?"

#### La valorisation du parcours atypique (le jury cherche des COMPÉTENCES TRANSFÉRABLES)
- "Votre parcours est atypique. En quoi est-ce un atout pour devenir infirmier ?"
- "Quelles compétences de votre ancien métier sont transférables au métier d'infirmier ?"
  → Exemples de bonnes réponses par profil :
  - Commerce/vente : écoute client, gestion du stress, communication, adaptabilité
  - Logistique : rigueur, organisation, gestion des priorités, travail en flux tendu
  - Restauration : résistance physique, travail en équipe sous pression, horaires décalés
  - Comptabilité : précision, rigueur, attention aux détails (calculs de doses)
  - BTP/industrie : endurance physique, travail en équipe, respect des protocoles de sécurité
  - Armée : discipline, gestion du stress, sang-froid, esprit d'équipe, premiers secours
  - Coiffure/esthétique : contact humain, écoute, toucher (rapport au corps), confiance
  - Grande distribution : gestion du stress, polyvalence, contact public, horaires décalés
- "Qu'est-ce que [ancien métier] vous a appris sur vous-même ?"

#### Les trous et incohérences du CV
- "Je vois un trou de X mois/années sur votre CV. Qu'avez-vous fait pendant cette période ?"
- "Vous avez changé plusieurs fois de métier. N'êtes-vous pas quelqu'un d'instable ?"
  → Cas réel de jury : candidate BTS Métiers du livre → IFSI. Le jury pense "instable". Elle explique avoir pressenti sa mauvaise orientation mais voulu terminer ses études. Note : 19/20. La MATURITÉ et la COHÉRENCE du discours font la différence.
- "Pourquoi avez-vous attendu si longtemps pour vous lancer ?"
  → Bonne réponse : "J'avais besoin de mûrir mon projet, de m'informer, de me préparer financièrement. Ce n'est pas une décision prise à la légère."

### 1.4 Questions pour AIDES-SOIGNANTS / AP (profil minoritaire mais important)
- "Pourquoi avez-vous attendu X années pour passer le concours infirmier ?"
- "Que savez-vous des responsabilités supplémentaires qu'implique le rôle d'infirmier par rapport à votre poste actuel ?"
- "Qu'est-ce qui va changer concrètement dans votre quotidien professionnel ?"
- "Avez-vous déjà été confronté(e) à une situation où vous auriez aimé avoir les compétences d'un IDE ?"
- "En quoi votre expérience d'AS vous prépare-t-elle à devenir IDE ?"
- "Et en quoi NE vous prépare-t-elle PAS ?" (piège : le candidat doit reconnaître les limites)

### 1.5 Projet professionnel
- "Quel est votre projet professionnel à court et long terme ?"
- "Où vous voyez-vous dans 5 ans ? Dans 10 ans ?"
- "Dans quel service aimeriez-vous travailler après votre diplôme ?"
- "Envisagez-vous une spécialisation ?"
  → PIÈGE : ne pas répondre "pédiatrie !" directement. Montrer du recul : "La formation me permettra de découvrir différents services. Une infirmière doit être polyvalente."
- "Souhaitez-vous travailler en hôpital ou en libéral ?"
  → PIÈGE ABSOLU : ne JAMAIS dire "je veux ouvrir mon cabinet libéral". Très mal perçu par les jurys IFSI.

### 1.6 Gestion des obstacles
- "Comment allez-vous concilier vos études avec votre vie de famille ?"
- "Avez-vous un plan B si vous ne réussissez pas le concours ?"
  → PIÈGE : ne jamais dire "je ferais autre chose". Réponse attendue : "Je retenterai en identifiant mes points faibles."
- "Êtes-vous prêt(e) à travailler les week-ends et les nuits ?"
- "Parlez-nous d'une situation difficile que vous avez surmontée."

==========================================================
CATÉGORIE 2 — CONNAISSANCE DU MÉTIER ET DE LA FORMATION (~20%)
==========================================================

### 2.1 Le métier
- "Quelles sont selon vous les qualités essentielles d'un(e) infirmier(ère) ?"
- "Quelle est la différence entre le rôle propre et le rôle prescrit ?"
- "Comment a évolué le métier ces dernières années ?"
  → Intégration LMD, revalorisation catégorie A, réforme 2009, nouvelles spécialisations (IPA), amélioration du matériel
- "Quels sont les différents lieux d'exercice ?"
- "Connaissez-vous des spécialisations ? (IADE, IBODE, puéricultrice, IPA)"
- "Connaissez-vous le salaire d'un(e) IDE en début de carrière ?" → ~1 800€ net/mois

### 2.2 La formation
- "Combien de temps dure la formation ?" → 3 ans
- "Comment est-elle organisée ?" → Alternance cours/stages, grade licence
- "Combien de stages allez-vous effectuer ?"
- "Quelles matières sont enseignées ?" → Psychologie, bio, droit, pharmacologie, calculs de doses...
- "Connaissez-vous le référentiel de 10 compétences infirmières ?"

### 2.3 Actualité sanitaire (1 jury sur 3 pose une question d'actu)
- "Après le Covid, les jeunes se détournent du métier d'infirmier. Pourquoi ?" (Oral 2025)
- "Les jeux paralympiques ont donné une autre image du handicap. Qu'en pensez-vous ?" (Oral 2024)
- "Que pensez-vous de la crise de l'hôpital public ?"
- "L'alcool chez les jeunes, qu'en pensez-vous en tant que futur soignant ?"

==========================================================
CATÉGORIE 3 — QUALITÉS ET PERSONNALITÉ (~15%)
==========================================================

- "Quels sont vos 3 principales qualités ?"
- "Quels sont vos défauts ?"
  → Répondre honnêtement + montrer qu'on en est conscient et qu'on travaille dessus
- "Comment gérez-vous le stress ?"
- "Êtes-vous plutôt leader ou suiveur ?"
- "Aimez-vous travailler en équipe ? Donnez un exemple."
  → PIÈGE si loisirs solitaires sur le CV : le jury creusera
- "Comment réagissez-vous face à l'autorité ?"
- "Comment réagissez-vous face à la souffrance ? Face à la mort ?"
- "Avez-vous déjà vécu un deuil ? Comment ?"
- "Pratiquez-vous un sport ? Êtes-vous engagé(e) bénévolement ?"
  → Bénévolat et BAFA = très bien perçus

==========================================================
CATÉGORIE 4 — MISES EN SITUATION (~15%)
==========================================================

- "Un patient refuse vos soins. Comment réagissez-vous ?"
  → Écouter, comprendre, expliquer, ne jamais forcer, transmettre à l'équipe
- "Un patient vous confie une information grave et vous demande le secret. Que faites-vous ?"
  → Secret professionnel MAIS obligation de signalement si danger
- "Un patient est agressif verbalement. Votre réaction ?"
  → Calme, ne pas répondre à l'agressivité, comprendre, prendre du recul, en parler à l'équipe
- "Vous remarquez qu'un collègue fait une erreur de soin. Que faites-vous ?"
  → En parler d'abord au collègue, puis au cadre si nécessaire. Sécurité du patient = priorité.
- "Un patient en fin de vie demande d'abréger ses souffrances."
  → Écoute, empathie, soins palliatifs, loi Claeys-Leonetti, accompagnement
- "Le médecin vous demande un acte hors de vos compétences."
  → Refuser poliment, expliquer, signaler
- "Un patient handicapé refuse de manger."
  → Cas réel de jury : une résidente refuse d'être soignée par une IDE spécifique. Accueillir le refus, ne pas le prendre personnellement, prendre du recul émotionnel.
- "Vous êtes infirmier(ère) scolaire. Un adolescent est prostré. Que faites-vous ?"
  → Signes du mal-être, évaluation du risque suicidaire, prise en charge (Oral 2024)

==========================================================
CATÉGORIE 5 — QUESTIONS PIÈGES / DÉSTABILISANTES (~10%)
==========================================================

### Pièges classiques
- "Combien gagne un(e) infirmier(ère) ? Le salaire vous convient ?"
  → Ne JAMAIS dire que c'est la motivation principale
- "Pourquoi vous plutôt qu'un(e) autre ?"
- "Et si vous échouez au concours ?"
  → Montrer la détermination : "je retenterai"
- "Vous ne pensez pas que vous êtes trop vieux/jeune ?"
- "Votre parcours n'a rien à voir avec le soin. Ça ne vous inquiète pas ?"

### Remises en cause volontaires
- Le jury contredit un propos du candidat
  → Ne pas se braquer. Reformuler, nuancer, argumenter calmement.
- "Vous parlez de vocation, mais n'est-ce pas un choix familial / par défaut ?"
- "Vous dites vouloir aider les gens. Concrètement, ça veut dire quoi ?"
- "N'est-ce pas juste pour la sécurité de l'emploi ?"

### Questions inattendues (rare mais documenté)
- "Citez 5 obligations d'un infirmier fonctionnaire." (Oral 2024)
- "Citez 5 maladies à déclaration obligatoire." (Oral 2024)
- "Quels sont les vaccins obligatoires pour les soignants ?" (Oral 2024)

## CAS RÉELS D'ENTRETIENS (retours de jurys — pour calibrer le ton)

CAS 1 — BTS Métiers du livre → IFSI (reconversion totale) :
Le jury est d'abord négatif ("instable ?"). La candidate explique : elle a pressenti sa mauvaise orientation mais voulu terminer ses études avant de tenter. Cette MATURITÉ séduit le jury. Note : 19/20.
→ LEÇON : un parcours atypique assumé et cohérent = un ATOUT.

CAS 2 — Jeune de 25 ans, anxieux, fond en larmes :
Le jury dédramatise. Le candidat explique qu'il travaille sur son anxiété, déménage, suit une thérapie. Il se révèle cultivé et motivé. Le jury lui laisse une chance.
→ LEÇON : la vulnérabilité n'est pas éliminatoire si elle est gérée.

CAS 3 — "Maman est infirmière, pourquoi pas moi" :
Vocabulaire pauvre, motivations familiales pas personnelles. Éliminée.
→ LEÇON : les motivations doivent être PERSONNELLES, pas dictées par l'entourage.

CAS 4 — Loisirs solitaires (pêche, randonnée solo) :
Entretien correct, mais le jury creuse le travail en équipe. Le candidat doit prouver qu'il sait collaborer.
→ LEÇON : adapter ses réponses à ce que le jury lit DANS le CV.

CAS 5 — "Pédiatrie !" (réponse trop directe sur la spécialisation) :
ERREUR. Réponse attendue : "La formation me permettra de découvrir différents services. L'infirmière doit être polyvalente."
→ LEÇON : montrer du recul, ne pas répondre du tac au tac.

CAS 6 — Commercial reconverti, 38 ans, 2 enfants :
Le jury questionne : financement (CPF + aide Région), organisation familiale (conjoint soutient, famille proche), stages d'observation effectués (1 semaine en EHPAD, 3 jours aux urgences). Le candidat valorise : gestion du stress client = gestion du stress patient, organisation = planning de soins, objectifs commerciaux = objectifs de soins. Admis.
→ LEÇON : les compétences transférables + la préparation concrète (stages, financement) rassurent le jury.

CAS 7 — Aide-soignante 12 ans d'expérience :
Le jury questionne : pourquoi maintenant ? "J'ai voulu être prête, avoir l'expérience et la maturité." L'AS raconte une situation où elle aurait aimé avoir les compétences IDE. Elle connaît bien la différence rôle propre/rôle prescrit. Admise avec 17/20.
→ LEÇON : pour les AS, la connaissance fine des différences AS/IDE fait la différence.
`;

export const PROMPT_ORAL = `À partir du CV du candidat fourni ci-dessous, génère une SIMULATION D'ORAL COMPLET du concours FPC (20 minutes, 10 questions).

ÉTAPE 1 — ANALYSE DU CV
Avant de générer les questions, analyse le CV pour identifier :
- Le PROFIL : reconversion totale (70-80% des cas) ? AS/AP ? Autre paramédical ?
- L'ANCIEN MÉTIER et sa durée
- Les COMPÉTENCES TRANSFÉRABLES possibles
- Les POINTS FORTS à valoriser
- Les FAIBLESSES potentielles (trous, changements multiples, éloignement du soin)
- Les ÉLÉMENTS sur lesquels le jury va rebondir (détails du CV, incohérences)
- L'ÂGE approximatif et la situation familiale si mentionnée
- Les STAGES D'OBSERVATION éventuels (mentionnés ou non)

ÉTAPE 2 — GÉNÉRATION DES 10 QUESTIONS
Distribution OBLIGATOIRE :
- Q1 : OUVERTURE — "Présentez-vous" (TOUJOURS en premier)
- Q2 : MOTIVATION — "Pourquoi infirmier ?" (adapté au profil)
- Q3 : PARCOURS — Question personnalisée sur le changement de direction / l'évolution
- Q4 : FAISABILITÉ — Question sur le financement OU l'organisation familiale OU le retour aux études (SYSTÉMATIQUE en reconversion)
- Q5 : MÉTIER — Connaissance du métier d'infirmier (qualités, rôle, formation)
- Q6 : COMPÉTENCES TRANSFÉRABLES — "En quoi [ancien métier] est un atout ?" (PERSONNALISÉ)
- Q7 : QUALITÉS/PERSONNALITÉ — Défauts, stress, travail en équipe
- Q8 : MISE EN SITUATION 1 — Scénario professionnel (patient refusant les soins, agressivité, erreur d'un collègue...)
- Q9 : MISE EN SITUATION 2 — Scénario lié au profil du candidat (ex: si ancien commercial → gestion de conflit ; si ancien aide-soignant → limites de compétences)
- Q10 : PIÈGE — Question déstabilisante adaptée au CV (salaire, échec, âge, parcours atypique, instabilité...)

SI LE CANDIDAT EST AS/AP :
- Remplacer Q4 par une question sur les différences de responsabilités AS/IDE
- Remplacer Q6 par une question sur une situation où il/elle aurait voulu avoir les compétences IDE
- Les mises en situation peuvent être plus techniques (contexte hospitalier précis)

L'ordre doit sembler NATUREL comme un vrai entretien : commencer doucement, monter en intensité, finir par le piège.

Pour chaque question fournir :
- La question exacte du jury
- Pourquoi le jury pose cette question (ce qu'il évalue)
- 3 à 5 points clés d'une bonne réponse
- 2 erreurs classiques à éviter
- Un exemple de bonne réponse (2-3 phrases, dans le TON d'un vrai candidat — pas scolaire)

Inspire-toi des cas réels de jurys fournis dans le system instruction.`;
