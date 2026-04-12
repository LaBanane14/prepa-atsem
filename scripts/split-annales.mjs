import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('data/annales-atsem.json', 'utf8'))

const rows = data.annales.map(a => ({
  region: a.region,
  region_nom: a.region_nom,
  cdg: a.cdg || null,
  annee: a.annee,
  duree_minutes: a.duree_minutes || 45,
  nb_questions: a.nb_questions || a.questions?.length || 20,
  bareme: a.bareme || null,
  questions: a.questions
}))

writeFileSync('data/annales-import.json', JSON.stringify(rows, null, 2), 'utf8')
console.log(`✅ ${rows.length} annales prêtes dans data/annales-import.json`)
