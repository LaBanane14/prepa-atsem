'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const emptyArticle = { title: '', slug: '', category: '', category_color: 'blue', excerpt: '', content: '', date: new Date().toISOString().split('T')[0], reading_time: '5 min de lecture', published: true, image_url: '', schema_extra: '', views: 0 }
  const [form, setForm] = useState(emptyArticle)
  const [pasteInput, setPasteInput] = useState('')
  const [pasteOpen, setPasteOpen] = useState(false)

  const hexToColorName = {
    '#dc2626': 'red', '#2563eb': 'blue', '#7c3aed': 'purple', '#ea580c': 'amber',
    '#059669': 'emerald', '#0891b2': 'blue', '#ca8a04': 'amber', '#4f46e5': 'purple',
    '#db2777': 'rose', '#f43f5e': 'rose', '#ef4444': 'red', '#f59e0b': 'amber',
    '#10b981': 'emerald', '#8b5cf6': 'purple', '#3b82f6': 'blue'
  }

  function extractField(text, labels) {
    for (const label of labels) {
      const regex = new RegExp(`${label}\\s*:\\s*(.+?)(?:\\r?\\n|$)`, 'i')
      const match = text.match(regex)
      if (match && match[1].trim()) {
        return match[1].trim().replace(/^\[|\]$/g, '').replace(/^["']|["']$/g, '').trim()
      }
    }
    return null
  }

  function extractSchemaExtra(text) {
    const blocks = []
    const fenceRegex = /```(?:json)?\s*\n(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/g
    let m
    while ((m = fenceRegex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(m[1])
        const items = Array.isArray(parsed) ? parsed : [parsed]
        for (const item of items) {
          const type = item?.['@type']
          if (type === 'FAQPage' || type === 'HowTo') blocks.push(item)
        }
      } catch {}
    }
    if (blocks.length === 0) return ''
    return JSON.stringify(blocks.length === 1 ? blocks[0] : blocks, null, 2)
  }

  function extractHtmlContent(text) {
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      return bodyMatch[1].replace(/<!--[\s\S]*?-->/g, '').trim()
    }
    const fenceMatch = text.match(/```(?:html)?\s*\n([\s\S]*?)```/i)
    if (fenceMatch && /<(p|h2|h3|ul|ol|blockquote|hr)/i.test(fenceMatch[1])) {
      return fenceMatch[1].trim()
    }
    const firstTag = text.search(/<(p|h2|h3)[\s>]/i)
    if (firstTag !== -1) {
      const slice = text.slice(firstTag)
      const lastClose = slice.lastIndexOf('>')
      if (lastClose !== -1) return slice.slice(0, lastClose + 1).trim()
    }
    return null
  }

  function inferCategoryFromColor(hex) {
    const map = {
      '#7c3aed': 'Concours ATSEM', '#2563eb': 'Épreuve écrite', '#dc2626': 'Épreuve orale',
      '#ea580c': 'Témoignages', '#059669': 'Reconversion', '#0891b2': 'Métier ATSEM',
      '#ca8a04': 'Pédagogie', '#4f46e5': 'Fonction publique', '#db2777': 'CAP AEPE'
    }
    return map[hex?.toLowerCase()] || null
  }

  function handleImportPaste() {
    if (!pasteInput.trim()) { setMessage('Collez d\'abord la réponse de l\'agent'); return }
    const t = pasteInput

    const title = extractField(t, ['TITRE SEO', 'TITRE', 'TITLE'])
    const slug = extractField(t, ['SLUG'])
    const excerpt = extractField(t, ['RÉSUMÉ', 'RESUME', 'META DESCRIPTION', 'META-DESCRIPTION'])
    const category = extractField(t, ['CATÉGORIE', 'CATEGORIE', 'CATEGORY'])
    const colorHex = extractField(t, ['CATEGORY_COLOR', 'COULEUR'])
    const publishedRaw = extractField(t, ['PUBLISHED', 'PUBLIÉ'])
    const html = extractHtmlContent(t)
    const schemaExtra = extractSchemaExtra(t)

    const updated = { ...form }
    if (title) updated.title = title
    if (slug) updated.slug = slug
    if (excerpt) updated.excerpt = excerpt
    if (category) updated.category = category
    else if (colorHex) {
      const inferred = inferCategoryFromColor(colorHex)
      if (inferred && !updated.category) updated.category = inferred
    }
    if (colorHex) {
      const name = hexToColorName[colorHex.toLowerCase()]
      if (name) updated.category_color = name
    }
    if (publishedRaw) updated.published = /true|oui|yes/i.test(publishedRaw)
    if (html) updated.content = html
    if (schemaExtra) updated.schema_extra = schemaExtra

    setForm(updated)
    const filled = [title && 'titre', slug && 'slug', excerpt && 'résumé', category && 'catégorie', colorHex && 'couleur', html && 'contenu', schemaExtra && 'schema.org'].filter(Boolean)
    setMessage(filled.length ? `Importé : ${filled.join(', ')}` : 'Aucun champ détecté — format non reconnu')
    setPasteInput('')
    setPasteOpen(false)
  }

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      if (session.user.email !== ADMIN_EMAIL) { window.location.href = '/'; return }
      setUser(session.user)
      setLoading(false)
    })
    fetchArticles()
  }, [])

  async function fetchArticles() {
    const { data } = await supabase.from('articles').select('*').order('date', { ascending: false })
    if (data) setArticles(data)
  }

  function generateSlug(title) {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleChange(field, value) {
    const updated = { ...form, [field]: value }
    if (field === 'title' && !editing) {
      updated.slug = generateSlug(value)
    }
    setForm(updated)
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('articles-images')
      .upload(fileName, file)

    if (error) {
      setMessage('Erreur upload : ' + error.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('articles-images')
      .getPublicUrl(fileName)

    setForm({ ...form, image_url: urlData.publicUrl })
    setUploading(false)
  }

  async function handleDeleteImage() {
    if (!form.image_url) return
    const fileName = form.image_url.split('/').pop()
    await supabase.storage.from('articles-images').remove([fileName])
    setForm({ ...form, image_url: '' })
  }

  function insertImageInContent() {
    if (!form.image_url) return
    const imgTag = `<img src="${form.image_url}" alt="" style="width:100%;border-radius:12px;margin:16px 0;" />`
    setForm({ ...form, content: form.content + '\n' + imgTag })
    setMessage('Image insérée dans le contenu !')
  }

  function startEdit(article) {
    setEditing(article.id)
    setForm({ ...article, date: article.date?.split('T')[0] || article.date })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(emptyArticle)
    setMessage('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    if (editing) {
      const { error } = await supabase.from('articles').update(form).eq('id', editing)
      if (error) setMessage('Erreur : ' + error.message)
      else { setMessage('Article mis à jour !'); cancelEdit() }
    } else {
      const { id, ...newArticle } = form
      const { error } = await supabase.from('articles').insert(newArticle)
      if (error) setMessage('Erreur : ' + error.message)
      else { setMessage('Article publié !'); setForm(emptyArticle) }
    }

    setSaving(false)
    fetchArticles()
  }

  async function handleDelete(id, title) {
    if (!confirm('Supprimer "' + title + '" ?')) return
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (!error) { setMessage('Article supprimé'); fetchArticles() }
  }

  async function togglePublished(id, current) {
    await supabase.from('articles').update({ published: !current }).eq('id', id)
    fetchArticles()
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-800 border-t-transparent rounded-full"></div></div>
  }

  const colorOptions = [
    { value: 'blue', label: 'Bleu' },
    { value: 'amber', label: 'Ambre' },
    { value: 'emerald', label: 'Émeraude' },
    { value: 'purple', label: 'Violet' },
    { value: 'rose', label: 'Rose' },
    { value: 'red', label: 'Rouge' }
  ]

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* HEADER ADMIN */}
      <nav className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg">Admin</span>
            <span className="text-slate-400 text-sm">Prépa ATSEM</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/blog" className="text-slate-400 hover:text-white text-sm font-medium transition">Voir le blog</a>
            <a href="/" className="text-slate-400 hover:text-white text-sm font-medium transition">Accueil</a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-slate-900 mb-8">{editing ? "Modifier l'article" : 'Nouvel article'}</h1>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.startsWith('Erreur') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{message}</div>
        )}

        {/* IMPORT DEPUIS RÉPONSE AGENT */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-purple-300 p-5 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002 2h4a2 2 0 002-2M8 5a2 2 0 012-2h4a2 2 0 012 2"/></svg>
              </div>
              <div>
                <h2 className="font-black text-slate-900">Importer depuis la réponse de l'agent</h2>
                <p className="text-xs text-slate-500 font-medium">Collez la sortie du skill blog-prepa-atsem pour remplir le formulaire automatiquement</p>
              </div>
            </div>
            <button type="button" onClick={() => setPasteOpen(!pasteOpen)} className="bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition shrink-0">
              {pasteOpen ? 'Fermer' : 'Coller'}
            </button>
          </div>
          {pasteOpen && (
            <div className="mt-4 space-y-3">
              <textarea rows={10} value={pasteInput} onChange={e => setPasteInput(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-mono text-xs resize-y" placeholder={`Collez ici la réponse complète de l'agent, par exemple :\n\nTITRE SEO : Concours ATSEM : les épreuves à connaître\nMETA DESCRIPTION : ...\nSLUG : concours-atsem-epreuves\n\nSUPABASE\nTITRE : ...\nRÉSUMÉ : ...\nCATEGORY_COLOR : #7c3aed\n\n<p>...</p>\n<h2>...</h2>`}/>
              <div className="flex gap-2">
                <button type="button" onClick={handleImportPaste} className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">Importer dans le formulaire</button>
                <button type="button" onClick={() => { setPasteInput(''); setPasteOpen(false) }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition">Annuler</button>
              </div>
            </div>
          )}
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-10 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Titre</label>
              <input type="text" required value={form.title} onChange={e => handleChange('title', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-medium" placeholder="Mon super article"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Slug (URL)</label>
              <input type="text" required value={form.slug} onChange={e => handleChange('slug', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-medium font-mono text-sm" placeholder="mon-super-article"/>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Catégorie</label>
              <input type="text" required value={form.category} onChange={e => handleChange('category', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-medium" placeholder="Concours ATSEM"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Couleur</label>
              <select value={form.category_color} onChange={e => handleChange('category_color', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-medium">
                {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-medium"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Nombre de vues <span className="font-normal text-slate-400">(ajustable manuellement)</span>
            </label>
            <div className="flex gap-2">
              <input type="number" min="0" value={form.views ?? 0} onChange={e => handleChange('views', parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-medium"/>
              {[50, 100, 500, 1000].map(n => (
                <button key={n} type="button" onClick={() => handleChange('views', (form.views || 0) + n)} className="bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-700 font-bold px-3 py-2 rounded-lg text-xs transition shrink-0">
                  +{n}
                </button>
              ))}
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Image de couverture</label>
            <div className="flex flex-col gap-3">
              {form.image_url ? (
                <div className="relative">
                  <img src={form.image_url} alt="Couverture" className="w-full h-48 object-cover rounded-xl border border-slate-200" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button type="button" onClick={insertImageInContent} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-md">
                      Insérer dans le contenu
                    </button>
                    <button type="button" onClick={handleDeleteImage} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-md">
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer transition ${uploading ? 'border-purple-300 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50/30'}`}>
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-purple-800 border-t-transparent rounded-full"></div>
                      <span className="text-sm font-bold text-purple-800">Upload en cours...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <span className="text-sm font-bold text-slate-500">Cliquez pour uploader une image</span>
                      <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
              {form.image_url && (
                <input type="text" value={form.image_url} readOnly className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-500" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Résumé (affiché sur la carte blog)</label>
            <textarea rows={2} value={form.excerpt} onChange={e => handleChange('excerpt', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-medium resize-none" placeholder="Un court résumé de l'article..."/>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Contenu (HTML)</label>
            <textarea rows={12} required value={form.content} onChange={e => handleChange('content', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-mono text-sm resize-y" placeholder="<h2>Introduction</h2><p>Votre contenu ici...</p>"/>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Schema.org additionnel <span className="font-normal text-slate-400">(optionnel — FAQPage, HowTo)</span>
            </label>
            <textarea rows={5} value={form.schema_extra || ''} onChange={e => handleChange('schema_extra', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:border-transparent outline-none font-mono text-xs resize-y" placeholder='{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[...]}'/>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">BlogPosting + BreadcrumbList sont générés automatiquement. Ne remplir ce champ que pour les schémas spécifiques (FAQ, HowTo).</p>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="published" checked={form.published} onChange={e => handleChange('published', e.target.checked)} className="w-4 h-4 accent-purple-800"/>
            <label htmlFor="published" className="text-sm font-bold text-slate-700">Publié (visible sur le blog)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-purple-800/20">
              {saving ? 'Enregistrement...' : editing ? 'Mettre à jour' : "Publier l'article"}
            </button>
            {editing && (
              <button type="button" onClick={cancelEdit} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition">Annuler</button>
            )}
          </div>
        </form>

        {/* LISTE DES ARTICLES */}
        <h2 className="text-2xl font-black text-slate-900 mb-4">Articles existants ({articles.length})</h2>
        <div className="space-y-3">
          {articles.map(article => (
            <div key={article.id} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {article.image_url && (
                  <img src={article.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${article.published ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <h3 className="font-bold text-slate-900 truncate">{article.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span>{article.category}</span>
                    <span>•</span>
                    <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span className="font-mono">/blog/{article.slug}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => togglePublished(article.id, article.published)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${article.published ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {article.published ? 'Publié' : 'Brouillon'}
                </button>
                <button onClick={() => startEdit(article)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition">Modifier</button>
                <button onClick={() => handleDelete(article.id, article.title)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
