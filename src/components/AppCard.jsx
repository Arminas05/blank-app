import GradeDisplay from './GradeDisplay'
import { GRADE_COLORS } from '../data/appsDatabase'

export default function AppCard({ app, onClick, isSkipped, isInstalled, isDownloading }) {
  const disabled = isSkipped || isInstalled

  function handleClick() {
    if (!disabled && !isDownloading) onClick(app)
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      aria-disabled={disabled}
      className={[
        'w-full text-left rounded-2xl p-4 bg-white shadow-sm border border-gray-100',
        'transition-all duration-200 select-none',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : isDownloading
          ? 'cursor-default'
          : 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <span
          className="text-3xl w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl flex-shrink-0"
          aria-hidden="true"
        >
          {app.icon}
        </span>

        {/* Name + category */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{app.name}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{app.category}</p>
        </div>

        {/* Status badge or grade */}
        <div className="flex-shrink-0">
          {isInstalled ? (
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              Installed ✓
            </span>
          ) : isDownloading ? (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              Downloading…
            </span>
          ) : isSkipped ? (
            <span className="text-xs text-gray-400">Skipped</span>
          ) : (
            <GradeDisplay grade={app.grade} size={44} />
          )}
        </div>
      </div>

      {/* Download progress bar */}
      {isDownloading && (
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-download-bar"
            style={{ backgroundColor: GRADE_COLORS[app.grade] }}
          />
        </div>
      )}
    </div>
  )
}
