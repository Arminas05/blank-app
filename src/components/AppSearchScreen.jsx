import { useMemo } from 'react'
import AppCard from './AppCard'
import { appsDatabase, GRADE_COLORS } from '../data/appsDatabase'

const GRADE_LEGEND = [
  { grade: 'A', label: 'Excellent' },
  { grade: 'B', label: 'Good' },
  { grade: 'C', label: 'Fair' },
  { grade: 'D', label: 'Poor' },
  { grade: 'E', label: 'Avoid' },
]

export default function AppSearchScreen({
  searchQuery,
  onSearchChange,
  onAppClick,
  skippedApps,
  installedApps,
  downloadingApp,
}) {
  const filteredApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return appsDatabase
    return appsDatabase.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-16">
      {/* Header */}
      <header className="mb-7 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-2xl" aria-hidden="true">🔐</span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">DataCheck EU</h1>
        </div>
        <p className="text-sm text-gray-500">Know your privacy before you download</p>
      </header>

      {/* Search bar */}
      <div className="relative mb-5">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search health apps…"
          aria-label="Search health apps"
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm
                     text-gray-900 placeholder-gray-400 text-base
                     focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent
                     transition-shadow"
        />
      </div>

      {/* Grade legend */}
      <div className="flex items-center justify-between mb-5 px-1">
        <span className="text-xs text-gray-400 font-medium">Privacy Grade</span>
        <div className="flex items-center gap-2">
          {GRADE_LEGEND.map(({ grade, label }) => (
            <div key={grade} className="flex items-center gap-1" title={label}>
              <span
                className="w-5 h-5 rounded text-white flex items-center justify-center font-bold text-[10px] leading-none"
                style={{ backgroundColor: GRADE_COLORS[grade] }}
                aria-label={`Grade ${grade}: ${label}`}
              >
                {grade}
              </span>
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-1">A → E</span>
        </div>
      </div>

      {/* Section label */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
        {searchQuery ? `Results for "${searchQuery}"` : 'Popular Health Apps'}
      </p>

      {/* App list */}
      <div className="space-y-3" role="list" aria-label="Health apps">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium text-gray-500">No apps found</p>
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

      {/* Footer */}
      <p className="text-center text-xs text-gray-300 mt-10">
        DataCheck EU · Privacy Receipt Prototype · Research build
      </p>
    </div>
  )
}
