import GradeDisplay from './GradeDisplay'
import { GRADE_COLORS, GRADE_MEANINGS } from '../data/appsDatabase'

function scoreToColor(score) {
  if (score >= 80) return GRADE_COLORS.A
  if (score >= 65) return GRADE_COLORS.B
  if (score >= 45) return GRADE_COLORS.C
  if (score >= 25) return GRADE_COLORS.D
  return GRADE_COLORS.E
}

function overallScore(app) {
  const total = app.auditDimensions.reduce((s, d) => s + d.score, 0)
  const max = app.auditDimensions.reduce((s, d) => s + d.maxScore, 0)
  return Math.round((total / max) * 100)
}

export default function FullAuditPage({ app, onBack }) {
  const score = overallScore(app)
  const gradeColor = GRADE_COLORS[app.grade]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          aria-label="Back to app search"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">🔐 Full Audit Report</span>
        </div>
        <div className="w-12" /> {/* spacer for centering */}
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-16">

        {/* App identity */}
        <div className="flex items-center gap-4 mb-5">
          <span className="text-5xl" aria-hidden="true">{app.icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
            <p className="text-sm text-gray-500">{app.category}</p>
          </div>
          <GradeDisplay grade={app.grade} size={72} />
        </div>

        {/* Overall score card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-sm font-semibold text-gray-700">Overall Privacy Score</p>
            <p className="text-xl font-black" style={{ color: gradeColor }}>{score}/100</p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score}%`, backgroundColor: gradeColor }}
            />
          </div>
          <p
            className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block"
            style={{ backgroundColor: gradeColor + '1a', color: gradeColor }}
          >
            {GRADE_MEANINGS[app.grade]}
          </p>
        </div>

        {/* Summary */}
        <blockquote
          className="text-sm text-gray-700 mb-5 pl-3 border-l-[3px] italic leading-relaxed"
          style={{ borderColor: gradeColor }}
        >
          {app.summary}
        </blockquote>

        {/* Dimension breakdown */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Dimension Breakdown
        </p>

        <div className="space-y-3 mb-6">
          {app.auditDimensions.map((dim, i) => {
            const pct = Math.round((dim.score / dim.maxScore) * 100)
            const color = scoreToColor(pct)
            return (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-semibold text-gray-800 text-sm">{dim.label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{pct}/100</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{dim.detail}</p>
              </div>
            )
          })}
        </div>

        {/* Key data facts */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Key Facts
        </p>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
          <ul className="space-y-2">
            {app.shares.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`flex-shrink-0 mt-0.5 font-bold ${fact.bad ? 'text-red-500' : 'text-green-600'}`}>
                  {fact.bad ? '✗' : '✓'}
                </span>
                <span className="text-gray-700">{fact.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hidden risks */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mb-6">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1.5">
            ⚠️ Hidden Risks
          </p>
          <p className="text-xs text-amber-600 mb-2">
            Data users give without realising — inferred from patterns
          </p>
          <ul className="space-y-1.5">
            {app.hiddenRisks.map((risk, i) => (
              <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                <span className="flex-shrink-0 mt-0.5">→</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Grade legend */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Grade Scale
        </p>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="space-y-2">
            {[
              { grade: 'A', range: '90–100', meaning: 'Excellent — Your data stays yours' },
              { grade: 'B', range: '75–89',  meaning: 'Good — Minor sharing with opt-out' },
              { grade: 'C', range: '60–74',  meaning: 'Moderate — Some sharing, limited control' },
              { grade: 'D', range: '45–59',  meaning: 'Poor — Significant sharing, hard to opt out' },
              { grade: 'E', range: '<45',    meaning: 'Failing — Data sold, no real control' },
            ].map(({ grade, range, meaning }) => (
              <div key={grade} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: GRADE_COLORS[grade] }}
                  aria-label={`Grade ${grade}`}
                >
                  {grade}
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-600">{range} · </span>
                  <span className="text-xs text-gray-500">{meaning}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300">
          DataCheck EU · Privacy Receipt Prototype · Research build
        </p>
      </div>
    </div>
  )
}
