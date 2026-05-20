import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import GradeDisplay from './GradeDisplay'
import { GRADE_COLORS, GRADE_MEANINGS } from '../data/appsDatabase'
import { useIsMobile } from '../hooks/useIsMobile'

const TIMER_SECONDS = 3
const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CircleTimer({ timeRemaining, total }) {
  const progress = timeRemaining / total
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const done = timeRemaining === 0

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
          {/* Track */}
          <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          {/* Progress */}
          <circle
            cx="24" cy="24" r={RADIUS}
            fill="none"
            stroke={done ? '#16a34a' : '#3b82f6'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={done ? 0 : dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
          {done ? '✓' : timeRemaining}
        </span>
      </div>
      <div>
        {done ? (
          <p className="text-sm font-semibold text-green-700">Ready to proceed</p>
        ) : (
          <p className="text-sm text-slate-500">
            Please review — <span className="font-semibold text-slate-700">{timeRemaining}s</span> remaining
          </p>
        )}
        <p className="text-[11px] text-slate-400 mt-0.5">
          {done ? 'You reviewed the privacy information' : 'Buttons unlock when timer ends'}
        </p>
      </div>
    </div>
  )
}

export default function ReceiptModal({ app, onClose, onDownload, onSkip, onOpenAudit }) {
  const [timeRemaining, setTimeRemaining] = useState(TIMER_SECONDS)
  const isMobile = useIsMobile()

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const buttonsActive = timeRemaining === 0
  const gradeColor = GRADE_COLORS[app.grade]
  const animClass = isMobile ? 'modal-slide-up' : 'modal-fade-in'

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40 overlay-fade-in backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-app-name"
        className={[
          'fixed z-50 bg-white overflow-hidden shadow-2xl',
          'w-full bottom-0 left-0 right-0 rounded-t-3xl',
          'sm:w-auto sm:min-w-[460px] sm:max-w-[540px] sm:rounded-2xl',
          'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
          animClass,
        ].join(' ')}
      >
        {/* Grade color bar */}
        <div className="h-1.5" style={{ backgroundColor: gradeColor }} />

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[88vh] sm:max-h-[88vh]">
          <div className="px-5 pt-3 pb-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-base">🔐</span>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">DataCheck EU</p>
                  <p className="text-[9px] text-slate-300 uppercase tracking-wider leading-none mt-0.5">Privacy Receipt</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center text-sm transition-colors"
              >✕</button>
            </div>

            {/* App + Grade */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl flex-shrink-0">
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="receipt-app-name" className="text-xl font-extrabold text-slate-900 leading-tight">{app.name}</h2>
                <p className="text-sm text-slate-400">{app.category}</p>
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold mt-1.5 px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: gradeColor + '18', color: gradeColor }}
                >
                  <span className="font-black text-sm">{app.grade}</span>
                  <span>·</span>
                  <span>{GRADE_MEANINGS[app.grade]}</span>
                </div>
              </div>
              <GradeDisplay grade={app.grade} size={60} />
            </div>

            {/* Summary */}
            <blockquote
              className="text-sm text-slate-600 leading-relaxed mb-5 pl-3 border-l-[3px] italic bg-slate-50 py-2 pr-3 rounded-r-xl"
              style={{ borderColor: gradeColor }}
            >
              {app.summary}
            </blockquote>

            {/* Two-column data facts on wider screens, single on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Collect */}
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">What They Collect</p>
                <ul className="space-y-1.5">
                  {app.collects.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-slate-300 mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Share */}
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">What They Do With It</p>
                <ul className="space-y-1.5">
                  {app.shares.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={`flex-shrink-0 font-bold mt-0.5 ${item.bad ? 'text-red-500' : 'text-green-600'}`}>
                        {item.bad ? '✗' : '✓'}
                      </span>
                      <span className={item.bad ? 'text-slate-800' : 'text-slate-500'}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hidden Risks */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span>⚠️</span>
                <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wide">Hidden Risks</p>
              </div>
              <p className="text-xs text-amber-600 mb-2 leading-relaxed">
                Data you give without realising — inferred from patterns you can't see.
              </p>
              <ul className="space-y-1">
                {app.hiddenRisks.map((risk, i) => (
                  <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="flex-shrink-0 mt-0.5 font-bold">→</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* QR + verification */}
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-3.5 mb-4 border border-slate-100">
              <button
                onClick={onOpenAudit}
                className="group flex flex-col items-center gap-1.5 flex-shrink-0 hover:opacity-75 transition-opacity"
                aria-label="View full privacy audit"
              >
                <div className="bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
                  <QRCodeSVG value={app.qrUrl} size={60} level="M" includeMargin={false} />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-500 transition-colors font-medium">Tap to open audit</span>
              </button>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Verified by</p>
                <p className="text-sm font-bold text-slate-800">DataCheck EU Foundation</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Independent audit — QR links to full methodology & evidence.
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="mb-4 px-1">
              <CircleTimer timeRemaining={timeRemaining} total={TIMER_SECONDS} />
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={buttonsActive ? onSkip : undefined}
                disabled={!buttonsActive}
                className={[
                  'flex-1 py-3.5 rounded-xl font-bold text-sm border-2 transition-all duration-200',
                  buttonsActive
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                    : 'border-slate-100 text-slate-300 cursor-not-allowed',
                ].join(' ')}
              >
                Skip App
              </button>
              <button
                onClick={buttonsActive ? onDownload : undefined}
                disabled={!buttonsActive}
                className={[
                  'flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all duration-200',
                  buttonsActive
                    ? 'bg-slate-900 hover:bg-slate-700 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed',
                ].join(' ')}
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
