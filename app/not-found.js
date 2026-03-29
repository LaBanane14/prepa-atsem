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

          {/* 0 avec visage et stéthoscope */}
          <div className="relative inline-block">
            <svg className="w-[100px] h-[130px] sm:w-[140px] sm:h-[180px]" viewBox="0 0 140 180">
              {/* Corps du 0 */}
              <ellipse cx="70" cy="90" rx="52" ry="70" fill="none" stroke="#0f172a" strokeWidth="16" strokeLinecap="round"/>

              {/* Oeil gauche */}
              <ellipse cx="52" cy="75" rx="7" ry="8" fill="#0f172a"/>
              <ellipse cx="54" cy="73" rx="2.5" ry="3" fill="white"/>

              {/* Oeil droit */}
              <ellipse cx="88" cy="75" rx="7" ry="8" fill="#0f172a"/>
              <ellipse cx="90" cy="73" rx="2.5" ry="3" fill="white"/>

              {/* Bouche (surprise/triste) */}
              <ellipse cx="70" cy="108" rx="10" ry="8" fill="#0f172a"/>

              {/* Bras gauche qui tient le stéthoscope */}
              <path d="M22 95 C5 85 -2 65 8 50" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round"/>

              {/* Stéthoscope tenu par le bras */}
              <g transform="translate(-8, 18) scale(0.9)">
                <path d="M16 35 L16 22 C16 12 28 12 28 22 L28 35" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round"/>
                <circle cx="16" cy="18" r="2.5" fill="#dc2626"/>
                <circle cx="28" cy="18" r="2.5" fill="#dc2626"/>
                <path d="M22 35 L22 42 C22 48 28 50 32 47" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round"/>
                <circle cx="34" cy="45" r="3.5" fill="none" stroke="#dc2626" strokeWidth="3"/>
              </g>
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
