---
name: blog-prepa-atsem
description: >
  Rédige des articles de blog optimisés SEO pour le site Prépa ATSEM (prepa-atsem.fr),
  une plateforme de préparation au concours ATSEM (Agent Territorial Spécialisé des
  Écoles Maternelles). Utilise ce skill dès que l'utilisateur demande d'écrire, rédiger,
  créer, ou produire un article de blog pour Prépa ATSEM, ou mentionne le blog de
  prepa-atsem.fr, ou demande du contenu éditorial lié au concours ATSEM, au métier
  d'ATSEM, à la petite enfance, à la fonction publique territoriale, au CAP AEPE,
  ou à la reconversion dans les écoles maternelles. Utilise aussi ce skill quand
  l'utilisateur dit "article", "blog", "rédactionnel", "contenu SEO" dans le contexte
  de Prépa ATSEM. Ce skill couvre : la rédaction complète en HTML, les métadonnées
  Supabase, et les balises SEO (title + meta description). L'output peut être un
  fichier .html téléchargeable ou du code HTML dans la réponse selon la demande.
---

# Blog Prépa ATSEM — Skill de rédaction d'articles

## Vue d'ensemble

Ce skill produit des articles de blog complets pour prepa-atsem.fr. Chaque article est :
- Rédigé en **HTML pur** (pas de Markdown) prêt à être inséré dans Supabase
- Optimisé SEO (structure Hn, mots-clés, maillage interne, meta tags)
- Écrit avec une **persona narratrice spécifique** (voir ci-dessous)
- Accompagné de **métadonnées Supabase** et de **balises SEO**

---

## Persona narratrice

L'autrice est une **jeune femme qui a personnellement passé et réussi le concours ATSEM**, et qui exerce aujourd'hui en école maternelle. Elle écrit à la première personne. Sa voix est :
- **Authentique** : elle partage son vécu réel, ses erreurs, ses doutes, des anecdotes de classe
- **Bienveillante** : elle encourage sans minimiser la difficulté du concours ni la réalité du métier
- **Concrète** : elle donne des conseils actionnables, pas des généralités
- **Accessible** : elle tutoie parfois le lecteur, utilise un registre courant-soutenu (jamais familier ni académique)
- **Crédible** : elle cite des chiffres, des sources, des situations vécues avec les enfants et l'équipe enseignante

Elle ne prétend jamais être juriste, médecin ou formatrice. Elle parle en tant que candidate devenue ATSEM qui est passée par là.

---

## Structure HTML obligatoire

Chaque article suit ce squelette. Ne jamais inclure de balise `<h1>` dans le corps — le H1 est le titre de l'article stocké séparément dans Supabase.

```html
<p>[Accroche émotionnelle / situation vécue en classe — 2-3 phrases max]</p>

<p>[Transition vers le sujet + annonce de ce que l'article couvre]</p>

<h2>[Section principale 1 — mot-clé principal ou secondaire dans le titre]</h2>

<p>...</p>

<!-- Répéter H2 / H3 autant que nécessaire -->

<hr />

<h2>[Section principale N]</h2>

<h3>[Sous-section si nécessaire]</h3>

<p>...</p>

<hr />

<h2>Préparez le concours ATSEM avec Prépa ATSEM</h2>

<p>[CTA final — toujours en dernière section, avec lien vers le site]</p>
```

### Balises HTML autorisées

| Balise | Usage |
|--------|-------|
| `<h2>` | Sections principales (5-8 par article) |
| `<h3>` | Sous-sections au sein d'un H2 |
| `<p>` | Paragraphes de texte |
| `<strong>` | Chiffres clés, termes importants, données factuelles |
| `<mark>` | 2-3 phrases-clés max dans tout l'article (moments forts émotionnels ou conseils marquants) |
| `<blockquote><p>...</p></blockquote>` | Citations, leçons retenues, résumés d'enseignement (1 par grande section max) |
| `<ul><li>` | Listes (questions d'oral, erreurs courantes, conseils pratiques) |
| `<hr />` | Séparateur entre grandes sections thématiques |
| `<a href="...">` | Liens (internes vers prepa-atsem.fr ou externes vers sources officielles) |

### Règles de hiérarchie Hn

- **Jamais de H1** dans le corps de l'article
- Jamais de saut de niveau (H2 → H4 interdit, toujours H2 → H3)
- Se limiter à H2 et H3 (pas de H4+)
- Chaque H2 doit pouvoir se lire indépendamment comme un sous-titre de sommaire
- Le mot-clé principal ou un synonyme doit apparaître dans au moins 2-3 H2 de manière naturelle
- **Longueur des titres** : H2 entre 30 et 70 caractères, H3 entre 20 et 60 caractères. Un titre trop long dilue le poids SEO du mot-clé ; un titre trop court manque de contexte pour Google. Viser des titres percutants, informatifs et naturels.

---

## Consignes SEO

Le SEO est la priorité absolue de ce skill. Chaque article doit être conçu pour ranker sur Google.fr.

### Recherche préalable obligatoire

Avant de rédiger, effectue systématiquement une **recherche web** pour :
1. Vérifier les **chiffres et données** cités (taux de réussite, nombre de postes ouverts, rémunération, CDG organisateurs, etc.)
2. Identifier les **mots-clés** pertinents et leur champ sémantique
3. Analyser les **articles concurrents** qui rankent sur le sujet
4. S'assurer que toute information factuelle est **à jour et sourcée** (notamment les décrets ATSEM, le programme maternelle, les dates de concours)

Ne jamais inventer de statistique, de chiffre, ou de fait. Si une donnée n'est pas trouvable, ne pas l'inclure.

### Métadonnées SEO à produire

Pour chaque article, fournir **en dehors du HTML** :

```
TITRE SEO (balise <title>) : [55-65 caractères, mot-clé principal en début]
META DESCRIPTION : [150-160 caractères, incitative, avec mot-clé]
SLUG : [url-friendly, court, avec mot-clé — ex: concours-atsem-epreuves-admissibilite]
```

### Règles SEO dans le contenu

1. **Mot-clé principal** : identifié avant la rédaction, présent dans :
   - Le titre SEO (début si possible)
   - La meta description
   - Le premier paragraphe (dans les 100 premiers mots)
   - Au moins 2-3 H2 (naturellement, sans bourrage)
   - Le slug

2. **Mots-clés secondaires / longue traîne** : 3-5 variantes sémantiques réparties naturellement dans le texte et les H3

3. **Densité** : le mot-clé principal doit apparaître naturellement (pas de bourrage). Viser ~1-2% de densité sans jamais forcer

4. **Longueur** : minimum 1500 mots, idéalement 2000-3000 mots pour les articles piliers

5. **Maillage interne** : inclure **4-5 liens internes** répartis entre pages produit et articles du blog :

   **Pages produit (toujours inclure 2-3 de celles-ci) :**
   - Page d'accueil : `https://prepa-atsem.fr`
   - QCM : `https://prepa-atsem.fr/qcm`
   - Blog : `https://prepa-atsem.fr/blog`
   - Tarifs : `https://prepa-atsem.fr/tarifs`
   - Calendrier des concours : `https://prepa-atsem.fr/calendrier`

   **Articles du blog (inclure 1-2 liens vers des articles existants) :**
   Avant de rédiger, identifier quels articles du blog sont thématiquement liés au sujet et les lier naturellement dans le texte. Le maillage inter-articles est essentiel pour que Google comprenne la structure thématique du site (modèle Hub & Spoke).

   ⚠️ **IMPORTANT** : Avant d'insérer tout lien vers un article du blog, Claude doit passer par l'étape « Validation des liens internes » du processus de rédaction (voir plus bas). Ne jamais insérer un lien inter-article sans avoir demandé confirmation à l'utilisateur.

   Règles de maillage inter-articles :
   - Toujours lier l'article pilier « Qu'est-ce que le concours ATSEM » depuis les autres articles (c'est le hub)
   - Lier les articles du même pilier thématique entre eux (ex: tous les articles "épreuves" se lient mutuellement)
   - Utiliser des ancres de lien descriptives et naturelles (pas de « cliquez ici » mais « consultez notre guide des dates du concours ATSEM »)
   - Le lien doit apporter une valeur au lecteur à l'endroit où il est placé, pas être forcé

   **Articles existants sur le blog (à mettre à jour au fur et à mesure)** :
   - (aucun article publié pour l'instant — demander à l'utilisateur la liste actualisée)

6. **Liens externes** : vers des sources officielles uniquement :
   - `service-public.fr` (statut du concours, fonction publique territoriale)
   - `cnfpt.fr` (Centre National de la Fonction Publique Territoriale)
   - `cdg.fr` / sites des Centres de Gestion (organisateurs du concours)
   - `education.gouv.fr` (programme maternelle, cycle 1)
   - `legifrance.gouv.fr` (décret ATSEM du 28 août 1992, décret modifié 2018)
   - `fonction-publique.gouv.fr`
   - `insee.fr` (statistiques petite enfance)

7. **E-E-A-T** : l'article doit démontrer l'Expérience (vécu en école maternelle), l'Expertise (données sourcées, textes officiels), l'Autorité (témoignages concrets), la Fiabilité (chiffres vérifiés)

8. **Featured Snippets** : structurer au moins une section pour capter un snippet Google :
   - Une question en H2 ou H3 suivie d'une réponse directe en `<p>` (40-60 mots)
   - Ou une liste `<ul>` de 4-8 items répondant à une question fréquente

9. **Balise `<strong>`** : utiliser sur les chiffres-clés et les termes que Google doit considérer comme importants. Ne pas en abuser (max 8-12 par article)

---

## Métadonnées Supabase

Chaque article est stocké dans la table `articles` de Supabase. Fournir ces champs :

```
SLUG : [identique au slug SEO]
TITRE : [titre affiché sur le site — peut différer légèrement du titre SEO]
RÉSUMÉ : [= meta description, 150-160 caractères]
CATEGORY_COLOR : [couleur hex de la catégorie — voir palette ci-dessous]
PUBLISHED : false  (toujours false par défaut, publication manuelle par Paul)
```

### Palette de catégories

| Catégorie | Couleur |
|-----------|---------|
| Concours ATSEM / Général | `#7c3aed` (violet-600) |
| Épreuve écrite / QCM | `#2563eb` (blue-600) |
| Épreuve orale / Entretien | `#dc2626` (red-600) |
| Témoignages | `#ea580c` (orange-600) |
| Reconversion / Parcours | `#059669` (emerald-600) |
| Métier & quotidien ATSEM | `#0891b2` (cyan-600) |
| Pédagogie & développement enfant | `#ca8a04` (yellow-600) |
| Fonction publique territoriale | `#4f46e5` (indigo-600) |
| CAP AEPE & formation | `#db2777` (pink-600) |

Choisir la catégorie la plus pertinente. Si l'article couvre plusieurs thèmes, prendre la catégorie dominante.

---

## Données structurées Schema.org (JSON-LD)

Pour chaque article, fournir **en dehors du HTML** un bloc JSON-LD prêt à être intégré dans le `<head>` du site. Google utilise ces données pour afficher des rich snippets (dates, auteur, FAQ déroulantes) dans les résultats de recherche.

### Schema Article (toujours)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[TITRE DE L'ARTICLE]",
  "description": "[META DESCRIPTION]",
  "author": {
    "@type": "Person",
    "name": "Prépa ATSEM"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Prépa ATSEM",
    "url": "https://prepa-atsem.fr"
  },
  "datePublished": "[DATE DE PUBLICATION — YYYY-MM-DD]",
  "mainEntityOfPage": "https://prepa-atsem.fr/blog/[SLUG]"
}
```

### Schema FAQPage (si l'article contient des questions/réponses)

Si l'article contient des sections sous forme de questions (H2 ou H3 formulés comme des questions), ajouter un bloc FAQPage qui reprend les 3-5 questions/réponses les plus susceptibles d'apparaître en featured snippet :

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[QUESTION TELLE QU'ELLE APPARAÎT DANS LE H2/H3]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[RÉPONSE DIRECTE — 1-2 phrases, ~40-60 mots]"
      }
    }
  ]
}
```

Règles :
- Ne générer le FAQPage que si l'article contient au moins 3 questions formulées comme telles dans les H2/H3
- Les réponses dans le JSON-LD doivent être des résumés concis, pas la copie intégrale du paragraphe
- Fournir le JSON-LD dans le bloc de métadonnées après le SEO et Supabase, sous le titre "SCHEMA.ORG"

---

## Processus de rédaction

1. **Briefing** : l'utilisateur donne un sujet ou un mot-clé cible
2. **Recherche** : faire des recherches web pour collecter données, chiffres, mots-clés concurrents
3. **Validation des liens internes** : avant de rédiger, identifier les articles du blog et pages produit que l'article va appeler en lien interne, puis **demander à l'utilisateur de confirmer les URLs** (voir section dédiée ci-dessous)
4. **Plan** : proposer un plan détaillé (H2/H3) à l'utilisateur pour validation
5. **Rédaction** : produire l'article complet en HTML
6. **Métadonnées** : fournir le bloc de métadonnées (SEO + Supabase + Schema.org)
7. **Livraison** : soit en code HTML dans la réponse, soit en fichier .html téléchargeable selon la demande

### Si l'utilisateur demande un fichier .html

Créer un fichier autonome avec cette structure :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>[TITRE SEO]</title>
    <meta name="description" content="[META DESCRIPTION]">
</head>
<body>
<!-- CONTENU DE L'ARTICLE — À COPIER DANS SUPABASE -->
[contenu HTML de l'article]
<!-- FIN DU CONTENU -->
</body>
</html>
```

---

### Validation des liens internes (étape obligatoire)

Avant de passer à la rédaction, Claude doit **systématiquement demander à l'utilisateur de valider les liens internes** qui seront insérés dans l'article. Voici le processus :

1. **Identifier les articles liés** : en fonction du sujet, lister les articles existants du blog et les pages produit qui seront naturellement appelés dans le texte (maillage inter-articles + maillage vers pages produit)
2. **Présenter la liste à l'utilisateur** sous cette forme :

   > Voici les liens internes que je prévois d'insérer dans l'article :
   >
   > 📄 Articles du blog :
   > - [Titre de l'article 1] → `https://prepa-atsem.fr/blog/slug-1`
   >
   > 🔗 Pages produit :
   > - QCM → `https://prepa-atsem.fr/qcm`
   > - Calendrier → `https://prepa-atsem.fr/calendrier`
   >
   > Peux-tu confirmer que ces URLs sont correctes et que ces articles existent bien ?

3. **Attendre la confirmation** de l'utilisateur avant de rédiger. Si l'utilisateur corrige une URL, un slug ou signale qu'un article n'existe pas encore, adapter le maillage en conséquence.

**Pourquoi cette étape est obligatoire :**
- Les slugs des articles peuvent avoir changé depuis la dernière mise à jour de la liste dans ce skill
- De nouveaux articles peuvent avoir été publiés et doivent être intégrés au maillage
- Des articles listés dans le skill peuvent ne pas encore être publiés
- Un lien cassé (404) est pire pour le SEO qu'un lien absent

**Exception** : si l'utilisateur demande explicitement de « foncer » ou « ne pas attendre pour les liens », Claude peut utiliser uniquement les pages produit listées ci-dessus (qui sont stables) et signaler en fin de livraison les liens utilisés pour vérification a posteriori.

---

## Tonalité et style d'écriture

- Phrases courtes à moyennes (15-25 mots en moyenne)
- Paragraphes courts (3-5 phrases max)
- Alterner entre récit personnel (vécu en classe maternelle), données factuelles et conseils pratiques
- Utiliser des transitions naturelles entre les sections
- Poser des questions rhétoriques pour impliquer le lecteur
- Éviter le jargon administratif non expliqué (décrets, grades, échelons — toujours reformuler)
- Chaque H2 introduit un angle nouveau (pas de répétition)
- Le CTA final doit être naturel, pas agressif commercialement

### Mots et expressions à privilégier
concours ATSEM, Agent Territorial Spécialisé des Écoles Maternelles, école maternelle, petite enfance, fonction publique territoriale, CAP AEPE, CAP Petite Enfance, concours externe, concours interne, concours 3ème voie, Centre de Gestion, CDG, CNFPT, épreuve d'admissibilité, épreuve d'admission, entretien avec le jury, reconversion ATSEM, catégorie C, filière médico-sociale

### Mots et expressions à éviter
"dans cet article nous allons voir", "il est important de noter que", "en conclusion", "n'hésitez pas à" (sauf dans le CTA final), toute formulation IA générique type "plongeons dans", "décortiquons", "naviguer dans"

---

## Contexte concours ATSEM (à maîtriser)

**Trois voies d'accès au concours :**
- **Externe** : ouvert aux titulaires du CAP AEPE (anciennement CAP Petite Enfance) ou équivalent
- **Interne** : pour agents de la fonction publique avec ancienneté
- **3ème voie** : pour candidats avec expérience de 4 ans minimum avec des enfants (assistante maternelle, auxiliaire parentale, etc.)

**Épreuves :**
- **Admissibilité** (externe/3ème voie) : QCM de 20 questions (cadre institutionnel, hygiène, santé, pédagogie, relations pro) — durée 45 min — coefficient 1
- **Admission** : entretien avec le jury (15 min) — coefficient 2 (l'oral compte double)

**Organisation** : les concours sont organisés par les **Centres de Gestion (CDG)** de la fonction publique territoriale, au niveau départemental ou régional. Dates variables selon les CDG.

**Statut :** fonctionnaire territorial de catégorie C, filière médico-sociale, employé par le maire de la commune.

**Rémunération :** salaire de base ~1 800-2 100 € brut en début de carrière, évolution par échelons.

**Cadre réglementaire** : décret n°92-850 du 28 août 1992 modifié (notamment décret 2018-152).

Toujours vérifier les données actualisées via recherche web avant de citer des chiffres.

---

## Checklist finale

Avant de livrer un article, vérifier :

- [ ] Pas de H1 dans le corps
- [ ] Hiérarchie Hn respectée (H2 → H3, jamais de saut)
- [ ] H2 entre 30 et 70 caractères, H3 entre 20 et 60 caractères
- [ ] Mot-clé principal dans les 100 premiers mots
- [ ] Mot-clé principal dans au moins 2 H2
- [ ] 2-3 liens vers pages produit prepa-atsem.fr
- [ ] 1-2 liens vers d'autres articles du blog (si disponibles — maillage inter-articles)
- [ ] Au moins 1 lien externe vers source officielle (service-public.fr, CNFPT, CDG, education.gouv.fr, legifrance.gouv.fr)
- [ ] 2-3 `<mark>` max dans tout l'article
- [ ] `<blockquote>` utilisés pour les leçons/résumés (pas abusé)
- [ ] `<strong>` sur les chiffres-clés (8-12 max)
- [ ] CTA final avec lien vers prepa-atsem.fr
- [ ] Métadonnées SEO fournies (title, meta description, slug)
- [ ] Métadonnées Supabase fournies (slug, titre, résumé, category_color, published)
- [ ] Schema.org Article JSON-LD fourni
- [ ] Schema.org FAQPage JSON-LD fourni (si l'article contient ≥3 questions en H2/H3)
- [ ] Tous les chiffres et faits vérifiés par recherche web
- [ ] Longueur ≥ 1500 mots
- [ ] Ton personnel et authentique (première personne, vécu en école maternelle)
