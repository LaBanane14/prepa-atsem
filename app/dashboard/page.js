'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const Stethoscope = ({className}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>

const menuItems = [
  { id: 'dashboard', label: 'Accueil', icon: <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'progression', label: 'Mes stats', icon: <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> },
  { id: 'historique', label: 'Mon historique', icon: <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg> },
  { id: 'profil', label: 'Mon compte', icon: <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg> },
  { id: 'abonnement', label: 'Mes offres', icon: <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> }
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [newFirstName, setNewFirstName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      setUser(session.user)
      setNewFirstName(session.user?.user_metadata?.first_name || '')
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.href = '/auth'
      else setUser(session.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function updateProfile(e) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg('')
    const updates = { data: { first_name: newFirstName } }
    if (newPassword) updates.password = newPassword
    const { error } = await supabase.auth.updateUser(updates)
    setProfileSaving(false)
    if (error) setProfileMsg('Erreur : ' + error.message)
    else { setProfileMsg('Profil mis à jour !'); setNewPassword('') }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div></div>
  }

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Utilisateur'
  const email = user?.email || ''
  const createdAt = new Date(user?.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const stats = { qcm: 0, score: '-', calculs: 0, redactions: 0 }
  const categories = [
    { name: 'Calculs de dose', color: 'bg-red-500', progress: 0 },
    { name: 'Pourcentages', color: 'bg-purple-500', progress: 0 },
    { name: 'Produit en croix', color: 'bg-amber-500', progress: 0 },
    { name: 'Calcul mental', color: 'bg-blue-500', progress: 0 },
    { name: 'Équations', color: 'bg-emerald-500', progress: 0 },
    { name: 'Conversions', color: 'bg-orange-500', progress: 0 }
  ]

  function navigateTo(id) { setPage(id); setSidebarOpen(false) }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR FLOTTANTE ARRONDIE */}
      <div className={`fixed inset-y-0 left-0 z-50 flex items-center pl-3 py-4 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <aside className="w-[72px] bg-white rounded-2xl shadow-lg border border-slate-200/80 flex flex-col items-center py-5 gap-1 h-[calc(100vh-2rem)]">
          {/* Logo */}
          <a href="/" className="mb-3">
            <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
          </a>
          <div className="w-8 h-px bg-slate-200 mb-2"></div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col items-center gap-0.5 w-full px-2">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)} className={`w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-[9px] font-bold transition-all cursor-pointer ${page === item.id ? 'bg-red-50 text-red-600' : 'text-slate-900 hover:bg-slate-50'}`}>
                <span className={page === item.id ? 'text-red-600' : 'text-slate-900'}>{item.icon}</span>
                <span className={page === item.id ? 'text-red-600' : 'text-slate-500'}>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="flex flex-col items-center gap-2 mt-auto pt-2">
            <div className="w-8 h-px bg-slate-200 mb-1"></div>
            <button onClick={() => navigateTo('profil')} className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${page === 'profil' ? 'bg-red-600 text-white ring-2 ring-red-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {firstName.charAt(0).toUpperCase()}
            </button>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </aside>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[90px]">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <span className="font-black text-lg text-slate-900">Prépa <span className="text-red-600">FPC</span></span>
          <button onClick={() => navigateTo('profil')} className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">{firstName.charAt(0).toUpperCase()}</button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* ============ ACCUEIL ============ */}
          {page === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">Bonjour {firstName} !</h1>
                <p className="text-slate-500 font-medium text-sm">Membre depuis le {createdAt}</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'QCM complétés', value: stats.qcm, color: 'bg-red-100 text-red-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
                  { label: 'Score moyen', value: stats.score, color: 'bg-green-100 text-green-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg> },
                  { label: 'Calculs résolus', value: stats.calculs, color: 'bg-blue-100 text-blue-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/></svg> },
                  { label: 'Rédactions', value: stats.redactions, color: 'bg-amber-100 text-amber-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                    <p className="text-2xl font-black text-slate-900">{s.value}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <h2 className="text-lg font-black text-slate-900 mb-4">Commencer un entraînement</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <a href="/qcm" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition group block">
                  <div className="w-11 h-11 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg></div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">QCM Mathématiques</h3>
                  <p className="text-xs text-slate-500 font-medium">20 questions variées</p>
                </a>
                <a href="/calculs-doses" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition group block">
                  <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/></svg></div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Calculs de doses</h3>
                  <p className="text-xs text-slate-500 font-medium">Formules et exercices</p>
                </a>
                <a href="/blog" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-200 transition group block">
                  <div className="w-11 h-11 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Culture sanitaire</h3>
                  <p className="text-xs text-slate-500 font-medium">Articles et fiches</p>
                </a>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2"><span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Plan gratuit</span></div>
                  <h3 className="text-lg font-black text-white mb-1">Passez au niveau supérieur</h3>
                  <p className="text-slate-400 font-medium text-sm">QCM, calculs et examens blancs en illimité.</p>
                </div>
                <a href="/tarifs" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-red-900/30 shrink-0 text-sm">Voir les offres</a>
              </div>
            </div>
          )}

          {/* ============ MES STATS ============ */}
          {page === 'progression' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Mes stats</h1>
              <p className="text-slate-500 font-medium text-sm mb-8">Suivez votre avancement dans chaque domaine.</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {categories.map((cat, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                      <span className="text-xs font-black text-slate-400">{cat.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{width: `${cat.progress}%`}}></div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-2">0 exercice complété</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg></div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Commencez à vous entraîner</h3>
                <p className="text-slate-500 font-medium text-sm mb-6">Vos statistiques apparaîtront ici dès votre premier entraînement.</p>
                <a href="/qcm" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm">Lancer un QCM <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></a>
              </div>
            </div>
          )}

          {/* ============ MON HISTORIQUE ============ */}
          {page === 'historique' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Mon historique</h1>
              <p className="text-slate-500 font-medium text-sm mb-8">Retrouvez vos entraînements passés.</p>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg></div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Aucun entraînement</h3>
                <p className="text-slate-500 font-medium text-sm mb-6">Votre historique est vide. Lancez votre premier QCM !</p>
                <a href="/qcm" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm">Commencer <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg></a>
              </div>
            </div>
          )}

          {/* ============ MON COMPTE ============ */}
          {page === 'profil' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Mon compte</h1>
              <p className="text-slate-500 font-medium text-sm mb-8">Gérez vos informations personnelles.</p>
              {profileMsg && <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${profileMsg.startsWith('Erreur') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{profileMsg}</div>}
              <form onSubmit={updateProfile} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5 max-w-xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Adresse email</label>
                  <input type="email" value={email} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-400 cursor-not-allowed"/>
                  <p className="text-xs text-slate-400 mt-1">L'email ne peut pas être modifié.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Prénom</label>
                  <input type="text" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent outline-none font-medium"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nouveau mot de passe</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Laisser vide pour ne pas changer" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent outline-none font-medium"/>
                  <p className="text-xs text-slate-400 mt-1">Min. 8 caractères, 1 majuscule, 1 chiffre, 1 spécial.</p>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={profileSaving} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-red-600/20 text-sm">{profileSaving ? 'Enregistrement...' : 'Sauvegarder'}</button>
                </div>
              </form>
              <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-xl">
                <h3 className="font-black text-slate-900 mb-4">Informations du compte</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500 font-medium">Email</span><span className="font-bold text-slate-900">{email}</span></div>
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500 font-medium">Membre depuis</span><span className="font-bold text-slate-900">{createdAt}</span></div>
                  <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500 font-medium">Connexion</span><span className="font-bold text-slate-900">{user?.app_metadata?.provider === 'google' ? 'Google' : 'Email'}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ============ MES OFFRES ============ */}
          {page === 'abonnement' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Mes offres</h1>
              <p className="text-slate-500 font-medium text-sm mb-8">Gérez votre formule d'accès.</p>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                  <div><h3 className="font-black text-slate-900">Plan Gratuit</h3><p className="text-xs text-slate-500 font-medium">Accès limité</p></div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  {['QCM gratuit (20 questions)', 'Accès au blog'].map((t,i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600 font-medium"><svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>{t}</div>
                  ))}
                  {['Entraînements illimités', 'Examens blancs', 'Annales corrigées'].map((t,i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400 font-medium"><svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>{t}</div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 max-w-xl">
                <h3 className="text-lg font-black text-white mb-2">Débloquez tout le contenu</h3>
                <p className="text-slate-400 font-medium text-sm mb-6">QCM, calculs de doses, examens blancs et rédactions en illimité.</p>
                <a href="/tarifs" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-red-900/30 text-sm">Voir les offres à partir de 12,99€/mois</a>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
