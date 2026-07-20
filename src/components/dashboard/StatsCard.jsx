import clsx from 'clsx'

export function StatsCard({ icon: Icon, label, value, subtext, color = 'blue' }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', value: 'text-green-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('p-2.5 rounded-xl', c.bg)}>
          <Icon className={clsx('w-5 h-5', c.icon)} />
        </div>
      </div>
      <p className={clsx('text-3xl font-bold', c.value)}>{value ?? '—'}</p>
      <p className="text-sm font-medium text-slate-700 mt-1">{label}</p>
      {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
    </div>
  )
}
