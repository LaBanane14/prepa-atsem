import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkDailyLimit } from '@/lib/daily-limit'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

async function callClaude(system, userPrompt) {
  const client = getClient()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    system,
    messages: [{ role: 'user', content: userPrompt }]
  })
  return message.content[0].text
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed, remaining } = checkDailyLimit(ip)

    if (!allowed) {
      return NextResponse.json({
        error: 'Vous avez atteint la limite de 20 exercices par jour. Revenez demain !',
        remaining: 0
      }, { status: 429 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API manquante.' }, { status: 500 })
    }

    const { category } = await request.json()

    if (!category || !['concentrations', 'debit'].includes(category)) {
      return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 })
    }

    const prompt = category === 'concentrations'
      ? `Génère UN exercice de calcul de concentration en pourcentage. L'exercice doit être réaliste et basé sur des situations cliniques courantes.

Types d'exercices possibles (varie à chaque fois) :
- Calculer la masse de substance dans un volume donné à partir d'une concentration en %
- Trouver la concentration en % à partir d'une masse et d'un volume
- Calculer le volume nécessaire pour obtenir une masse donnée à partir d'une solution à X%

Utilise des substances réelles : glucose (G5, G10, G30), NaCl (0.9%, 10%), Bétadine (10%), KCl, etc.
Utilise des volumes réalistes : 50, 100, 125, 250, 500, 1000 ml.
L'exercice doit avoir une réponse numérique simple (pas trop de décimales).

Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "question": "l'énoncé complet de l'exercice",
  "answer": 12.5,
  "unit": "g",
  "explanation": "Explication pas à pas de la résolution avec la formule utilisée"
}`
      : `Génère UN exercice de calcul de débit en gouttes par minute. L'exercice doit être réaliste et basé sur des situations cliniques courantes.

Types d'exercices possibles (varie à chaque fois) :
- Calculer le débit en gouttes/min pour un volume donné sur une durée donnée (perfuseur standard 1ml = 20 gouttes)
- Calculer le débit avec un perfuseur pédiatrique (1ml = 60 gouttes)
- Calculer le volume total passé à partir d'un débit et d'une durée
- Calculer le temps de perfusion à partir d'un volume et d'un débit

Utilise des solutions réelles : NaCl 0.9%, Ringer Lactate, G5%, etc.
Utilise des volumes réalistes : 100, 250, 500, 1000 ml.
Utilise des durées réalistes : 30min, 45min, 1h, 2h, 3h, 4h, 6h, 8h, 12h, 24h.
L'exercice doit avoir une réponse numérique arrondie à l'entier le plus proche si nécessaire.

Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "question": "l'énoncé complet de l'exercice",
  "answer": 42,
  "unit": "gouttes/min",
  "explanation": "Explication pas à pas de la résolution avec la formule utilisée"
}`

    const text = await callClaude(
      'Tu es un formateur en calculs de doses pour des étudiants infirmiers préparant le concours FPC.',
      prompt
    )
    if (!text) return NextResponse.json({ error: 'Réponse vide.' }, { status: 500 })

    let exercise
    try {
      exercise = JSON.parse(text)
    } catch {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      exercise = JSON.parse(cleaned)
    }

    return NextResponse.json({ exercise, remaining })
  } catch (error) {
    console.error('Calculs-doses API error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
