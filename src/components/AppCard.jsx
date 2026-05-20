import GradeDisplay from './GradeDisplay'
import { GRADE_COLORS, GRADE_MEANINGS } from '../data/appsDatabase'

export default function AppCard({ app, onClick, isSkipped, isInstalled, isDownloading }) {
  const disabled = isSkipped || isInstalled

  function handleClick() {
    if (!disabled && !isDownloading) onClick(app)
  }

  const gradeColor = GRADE_COLORS[app.grade]

  return (
    <div
      className={[
        'bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col',
        'transition-all duration-200',
        disabled
          ? 'opacity-50'
          : isDownloading
          ? ''
          : 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
      ].join(' ')}
      onClick={!disabled && !isDownloading ? handleClick : undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) handleClick() }}
      aria-disabled={disabled}
    >
      {/* Grade accent strip */}
      <div className="h-1 w-full" style={{ backgroundColor: gradeColor }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Top row: icon + grade */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl border border-slate-100">
            {app.icon}
          </div>
          <div className="flex flex-col items-end gap-1">
            <GradeDisplay grade={app.grade} size={48} />
            <span className="text-[10px] text-slate-400 font-medium">{app.grade === 'A' || app.grade === 'B' ? '✓ Safe choice' : app.grade === 'E' ? '⚠ High risk' : 'Review carefully'}</span>
          </div>
        </div>

        {/* Name + category */}
        <p className="font-bold text-slate-900 text-base mb-0.5">{app.name}</p>
        <p className="text-xs text-slate-500 mb-3">{app.category}</p>

        {/* Grade meaning badge */}
        <div
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full self-start mb-3"
          style={{ backgroundColor: gradeColor + '18', color: gradeColor }}
        >
          <span className="font-black">{app.grade}</span>
          <span>·</span>
          <span>{GRADE_MEANINGS[app.grade].split(' — ')[0]}</span>
        </div>

        {/* Summary snippet */}
        <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4 line-clamp-2">
          {app.summary}
        </p>

        {/* Download progress bar */}
        {isDownloading && (
          <div className="mb-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full animate-download-bar"
              style={{ backgroundColor: gradeColor }}
            />
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          {isInstalled ? (
            <div className="w-full py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold text-center">
              Installed ✓
            </div>
          ) : isDownloading ? (
            <div className="w-full py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold text-center">
              Downloading…
            </div>
          ) : isSkipped ? (
            <div className="w-full py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm font-semibold text-center">
              Skipped
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleClick() }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold text-center transition-colors"
            >
              Check Privacy Receipt →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
