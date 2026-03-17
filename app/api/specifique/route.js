import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const apiKey = process.env.GEMINI_API_KEY

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
    parts.push({ inlineData: { mimeType: 'application/pdf', data: annalesBase64 } })
  }
  parts.push({ text: prompt })

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 16000 }
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API error:', response.status, errorText)
    throw new Error(`Erreur API Gemini (${response.status})`)
  }

  const data = await response.json()
  const allText = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || ''
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
        generationConfig: { temperature: 0.7, maxOutputTokens: 16000 }
      })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API error:', response.status, errorText)
    throw new Error(`Erreur API Gemini (${response.status})`)
  }

  const data = await response.json()
  const allText = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || ''
  if (!allText) throw new Error('Réponse vide de Gemini')
  return allText.replace(/```json/g, '').replace(/```/g, '').trim()
}

const familleDescriptions = {
  operations: "Opérations décimales : additions, soustractions, multiplications et divisions de nombres décimaux. Opérations posées à effectuer sans calculatrice. Inclure des calculs avec des nombres à virgule, des multiplications par 10/100/1000, des divisions longues simples.",
  pourcentages: "Pourcentages et proportionnalité : calculer un pourcentage d'un nombre, augmentations/diminutions en pourcentage, produits en croix, proportionnalité directe et inverse, problèmes de remise/TVA/taux. Contextes concrets (médical, commerce, vie courante).",
  conversions: "Conversions d'unités : longueurs (km, m, cm, mm), masses (kg, g, mg, µg), volumes (L, dL, cL, mL), surfaces (m², cm²), durées (heures, minutes, secondes). Tableaux de conversion. Exercices variés de conversion dans les deux sens.",
  equations: "Équations et problèmes : équations du 1er degré (ax + b = c), mise en équation de problèmes concrets (âges, répartitions, mélanges, vitesses), problèmes de logique. Contextes adaptés au milieu médical et à la vie courante."
}

export async function POST(request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API Gemini manquante.' }, { status: 500 })
    }

    const body = await request.json()
    const { action, famille, exercices, reponses } = body

    if (action === 'generer') {
      if (!famille || !familleDescriptions[famille]) {
        return NextResponse.json({ error: 'Famille non reconnue.' }, { status: 400 })
      }

      const prompt = `Tu es un professeur de mathématiques qui prépare des candidats au concours IFSI FPC (Formation Professionnelle Continue).

Le document PDF ci-joint contient des annales réelles du concours. Inspire-toi des exercices correspondant à cette famille.

FAMILLE DEMANDÉE : ${familleDescriptions[famille]}

Génère un entraînement ciblé sur cette famille uniquement :
- Entre 10 et 15 questions progressives (du plus facile au plus difficile)
- Sans calculatrice, les calculs doivent être faisables à la main
- Chaque question doit avoir une réponse numérique ou textuelle courte (un nombre, une conversion, un résultat)
- Adapte au niveau aide-soignant / auxiliaire de puériculture
- Varie les types de questions au sein de la famille

IMPORTANT : Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "famille": "${famille}",
  "titre": "Titre de l'entraînement",
  "questions": [
    {
      "id": 1,
      "question": "L'énoncé de la question",
      "reponse": "La réponse attendue (courte)"
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

    if (action === 'corriger') {
      if (!exercices || !reponses) {
        return NextResponse.json({ error: 'Exercices et réponses requis.' }, { status: 400 })
      }

      const questionsFormatted = exercices.map((q, i) => `Question ${q.id} : "${q.question}" (Réponse attendue : ${q.reponse}) → Réponse du candidat : "${reponses[q.id] || '(vide)'}"`).join('\n')

      const prompt = `Tu es un professeur de mathématiques bienveillant. Tu corriges les réponses d'un candidat au concours IFSI FPC.

QUESTIONS ET RÉPONSES :
${questionsFormatted}

Pour CHAQUE question, indique si la réponse est correcte ou incorrecte, et donne une explication détaillée en HTML (utilise <br/>, <strong>, <em>) de la méthode de résolution étape par étape. Sois pédagogue.

IMPORTANT : Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "note": 7,
  "noteMax": ${exercices.length},
  "appreciation": "Appréciation générale en 1-2 phrases",
  "corrections": [
    {
      "id": 1,
      "question": "La question",
      "reponse_candidat": "Ce que le candidat a répondu",
      "reponse_attendue": "La bonne réponse",
      "correct": true,
      "explication": "Explication détaillée en HTML avec <br/>, <strong>, <em>"
    }
  ]
}

Le champ "correct" est un booléen (true ou false). Accorde le point si la réponse est mathématiquement correcte même si la formulation diffère légèrement.`

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
