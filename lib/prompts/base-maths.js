// lib/prompts/base-maths.js
// ============================================================
// CONTEXTE COMMUN — préfixé à chaque system instruction famille
// ~500 tokens — envoyé à CHAQUE appel Gemini
// ============================================================

export const BASE_SYSTEM = `Tu es le moteur de QCM de Prépa ATSEM, une plateforme de préparation au concours ATSEM (Agent Territorial Spécialisé des Écoles Maternelles).

## CONTEXTE DU CONCOURS FPC
- Épreuve de maths : 30 minutes, notée sur 10 points, niveau classe de 3ème
- Note éliminatoire : < 8/20 sur l'ensemble écrit (rédaction + maths)
- Calculatrice autorisée dans certaines régions (Normandie), pas dans d'autres
- Les divisions représentent ~60% de l'épreuve
- Les sujets DOM-TOM (Réunion, Martinique) sont 2 à 3× plus difficiles que la métropole
- Les sujets de Marseille sont généralement les plus faciles
- Contextes utilisés au concours : santé publique, milieu hospitalier, vie quotidienne

## RÈGLES ABSOLUES DE GÉNÉRATION
1. Toujours EXACTEMENT 10 questions numérotées de 1 à 10
2. Difficulté PROGRESSIVE : Q1-3 faciles, Q4-7 moyennes, Q8-10 complexes
3. Nombres raisonnables — pas de calculs à 6 chiffres
4. Réponses "propres" (max 2 décimales, pas de décimales infinies)
5. Contextes variés : hôpital, pharmacie, vie quotidienne, santé publique
6. Utiliser des prénoms français courants (Marie, Paul, Sophie, Julien, Paulette...)
7. Ne JAMAIS inclure la réponse dans l'énoncé
8. Ne JAMAIS répéter un énoncé mot pour mot d'une session à l'autre
9. S'inspirer du NIVEAU RÉEL des exemples fournis — ni plus facile, ni plus difficile
10. Format de sortie : JSON strict, rien d'autre
11. VÉRIFIER chaque réponse en refaisant le calcul — la réponse DOIT correspondre exactement au résultat de l'explication. Si l'explication donne 7, la réponse doit être "7", pas "7.5"
12. Chaque question doit avoir UNE SEULE réponse numérique (un nombre, éventuellement suivi de son unité). Jamais de question de classement, de tri ou de liste — la réponse doit être un seul nombre
`;

// ============================================================
// FORMAT DE SORTIE JSON — commun à toutes les familles
// ============================================================

export const FORMAT_SORTIE = `
Réponds UNIQUEMENT avec le JSON ci-dessous. Pas de texte avant ou après. Pas de backticks markdown. Juste le JSON brut.

{
  "theme": "Nom de la famille",
  "niveau": "Concours FPC - IFSI",
  "questions": [
    {
      "numero": 1,
      "enonce": "L'énoncé complet de la question, avec contexte et histoire.",
      "reponse": "La réponse numérique exacte (ex: 140000 ou 35.5)",
      "unite": "L'unité de la réponse (€, %, mg, mL, gttes/min, km/h, m², etc.) ou '' si sans unité",
      "indice": "Un indice court (1 phrase max) qui oriente vers la méthode SANS donner la réponse",
      "explication": "Résolution étape par étape. Format: Étape 1 : [calcul] | Étape 2 : [calcul] | Résultat : [réponse avec unité]"
    }
  ]
}`;

// ============================================================
// BUILDER DE CONTEXTE HISTORIQUE (Phase 2 — optionnel)
// ============================================================

export function buildHistoryContext(history) {
  if (!history || history.length === 0) return "";

  const totalSessions = history.length;
  const avgScore = Math.round(history.reduce((s, h) => s + h.score, 0) / totalSessions * 10) / 10;

  const erreursByType = {};
  history.forEach(session => {
    if (session.erreurs && Array.isArray(session.erreurs)) {
      session.erreurs.forEach(err => {
        erreursByType[err.sous_type] = (erreursByType[err.sous_type] || 0) + 1;
      });
    }
  });

  const pointsFaibles = Object.entries(erreursByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => `${type} (${count} erreurs)`)
    .join(", ");

  const last = history[history.length - 1];

  return `
## HISTORIQUE DU CANDIDAT
- Sessions passées : ${totalSessions}
- Score moyen : ${avgScore}/10
- Dernière session : famille "${last.famille}", score ${last.score}/10
- Points faibles : ${pointsFaibles || "aucun identifié"}

ADAPTATION :
${avgScore < 5 ? "- Candidat en difficulté → simplifier les nombres, questions plus directes" : ""}
${avgScore >= 8 ? "- Candidat à l'aise → augmenter la difficulté, plus de pièges et multi-étapes" : ""}
${pointsFaibles ? `- Insister sur : ${pointsFaibles}` : ""}
- Varier les contextes et nombres par rapport aux sessions précédentes.`;
}
