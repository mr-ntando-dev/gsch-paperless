'use client'

export default function MiniBarChart({ data = [], labels = [], color = '#0d9488', height = 48 }) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative">
          <div
            className="w-full rounded-t-sm transition-all duration-300"
            style={{ height: `${(v / max) * (height - 12)}px`, minHeight: v > 0 ? 3 : 0, backgroundColor: color, opacity: 0.8 }}
          />
          {labels[i] && (
            <span className="text-[8px] text-gray-400 truncate w-full text-center leading-none">{labels[i]}</span>
          )}
          {/* tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">{v}</div>
        </div>
      ))}
    </div>
  )
}
