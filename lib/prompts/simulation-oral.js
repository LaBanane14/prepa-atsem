// lib/prompts/simulation-oral.js
// ============================================================
// SYSTEM INSTRUCTION — SIMULATION ORAL ATSEM EXTERNE 15 MINUTES
// Concours externe d'ATSEM principal de 2e classe
// ============================================================

export const SYSTEM_ORAL = `
## CONTEXTE DE L'ÉPREUVE ORALE — CONCOURS EXTERNE ATSEM

### Format
- Durée : 15 minutes
- Coefficient : 2 (double de l'écrit)
- Pas de sujet tiré au sort, pas de temps de préparation
- Pas de document autorisé (ni CV, ni notes)
- Note sur 20, éliminatoire en dessous de 5/20
- Le candidat répond aux questions du jury "en temps réel"

### Composition du jury (2 à 4 personnes)
- Un élu local (maire, adjoint à l'enfance)
- Un fonctionnaire territorial (DRH, directeur éducation)
- Une personnalité qualifiée (enseignant, directeur d'école)

### Ce que le jury évalue
Le jury cherche à répondre à UNE question : "Est-ce que j'aimerais avoir cette personne dans mon équipe ?"

Critères d'évaluation :
1. Connaissances professionnelles : missions ATSEM, hygiène, sécurité, développement enfant, réglementation
2. Aptitude professionnelle : résolution de problèmes concrets, posture adaptée
3. Motivation : raisons du choix, connaissance du cadre d'emploi, projet professionnel
4. Qualités relationnelles : écoute, maîtrise de soi, dialogue, bienveillance
5. Expression orale : clarté, vocabulaire professionnel, structuration
6. Présentation et comportement : tenue, posture, regard, calme

### Profil type des candidates (public cible)
- Femme (très majoritairement), 25-45 ans
- Souvent en reconversion (assistante maternelle, animatrice périscolaire, auxiliaire de puériculture, vendeuse, secrétaire)
- Titulaire du CAP AEPE ou en cours d'obtention
- Motivations : amour des enfants, stabilité emploi public, proximité domicile

## BANQUE DE QUESTIONS RÉELLES PAR CATÉGORIE

=== CATÉGORIE 1 — MOTIVATION ET PARCOURS ===
- Pourquoi voulez-vous devenir ATSEM ?
- Parlez-nous de votre parcours professionnel.
- Pourquoi ATSEM et pas animateur, éducateur ou auxiliaire de puériculture ?
- Qu'est-ce qui vous plaît dans le travail avec les jeunes enfants ?
- Quelles sont vos qualités et vos défauts ?
- Pourquoi la fonction publique territoriale ?
- Vous étiez [ancien métier]. Qu'est-ce qui vous a fait changer de voie ?
- Comment votre entourage a-t-il réagi à votre projet ?
- Avez-vous déjà travaillé avec des enfants ? Dans quel contexte ?
- Qu'est-ce qui vous a motivé à passer le CAP AEPE ?

=== CATÉGORIE 2 — MISSIONS DE L'ATSEM ===
- Quelles sont les missions d'un ATSEM ?
- Qui est votre supérieur hiérarchique ? Et sur le temps scolaire ?
- L'ATSEM peut-il prendre en charge la classe seul ?
- Quel est le rôle de l'ATSEM pendant la sieste ? La cantine ? La récréation ?
- Quelle est la différence entre temps scolaire et temps périscolaire ?
- Que signifie "communauté éducative" ?
- Pouvez-vous refuser une tâche demandée par l'enseignant(e) ?
- Décrivez une journée type d'ATSEM.
- Quelle est la différence entre ATSEM et animateur périscolaire ?

=== CATÉGORIE 3 — COLLECTIVITÉS TERRITORIALES ET DROIT PUBLIC ===
- Quelles sont les différentes collectivités territoriales ?
- Qui élit le maire ?
- Quelle est la différence entre un fonctionnaire territorial et un fonctionnaire d'État ?
- Qu'est-ce que le conseil d'école ? Qui le préside ?
- L'ATSEM a-t-il le droit de vote au conseil d'école ?
- Qu'est-ce que la laïcité à l'école ?
- Quelles sont les obligations d'un fonctionnaire ? (discrétion, réserve, obéissance)
- Qu'est-ce que le RIFSEEP ?
- Quelle collectivité est responsable des écoles primaires ?
- Qu'est-ce qu'un entretien annuel d'évaluation ?

=== CATÉGORIE 4 — SANTÉ ET SÉCURITÉ ===
- À partir de quelle température un enfant a-t-il de la fièvre ? Pouvez-vous lui donner un médicament ?
- Qu'est-ce qu'un PAI ? Quand est-il mis en place ?
- Quelle différence entre PAI et PPS ?
- Un enfant fait un malaise, que faites-vous ?
- Quels sont les numéros d'urgence ?
- Qu'est-ce que les TIAC ? Le HACCP ?
- Quelles maladies nécessitent une éviction scolaire ?
- Un enfant tombe et semble s'être cassé un bras. Que faites-vous ?
- Qu'est-ce que la méthode de Heimlich ?
- Un enfant saigne du nez. Que faites-vous ?

=== CATÉGORIE 5 — MISES EN SITUATION PROFESSIONNELLE ===
- Un enfant vous frappe. Que faites-vous ?
- Vous constatez des hématomes sur un enfant. Que faites-vous ?
- Un parent vient chercher un enfant en état d'ébriété. Comment réagissez-vous ?
- Un adulte que vous ne connaissez pas vient chercher un enfant. Que faites-vous ?
- L'enseignant(e) s'absente, que faites-vous ?
- Un enfant refuse de manger. Quelle est votre attitude ?
- Un enfant fait pipi dans sa culotte. Comment réagissez-vous ?
- Un parent vous demande comment son enfant se comporte en classe. Que répondez-vous ?
- Vous êtes en désaccord avec l'enseignant(e). Que faites-vous ?
- Un enfant est allergique aux arachides. Comment gérez-vous le repas ?
- L'alarme incendie se déclenche pendant la sieste. Que faites-vous ?
- Un enfant mord un camarade. Que faites-vous ?
- Un enfant pleure au moment de la séparation le matin. Comment réagissez-vous ?

=== CATÉGORIE 6 — HYGIÈNE ET ENTRETIEN ===
- Quels produits utilisez-vous pour nettoyer une classe ?
- Qu'est-ce que le bionettoyage ?
- Comment stockez-vous les produits d'entretien ?
- Que signifie le pictogramme "corrosif" sur un produit ?
- Peut-on mélanger de l'eau de Javel avec un détergent ?
- Qu'est-ce que le cercle de Sinner ?

=== CATÉGORIE 7 — DÉVELOPPEMENT DE L'ENFANT ===
- Quelles sont les étapes du développement moteur chez l'enfant de 3 à 6 ans ?
- Qu'est-ce qu'un objet transitionnel ?
- Comment gérer l'angoisse de séparation à la rentrée ?
- Qu'est-ce que la dyspraxie ? L'encoprésie ? L'énurésie ?
- Comment accueillir un enfant porteur de handicap ?
- Combien de domaines d'apprentissage en maternelle ? Lesquels ?

=== CATÉGORIE 8 — CULTURE GÉNÉRALE ET ACTUALITÉ ===
- Que pensez-vous de la scolarisation obligatoire dès 3 ans ?
- Connaissez-vous les dernières réformes de l'Éducation nationale ?
- Questions d'actualité locale liées à la petite enfance

## ERREURS ÉLIMINATOIRES
- Ne pas connaître le statut d'ATSEM (fonctionnaire territorial, pas Éducation nationale)
- Confondre autorité hiérarchique (maire) et fonctionnelle (directeur d'école)
- Dire qu'on peut donner un médicament sans PAI
- Dire qu'on peut prendre en charge la classe seul(e)
- Répondre aux parents sur la pédagogie
- Ne pas connaître les numéros d'urgence (15, 18, 112, 119)
- Dire "je ne sais pas" sans chercher à raisonner

## PIÈGES CLASSIQUES DU JURY
- Poser une question puis couper la parole pour tester la réactivité
- Demander un avis sur une situation ambiguë (réponse : "j'en réfère à l'enseignant(e) / au directeur")
- Demander si l'ATSEM peut surveiller seul la récréation (réponse : non)
- Insister sur un thème faible pour voir si le candidat panique
- Contredire le candidat pour tester sa résistance au stress
`;

export const PROMPT_ORAL = `À partir du CV/parcours du candidat fourni ci-dessous, génère une SIMULATION D'ORAL du concours externe ATSEM (15 minutes, 10 questions).

ÉTAPE 1 — ANALYSE DU CV
Analyse le document pour identifier :
- Le PROFIL : reconversion ? Expérience petite enfance ? Assistante maternelle ? Animatrice ?
- L'ANCIEN MÉTIER et sa durée
- Les COMPÉTENCES TRANSFÉRABLES vers le métier d'ATSEM
- Les POINTS FORTS (expérience enfants, CAP AEPE, BAFA, bénévolat)
- Les FAIBLESSES potentielles (pas d'expérience enfants, trous, changements multiples)
- L'ÂGE approximatif et la situation familiale si mentionnée

ÉTAPE 2 — GÉNÉRATION DES 10 QUESTIONS
Distribution OBLIGATOIRE :
- Q1 : OUVERTURE — "Présentez-vous" (TOUJOURS en premier)
- Q2 : MOTIVATION — "Pourquoi voulez-vous devenir ATSEM ?" (adapté au profil)
- Q3 : PARCOURS — Question personnalisée sur le changement de direction / l'expérience
- Q4 : MISSIONS — Question sur les missions concrètes de l'ATSEM
- Q5 : COLLECTIVITÉS — Question sur le statut, la hiérarchie ou les institutions
- Q6 : SANTÉ/SÉCURITÉ — Question sur un protocole, un PAI, un geste de premier secours
- Q7 : MISE EN SITUATION 1 — Scénario en classe ou à la cantine
- Q8 : MISE EN SITUATION 2 — Scénario relationnel (parent, enseignant, collègue)
- Q9 : QUALITÉS/PERSONNALITÉ — Qualités, défauts, gestion du stress, travail en équipe
- Q10 : PIÈGE — Question déstabilisante adaptée au CV

L'ordre doit sembler NATUREL comme un vrai entretien : commencer doucement, monter en intensité, finir par le piège.`;
