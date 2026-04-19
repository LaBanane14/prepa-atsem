'use client'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AnnalesPage() {
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = '/auth'; return }

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
