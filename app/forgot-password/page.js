'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #f3f0ff 0%, #ede9fe 50%, #fdf4ff 100%)' }}>
        <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl relative z-10 p-8 sm:p-10 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Email envoyé !</h2>
          <p className="text-slate-500 font-medium">Un lien de réinitialisation a été envoyé à <strong className="text-slate-800">{email}</strong>. Vérifiez votre boîte mail et vos spams.</p>
          <a href="/auth" className="inline-block mt-6 bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl transition">Retour à la connexion</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-slate-900 flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #f3f0ff 0%, #ede9fe 50%, #fdf4ff 100%)' }}>
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl relative z-10 p-8 sm:p-10 border border-slate-100">
        <a href="/auth" className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 transition bg-slate-50 hover:bg-[#eceef1] p-2 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </a>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-purple-800 text-white p-2 rounded-2xl shadow-sm mb-4">
            <svg className="w-8 h-8" viewBox="2 -2 36 26" fill="currentColor"><circle cx="12" cy="4" r="3.5"/><path d="M12 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M5 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M19 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="10" y="14" width="1.8" height="6" rx="0.9"/><rect x="12.5" y="14" width="1.8" height="6" rx="0.9"/><circle cx="28" cy="4" r="3.5"/><circle cx="32" cy="3" r="1.8"/><path d="M31 2.5c1.2-0.5 2.2 0 2.5 1" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M28 7.5c-1.8 0-3 1-3 2.5v4h6v-4c0-1.5-1.2-2.5-3-2.5z"/><path d="M21 11.5l4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><path d="M35 11.5l-4.5-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/><rect x="26" y="14" width="1.8" height="6" rx="0.9"/><rect x="28.5" y="14" width="1.8" height="6" rx="0.9"/><polygon points="20,1 21,3.5 23.5,3.8 21.5,5.5 22,8 20,6.8 18,8 18.5,5.5 16.5,3.8 19,3.5"/><path d="M7 22c4-1.5 8-2 13-1.5s9 1 13-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1 text-center">Mot de passe oublié</h1>
          <p className="text-slate-500 font-medium text-center">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Adresse email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div>
              <input type="email" required placeholder="marie@email.fr" value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition font-medium"/>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-bold text-lg py-4 rounded-xl mt-2 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/></svg>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-slate-500 font-medium text-sm">Vous vous souvenez ? <a href="/auth" className="text-purple-800 font-bold hover:text-purple-900 transition ml-1">Se connecter</a></p>
        </div>
      </div>
    </div>
  )
}