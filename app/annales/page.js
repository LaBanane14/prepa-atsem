'use client'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AnnalesPage() {
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }

      // Vérifie l'accès : essai gratuit actif OU abonnement actif
      const { data: sub } = await supabase.from('subscriptions').select('status, current_period_end').eq('user_id', session.user.id).eq('status', 'active').single()
      const hasSub = sub && new Date(sub.current_period_end) > new Date()
      const trialMs = 7 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(session.user.created_at))
      if (!hasSub && trialMs <= 0) {
        window.location.href = '/dashboard?tab=abonnement'
        return
      }

      const { data: annalesData } = await supabase
        .from('annales')
        .select('id')
        .order('annee', { ascending: false })

      if (!annalesData || annalesData.length === 0) {
        window.location.href = '/dashboard'
        return
      }

      const random = annalesData[Math.floor(Math.random() * annalesData.length)]
      window.location.href = `/annales/${random.id}`
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  )
}
