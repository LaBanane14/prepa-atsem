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

              {/* Stéthoscope : tube des oreilles vers le bas */}
              <path d="M30 45 L30 30 C30 15 48 15 48 30" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M102 30 C102 15 120 15 120 30 L120 45" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round"/>
              {/* Earpiece dots */}
              <circle cx="30" cy="26" r="3" fill="#dc2626"/>
              <circle cx="48" cy="26" r="3" fill="#dc2626"/>
              <circle cx="102" cy="26" r="3" fill="#dc2626"/>
              <circle cx="120" cy="26" r="3" fill="#dc2626"/>
              {/* Tube central qui descend du U gauche */}
              <path d="M39 30 L39 8 C39 2 75 -5 75 8 L75 170" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round"/>
              {/* Tube du U droit qui rejoint le centre */}
              <path d="M111 30 L111 8 C111 2 75 -5 75 8" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round"/>
              {/* Chest piece (pavillon) en bas */}
              <circle cx="75" cy="175" r="8" fill="none" stroke="#dc2626" strokeWidth="4"/>
              <circle cx="75" cy="175" r="2.5" fill="#dc2626"/>

              {/* Oreille gauche */}
              <ellipse cx="20" cy="85" rx="12" ry="18" fill="#0f172a"/>
              <ellipse cx="22" cy="85" rx="6" ry="12" fill="#1e293b"/>
              {/* Écouteur dans l'oreille gauche */}
              <circle cx="22" cy="82" r="4" fill="#dc2626"/>

              {/* Oreille droite */}
              <ellipse cx="130" cy="85" rx="12" ry="18" fill="#0f172a"/>
              <ellipse cx="128" cy="85" rx="6" ry="12" fill="#1e293b"/>
              {/* Écouteur dans l'oreille droite */}
              <circle cx="128" cy="82" r="4" fill="#dc2626"/>

              {/* Tube stétho vers oreille gauche */}
              <path d="M30 45 C25 55 22 65 22 78" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>
              {/* Tube stétho vers oreille droite */}
              <path d="M120 45 C125 55 128 65 128 78" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"/>

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

              {/* Bouche (O surpris) */}
              <ellipse cx="75" cy="112" rx="9" ry="7" fill="#1e293b"/>
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
