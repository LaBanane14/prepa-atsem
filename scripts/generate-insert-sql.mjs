import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('data/annales-atsem.json', 'utf8'))

let sql = '-- INSERT annales ATSEM\n\n'

data.annales.forEach(a => {
  const questions = JSON.stringify(a.questions).replace(/'/g, "''")
  sql += `INSERT INTO annales (region, region_nom, cdg, annee, duree_minutes, nb_questions, bareme, questions) VALUES (
  '${a.region}',
  '${(a.region_nom || '').replace(/'/g, "''")}',
  ${a.cdg ? `'${a.cdg}'` : 'NULL'},
  ${a.annee},
  ${a.duree_minutes || 45},
  ${a.nb_questions || a.questions?.length || 20},
  ${a.bareme ? `'${a.bareme.replace(/'/g, "''")}'` : 'NULL'},
  '${questions}'
);\n\n`
})

writeFileSync('data/insert-annales.sql', sql, 'utf8')
console.log(`✅ SQL généré : data/insert-annales.sql (${data.annales.length} INSERT)`)
