import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useAccess() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [trialExpired, setTrialExpired] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }
      const u = session.user
      setUser(u)

      // Vérifier abonnement
      supabase.from('subscriptions').select('status, current_period_end').eq('user_id', u.id).eq('status', 'active').single().then(({ data: sub }) => {
        if (sub && new Date(sub.current_period_end) > new Date()) {
          setIsPremium(true)
          setHasAccess(true)
        } else {
          // Vérifier essai gratuit
          const created = new Date(u.created_at)
          const now = new Date()
          const totalMs = 7 * 24 * 60 * 60 * 1000 - (now - created)
          if (totalMs > 0) {
            setHasAccess(true)
          } else {
            setTrialExpired(true)
            setHasAccess(false)
          }
        }
        setAuthLoading(false)
      })
    })
  }, [])

  return { user, authLoading, hasAccess, isPremium, trialExpired }
}
