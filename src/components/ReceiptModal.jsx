import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import GradeDisplay from './GradeDisplay'
import { GRADE_COLORS, GRADE_MEANINGS } from '../data/appsDatabase'
import { useIsMobile } from '../hooks/useIsMobile'

export default function ReceiptModal({ app, onClose, onDownload, onSkip, onOpenAudit }) {
  const [timeRemaining, setTimeRemaining] = useState(3)
  const isMobile = useIsMobile()

  // Timer — resets each time this component mounts (parent unmounts/remounts on each open)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Escape key closes modal
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const buttonsActive = timeRemaining === 0
  const gradeColor = GRADE_COLORS[app.grade]

  // Determine animation class based on viewport
  const animationClass = isMobile ? 'modal-slide-up' : 'modal-fade-in'

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40 overlay-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-app-name"
        className={[
          'fixed z-50 bg-white shadow-2xl overflow-hidden',
          // Mobile: full-width bottom sheet
          'w-full bottom-0 left-0 right-0 rounded-t-3xl',
          // Desktop: centered card
          'sm:w-auto sm:min-w-[420px] sm:max-w-[520px] sm:rounded-2xl',
          'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
          animationClass,
        ].join(' ')}
      >
        {/* Grade accent bar at top */}
        <div className="h-1.5 w-full" style={{ backgroundColor: gradeColor }} />

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
          <div className="px-5 pt-4 pb-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-base" aria-hidden="true">🔐</span>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">DataCheck EU</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none mt-0.5">Privacy Receipt</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close receipt"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* App identity + grade */}
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl mt-1" aria-hidden="true">{app.icon}</span>
              <div className="flex-1">
                <h2 id="receipt-app-name" className="text-xl font-bold text-gray-900 leading-tight">
                  {app.name}
                </h2>
                <p className="text-sm text-gray-500">{app.category}</p>
              </div>
              <GradeDisplay grade={app.grade} size={64} showMeaning={false} />
            </div>

            {/* Grade meaning badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: gradeColor + '1a', color: gradeColor }}
            >
              <span className="font-black">{app.grade}</span>
              <span>·</span>
              <span>{GRADE_MEANINGS[app.grade]}</span>
            </div>

            {/* Summary sentence */}
            <blockquote
              className="text-sm text-gray-700 mb-5 pl-3 border-l-[3px] italic leading-relaxed"
              style={{ borderColor: gradeColor }}
            >
              {app.summary}
            </blockquote>

            {/* What They Collect */}
            <Section title="What They Collect">
              <ul className="space-y-1.5">
                {app.collects.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* What They Do With It */}
            <Section title="What They Do With It">
              <ul className="space-y-1.5">
                {app.shares.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`flex-shrink-0 mt-0.5 font-bold ${item.bad ? 'text-red-500' : 'text-green-600'}`}>
                      {item.bad ? '✗' : '✓'}
                    </span>
                    <span className={item.bad ? 'text-gray-800' : 'text-gray-600'}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Hidden Risks — the key innovation */}
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-3 mb-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1.5">
                ⚠️ Hidden Risks
              </p>
              <p className="text-xs text-amber-600 mb-2">
                Data you give without realising — inferred from patterns
              </p>
              <ul className="space-y-1">
                {app.hiddenRisks.map((risk, i) => (
                  <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification + QR */}
            <div className="flex items-center gap-4 py-3 border-t border-b border-gray-100 mb-4">
              <button
                onClick={onOpenAudit}
                className="group flex flex-col items-center gap-1 hover:opacity-75 transition-opacity flex-shrink-0"
                aria-label="View full privacy audit report"
              >
                <QRCodeSVG
                  value={app.qrUrl}
                  size={72}
                  level="M"
                  includeMargin={false}
                />
                <span className="text-[10px] text-gray-400 group-hover:text-blue-500 transition-colors">
                  Full audit
                </span>
              </button>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600">Verified by</p>
                <p className="text-xs text-gray-800 font-bold">DataCheck EU Foundation</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Independent audit · Tap QR to view report
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="mb-3 text-center">
              {buttonsActive ? (
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-semibold">✓ Ready to proceed</span>
                  <span className="text-gray-400 text-xs ml-2">You reviewed the privacy information</span>
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-gray-600">⏱ {timeRemaining}s</span>
                  {' '}— please review before continuing
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={buttonsActive ? onSkip : undefined}
                disabled={!buttonsActive}
                className={[
                  'flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all duration-200',
                  buttonsActive
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed',
                ].join(' ')}
                aria-label={buttonsActive ? 'Skip this app' : `Skip — available in ${timeRemaining} seconds`}
              >
                Skip App
              </button>
              <button
                onClick={buttonsActive ? onDownload : undefined}
                disabled={!buttonsActive}
                className={[
                  'flex-[2] py-3.5 rounded-xl font-semibold text-sm transition-all duration-200',
                  buttonsActive
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm'
                    : 'bg-blue-200 text-white cursor-not-allowed',
                ].join(' ')}
                aria-label={buttonsActive ? 'Download — I understand the risks' : `Download — available in ${timeRemaining} seconds`}
              >
                {buttonsActive ? 'Download — I understand' : `Download (${timeRemaining}s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}
