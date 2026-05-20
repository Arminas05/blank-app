import { GRADE_COLORS, GRADE_TEXT_COLORS, GRADE_MEANINGS } from '../data/appsDatabase'

export default function GradeDisplay({ grade, size = 80, showMeaning = false, className = '' }) {
  const bg = GRADE_COLORS[grade] ?? '#888'
  const fg = GRADE_TEXT_COLORS[grade] ?? '#fff'

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className="flex items-center justify-center rounded-xl font-black leading-none select-none"
        style={{
          width: size,
          height: size,
          backgroundColor: bg,
          color: fg,
          fontSize: Math.round(size * 0.55),
        }}
        aria-label={`Privacy grade: ${grade}`}
        role="img"
      >
        {grade}
      </div>
      {showMeaning && (
        <p className="text-xs text-center text-gray-500 max-w-[120px]">
          {GRADE_MEANINGS[grade]}
        </p>
      )}
    </div>
  )
}
