import Link from 'next/link'

export const metadata = { title: 'Page introuvable' }

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#eceef1] flex items-center justify-center px-4" style={{fontFamily: "'Nunito', sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div className="text-center max-w-lg">
        <div className="relative mb-6 flex items-center justify-center gap-0">
          {/* 4 */}
          <span className="text-[120px] sm:text-[180px] font-black text-slate-900 leading-none select-none">4</span>

          {/* 0 avec visage, oreilles et stéthoscope */}
          <div className="relative inline-block">
            <svg className="w-[110px] h-[140px] sm:w-[150px] sm:h-[190px]" viewBox="0 0 150 190">

              {/* Corps du 0 */}
              <ellipse cx="75" cy="95" rx="52" ry="70" fill="none" stroke="#0f172a" strokeWidth="16" strokeLinecap="round"/>

              {/* Oeil gauche */}
              <ellipse cx="57" cy="80" rx="7" ry="8" fill="white"/>
              <ellipse cx="59" cy="80" rx="5" ry="6" fill="#0f172a"/>
              <ellipse cx="60" cy="78" rx="2" ry="2.5" fill="white"/>

              {/* Oeil droit */}
              <ellipse cx="93" cy="80" rx="7" ry="8" fill="white"/>
              <ellipse cx="95" cy="80" rx="5" ry="6" fill="#0f172a"/>
              <ellipse cx="96" cy="78" rx="2" ry="2.5" fill="white"/>

              {/* Sourire */}
              <path d="M60 108 Q75 122 90 108" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* 4 */}
          <span className="text-[120px] sm:text-[180px] font-black text-slate-900 leading-none select-none">4</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Page introuvable</h1>
        <p className="text-slate-500 font-medium mb-8">Cette page n'existe pas ou a été déplacée. Pas de panique, retournez à l'accueil pour continuer vos révisions !</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>
            Retour à l'accueil
          </Link>
          <Link href="/dashboard" className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-6 py-3 rounded-xl transition text-sm flex items-center gap-2">
            Mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}
