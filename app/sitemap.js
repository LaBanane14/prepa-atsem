import { supabase } from '../lib/supabase'

const BASE_URL = 'https://www.prepa-atsem.fr'

// Revalide toutes les heures pour récupérer les nouveaux articles publiés
export const revalidate = 3600

export default async function sitemap() {
  // Pages statiques publiques
  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' },
    { url: '/calendrier', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/tarifs', priority: 0.9, changeFrequency: 'monthly' },
    { url: '/blog', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/qcm', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/cgu', priority: 0.3, changeFrequency: 'yearly' },
    { url: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' },
  ]

  const staticEntries = staticRoutes.map(r => ({
    url: `${BASE_URL}${r.url}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // Articles de blog publiés
  let articleEntries = []
  if (supabase) {
    try {
      const { data: articles } = await supabase
        .from('articles')
        .select('slug, date')
        .eq('published', true)

      if (articles) {
        articleEntries = articles.map(a => ({
          url: `${BASE_URL}/blog/${a.slug}`,
          lastModified: a.date ? new Date(a.date) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
      }
    } catch (err) {
      console.error('Sitemap : erreur fetch articles', err)
    }
  }

  return [...staticEntries, ...articleEntries]
}
