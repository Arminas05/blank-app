import { useMemo } from 'react'
import AppCard from './AppCard'
import { appsDatabase, GRADE_COLORS } from '../data/appsDatabase'

const STEPS = [
  { num: '1', icon: '🔍', title: 'Pick a health app', desc: 'Browse or search from our audited list of popular health apps.' },
  { num: '2', icon: '🧾', title: 'Read your receipt', desc: 'See exactly what data is collected, shared — and what risks are invisible.' },
  { num: '3', icon: '✅', title: 'Make your choice', desc: 'Download knowing the full picture, or find a safer alternative.' },
]

const GRADE_LEGEND = [
  { grade: 'A', label: 'Excellent' },
  { grade: 'B', label: 'Good' },
  { grade: 'C', label: 'Fair' },
  { grade: 'D', label: 'Poor' },
  { grade: 'E', label: 'Avoid' },
]

export default function AppSearchScreen({
  searchQuery, onSearchChange, onAppClick,
  skippedApps, installedApps, downloadingApp,
}) {
  const filteredApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return appsDatabase
    return appsDatabase.filter(
      (app) => app.name.toLowerCase().includes(q) || app.category.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🔐</span>
            <span className="font-extrabold text-slate-800 text-base tracking-tight">DataCheck <span className="text-blue-600">EU</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-5 text-sm text-slate-500 font-medium">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#apps" className="hover:text-blue-600 transition-colors">Apps</a>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full">Research prototype</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="hero-gradient text-white px-5 pt-14 pb-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>🇪🇺</span>
            <span>GDPR-aware privacy ratings for health apps</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            Know before<br />you download.
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed mb-8 max-w-lg mx-auto">
            Health apps hide 47-page privacy terms. DataCheck EU turns them into a 5-second receipt — with the risks you never knew you were taking.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: '⏱', text: '3-second forced review' },
              { icon: '⚠️', text: 'Hidden risk detection' },
              { icon: '🔍', text: '6 apps independently audited' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-sm">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Grade spectrum preview */}
          <div className="flex items-center justify-center gap-1.5">
            {GRADE_LEGEND.map(({ grade, label }) => (
              <div key={grade} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg"
                  style={{ backgroundColor: GRADE_COLORS[grade] }}
                >
                  {grade}
                </div>
                <span className="text-[10px] text-blue-200 hidden sm:block">{label}</span>
              </div>
            ))}
            <div className="ml-2 text-blue-200 text-xs hidden sm:block">Privacy scale</div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white border-b border-slate-200 py-12 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mx-auto mb-3">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Step {step.num}</div>
                <p className="font-bold text-slate-800 mb-1.5">{step.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App search + grid ─────────────────────────────────────────── */}
      <section id="apps" className="max-w-5xl mx-auto px-5 py-10">

        {/* Search */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search health apps — try Strava, Flo…"
              aria-label="Search health apps"
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm
                         text-slate-900 placeholder-slate-400 text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {searchQuery ? `Results for "${searchQuery}"` : 'Audited Apps'}
          </p>
          <p className="text-xs text-slate-400">{filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Health apps">
          {filteredApps.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-400">
              <p className="text-5xl mb-3">🔍</p>
              <p className="font-semibold text-slate-600 text-lg">No apps found</p>
              <p className="text-sm mt-1">Try: Strava, Flo, MindfulMoments</p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <div key={app.id} role="listitem">
                <AppCard
                  app={app}
                  onClick={onAppClick}
                  isSkipped={skippedApps.includes(app.id)}
                  isInstalled={installedApps.includes(app.id)}
                  isDownloading={downloadingApp === app.id}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-5 mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span>🔐</span>
            <span className="font-bold text-slate-600">DataCheck EU</span>
            <span>· Research prototype</span>
          </div>
          <p>Grades reflect independent privacy audits, not app quality.</p>
        </div>
      </footer>
    </div>
  )
}
