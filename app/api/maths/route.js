import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const apiKey = process.env.GEMINI_API_KEY

// Charger le PDF des annales maths au démarrage
let annalesBase64 = null
try {
  const pdfPath = join(process.cwd(), 'data', 'annales-maths.pdf')
  const pdfBuffer = readFileSync(pdfPath)
  annalesBase64 = pdfBuffer.toString('base64')
} catch (e) {
  console.error('Impossible de charger le PDF des annales maths:', e.message)
}

async function callGeminiWithPdf(prompt) {
  const parts = []

  if (annalesBase64) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: annalesBase64
      }
    })
  }

  parts.push({ text: prompt })

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 8000, responseMimeType: "application/json" }
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API error:', response.status, errorText)
    throw new Error(`Erreur API Gemini (${response.status})`)
  }

  const data = await response.json()
  const allText = data.candidates?.[0]?.content?.parts
    ?.map(p => p.text || '')
    .join('\n') || ''

  if (!allText) throw new Error('Réponse vide de Gemini')
  return allText.replace(/```json/g, '').replace(/```/g, '').trim()
}

async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8000, responseMimeType: "application/json" }
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API error:', response.status, errorText)
    throw new Error(`Erreur API Gemini (${response.status})`)
  }

  const data = await response.json()
  const allText = data.candidates?.[0]?.content?.parts
    ?.map(p => p.text || '')
    .join('\n') || ''

  if (!allText) throw new Error('Réponse vide de Gemini')
  return allText.replace(/```json/g, '').replace(/```/g, '').trim()
}

export async function POST(request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Gemini manquante.' }, { status: 500 })
    }

    const body = await request.json()
    const { action, exercices, reponses } = body

    // === GÉNÉRER DES EXERCICES ===
    if (action === 'generer') {
      // Choix côté serveur : 1 chance sur 4 annale, 3 chances sur 4 original
      const useAnnale = Math.random() < 0.25

      const promptAnnale = `Tu es un examinateur du concours IFSI FPC (Formation Professionnelle Continue) pour l'épreuve de mathématiques.

Le document PDF ci-joint contient des annales réelles du concours IFSI FPC des dernières années. Tu dois t'en servir comme base exclusive.

MISSION :
Reprends un sujet tel quel ou très proche d'un sujet présent dans les annales du PDF. Reproduis fidèlement les exercices et les questions tels qu'ils apparaissent dans le document d'origine.

RÈGLES IMPORTANTES :
- Le candidat dispose de 30 MINUTES, SANS CALCULATRICE.
- La note totale est sur 10 points.
- Le format attendu est QUESTION-RÉPONSE (pas de QCM), le candidat devra écrire sa propre réponse.
- Chaque question doit avoir une réponse numérique ou textuelle courte attendue.

FORMAT DE SORTIE :
Tu dois répondre UNIQUEMENT au format JSON strict, sans aucun texte avant ou après, en respectant scrupuleusement cette structure :

{
  "source": "annale",
  "titre": "Titre du sujet (ex: Annale Marseille 2024)",
  "annee": "Année de l'annale",
  "ville": "Ville d'origine",
  "duree": "30 minutes",
  "calculatrice": false,
  "noteMax": 10,
  "exercices": [
    {
      "numero": 1,
      "titre": "Titre de l'exercice",
      "enonce": "Énoncé global de l'exercice (si applicable)",
      "categorie": "operations/pourcentages/conversions/equations",
      "points": 3,
      "questions": [
        {
          "id": "1a",
          "question": "Texte de la question",
          "points": 1.5,
          "reponse": "La réponse correcte attendue"
        }
      ]
    }
  ]
}`

      const promptOriginal = `Tu es un examinateur du concours IFSI FPC (Formation Professionnelle Continue) pour l'épreuve de mathématiques.

Le document PDF ci-joint contient des annales réelles du concours IFSI FPC. Tu dois t'en servir comme modèle pour comprendre les thèmes, le format et le niveau de difficulté attendus.

MISSION :
Crée un sujet ORIGINAL INÉDIT en t'inspirant fidèlement des annales fournies. Le sujet doit être réaliste, cohérent avec ce qui est demandé au concours, et adapté au niveau d'un aide-soignant ou auxiliaire de puériculture.

RÈGLES IMPORTANTES :
- Le candidat dispose de 30 MINUTES, SANS CALCULATRICE.
- La note totale est sur 10 points.
- Génère entre 2 et 4 exercices pour un total de 6 à 8 questions/items.
- RÉPARTITION : Génère 4 à 5 questions portant sur les opérations sur les décimaux. Répartis les 2 à 3 questions restantes sur les pourcentages/proportionnalité, conversions d'unités ou équations/problèmes simples.
- Le format attendu est QUESTION-RÉPONSE (pas de QCM).
- Chaque question doit avoir une réponse numérique ou textuelle courte.
- Les calculs doivent être faisables à la main de tête (pas de nombres trop complexes).

FORMAT DE SORTIE :
Tu dois répondre UNIQUEMENT au format JSON strict, sans aucun texte avant ou après, en respectant scrupuleusement cette structure :

{
  "source": "original",
  "titre": "Sujet Original Type Concours FPC",
  "annee": null,
  "ville": null,
  "duree": "30 minutes",
  "calculatrice": false,
  "noteMax": 10,
  "exercices": [
    {
      "numero": 1,
      "titre": "Titre de l'exercice",
      "enonce": "Énoncé global de l'exercice",
      "categorie": "operations/pourcentages/conversions/equations",
      "points": 3,
      "questions": [
        {
          "id": "1a",
          "question": "Texte de la question",
          "points": 1.5,
          "reponse": "La réponse correcte attendue et détaillée"
        }
      ]
    }
  ]
}`

      const prompt = useAnnale ? promptAnnale : promptOriginal
      const raw = await callGeminiWithPdf(prompt)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Erreur de format. Réessayez.' }, { status: 500 })
      }
      const sujetData = JSON.parse(jsonMatch[0])
      return NextResponse.json({ sujet: sujetData })
    }

    // === CORRIGER LES RÉPONSES ===
    if (action === 'corriger') {
      if (!exercices || !reponses) {
        return NextResponse.json({ error: 'Exercices et réponses requis.' }, { status: 400 })
      }

      const reponsesFormatted = Object.entries(reponses).map(([id, val]) => `- Question ${id} : "${val}"`).join('\n')

      const prompt = `Tu es un correcteur du concours IFSI FPC pour l'épreuve de mathématiques.
Tu dois corriger les réponses d'un candidat de manière détaillée, juste et bienveillante.
Rappel du contexte : le candidat disposait de 30 minutes, sans calculatrice.

VOICI LE SUJET ET LE BARÈME (au format JSON) :
${JSON.stringify(exercices, null, 2)}

VOICI LES RÉPONSES DU CANDIDAT :
${reponsesFormatted}

MISSION :
Corrige chaque réponse en :
1. Comparant avec la réponse attendue.
2. Expliquant la méthode de résolution étape par étape de manière pédagogique.
3. Attribuant les points avec justesse. Valorise les méthodes correctes même si le résultat final est faux en accordant des points partiels.
4. Rédigeant un bilan constructif (points forts, points à améliorer, conseil).

FORMAT DE SORTIE :
Tu dois répondre UNIQUEMENT au format JSON strict, sans aucun texte avant ou après, en respectant scrupuleusement cette structure :

{
  "note": 7.5,
  "noteMax": 10,
  "appreciation": "Appréciation globale bienveillante sur le travail fourni",
  "corrections": [
    {
      "id": "1a",
      "question": "Rappel de la question",
      "reponse_candidat": "Ce qu'a répondu le candidat",
      "reponse_attendue": "La vraie réponse attendue",
      "correct": "true, false, ou partiel",
      "points_obtenus": 1.5,
      "points_max": 1.5,
      "explication": "Explication pédagogique de la correction et de l'attribution des points"
    }
  ],
  "points_forts": ["Point fort 1", "Point fort 2"],
  "points_ameliorer": ["Axe d'amélioration 1", "Axe d'amélioration 2"],
  "conseil": "Un conseil pratique pour le concours"
}`

      const raw = await callGemini(prompt)
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Erreur de format. Réessayez.' }, { status: 500 })
      }
      const correction = JSON.parse(jsonMatch[0])
      return NextResponse.json({ correction })
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Erreur serveur : ' + error.message }, { status: 500 })
  }
}
