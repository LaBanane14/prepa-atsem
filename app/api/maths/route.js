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
        generationConfig: { temperature: 0.8, maxOutputTokens: 8000 }
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
        generationConfig: { temperature: 0.7, maxOutputTokens: 8000 }
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
      const prompt = `Tu es un examinateur du concours IFSI FPC (Formation Professionnelle Continue) pour l'épreuve de mathématiques.

Le document PDF ci-joint contient des annales réelles du concours IFSI FPC des dernières années. Tu dois t'en servir comme base principale.

Tu as DEUX possibilités (choisis-en une au hasard, avec une probabilité de 50/50) :

OPTION 1 — SUJET D'ANNALE :
Reprends un sujet tel quel ou très proche d'un sujet présent dans les annales du PDF. Mentionne l'année et la ville d'origine dans le titre (ex: "Annale Marseille 2024"). Reproduis fidèlement les exercices et questions tels qu'ils apparaissent dans le document.

OPTION 2 — SUJET ORIGINAL INSPIRÉ DES ANNALES :
Crée un sujet original en t'inspirant des thèmes, du format et du niveau de difficulté des annales du PDF. Le sujet doit être réaliste et cohérent avec ce qui est demandé au concours.

RÈGLES IMPORTANTES :
- Le candidat dispose de 30 MINUTES, SANS CALCULATRICE
- La note est sur 10 points
- Génère entre 2 et 4 exercices pour un total de 6 à 8 questions/items
- Les 4 familles d'exercices possibles : opérations sur les décimaux (60% du sujet), pourcentages/proportionnalité, conversions d'unités, équations/problèmes
- Le format est QUESTION-RÉPONSE (pas de QCM), le candidat écrit sa réponse
- Chaque question doit avoir une réponse numérique ou textuelle courte
- Les calculs doivent être faisables à la main (pas de nombres trop complexes)
- Adapte la difficulté au niveau aide-soignant / auxiliaire de puériculture

IMPORTANT : Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "source": "annale" ou "original",
  "titre": "Titre du sujet (précise ville et année si annale)",
  "annee": "2024 (si annale, sinon null)",
  "ville": "Marseille (si annale, sinon null)",
  "duree": "30 minutes",
  "calculatrice": false,
  "noteMax": 10,
  "exercices": [
    {
      "numero": 1,
      "titre": "Titre de l'exercice",
      "enonce": "Énoncé général de l'exercice (contexte, données...)",
      "categorie": "operations" ou "pourcentages" ou "conversions" ou "equations",
      "points": 3,
      "questions": [
        {
          "id": "1a",
          "question": "La question précise à résoudre",
          "points": 1.5,
          "reponse": "La réponse attendue (nombre ou texte court)"
        }
      ]
    }
  ]
}`

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

      const prompt = `Tu es un correcteur du concours IFSI FPC pour l'épreuve de mathématiques. Tu dois corriger les réponses d'un candidat de manière détaillée et bienveillante. Le candidat disposait de 30 minutes, sans calculatrice.

EXERCICES :
${JSON.stringify(exercices, null, 2)}

RÉPONSES DU CANDIDAT :
${reponsesFormatted}

Corrige chaque réponse en :
1. Comparant avec la réponse attendue
2. Expliquant la méthode de résolution étape par étape
3. Indiquant si la réponse est correcte, partiellement correcte ou incorrecte
4. Attribuant les points (points partiels possibles si la méthode est bonne mais le résultat faux)

Sois juste mais bienveillant. Valorise les méthodes correctes même si le résultat final est faux.

IMPORTANT : Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "note": 7,
  "noteMax": 10,
  "appreciation": "Appréciation générale en 2-3 phrases",
  "corrections": [
    {
      "id": "1a",
      "question": "La question",
      "reponse_candidat": "Ce que le candidat a répondu",
      "reponse_attendue": "La bonne réponse",
      "correct": true ou false ou "partiel",
      "points_obtenus": 1.5,
      "points_max": 1.5,
      "explication": "Explication détaillée de la correction avec la méthode de résolution"
    }
  ],
  "points_forts": ["point fort 1", "point fort 2"],
  "points_ameliorer": ["point à améliorer 1", "point à améliorer 2"],
  "conseil": "Un conseil personnalisé pour progresser"
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
