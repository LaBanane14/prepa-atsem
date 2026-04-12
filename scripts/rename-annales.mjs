import { readdirSync, renameSync } from 'fs'
import { join } from 'path'

const dir = 'data/annales'
const files = readdirSync(dir)

const regionMap = {
  'Haut de France': 'HDF',
  'Hauts de France': 'HDF',
  'Normandie': 'NOR',
  'Bretagne': 'BRE',
  'Auvergne Rhône Alpe': 'ARA',
  'Auvergne Rhône Alpes': 'ARA',
  'Nouvelle Aquitaine': 'NAQ',
  'Pays de la Loire': 'PDL',
  'Occitanie': 'OCC',
  'Paca': 'PAC',
  'PACA': 'PAC',
  'IDF': 'IDF',
}

const renames = []

files.forEach(f => {
  let newName = f

  // Fichiers .md (IDF)
  if (f.endsWith('.md')) {
    // IDF-2015-Sujet.md → IDF-2015-sujet.md
    // IDF-CDG77-2021-Correction.md → IDF-CDG77-2021-correction.md
    newName = f.replace('Sujet', 'sujet').replace('Correction', 'correction')
    if (newName !== f) {
      renames.push({ from: f, to: newName })
      renameSync(join(dir, f), join(dir, newName))
    }
    return
  }

  // Fichiers correction CDG68
  // correction_sujet_ATSEM_externe_2021_68.pdf → GES-CDG68-2021-correction.pdf
  const corrMatch68 = f.match(/correction_sujet_ATSEM_externe_(\d{4})_68\.pdf/)
  if (corrMatch68) {
    newName = `GES-CDG68-${corrMatch68[1]}-correction.pdf`
    renames.push({ from: f, to: newName })
    renameSync(join(dir, f), join(dir, newName))
    return
  }

  // Fichiers sujet CDG68
  // sujet_ATSEM_externe_2021_68.pdf → GES-CDG68-2021-sujet.pdf
  const sujetMatch68 = f.match(/sujet_ATSEM_externe_(\d{4})_68\.pdf/)
  if (sujetMatch68) {
    newName = `GES-CDG68-${sujetMatch68[1]}-sujet.pdf`
    renames.push({ from: f, to: newName })
    renameSync(join(dir, f), join(dir, newName))
    return
  }

  // Fichier HDF spécial
  // Annales-concours-ATSEM-pal-2e-2021-3e-Sujet-QCM-02052024-Haut de France.pdf
  if (f.includes('Haut de France')) {
    newName = 'HDF-2021-sujet.pdf'
    renames.push({ from: f, to: newName })
    renameSync(join(dir, f), join(dir, newName))
    return
  }

  // Fichiers sujet standard
  // sujet-qcm-atsem-2017-Normandie.pdf → NOR-2017-sujet.pdf
  // sujet-qcm-atsem-externe-2019-Pays de la Loire.pdf → PDL-2019-sujet.pdf
  const sujetMatch = f.match(/sujet-qcm-atsem-(?:externe-)?(\d{4})-(.+)\.pdf/)
  if (sujetMatch) {
    const year = sujetMatch[1]
    const regionRaw = sujetMatch[2]
    const region = regionMap[regionRaw] || regionRaw.toUpperCase().replace(/\s+/g, '-')
    newName = `${region}-${year}-sujet.pdf`
    renames.push({ from: f, to: newName })
    renameSync(join(dir, f), join(dir, newName))
    return
  }
})

console.log(`\n${renames.length} fichiers renommés :\n`)
renames.forEach(r => console.log(`  ${r.from}\n  → ${r.to}\n`))

// Afficher les fichiers finaux
console.log('\nFichiers finaux :')
readdirSync(dir).sort().forEach(f => console.log(`  ${f}`))
