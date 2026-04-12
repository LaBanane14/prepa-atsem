import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const dir = 'data/annales'
const outputFile = 'data/annales-atsem.json'

const regionNames = {
  ARA: 'Auvergne-Rhône-Alpes',
  BRE: 'Bretagne',
  GES: 'Grand Est',
  HDF: 'Hauts-de-France',
  IDF: 'Île-de-France',
  NAQ: 'Nouvelle-Aquitaine',
  NOR: 'Normandie',
  OCC: 'Occitanie',
  PAC: 'Provence-Alpes-Côte d\'Azur',
  PDL: 'Pays de la Loire',
}

// Grouper les fichiers par annale (region-année)
function groupFiles() {
  const files = readdirSync(dir).sort()
  const groups = {}

  files.forEach(f => {
    // Parse : REGION(-CDGxx)?-ANNEE-sujet/correction.pdf/md
    const match = f.match(/^([A-Z]+)(?:-([A-Z]+\d+))?-(\d{4})-(sujet|correction)\.(pdf|md)$/)
    if (!match) {
      console.log('⚠️  Fichier non parsé:', f)
      return
    }
    const [, region, cdg, year, type, ext] = match
    const key = cdg ? `${region}-${cdg}-${year}` : `${region}-${year}`

    if (!groups[key]) {
      groups[key] = { region, cdg: cdg || null, year: parseInt(year), sujet: null, correction: null }
    }
    groups[key][type] = { file: f, ext }
  })

  return groups
}

async function extractFromMd(filePath) {
  return readFileSync(filePath, 'utf8')
}

async function extractFromPdf(filePath) {
  const buffer = readFileSync(filePath)
  return buffer.toString('base64')
}

async function processAnnale(key, info) {
  console.log(`\n📄 Traitement: ${key}`)

  const regionName = regionNames[info.region] || info.region
  const cdgLabel = info.cdg ? ` (${info.cdg})` : ''

  // Lire le sujet
  let sujetContent = ''
  let sujetPdfBase64 = null
  if (info.sujet) {
    const path = join(dir, info.sujet.file)
    if (info.sujet.ext === 'md') {
      sujetContent = await extractFromMd(path)
    } else {
      sujetPdfBase64 = await extractFromPdf(path)
    }
  } else {
    console.log('  ⚠️  Pas de sujet trouvé, skip')
    return null
  }

  // Lire la correction si elle existe
  let correctionContent = ''
  let correctionPdfBase64 = null
  if (info.correction) {
    const path = join(dir, info.correction.file)
    if (info.correction.ext === 'md') {
      correctionContent = await extractFromMd(path)
    } else {
      correctionPdfBase64 = await extractFromPdf(path)
    }
  }

  // Construire le prompt
  const systemPrompt = `Tu extrais des QCM de concours ATSEM depuis des documents. Extrais TOUTES les questions avec leurs propositions, et si la correction est fournie, les bonnes réponses et explications.

Réponds UNIQUEMENT en JSON valide, sans backticks, sans texte autour.`

  const userPrompt = `Extrais le QCM de ce sujet de concours ATSEM.

Région : ${regionName}${cdgLabel}
Année : ${info.year}

Réponds avec ce format JSON exact :
{
  "region": "${info.region}",
  "region_nom": "${regionName}",
  "cdg": ${info.cdg ? `"${info.cdg}"` : 'null'},
  "annee": ${info.year},
  "duree_minutes": 45,
  "nb_questions": 20,
  "bareme": "Description du barème si mentionné (ex: 1pt par bonne réponse, -0.25 par mauvaise)",
  "questions": [
    {
      "numero": 1,
      "enonce": "Texte exact de la question",
      "propositions": [
        {"lettre": "a", "texte": "Texte de la proposition"},
        {"lettre": "b", "texte": "Texte de la proposition"}
      ],
      "reponses_correctes": ["b", "d"],
      "explication": "Explication de la correction si disponible"
    }
  ]
}

RÈGLES :
- Extrais le texte EXACT des questions et propositions (pas de reformulation)
- Si la correction est fournie, remplis reponses_correctes et explication
- Si PAS de correction, mets reponses_correctes: [] et explication: ""
- Conserve les lettres exactes des propositions (a, b, c, d, e, f...)
- Note le barème tel qu'il est mentionné dans le sujet
- Le nombre de questions peut varier (15, 20, 25...)`

  // Construire les messages
  const content = []

  if (sujetPdfBase64) {
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: sujetPdfBase64 } })
    content.push({ type: 'text', text: 'Voici le SUJET du QCM.' })
  } else if (sujetContent) {
    content.push({ type: 'text', text: 'Voici le SUJET du QCM :\n\n' + sujetContent })
  }

  if (correctionPdfBase64) {
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: correctionPdfBase64 } })
    content.push({ type: 'text', text: 'Voici la CORRECTION du QCM.' })
  } else if (correctionContent) {
    content.push({ type: 'text', text: 'Voici la CORRECTION du QCM :\n\n' + correctionContent })
  }

  content.push({ type: 'text', text: userPrompt })

  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      system: systemPrompt,
      messages: [
        { role: 'user', content },
        { role: 'assistant', content: '{' }
      ]
    })
    const message = await stream.finalMessage()
    const text = '{' + message.content[0].text

    // Parser le JSON
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
      else throw new Error('JSON non parsable')
    }

    const nbQ = parsed.questions?.length || 0
    const nbCorr = parsed.questions?.filter(q => q.reponses_correctes?.length > 0).length || 0
    console.log(`  ✅ ${nbQ} questions extraites, ${nbCorr} avec correction`)

    return parsed
  } catch (e) {
    console.error(`  ❌ Erreur: ${e.message}`)
    return null
  }
}

async function main() {
  const groups = groupFiles()
  const keys = Object.keys(groups).sort()

  console.log(`\n📚 ${keys.length} annales trouvées :\n`)
  keys.forEach(k => {
    const g = groups[k]
    console.log(`  ${k} — sujet: ${g.sujet ? g.sujet.file : '❌'} | correction: ${g.correction ? g.correction.file : '—'}`)
  })

  const results = []

  for (const key of keys) {
    const result = await processAnnale(key, groups[key])
    if (result) results.push(result)
  }

  // Sauvegarder
  const output = {
    titre: 'Annales QCM Concours ATSEM',
    total_annales: results.length,
    total_questions: results.reduce((sum, a) => sum + (a.questions?.length || 0), 0),
    annales: results
  }

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8')
  console.log(`\n✅ Sauvegardé dans ${outputFile}`)
  console.log(`   ${output.total_annales} annales, ${output.total_questions} questions`)
}

main().catch(console.error)
