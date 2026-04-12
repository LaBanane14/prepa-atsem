import { readFileSync, writeFileSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const data = JSON.parse(readFileSync('data/annales-atsem.json', 'utf8'))

const SYSTEM = `Tu es un expert du concours ATSEM (Agent Territorial Spécialisé des Écoles Maternelles). Tu corriges des QCM du concours externe.

Pour chaque question, tu dois :
1. Identifier TOUTES les bonnes réponses (il peut y en avoir 1 ou plusieurs)
2. Fournir une explication courte et pédagogique

Tu connais parfaitement :
- Le statut de l'ATSEM (fonctionnaire territorial, catégorie C)
- La double autorité (hiérarchique = maire, fonctionnelle = directeur d'école)
- Les protocoles d'hygiène (bionettoyage, HACCP, produits)
- La santé et premiers secours (PAI, épistaxis, pharmacie scolaire)
- Le développement de l'enfant (cycle 1, sieste, autonomie)
- Les relations professionnelles (discrétion, réserve, relation ATSEM/enseignant)
- La protection de l'enfance (signalement, 119)
- Le cadre institutionnel (conseil d'école, collectivités territoriales, laïcité)`

async function correctAnnale(annale) {
  const questionsText = annale.questions.map(q => {
    const props = q.propositions.map(p => `  ${p.lettre}) ${p.texte}`).join('\n')
    return `Question ${q.numero} : ${q.enonce}\n${props}`
  }).join('\n\n')

  const prompt = `Voici un QCM du concours ATSEM (${annale.region_nom} ${annale.annee}). Corrige TOUTES les questions.

${questionsText}

${annale.bareme ? `Barème : ${annale.bareme}` : ''}

Réponds UNIQUEMENT en JSON, sans backticks :
{
  "corrections": [
    {
      "numero": 1,
      "reponses_correctes": ["a", "d"],
      "explication": "Explication courte et pédagogique"
    }
  ]
}`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16384,
    system: SYSTEM,
    messages: [
      { role: 'user', content: prompt },
      { role: 'assistant', content: '{' }
    ]
  })
  const message = await stream.finalMessage()
  const text = '{' + message.content[0].text

  let parsed
  try { parsed = JSON.parse(text) } catch {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) parsed = JSON.parse(match[0])
    else throw new Error('JSON non parsable')
  }

  return parsed.corrections || []
}

async function main() {
  const needCorrection = data.annales.filter(a =>
    a.questions.every(q => !q.reponses_correctes || q.reponses_correctes.length === 0)
  )

  console.log(`\n📝 ${needCorrection.length} annales à corriger sur ${data.annales.length} total\n`)

  for (const annale of needCorrection) {
    const key = `${annale.region}-${annale.annee}`
    process.stdout.write(`  📄 ${annale.region_nom} ${annale.annee}...`)

    try {
      const corrections = await correctAnnale(annale)

      // Appliquer les corrections aux questions
      corrections.forEach(c => {
        const q = annale.questions.find(q => q.numero === c.numero)
        if (q) {
          q.reponses_correctes = c.reponses_correctes || []
          q.explication = c.explication || ''
        }
      })

      const nbCorr = corrections.length
      console.log(` ✅ ${nbCorr} corrections`)
    } catch (e) {
      console.log(` ❌ ${e.message}`)
    }
  }

  // Mettre à jour les compteurs
  data.total_questions = data.annales.reduce((sum, a) => sum + a.questions.length, 0)

  writeFileSync('data/annales-atsem.json', JSON.stringify(data, null, 2), 'utf8')

  const totalCorr = data.annales.filter(a =>
    a.questions.some(q => q.reponses_correctes?.length > 0)
  ).length
  console.log(`\n✅ Terminé ! ${totalCorr}/${data.annales.length} annales corrigées`)
  console.log('   Fichier mis à jour : data/annales-atsem.json')
}

main().catch(console.error)
